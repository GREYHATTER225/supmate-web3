import React, { FC, useEffect, useState, useRef } from "react";
import { AssetIcon } from "../ui/asset-icon";

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_KEY = "sm_splash_v3";

/**
 * Splash screen.
 *
 * A restrained obsidian stage: a single smoked-glass logo plate, the
 * wordmark, and a quiet progress bar. Negative space is the design
 * asset — there are no particle fields, aurora blobs, streak lines,
 * or glows.
 */
export const SplashScreen: FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<
    "particles" | "logo" | "wordmark" | "bar" | "exit"
  >("particles");
  const skipped = useRef(false);

  const skip = () => {
    if (skipped.current) return;
    skipped.current = true;
    sessionStorage.setItem(SPLASH_KEY, "1");
    setPhase("exit");
    setTimeout(onComplete, 350);
  };

  useEffect(() => {
    // Respect reduced-motion. Guard matchMedia for non-browser/older runtimes.
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (prefersReducedMotion || sessionStorage.getItem(SPLASH_KEY)) {
      onComplete();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("logo"), 400));
    timers.push(setTimeout(() => setPhase("wordmark"), 1100));
    timers.push(setTimeout(() => setPhase("bar"), 1750));
    timers.push(
      setTimeout(() => {
        sessionStorage.setItem(SPLASH_KEY, "1");
        setPhase("exit");
      }, 2600)
    );
    timers.push(setTimeout(onComplete, 3000));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none cursor-pointer transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "var(--bg-main)" }}
      onClick={skip}
    >
      {/* Central stage */}
      <div className="relative z-10 flex flex-col items-center gap-7">
        {/* Logo plate */}
        {["logo", "wordmark", "bar"].includes(phase) && (
          <div style={{ animation: "logoReveal 0.7s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <div
              className="bento w-24 h-24 flex items-center justify-center"
              style={{ borderRadius: "var(--radius-xl)" }}
            >
              <AssetIcon name="chatLogo" size={44} tone="accent" active />
            </div>
          </div>
        )}

        {/* Wordmark */}
        {["wordmark", "bar"].includes(phase) && (
          <div
            className="flex flex-col items-center gap-2"
            style={{ animation: "wordmarkSlide 0.55s cubic-bezier(0.16,1,0.3,1) forwards" }}
          >
            <span
              className="font-extrabold uppercase"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(28px, 6vw, 44px)",
                letterSpacing: "0.2em",
                color: "var(--text-primary)",
              }}
            >
              SUPMATE
            </span>
            <span
              className="label-caps"
              style={{ fontSize: 10, letterSpacing: "0.35em" }}
            >
              Sovereign Web3 Messaging
            </span>
          </div>
        )}

        {/* Progress bar */}
        {phase === "bar" && (
          <div
            className="w-48 h-[3px] rounded-full overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
              animation: "fadeIn 0.3s ease forwards",
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                background: "var(--accent-success)",
                animation: "progressFlow 1s ease-in-out forwards",
                width: "100%",
                transformOrigin: "left",
              }}
            />
          </div>
        )}

        {/* Tagline */}
        {phase === "bar" && (
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              color: "var(--text-muted)",
              animation: "fadeIn 0.4s 0.1s ease both",
            }}
          >
            ENCRYPTED · ON-CHAIN · YOURS
          </div>
        )}
      </div>

      {/* Skip hint */}
      {["logo", "wordmark", "bar"].includes(phase) && (
        <div
          className="absolute bottom-8 text-center"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 11,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            animation: "fadeIn 0.5s 1.2s ease both",
          }}
        >
          Click anywhere to skip
        </div>
      )}
    </div>
  );
};
