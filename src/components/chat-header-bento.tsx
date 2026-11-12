
import { FC, ReactNode } from "react";
import { playClickSound } from "../utils/soundEffects";
import { AssetIcon } from "./ui/asset-icon";

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
  onOpenTipModal?: () => void;
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
  onOpenTipModal,
}) => {
    // Network information
    const network =
      isTestnet === null
        ? "NETWORK UNKNOWN"
        : isTestnet
          ? "TESTNET"
          : "MAINNET";

    // Blockchain tracker
    const trackerLive = live && blockHeight !== null;

    const trackerState = trackerLive
      ? "CONFIRMED BLOCK"
      : syncing
        ? "SYNCING CHAIN"
        : "NODE OFFLINE";

    const trackerColor = trackerLive
      ? "bg-emerald-500"
      : syncing
        ? "bg-amber-500"
        : "bg-rose-500";

    const trackerText = trackerLive
      ? "text-emerald-400"
      : syncing
        ? "text-amber-400"
        : "text-rose-400";

    const handleAction = (callback: () => void) => {
      playClickSound();
      callback();
    };

    return (
      <header
        className="
        relative isolate z-20
        flex items-center justify-between
        gap-3 sm:gap-4
        px-3 sm:px-5
        py-3 sm:py-3.5
        bg-[#08090c]/90
        backdrop-blur-2xl
        border-b border-white/[0.07]
        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
        transition-colors duration-300
      "
      >
        {/* Ambient top highlight */}
        <div
          aria-hidden="true"
          className="
          absolute inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent
          via-orange-500/60
          to-transparent
          pointer-events-none
        "
        />

        {/* Left: Navigation and Chat Identity */}
        <div className="flex items-center gap-3 min-w-0 flex-1">

          {/* Back Button */}
          <button
            type="button"
            onClick={() => handleAction(onBack)}
            aria-label="Back to channels"
            className="
            md:hidden shrink-0
            flex items-center justify-center
            size-9 rounded-xl
            text-neutral-400
            bg-white/[0.025]
            border border-white/[0.06]
            hover:text-orange-400
            hover:bg-orange-500/10
            hover:border-orange-500/30
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-orange-500
            active:scale-95
            transition-all duration-200
          "
          >
            <AssetIcon name="leftChevron" size={16} active />
          </button>

          {/* Chat Identity */}
          <div className="min-w-0 flex flex-col justify-center">

            <div className="flex items-center gap-2 min-w-0">

              <h2
                title={chatName}
                className="
                text-[14px] sm:text-[15px]
                font-semibold
                tracking-tight
                text-white
                truncate
                leading-tight
              "
              >
                {chatName || "Select a channel"}
              </h2>

              {/* Group / Direct badge */}
              <span
                className="
                hidden sm:inline-flex shrink-0
                items-center
                px-2 py-0.5
                rounded-md
                text-[9px]
                font-bold
                tracking-[0.12em]
                uppercase
                bg-white/[0.045]
                border border-white/[0.07]
                text-neutral-400
              "
              >
                {isGroup ? "GROUP" : "DIRECT"}
              </span>

            </div>

            {/* Identity Status */}
            <div
              className="
              flex items-center gap-2
              mt-1
              min-w-0
              text-[10px] sm:text-[11px]
              font-mono
              tracking-wide
              text-neutral-500
            "
            >
              <span
                aria-hidden="true"
                className="
                relative flex shrink-0
                size-1.5 rounded-full
                bg-orange-400
                shadow-[0_0_7px_rgba(249,115,22,0.55)]
              "
              />

              {isGroup ? (
                <span className="truncate">
                  Group conversation
                  <span className="text-orange-400/90">
                    {" "}· Encrypted Stream
                  </span>
                </span>
              ) : (
                <span className="truncate">
                  <span className="text-neutral-400">
                    Peer
                  </span>
                  <span className="text-neutral-600 mx-1.5">
                    /
                  </span>
                  <span
                    className="text-neutral-200 font-semibold"
                    title={peerLabel || "Peer identifier unavailable"}
                  >
                    {peerLabel || "Unknown peer"}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Blockchain Status */}
        <div
          className="
          hidden lg:flex
          items-center gap-3
          shrink-0
          px-3.5 py-2
          rounded-xl
          bg-white/[0.025]
          border border-white/[0.07]
          shadow-inner
          transition-all duration-200
          hover:bg-white/[0.045]
        "
          aria-live="polite"
          aria-label={`Blockchain status: ${trackerState}, ${network}`}
        >

          {/* Status Indicator */}
          <span className="relative flex size-2 shrink-0">

            {(trackerLive || syncing) && (
              <span
                aria-hidden="true"
                className={`
                motion-safe:animate-ping
                absolute inset-0
                rounded-full
                opacity-40
                ${trackerColor}
              `}
              />
            )}

            <span
              aria-hidden="true"
              className={`
              relative size-2 rounded-full
              ${trackerColor}
              ${trackerLive
                  ? "shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  : ""}
            `}
            />
          </span>

          {/* Block Information */}
          <div className="flex flex-col gap-0.5 leading-tight">

            <span
              className="
              font-mono
              text-xs
              font-bold
              tracking-wider
              text-white
              tabular-nums
            "
            >
              {blockHeight !== null
                ? `#${blockHeight.toLocaleString()}`
                : "#—"}
            </span>

            <span
              className="
              text-[9px]
              font-mono
              uppercase
              tracking-[0.12em]
              text-neutral-500
            "
            >
              <span className={trackerText}>
                {trackerState}
              </span>
              <span className="mx-1.5 text-neutral-700">·</span>
              <span className="text-neutral-400">
                {network}
              </span>
            </span>

          </div>
        </div>

        {/* Right: Actions */}
        <div
          className="
          flex items-center
          gap-1.5 sm:gap-2
          shrink-0
        "
        >

          {/* Multi-chain Tip */}
          {onOpenTipModal && !isGroup && (
            <button
              type="button"
              onClick={() => handleAction(onOpenTipModal)}
              title="Send multi-chain tip"
              aria-label="Send multi-chain tip"
              className="
              inline-flex items-center justify-center
              gap-1.5
              px-2.5 sm:px-3.5
              py-2
              rounded-xl
              text-amber-300
              text-xs font-semibold
              bg-amber-500/[0.07]
              border border-amber-500/20
              hover:bg-amber-500/[0.14]
              hover:border-amber-400/40
              hover:shadow-[0_0_18px_rgba(245,158,11,0.08)]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-amber-500
              active:scale-95
              transition-all duration-200
            "
            >
              <span aria-hidden="true">⚡</span>
              <span className="hidden sm:inline">Tip</span>
            </button>
          )}

          {/* Group Member Management */}
          {manageMembers}

          {/* Details Toggle */}
          <button
            type="button"
            onClick={() => handleAction(onToggleDetails)}
            aria-label={
              detailsOpen
                ? "Close chat details"
                : "Open chat details"
            }
            aria-expanded={detailsOpen}
            className="
            inline-flex items-center justify-center
            gap-1.5
            px-2.5 sm:px-3.5
            py-2
            rounded-xl
            text-neutral-300
            hover:text-white
            text-[10px] sm:text-[11px]
            font-mono
            font-semibold
            uppercase
            tracking-wider
            bg-white/[0.035]
            border border-white/[0.08]
            hover:bg-white/[0.08]
            hover:border-orange-500/30
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-orange-500
            active:scale-95
            transition-all duration-200
          "
          >
            <span className="hidden sm:inline">
              {detailsOpen ? "Close" : "Details"}
            </span>

            <span className="sm:hidden">
              {detailsOpen ? "×" : "⋯"}
            </span>
          </button>

        </div>
      </header>
    );
  };
