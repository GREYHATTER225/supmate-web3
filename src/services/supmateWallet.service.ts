import * as bip39 from "bip39";
import { hmac } from "@noble/hashes/hmac";
import { sha512 } from "@noble/hashes/sha512";
import * as secp from "@noble/secp256k1";
import { keygen, publicKeyToBase58Check, signTx } from "deso-protocol";
import { IS_MAINNET } from "../utils/constants";

export interface NativeWalletData {
  mnemonic: string;
  seedHex: string;
  publicKeyBase58Check: string;
  createdAt: number;
}

const STORAGE_KEY = "supmate_native_wallet_vault";

interface HDNode {
  key: Uint8Array;
  chainCode: Uint8Array;
}

/**
 * Standard BIP-32 Master Node derivation from 64-byte seed.
 */
function deriveMaster(seed: Uint8Array): HDNode {
  const I = hmac(sha512, new TextEncoder().encode("Bitcoin seed"), seed);
  return { key: I.slice(0, 32), chainCode: I.slice(32) };
}

/**
 * Standard BIP-32 Child derivation (Hardened & Non-Hardened).
 */
function deriveChild(parent: HDNode, index: number, hardened: boolean): HDNode {
  const actualIndex = hardened ? index + 0x80000000 : index;
  let data: Uint8Array;
  if (hardened) {
    data = new Uint8Array([
      0,
      ...parent.key,
      (actualIndex >>> 24) & 0xff,
      (actualIndex >>> 16) & 0xff,
      (actualIndex >>> 8) & 0xff,
      actualIndex & 0xff,
    ]);
  } else {
    const pub = secp.Point.fromPrivateKey(parent.key).toRawBytes(true);
    data = new Uint8Array([
      ...pub,
      (actualIndex >>> 24) & 0xff,
      (actualIndex >>> 16) & 0xff,
      (actualIndex >>> 8) & 0xff,
      actualIndex & 0xff,
    ]);
  }

  const I = hmac(sha512, parent.chainCode, data);
  const IL = I.slice(0, 32);
  const IR = I.slice(32);

  // Convert bytes to hex string for BigInt arithmetic
  const ilHex = Array.from(IL).map(b => b.toString(16).padStart(2, "0")).join("");
  const parentHex = Array.from(parent.key).map(b => b.toString(16).padStart(2, "0")).join("");
  const ki = (BigInt("0x" + ilHex) + BigInt("0x" + parentHex)) % secp.CURVE.n;
  const childHex = ki.toString(16).padStart(64, "0");

  const childKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    childKey[i] = parseInt(childHex.substring(i * 2, i * 2 + 2), 16);
  }

  return { key: childKey, chainCode: IR };
}

// ---------------------------------------------------------------------------
// PBKDF2 adaptive iteration count — calibrated once at first use.
// OWASP 2024 minimum for PBKDF2-SHA256 is 480,000 iterations.
// ---------------------------------------------------------------------------
const PBKDF2_MIN_ITERATIONS = 480_000;
let cachedIterations: number | null = null;

/**
 * Runs a 100 ms calibration to determine how many PBKDF2-SHA256 iterations
 * the current device can complete within 300 ms, subject to a floor of
 * PBKDF2_MIN_ITERATIONS (480,000 — OWASP 2024).
 *
 * The result is cached in a module-level variable so calibration only runs once.
 */
async function getAdaptiveIterations(): Promise<number> {
  if (cachedIterations !== null) return cachedIterations;

  // Calibrate: measure how long PBKDF2_MIN_ITERATIONS takes on this device.
  const enc = new TextEncoder();
  const calibrationPassword = enc.encode("calibration-probe");
  const calibrationSalt = new Uint8Array(16); // all-zeros salt is fine for benchmarking

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    calibrationPassword,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const t0 = performance.now();
  await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: calibrationSalt,
      iterations: PBKDF2_MIN_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const elapsed = performance.now() - t0; // ms for PBKDF2_MIN_ITERATIONS

  // If the device can do more within 300 ms, scale up proportionally.
  // e.g. if 480k takes 60 ms we can fit 480k * (300/60) = 2.4 M iterations.
  const scaledIterations = Math.floor(PBKDF2_MIN_ITERATIONS * (300 / elapsed));
  cachedIterations = Math.max(PBKDF2_MIN_ITERATIONS, scaledIterations);

  return cachedIterations;
}

