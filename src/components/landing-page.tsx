import { FC, ReactNode } from "react";
import { DEMO_MEMBERS, DEMO_USER } from "../utils/demoData";
import { MessagingSetupButton } from "./messaging-setup-button";
import { Badge } from "./ui/badge";
import { AssetIcon } from "./ui/asset-icon";

interface LandingPageProps {
  onConnectAccount: () => void;
  onExploreDemo: () => void;
  showSetupButton?: boolean;
  appUser?: any;
}

/* ── Local monochrome icons (inline SVG — no icon library) ── */

interface SvgIconProps {
  size?: number;
  className?: string;
}

const LockIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
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
    aria-hidden="true"
  >
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
);

const BoltIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
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
    aria-hidden="true"
  >
    <path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12l1-7.5z" />
  </svg>
);

const GlobeIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
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
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.4 2.5 3.7 5.5 3.7 8.5s-1.3 6-3.7 8.5c-2.4-2.5-3.7-5.5-3.7-8.5S9.6 6 12 3.5z" />
  </svg>
);

const SearchIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
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
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.8-3.8" />
  </svg>
);

const EllipsisIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
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
    aria-hidden="true"
  >
    <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

const ArrowRightIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
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
    aria-hidden="true"
  >
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const ShieldCheckIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
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
    aria-hidden="true"
  >
    <path d="M12 3.5 18.5 6v5c0 4.3-2.8 7.3-6.5 8.7-3.7-1.4-6.5-4.4-6.5-8.7V6L12 3.5z" />
    <path d="m9 11.8 2.1 2.1 4-4.2" />
  </svg>
);

const ServerIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
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
    aria-hidden="true"
  >
    <rect x="3.5" y="4.5" width="17" height="6.5" rx="2" />
    <rect x="3.5" y="13" width="17" height="6.5" rx="2" />
    <path d="M7 7.75h.01" />
    <path d="M7 16.25h.01" />
  </svg>
);

const KeyIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
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
    aria-hidden="true"
  >
    <circle cx="8" cy="15" r="4" />
    <path d="M10.9 12.1 20 3" />
    <path d="m15.5 6.5 3 3" />
  </svg>
);

const FEATURES = [
  {
    icon: <LockIcon size={20} />,
    accent: "var(--color-emerald)",
    title: "Encrypted by default",
    desc: "Messages are encrypted on your device with DeSo Access Group keys and decrypted locally — end-to-end encryption applies whenever both parties have messaging set up.",
    meta: "ACCESS GROUPS · AES-GCM",
  },
  {
    icon: <BoltIcon size={20} />,
    accent: "var(--color-cyan)",
    title: "Low-friction, on-chain",
    desc: "Conversations live on the DeSo blockchain at a 1,000 nanos/KB fee rate. A one-time derived-key authorization lets you send without a signing popup on every message.",
    meta: "1,000 NANOS / KB",
  },
  {
    icon: <GlobeIcon size={20} />,
    accent: "var(--color-amber)",
    title: "Identity of your own",
    desc: "Chat with DeSo public keys, 0x Ethereum addresses, and ENS names — resolved through DeSo Identity. One handle, every address you own.",
    meta: "DESO · 0X · ENS",
  },
];

/**
 * Public marketing / setup landing page.
 * Shown before a user has unlocked their real messaging inbox.
 */
