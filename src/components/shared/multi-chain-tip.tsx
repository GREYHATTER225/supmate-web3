import { FC, useState, useContext } from "react";
import { toast } from "react-toastify";
import { sendDeso } from "deso-protocol";
import { UserContext } from "../../contexts/UserContext";

export type SupportedChain = "deso" | "ethereum" | "solana" | "polygon" | "arbitrum";

export interface MultiChainTipProps {
  isOpen: boolean;
  onClose: () => void;
  recipientHandle?: string;
  recipientPublicKey?: string;
  onSuccess?: (txHash: string, chain: SupportedChain, amount: string) => void;
}

export const MultiChainTipModal: FC<MultiChainTipProps> = ({
  isOpen,
  onClose,
  recipientHandle = "Recipient",
  recipientPublicKey = "",
  onSuccess,
}) => {
  const { appUser } = useContext(UserContext);
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("deso");
  const [amount, setAmount] = useState("0.1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSuccessHash, setTxSuccessHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const chainConfig: Record<SupportedChain, { name: string; symbol: string; icon: string; gas: string; color: string; available: boolean }> = {
    deso: { name: "DeSo L1", symbol: "DESO", icon: "💎", gas: "< $0.0001", color: "from-blue-500 to-cyan-500", available: true },
    ethereum: { name: "Ethereum", symbol: "ETH", icon: "Ξ", gas: "~ $1.20", color: "from-slate-600 to-indigo-600", available: false },
    solana: { name: "Solana", symbol: "SOL", icon: "◎", gas: "< $0.001", color: "from-purple-500 to-pink-500", available: false },
    polygon: { name: "Polygon", symbol: "POL", icon: "⬡", gas: "~ $0.01", color: "from-purple-600 to-indigo-700", available: false },
    arbitrum: { name: "Arbitrum", symbol: "ARB", icon: "🔵", gas: "~ $0.05", color: "from-blue-600 to-cyan-600", available: false },
  };

  const current = chainConfig[selectedChain];

  const handleSendTransaction = async () => {
    if (selectedChain !== "deso") {
      toast.info(`${current.name} transfers will be enabled after native bridge verification.`);
      return;
    }

    if (!appUser?.PublicKeyBase58Check) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!recipientPublicKey) {
      toast.error("Recipient public key is missing.");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.warning("Please enter a valid amount.");
      return;
    }

    setIsProcessing(true);
    try {
      const amountNanos = Math.round(amountNum * 1e9);
      const res = await sendDeso({
        SenderPublicKeyBase58Check: appUser.PublicKeyBase58Check,
        RecipientPublicKeyOrUsername: recipientPublicKey,
        AmountNanos: amountNanos,
        MinFeeRateNanosPerKB: 1000,
      });

      const txHash = (res as any)?.TxnHashHex || (res as any)?.TransactionHex || "Confirmed on-chain";
      setTxSuccessHash(txHash);
      toast.success(`Sent ${amount} DESO successfully!`);
      if (onSuccess) {
        onSuccess(txHash, "deso", amount);
      }
    } catch (err: any) {
      toast.error(`Transaction failed: ${err?.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Send Multi-Chain Tip</h3>
              <p className="text-[11px] text-slate-400">Direct on-chain cross-network transfer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {txSuccessHash ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xl">
                ✓
              </div>
              <h4 className="text-sm font-semibold text-white">Transfer Broadcast Successfully!</h4>
              <p className="text-xs text-slate-400">
                Sent <span className="text-emerald-400 font-semibold">{amount} {current.symbol}</span> to {recipientHandle}
              </p>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 break-all">
                Tx: {txSuccessHash}
              </div>
              <button
                onClick={() => {
                  setTxSuccessHash(null);
                  onClose();
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Recipient Card */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Recipient</span>
                  <span className="text-xs font-semibold text-slate-200">@{recipientHandle}</span>
                </div>
                {recipientPublicKey && (
                  <span className="text-[10px] font-mono text-slate-500">
                    {recipientPublicKey.slice(0, 6)}...{recipientPublicKey.slice(-4)}
                  </span>
                )}
              </div>

              {/* Select Network */}
              <div>
                <label className="text-xs font-medium text-slate-300 mb-2 block">
                  Select Blockchain Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(chainConfig) as SupportedChain[]).map((chainKey) => {
                    const cfg = chainConfig[chainKey];
                    const isSelected = selectedChain === chainKey;
                    return (
                      <button
                        key={chainKey}
                        onClick={() => setSelectedChain(chainKey)}
                        disabled={!cfg.available}
                        className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          !cfg.available
                            ? "opacity-40 cursor-not-allowed bg-slate-950/40 border-slate-900 text-slate-600"
                            : isSelected
                            ? "bg-slate-800/90 border-cyan-500/80 shadow-sm shadow-cyan-500/10 text-white"
                            : "bg-slate-900/40 border-slate-800/70 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{cfg.icon}</span>
                          <span className="text-[9px] text-slate-400">
                            {cfg.available ? cfg.gas : "Coming Soon"}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold mt-1 block">{cfg.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Amount to send</label>
                  <span className="text-[10px] text-slate-500">Est. Gas: {current.gas}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    placeholder="0.0"
                    step="0.1"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {current.symbol}
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendTransaction}
                disabled={isProcessing || !amount || Number(amount) <= 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-xs tracking-wide shadow-lg shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing Transaction...</span>
                  </>
                ) : (
                  <span>Send {amount} {current.symbol} on {current.name}</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