export class SupmateWalletService {
  /**
   * Generates a new 12-word DeSo compatible wallet.
   */
  public static createNewWallet(): NativeWalletData {
    const mnemonic = bip39.generateMnemonic(128); // 12 words
    return this.deriveWalletFromMnemonic(mnemonic);
  }

  /**
   * Derives DeSo wallet credentials from a mnemonic using official BIP-44 path m/44'/0'/0'/0/0.
   */
  public static deriveWalletFromMnemonic(mnemonic: string): NativeWalletData {
    const cleanMnemonic = mnemonic.trim().toLowerCase();
    if (!bip39.validateMnemonic(cleanMnemonic)) {
      throw new Error("Invalid 12-word recovery phrase. Please check spelling.");
    }

    const seed = bip39.mnemonicToSeedSync(cleanMnemonic);
    // Register seed bytes for best-effort memory cleanup on lockWallet().
    const seedBytes = new Uint8Array(seed);
    SupmateWalletService.registerSensitiveBuffer(seedBytes);

    let node = deriveMaster(seedBytes);

    // Register intermediate HD node keys for best-effort memory cleanup.
    node = deriveChild(node, 44, true);
    SupmateWalletService.registerSensitiveBuffer(node.key);
    node = deriveChild(node, 0, true);
    SupmateWalletService.registerSensitiveBuffer(node.key);
    node = deriveChild(node, 0, true);
    SupmateWalletService.registerSensitiveBuffer(node.key);
    node = deriveChild(node, 0, false);
    SupmateWalletService.registerSensitiveBuffer(node.key);
    node = deriveChild(node, 0, false);
    SupmateWalletService.registerSensitiveBuffer(node.key);

    const seedHex = Array.from(node.key).map(b => b.toString(16).padStart(2, "0")).join("");
    const keyPair = keygen(seedHex);
    const network = IS_MAINNET ? "mainnet" : "testnet";
    const publicKeyBase58Check = publicKeyToBase58Check(keyPair.public, { network });

    return {
      mnemonic: cleanMnemonic,
      seedHex,
      publicKeyBase58Check,
      createdAt: Date.now(),
    };
  }

  /**
   * Derives wallet directly from seed hex (optional advanced import).
   */
  public static deriveWalletFromSeedHex(seedHex: string): NativeWalletData {
    const cleanHex = seedHex.trim();
    if (cleanHex.length !== 64 || !/^[0-9a-fA-F]+$/.test(cleanHex)) {
      throw new Error("Invalid 64-character seed hex format.");
    }
    const keyPair = keygen(cleanHex);
    const network = IS_MAINNET ? "mainnet" : "testnet";
    const publicKeyBase58Check = publicKeyToBase58Check(keyPair.public, { network });

    return {
      mnemonic: "",
      seedHex: cleanHex,
      publicKeyBase58Check,
      createdAt: Date.now(),
    };
  }

  /**
   * Encrypts and saves wallet to local storage using user password.
   * Uses an adaptive PBKDF2 iteration count (≥480,000 — OWASP 2024) calibrated
   * to the device's performance. The chosen iteration count is stored inside the
   * vault JSON so the decrypt path always uses the exact same value.
   */
  public static async saveEncryptedWallet(wallet: NativeWalletData, password?: string): Promise<void> {
    const payload = JSON.stringify(wallet);
    if (!password) {
      // In-browser non-custodial local session
      localStorage.setItem(STORAGE_KEY, btoa(payload));
      return;
    }

    // Standard Web Crypto AES-GCM encryption with PBKDF2
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iterations = await getAdaptiveIterations();

    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(payload)
    );