export const LandingPage: FC<LandingPageProps> = ({
  onConnectAccount,
  onExploreDemo,
  showSetupButton = false,
  appUser,
}) => {
  return (
    <div
      className="h-full overflow-y-auto custom-scrollbar"
      style={{ background: "var(--color-bg-deep)" }}
    >
      {/* ── HERO ── */}
      <section className="relative" aria-label="Supmate intro">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-14 lg:gap-20">
            {/* ── LEFT ── */}
            <div className="w-full lg:w-[52%] space-y-7 animate-fade-up">
              <Badge tone="accent" pulse uppercase>
                Sovereign Web3 Messaging · Built on DeSo
              </Badge>

              {appUser ? (
                <div>
                  <h1
                    className="font-bold leading-tight text-balance"
                    style={{ fontSize: "clamp(32px, 5vw, 54px)", lineHeight: 1.08 }}
                  >
                    Unlock your{" "}
                    <span style={{ color: "var(--color-emerald)" }}>
                      messaging keys
                    </span>
                  </h1>
                  <p
                    className="mt-4 leading-relaxed"
                    style={{
                      fontSize: 16,
                      color: "var(--text-secondary)",
                      maxWidth: 540,
                    }}
                  >
                    Your wallet is connected. One on-chain authorization creates
                    the derived keys that let you send and receive encrypted
                    messages — no signing popup on every message.
                  </p>
                </div>
              ) : (
                <div>
                  <h1
                    className="font-bold leading-tight text-balance"
                    style={{ fontSize: "clamp(40px, 6vw, 68px)", lineHeight: 1.02 }}
                  >
                    Messages you can{" "}
                    <span style={{ color: "var(--color-emerald)" }}>own.</span>
                  </h1>
                  <p
                    className="mt-5 leading-relaxed"
                    style={{
                      fontSize: 16,
                      color: "var(--text-secondary)",
                      maxWidth: 520,
                    }}
                  >
                    Encrypted, on-chain messaging that keeps your identity
                    yours. Decrypted on your device, stored on the DeSo
                    blockchain, and never locked behind a proprietary server.
                  </p>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                {showSetupButton ? (
                  <MessagingSetupButton />
                ) : (
                  <>
                    <button className="btn-primary" onClick={onExploreDemo}>
                      <AssetIcon name="rocket" size={16} tone="dark" />
                      Explore Demo
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={onConnectAccount}
                    >
                      Connect Account
                      <ArrowRightIcon size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* Proof row */}
              {!appUser && (
                <div className="flex items-center gap-4 pt-3">
                  <div className="flex -space-x-2">
                    {[DEMO_MEMBERS.alex, DEMO_MEMBERS.sarah, DEMO_MEMBERS.neoTrader].map((m) => (
                      <img
                        key={m.publicKey}
                        src={m.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                        style={{
                          border: "2px solid var(--color-bg-deep)",
                          background: "var(--color-bg-overlay)",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                    Try the interactive preview — no wallet required.
                  </span>
                </div>
              )}
            </div>

            {/* ── RIGHT — Phone preview ── */}
            <div
              className="w-full lg:w-[44%] flex justify-center lg:justify-end animate-fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              <div
                className="w-full max-w-[340px] overflow-hidden"
                style={{
                  borderRadius: 28,
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--line-subtle)",
                  boxShadow: "var(--shadow-elev-3)",
                }}
              >
                {/* Preview label */}
                <div
                  className="flex items-center justify-center gap-1.5 py-1.5"
                  style={{
                    background: "var(--color-emerald-dim)",
                    borderBottom: "1px solid var(--line-emerald)",
                  }}
                >
                  <span
                    className="mono uppercase"
                    style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--color-emerald)" }}
                  >
                    Preview · Simulated UI
                  </span>
                </div>

                {/* Mock header */}
                <div
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{ borderBottom: "1px solid var(--line-subtle)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        background: "var(--bg-surface-elevated)",
                        border: "1px solid var(--border-specular)",
                        color: "var(--text-primary)",
                      }}
                    >
                      F
                    </div>
                    <div className="leading-tight">
                      <div className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Friends
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        4 members
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" style={{ color: "var(--text-faint)" }}>
                    <SearchIcon size={16} />
                    <EllipsisIcon size={16} />
                  </div>
                </div>

                {/* Mock messages */}
                <div className="p-4 space-y-3" style={{ minHeight: 280 }}>
                  <PreviewBubble
                    name="Alex"
                    avatar={DEMO_MEMBERS.alex.avatar}
                    time="10:04 PM"
                    text="The new design feels really clean ✨"
                    align="left"
                  />
                  <PreviewBubble
                    name="You"
                    avatar={DEMO_USER.avatar}
                    time="10:07 PM"
                    text="On-chain and decrypted locally."
                    align="right"
                  />
                  <PreviewBubble
                    name="Sarah"
                    avatar={DEMO_MEMBERS.sarah.avatar}
                    time="10:12 PM"
                    text="Love the minimal look 🌄"
                    align="left"
                  />
                </div>

                {/* Mock composer */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  style={{ borderTop: "1px solid var(--line-subtle)" }}
                  onClick={onExploreDemo}
                >
                  <div
                    className="flex-1 px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      background: "var(--bg-surface-elevated)",
                      color: "var(--text-faint)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    Type a message…
                  </div>
                  <button
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
                    style={{ background: "var(--color-emerald)", color: "#07080A" }}
                    aria-label="Open demo"
                  >
                    <AssetIcon name="send" size={16} tone="dark" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-24" aria-label="Features">
        <div className="text-center mb-10">
          <p
            className="text-[11px] font-semibold mb-2 uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--color-emerald)",
              letterSpacing: "0.22em",
            }}
          >
            Why Supmate
          </p>
          <h2
            className="font-bold text-balance"
            style={{ fontSize: "clamp(26px, 4vw, 40px)" }}
          >
            Sovereign by design.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((card) => (
            <article
              key={card.title}
              className="p-6 flex flex-col gap-4 bento hover:border-[color:var(--line-strong)]"
              style={{ borderRadius: "var(--radius-xl)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "var(--color-emerald-dim)",
                  border: "1px solid var(--line-subtle)",
                  color: card.accent,
                }}
              >
                {card.icon}
              </div>
              <div>
                <h3 className="font-semibold mb-1.5" style={{ fontSize: 15 }}>
                  {card.title}
                </h3>
                <p className="leading-relaxed" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {card.desc}
                </p>
              </div>
              <div
                className="mt-auto pt-4"
                style={{ borderTop: "1px solid var(--line-subtle)" }}
              >
                <span
                  className="mono uppercase"
                  style={{ fontSize: 10, letterSpacing: "0.12em", color: card.accent }}
                >
                  {card.meta}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── SECURITY / TRUST ── */}
      <section
        className="max-w-7xl mx-auto px-6 md:px-12 pb-24"
        aria-label="Security model"
      >
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 md:p-8"
          style={{
            borderRadius: "var(--radius-xl)",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--border-specular)",
          }}
        >
          <SecurityItem
            icon={<ShieldCheckIcon size={18} />}
            title="Non-custodial"
            desc="Your keys stay in your DeSo Identity vault. Supmate never holds seed phrases or private keys."
          />
          <SecurityItem
            icon={<ServerIcon size={18} />}
            title="On-chain storage"
            desc="Messages are stored on the DeSo blockchain. Transaction metadata is public like any chain; message content is encrypted before it leaves your device."
          />
          <SecurityItem
            icon={<KeyIcon size={18} />}
            title="Access-group keys"
            desc="DeSo Access Groups control who can encrypt and decrypt a channel. Recipients without messaging set up must explicitly opt in to unencrypted delivery."
          />
        </div>
      </section>
    </div>
  );
};

const PreviewBubble: FC<{
  name: string;
  avatar: string;
  time: string;
  text: string;
  align: "left" | "right";
}> = ({ name, avatar, time, text, align }) => {
  const isSender = align === "right";
  return (
    <div
      className={`flex items-end gap-2 ${isSender ? "flex-row-reverse" : ""}`}
    >
      {!isSender && (
        <img
          src={avatar}
          alt={name}
          className="w-7 h-7 rounded-xl object-cover"
          style={{ background: "var(--color-bg-overlay)" }}
        />
      )}
      <div
        className="px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[70%]"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          borderRadius: isSender ? "16px 16px 6px 16px" : "16px 16px 16px 6px",
          background: isSender
            ? "var(--color-emerald)"
            : "var(--bg-surface-elevated)",
          border: isSender ? "none" : "1px solid var(--line-subtle)",
          color: isSender ? "#07080A" : "var(--text-primary)",
        }}
      >
        {text}
      </div>
      <span
        className="mono"
        style={{ fontSize: 9, color: "var(--text-faint)", whiteSpace: "nowrap" }}
      >
        {time}
      </span>
    </div>
  );
};

const SecurityItem: FC<{ icon: ReactNode; title: string; desc: string }> = ({
  icon,
  title,
  desc,
}) => (
  <div className="flex gap-4">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: "var(--color-emerald-dim)",
        color: "var(--color-emerald)",
        border: "1px solid var(--line-subtle)",
      }}
    >
      {icon}
    </div>
    <div>
      <h3 className="font-semibold mb-1" style={{ fontSize: 14 }}>
        {title}
      </h3>
      <p className="leading-relaxed" style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
        {desc}
      </p>
    </div>
  </div>
);
