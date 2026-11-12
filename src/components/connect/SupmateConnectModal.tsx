import { FC, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { identity } from "deso-protocol";
import { SupmateWalletService, NativeWalletData } from "../../services/supmateWallet.service";
import { AssetIcon } from "../ui/asset-icon";

export interface SupmateConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected?: (pubKey: string, method: "native" | "deso-identity") => void;
}

type TabType = "choose" | "create" | "import" | "unlock";

export const SupmateConnectModal: FC<SupmateConnectModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("choose");
  const [generatedWallet, setGeneratedWallet] = useState<NativeWalletData | null>(null);
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [importInput, setImportInput] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [unlockPasscode, setUnlockPasscode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasVault, setHasVault] = useState(false);
  const [isVaultLocked, setIsVaultLocked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const exists = SupmateWalletService.hasStoredVault();
      const locked = SupmateWalletService.isVaultPasswordProtected();
      setHasVault(exists);
      setIsVaultLocked(locked);
      if (locked) {
        setActiveTab("unlock");
      } else {
        setActiveTab("choose");
      }
      setPasscode("");
      setConfirmPasscode("");
      setUnlockPasscode("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    try {
      const wallet = SupmateWalletService.createNewWallet();
      setGeneratedWallet(wallet);
      setHasBackedUp(false);
      setPasscode("");
      setConfirmPasscode("");
      setActiveTab("create");
    } catch (err: any) {
      toast.error(`Wallet creation failed: ${err.message}`);
    }
  };

  const handleConfirmCreation = async () => {
    if (!generatedWallet) return;
    if (!hasBackedUp) {
      toast.warning("Please confirm you have saved your 12-word recovery phrase.");
      return;
    }
    if (passcode && passcode !== confirmPasscode) {
      toast.error("Passcodes do not match.");
      return;
    }
    setIsProcessing(true);
    try {
      await SupmateWalletService.saveEncryptedWallet(generatedWallet, passcode || undefined);
      toast.success("Supmate Wallet successfully created & activated!");
      onWalletConnected?.(generatedWallet.publicKeyBase58Check, "native");
      onClose();
    } catch (err: any) {
      toast.error(`Error saving wallet: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportWallet = async () => {
    const input = importInput.trim();
    if (!input) {
      toast.warning("Please enter your 12-word phrase or seed hex.");
      return;
    }
    if (passcode && passcode !== confirmPasscode) {
      toast.error("Passcodes do not match.");
      return;
    }
    setIsProcessing(true);
    try {
      let wallet: NativeWalletData;
      if (input.includes(" ")) {
        wallet = SupmateWalletService.deriveWalletFromMnemonic(input);
      } else {
        wallet = SupmateWalletService.deriveWalletFromSeedHex(input);
      }
      await SupmateWalletService.saveEncryptedWallet(wallet, passcode || undefined);
      toast.success("Wallet successfully imported!");
      onWalletConnected?.(wallet.publicKeyBase58Check, "native");
      onClose();
    } catch (err: any) {
      toast.error(`Import failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockExistingVault = async () => {
    if (!unlockPasscode) {
      toast.warning("Please enter your vault passcode.");
      return;
    }
    setIsProcessing(true);
    try {
      const wallet = await SupmateWalletService.unlockWallet(unlockPasscode);
      toast.success("Vault successfully unlocked!");
      onWalletConnected?.(wallet.publicKeyBase58Check, "native");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Incorrect passcode.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeSoIdentityLogin = async () => {
    setIsProcessing(true);
    try {
      const response = await identity.login();
      const pubKey = response?.publicKeyBase58Check;
      if (pubKey) {
        toast.success("Connected via DeSo Identity!");
        onWalletConnected?.(pubKey, "deso-identity");
        onClose();
      }
    } catch (err: any) {
      toast.error(`DeSo Identity login failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-up">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Supmate Connect</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  Sovereign Identity
                </span>
              </h3>
              <p className="text-xs text-slate-400">Non-custodial cryptographic access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === "unlock" && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5">
                <span className="text-emerald-400 text-base">🔐</span>
                <p className="text-xs text-emerald-300/90 leading-relaxed">
                  An encrypted Supmate vault was detected on this device. Enter your passcode to unlock your sovereign session.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Vault Passcode</label>
                <input
                  type="password"
                  value={unlockPasscode}
                  onChange={(e) => setUnlockPasscode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlockExistingVault()}
                  placeholder="Enter your passcode..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setActiveTab("choose")}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Other Options
                </button>
                <button
                  disabled={!unlockPasscode || isProcessing}
                  onClick={handleUnlockExistingVault}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isProcessing ? "Decrypting..." : "Unlock Vault"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "choose" && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 leading-relaxed mb-2">
                Choose your preferred way to authenticate with the DeSo blockchain.
                Supmate gives you full sovereign ownership of your keys.
              </div>

              {hasVault && isVaultLocked && (
                <button
                  onClick={() => setActiveTab("unlock")}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all group flex items-start justify-between"
                >
                  <div className="flex gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-lg">
                      🔐
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Unlock Saved Vault
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Decrypt your local encrypted wallet using your passcode.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold mt-1">→</span>
                </button>
              )}

              {/* Option 1: Create Native Supmate Wallet */}
              <button
                onClick={handleStartCreate}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 hover:border-emerald-400/60 text-left transition-all group flex items-start justify-between"
              >
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg group-hover:scale-105 transition-transform">
                    ✨
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Create New Supmate Wallet
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Generate a fresh 12-word DeSo recovery phrase directly on your device.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold mt-1">→</span>
              </button>

              {/* Option 2: Import Wallet */}
              <button
                onClick={() => setActiveTab("import")}
                className="w-full p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition-all group flex items-start justify-between"
              >
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-lg group-hover:scale-105 transition-transform">
                    🔑
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
                      Import Existing Wallet
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Paste a 12-word seed phrase or seed hex from any compatible wallet.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-semibold mt-1">→</span>
              </button>

              {/* Option 3: Connect via DeSo Identity */}
              <button
                disabled={isProcessing}
                onClick={handleDeSoIdentityLogin}
                className="w-full p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-800/60 text-left transition-all group flex items-start justify-between"
              >
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400 text-lg group-hover:scale-105 transition-transform">
                    <AssetIcon name="deso" size={18} tone="none" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Connect via DeSo Identity
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Existing DeSo accounts (Identity popup with Google/Seed phrase).
                    </p>
                  </div>
                </div>
                <span className="text-xs text-cyan-400 font-semibold mt-1">→</span>
              </button>
            </div>
          )}

          {activeTab === "create" && generatedWallet && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                <span className="text-amber-400 text-base">⚠️</span>
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  Write down these 12 words in order. Never share them with anyone.
                  Supmate never sends your secret recovery phrase to any server.
                </p>
              </div>

              {/* 12 Words Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 font-mono">
                {generatedWallet.mnemonic.split(" ").map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs"
                  >
                    <span className="text-slate-500 text-[10px] w-4">{index + 1}.</span>
                    <span className="text-slate-200 font-medium">{word}</span>
                  </div>
                ))}
              </div>

              {/* Passcode Protection (Optional) */}
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 block">
                  Vault Encryption Passcode (Optional but recommended)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Set passcode"
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="password"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Confirm passcode"
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Encrypts your secret seed with AES-256-GCM before writing to local storage.
                </p>
              </div>

              {/* Checkbox confirmation */}
              <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={hasBackedUp}
                  onChange={(e) => setHasBackedUp(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>I have safely written down my 12-word recovery phrase.</span>
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setActiveTab("choose")}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={!hasBackedUp || isProcessing}
                  onClick={handleConfirmCreation}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isProcessing ? "Encrypting..." : "Activate Wallet"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Enter your 12-word recovery phrase separated by spaces, or your 64-character seed hex.
              </p>

              <textarea
                rows={3}
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="word1 word2 word3 ... word12"
                className="w-full p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />

              {/* Passcode Protection */}
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 block">
                  Vault Encryption Passcode (Optional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Set passcode"
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="password"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Confirm passcode"
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setActiveTab("choose")}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={!importInput.trim() || isProcessing}
                  onClick={handleImportWallet}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isProcessing ? "Importing..." : "Import Wallet"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900/40 border-t border-slate-800/60 text-center">
          <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <span>🛡️</span> Client-side cryptographic isolation · Non-custodial
          </span>
        </div>
      </div>
    </div>
  );
};