    const vault = {
      salt: Array.from(salt),
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(encrypted)),
      iterations,
      encrypted: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
    this.activeSessionWallet = wallet;
  }

  private static activeSessionWallet: NativeWalletData | null = null;

  /**
   * Registry of sensitive byte arrays that should be zeroed on lockWallet().
   *
   * JavaScript engines do not guarantee object finalization timing or memory layout.
   * This is a best-effort mitigation to reduce the window of secret exposure in
   * memory — it does not provide cryptographic erasure guarantees.
   */
  private static sensitiveBuffers = new Set<Uint8Array>();

  /**
   * Registers a sensitive buffer to be zeroed when lockWallet() is called.
   *
   * JavaScript engines do not guarantee object finalization timing or memory layout.
   * This is a best-effort mitigation to reduce the window of secret exposure in
   * memory — it does not provide cryptographic erasure guarantees.
   */
  public static registerSensitiveBuffer(buf: Uint8Array): void {
    SupmateWalletService.sensitiveBuffers.add(buf);
  }

  /**
   * Checks whether a stored vault exists on device.
   */
  public static hasStoredVault(): boolean {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  }

  /**
   * Checks whether the stored vault is password-encrypted.
   */
  public static isVaultPasswordProtected(): boolean {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      if (raw.startsWith("{")) {
        const parsed = JSON.parse(raw);
        return Boolean(parsed.encrypted);
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Returns in-memory session wallet if unlocked.
   */
  public static getActiveSessionWallet(): NativeWalletData | null {
    if (this.activeSessionWallet) return this.activeSessionWallet;
    return this.getStoredWallet();
  }

  /**
   * Unlocks password-encrypted vault.
   * Reads the iteration count stored in the vault so the correct PBKDF2 work
   * factor is always used regardless of when the vault was created.
   */
  public static async unlockWallet(password: string): Promise<NativeWalletData> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("No wallet vault found on this device.");

    if (!this.isVaultPasswordProtected()) {
      const data = this.getStoredWallet();
      if (!data) throw new Error("Corrupted wallet storage.");
      this.activeSessionWallet = data;
      return data;
    }

    try {
      const vaultObj = JSON.parse(raw);
      const salt = new Uint8Array(vaultObj.salt);
      const iv = new Uint8Array(vaultObj.iv);
      const ciphertext = new Uint8Array(vaultObj.ciphertext);
      // Use the iteration count stored in the vault; fall back to 100,000
      // for legacy vaults created before this field was added.
      const iterations: number =
        typeof vaultObj.iterations === "number" && vaultObj.iterations > 0
          ? vaultObj.iterations
          : 100_000;

      const enc = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );
      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );
      const dec = new TextDecoder();
      const wallet: NativeWalletData = JSON.parse(dec.decode(decrypted));
      this.activeSessionWallet = wallet;
      return wallet;
    } catch {
      throw new Error("Incorrect passcode. Unable to decrypt wallet.");
    }
  }

  /**
   * Locks the active session wallet from memory.
   *
   * Also performs a best-effort zeroing of all registered sensitive buffers
   * (seed bytes, intermediate HD node keys) to reduce the window of secret
   * exposure in the GC heap.
   *
   * JavaScript engines do not guarantee object finalization timing or memory layout.
   * This is a best-effort mitigation to reduce the window of secret exposure in
   * memory — it does not provide cryptographic erasure guarantees.
   */
  public static lockWallet(): void {
    for (const buf of SupmateWalletService.sensitiveBuffers) {
      buf.fill(0);
    }
    SupmateWalletService.sensitiveBuffers.clear();
    this.activeSessionWallet = null;
  }

  /**
   * Retrieves active wallet if stored locally without encryption.
   */
  public static getStoredWallet(): NativeWalletData | null {
    if (this.activeSessionWallet) return this.activeSessionWallet;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      if (raw.startsWith("{") && JSON.parse(raw).encrypted) {
        // Vault is password protected, requires unlockWallet(passcode)
        return null;
      }
      const data = JSON.parse(atob(raw));
      this.activeSessionWallet = data;
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Removes native wallet from device.
   */
  public static purgeWallet(): void {
    this.activeSessionWallet = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Signs a transaction hex using the native wallet seed.
   */
  public static async signTransactionHex(txHex: string, seedHex: string): Promise<string> {
    const signed = await signTx(txHex, seedHex);
    return signed;
  }
}
