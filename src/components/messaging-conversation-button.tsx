import { FC, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { AssetIcon } from "./ui/asset-icon";

export const MessagingConversationButton: FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  const [isSending, setIsSending] = useState(false);
  return (
    <div
      className="p-8"
      style={{
        borderRadius: "var(--radius-xl)",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-specular)",
        boxShadow: "var(--shadow-elev-2)",
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: "var(--color-emerald-dim)",
          border: "1px solid var(--line-emerald)",
        }}
      >
        <AssetIcon name="chatLogo" size={22} tone="none" active />
      </div>
      <h2 className="mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24 }}>
        You're ready to chat
      </h2>
      <p
        className="text-sm mb-6 leading-relaxed"
        style={{ color: "var(--text-secondary)", maxWidth: 360, margin: "0 auto 24px" }}
      >
        Your on-chain encryption keys are verified. Load your decentralized
        inbox to begin messaging contacts.
      </p>

      <button
        disabled={isSending}
        className="btn-primary mx-auto"
        onClick={async () => {
          setIsSending(true);
          try {
            await onClick();
          } catch {
            setIsSending(false);
          }
          setIsSending(false);
        }}
      >
        {isSending ? (
          <ClipLoader color={"#07080A"} loading={true} size={18} className="mx-2" />
        ) : (
          <span>Load On-Chain Inbox</span>
        )}
      </button>
    </div>
  );
};
