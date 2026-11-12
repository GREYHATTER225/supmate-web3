import { FC, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { SupmateWalletService, NativeWalletData } from "../../services/supmateWallet.service";
import { IS_MAINNET } from "../../utils/constants";
import { desoNanosToDeso } from "../../utils/helpers";

export interface WalletDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  desoBalanceNanos?: number | string | bigint;
  onDisconnect?: () => void;
}

export const WalletDashboardModal: FC<WalletDashboardModalProps> = ({
  isOpen,
  onClose,
  publicKey,
  desoBalanceNanos = 0,
  onDisconnect,
}) => {
  const [nativeWallet, setNativeWallet] = useState<NativeWalletData | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passcodePrompt, setPasscodePrompt] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = SupmateWalletService.getActiveSessionWallet();
      setNativeWallet(stored);
      setShowPhrase(false);
      setCopied(false);
      setPasscodePrompt(false);
      setPasscode("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    toast.success("Public key copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevealClick = () => {
    if (showPhrase) {
      setShowPhrase(false);
      return;
    }
    if (nativeWallet?.mnemonic) {
      setShowPhrase(true);
      return;
    }
    if (SupmateWalletService.isVaultPasswordProtected()) {
      setPasscodePrompt(true);
    } else {
      const stored = SupmateWalletService.getStoredWallet();
      if (stored?.mnemonic) {
        setNativeWallet(stored);
        setShowPhrase(true);
      } else {
        toast.info("Wallet connected via external session (no local seed stored).");
      }
    }
  };

  const handleUnlockAndReveal = async () => {
    if (!passcode) {
      toast.warning("Please enter your vault passcode.");
      return;
    }
    setIsDecrypting(true);
    try {
      const wallet = await SupmateWalletService.unlockWallet(passcode);
      setNativeWallet(wallet);
      setShowPhrase(true);
      setPasscodePrompt(false);
      setPasscode("");
      toast.success("Vault decrypted.");
    } catch (err: any) {
      toast.error(err.message || "Incorrect passcode.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleLockVault = () => {
    SupmateWalletService.lockWallet();
    setNativeWallet(null);
    setShowPhrase(false);
    toast.info("Vault locked. Memory cleared.");
  };

  const handleDisconnect = () => {
    SupmateWalletService.purgeWallet();
    toast.info("Wallet disconnected.");
    onDisconnect?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              💎
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Supmate Wallet Manager</h3>
              <p className="text-[10px] text-slate-400">
                Network: <span className="text-emerald-400 font-semibold">{IS_MAINNET ? "Mainnet" : "Testnet"}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Balance Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
              Confirmed Balance
            </span>
            <div className="text-2xl font-black text-white tracking-tight">
              {desoNanosToDeso(desoBalanceNanos).toFixed(4)}{" "}
              <span className="text-sm text-emerald-400 font-semibold">DESO</span>
            </div>
          </div>

          {/* Public Key Display */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 block">
              DeSo Public Address
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
              <span className="truncate flex-1">{publicKey}</span>
              <button
                onClick={handleCopyPublicKey}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-medium transition-colors"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Backup / Export Phrase for Native Wallets */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                Secret Recovery Phrase
              </span>
              <button
                onClick={handleRevealClick}
                className="text-[11px] text-cyan-400 hover:underline font-semibold"
              >
                {showPhrase ? "Hide Phrase" : "Reveal (12 words)"}
              </button>
            </div>

            {passcodePrompt && (
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-300">
                  Enter your passcode to decrypt and reveal your phrase:
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlockAndReveal()}
                    placeholder="Vault passcode"
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    disabled={isDecrypting}
                    onClick={handleUnlockAndReveal}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
                  >
                    {isDecrypting ? "..." : "Unlock"}
                  </button>
                </div>
              </div>
            )}

            {showPhrase && nativeWallet?.mnemonic && (
              <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 font-mono text-xs text-amber-200 grid grid-cols-3 gap-1.5 animate-fade-in">
                {nativeWallet.mnemonic.split(" ").map((w, i) => (
                  <span key={i} className="text-[10px] text-slate-300">
                    {i + 1}. {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Lock Vault button if active */}
          {nativeWallet && SupmateWalletService.isVaultPasswordProtected() && (
            <button
              onClick={handleLockVault}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
            >
              🔒 Lock Vault (Clear Memory)
            </button>
          )}

          {/* Disconnect / Actions */}
          <div className="pt-2">
            <button
              onClick={handleDisconnect}
              className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/40 text-xs font-semibold transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
