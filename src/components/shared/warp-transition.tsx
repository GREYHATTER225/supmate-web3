import React, { FC } from "react";
import { AssetIcon } from "../ui/asset-icon";

interface WarpTransitionProps {
  isActive: boolean;
  message?: string;
}

/**
 * Warp transition overlay.
 *
 * A quiet smoked-glass card on a dimmed obsidian field. No aurora
 * blobs, dot grids, or glows — just the plate, the protocol badge,
 * the status line, and a restrained progress bar.
 */
export const WarpTransitionOverlay: FC<WarpTransitionProps> = ({
  isActive,
  message = "INITIALIZING SUPMATE...",
}) => {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center pointer-events-none select-none"
      style={{ animation: "warpIn 0.85s cubic-bezier(0.16,1,0.3,1) forwards" }}
    >
      {/* Dimmed glass backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(7,8,10,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      />

      {/* Central card */}
      <div
        className="bento relative z-10 flex flex-col items-center gap-5 px-10 py-8 text-center max-w-sm mx-4"
        style={{ borderRadius: "var(--radius-xl)" }}
      >
        {/* Logo plate */}
        <div
          className="bento-inset w-14 h-14 rounded-2xl flex items-center justify-center"
        >
          <AssetIcon name="chatLogo" size={24} tone="accent" active />
        </div>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{
            background: "var(--color-emerald-dim)",
            border: "1px solid var(--line-emerald)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "var(--accent-success)",
            letterSpacing: "0.15em",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent-success)", animation: "pulse 1s infinite" }}
          />
          SUPMATE PROTOCOL
        </div>

        {/* Message */}
        <p
          className="font-bold"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            letterSpacing: "0.05em",
            color: "var(--text-primary)",
          }}
        >
          {message}
        </p>

        {/* Progress bar */}
        <div
          className="w-48 h-[3px] rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: "var(--accent-success)",
              animation: "progressFlow 1.2s ease-in-out infinite",
              width: "100%",
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
    </div>
  );
};
