import React, { FC, useState } from "react";
import { identity } from "deso-protocol";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { AssetIcon } from "../ui/asset-icon";

export interface SupmateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDemo?: () => void;
}

/* ── Local monochrome icons (inline SVG — no icon library) ── */

interface SvgIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const CloseIcon: FC<SvgIconProps> = ({ size = 16, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

const ShieldCheckIcon: FC<SvgIconProps> = ({ size = 16, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="M12 3.5 18.5 6v5c0 4.3-2.8 7.3-6.5 8.7-3.7-1.4-6.5-4.4-6.5-8.7V6L12 3.5z" />
    <path d="m9 11.8 2.1 2.1 4-4.2" />
  </svg>
);

const CheckCircleIcon: FC<SvgIconProps> = ({ size = 16, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.5 12.2 2.4 2.4 4.6-4.9" />
  </svg>
);

/**
 * Account connection modal.
 *
 * There is a single real connection path: DeSo Identity. Its iframe already
 * supports seed phrase, hardware/extension wallets, and social sign-in, so we
 * present that honestly rather than as several distinct fake providers.
 */
export const SupmateAuthModal: FC<SupmateAuthModalProps> = ({
  isOpen,
  onClose,
  onExploreDemo,
}) => {
  const [connectingMethod, setConnectingMethod] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeSoLogin = async () => {
    setConnectingMethod("deso");
    try {
      await identity.login();
      onClose();
    } catch (err: any) {
      toast.error(`Login error: ${err?.message || err}`);
    } finally {
      setConnectingMethod(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{
          background: "rgba(10,13,18,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full flex overflow-hidden animate-scale-in"
        style={{
          maxWidth: 780,
          borderRadius: 24,
          background: "var(--color-bg-surface)",
          border: "1px solid var(--line-strong)",
          boxShadow: "var(--shadow-elev-3)",
        }}
      >
        {/* Left brand column */}
        <div
          className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
          style={{
            width: 320,
            background: "rgba(255,255,255,0.02)",
            borderRight: "1px solid var(--line-subtle)",
            flexShrink: 0,
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-10">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-specular)",
                }}
              >
                <AssetIcon name="logoWhite" size={18} tone="none" />
              </div>
              <span
                className="font-bold tracking-wider"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 15,
                  letterSpacing: "0.1em",
                }}
              >
                SUPMATE
              </span>
            </div>

            <div className="space-y-2 mb-8">
              <p
                className="text-sm font-medium"
                style={{
                  color: "var(--color-emerald)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                WELCOME
              </p>
              <h2
                id="auth-modal-title"
                className="leading-tight"
                style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15 }}
              >
                Your conversations.{" "}
                <span style={{ color: "var(--color-emerald)" }}>Your keys.</span>
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Connect a DeSo account to message on-chain, or explore the demo
                to try the workspace without a wallet.
              </p>
            </div>

            <div className="space-y-2">
              {["NON-CUSTODIAL", "ON-CHAIN", "ENCRYPTED"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ background: "var(--color-emerald)" }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative z-10 flex items-center gap-2 p-3 rounded-xl"
            style={{
              background: "var(--color-emerald-dim)",
              border: "1px solid var(--line-emerald)",
            }}
          >
            <ShieldCheckIcon
              size={16}
              className="shrink-0"
              style={{ color: "var(--color-emerald)" }}
            />
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Your keys stay in your DeSo Identity vault. Supmate never stores
              seed phrases.
            </p>
          </div>
        </div>

        {/* Right auth column */}
        <div className="flex-1 flex flex-col p-7 md:p-9 relative">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-specular)",
              color: "var(--text-secondary)",
            }}
          >
            <CloseIcon size={16} />
          </button>

          <div className="md:hidden mb-6">
            <h3 className="font-bold mb-1" style={{ fontSize: 22 }}>
              Your conversations.{" "}
              <span style={{ color: "var(--color-emerald)" }}>Your keys.</span>
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Connect a DeSo account or explore the demo.
            </p>
          </div>

          <div className="md:pt-4">
            <p
              className="text-xs font-semibold mb-4"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--text-muted)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Connect
            </p>

            <button
              id="deso"
              disabled={!!connectingMethod}
              onClick={handleDeSoLogin}
              className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] text-left"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-specular)",
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{
                  background: "var(--color-emerald-dim)",
                  border: "1px solid var(--line-emerald)",
                }}
              >
                <AssetIcon name="deso" size={20} tone="none" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold text-sm"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Connect DeSo
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: "var(--color-emerald-dim)",
                      color: "var(--color-emerald)",
                      border: "1px solid var(--line-emerald)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Recommended
                  </span>
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  DeSo Identity — email, seed phrase, or wallet
                </p>
              </div>
              <div className="shrink-0">
                {connectingMethod === "deso" ? (
                  <ClipLoader color={"var(--color-emerald)"} size={18} />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ color: "var(--text-faint)" }}
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>

            <div className="flex items-center gap-4 my-5">
              <div
                className="flex-1 h-px"
                style={{ background: "var(--line-subtle)" }}
              />
              <span
                className="text-xs"
                style={{ color: "var(--text-faint)" }}
              >
                or
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "var(--line-subtle)" }}
              />
            </div>

            {onExploreDemo && (
              <button
                id="explore-demo-btn"
                onClick={() => {
                  onClose();
                  onExploreDemo();
                }}
                className="btn-secondary w-full"
                style={{ padding: "14px 16px" }}
              >
                <AssetIcon name="rocket" size={16} tone="light" />
                Explore Demo
              </button>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-6">
              {[
                "Encrypted when both sides are set up",
                "Non-custodial",
                "On-chain DeSo",
              ].map((label) => (
                <div key={label} className="flex items-center gap-1.5">
                  <CheckCircleIcon
                    size={12}
                    className="shrink-0"
                    style={{ color: "var(--color-emerald)" }}
                  />
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
