import { FC, ReactNode } from "react";
import { playClickSound } from "../utils/soundEffects";
import { AssetIcon } from "./ui/asset-icon";

/**
 * Bento 3 · Chat header / ENS metadata.
 *
 * Carries the peer signature-verification state on the left and the live
 * confirmed-block network tracker on the right — the interface remains
 * anchored to the chain without a single decorative element.
 */
export const ChatHeaderBento: FC<{
  chatName: string;
  peerLabel?: string;
  isGroup: boolean;
  onBack: () => void;
  blockHeight: number | null;
  isTestnet: boolean | null;
  live: boolean;
  syncing: boolean;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  manageMembers?: ReactNode;
}> = ({
  chatName,
  peerLabel,
  isGroup,
  onBack,
  blockHeight,
  isTestnet,
  live,
  syncing,
  detailsOpen,
  onToggleDetails,
  manageMembers,
}) => {
  const network = isTestnet ? "TESTNET" : "MAINNET";
  const trackerLive = live && blockHeight !== null;
  const trackerState = trackerLive ? "CONFIRMED BLOCK" : syncing ? "SYNCING CHAIN" : "NODE OFFLINE";

  return (
    <header className="bento chat-header-bento" aria-label="Conversation and network status">
      <button
        className="btn-ghost md:hidden shrink-0"
        style={{ padding: "8px 8px", marginLeft: -8 }}
        onClick={() => {
          playClickSound();
          onBack();
        }}
        aria-label="Back to channels"
      >
        <AssetIcon name="leftChevron" size={16} active />
      </button>

      <div className="chat-header-bento__titles">
        <div className="chat-header-bento__name">{chatName || "Select a channel"}</div>
        <div className="peer-state">
          <span className="status-dot" />
          {isGroup ? (
            <span>Group · Access-group encrypted</span>
          ) : (
            <span>
              Verified · <span className="peer-state__id">{peerLabel || "—"}</span>
            </span>
          )}
        </div>
      </div>

      <div className="block-tracker">
        <span className={`status-dot ${trackerLive ? "" : syncing ? "status-dot--pending" : "status-dot--offline"}`} />
        <div className="block-tracker__inner">
          <span className="block-tracker__num">
            {blockHeight !== null ? `#${blockHeight.toLocaleString()}` : "#—"}
          </span>
          <span className="block-tracker__lbl">
            {trackerState} · {network}
          </span>
        </div>
      </div>

      <div className="chat-header-bento__actions">
        {manageMembers}
        <button
          className="btn-ghost"
          style={{ fontSize: 11, padding: "7px 10px", letterSpacing: "0.1em", textTransform: "uppercase" }}
          onClick={() => {
            playClickSound();
            onToggleDetails();
          }}
        >
          {detailsOpen ? "Close" : "Details"}
        </button>
      </div>
    </header>
  );
};