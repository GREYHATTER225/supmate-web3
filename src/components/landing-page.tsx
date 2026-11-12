import { FC, ReactNode } from "react";
import { DEMO_MEMBERS } from "../utils/demoData";
import { MessagingSetupButton } from "./messaging-setup-button";
import { AssetIcon } from "./ui/asset-icon";
import CrystalizedBall from "./reactbits/CrystalizedBall";
import AnimatedList from "./reactbits/AnimatedList";

interface LandingPageProps {
  onConnectAccount: () => void;
  onExploreDemo: () => void;
  showSetupButton?: boolean;
  appUser?: any;
}

interface SvgIconProps {
  size?: number;
  className?: string;
}

const LockIcon: FC<SvgIconProps> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
);

const BoltIcon: FC<SvgIconProps> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12l1-7.5z" />
  </svg>
);

const GlobeIcon: FC<SvgIconProps> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.4 2.5 3.7 5.5 3.7 8.5s-1.3 6-3.7 8.5c-2.4-2.5-3.7-5.5-3.7-8.5S9.6 6 12 3.5z" />
  </svg>
);

const ArrowRightIcon: FC<SvgIconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const ShieldCheckIcon: FC<SvgIconProps> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 3.5 18.5 6v5c0 4.3-2.8 7.3-6.5 8.7-3.7-1.4-6.5-4.4-6.5-8.7V6L12 3.5z" />
    <path d="m9 11.8 2.1 2.1 4-4.2" />
  </svg>
);

const ServerIcon: FC<SvgIconProps> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="3.5" y="4.5" width="17" height="6.5" rx="2" />
    <rect x="3.5" y="13" width="17" height="6.5" rx="2" />
    <path d="M7 7.75h.01" />
    <path d="M7 16.25h.01" />
  </svg>
);

const KeyIcon: FC<SvgIconProps> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="8" cy="15" r="4" />
    <path d="M10.9 12.1 20 3" />
    <path d="m15.5 6.5 3 3" />
  </svg>
);

const FEATURES = [
  {
    icon: <LockIcon size={22} />,
    accent: "#ff5500",
    title: "Absolute Privacy",
    desc: "Messages are encrypted locally on your device with decentralized access keys. Only your intended peers hold the decryption rights.",
    meta: "END-TO-END · SECURE",
  },
  {
    icon: <BoltIcon size={22} />,
    accent: "#d93800",
    title: "Lightning Fast On-Chain",
    desc: "Optimized protocol routing guarantees instant dispatch with minimal gas overhead, keeping conversations fluid and responsive.",
    meta: "SUB-SECOND SYNC",
  },
  {
    icon: <GlobeIcon size={22} />,
    accent: "#ff7700",
    title: "Universal Identity",
    desc: "Seamlessly connect via Web3 handles, EVM addresses, or ENS names. One sovereign profile for all your communications.",
    meta: "MULTI-CHAIN READY",
  },
];

/**
 * Public marketing / setup landing page.
 * Recreates the exact vibrant fiery orange-to-deep dark red smooth mesh gradient from the reference image.
 */
export const LandingPage: FC<LandingPageProps> = ({
  onConnectAccount,
  onExploreDemo,
  showSetupButton = false,
  appUser,
}) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#050000] text-neutral-100 relative selection:bg-orange-500 selection:text-white">

      {/* ── REFERENCE ACCURATE SMOOTH MESH AMBIENT BACKDROP ── */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden z-0">
        {/* Top vibrant glowing orange light pool */}
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[110%] h-[750px] bg-gradient-to-b from-[#ff5500] via-[#c42800] to-[#2b0300] opacity-90 blur-[100px] rounded-[100%]" />

        {/* Deep dark red core shadow blur */}
        <div className="absolute top-[400px] left-1/2 -translate-x-1/2 w-[90%] h-[600px] bg-gradient-to-b from-[#6b0900] via-[#210000] to-[#050000] opacity-95 blur-[120px] rounded-[100%]" />

        {/* Dynamic side lights for subtle warm reflection */}
        <div className="absolute top-0 left-0 w-full h-[1000px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/25 via-[#3a0000]/40 to-transparent blur-[140px]" />
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 md:pt-40 md:pb-32" aria-label="Supmate intro">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">

          <div className="w-full lg:w-[58%] space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/40 text-orange-200 font-mono text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(255,85,0,0.35)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-[0_0_10px_rgba(255,140,0,1)]" />
              Next-Gen Sovereign Web3 Messaging
            </div>

            {appUser ? (
              <div>
                <h1 className="font-extrabold tracking-tight text-white text-balance" style={{ fontSize: "clamp(38px, 5.5vw, 64px)", lineHeight: 1.08 }}>
                  Unlock your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-orange-400 to-red-500">messaging keys</span>
                </h1>
                <p className="mt-6 text-neutral-200 text-base md:text-lg leading-relaxed max-w-xl font-sans drop-shadow">
                  Your wallet is securely connected. Authorize once to enable lightning-fast encrypted conversations without recurrent signing prompts.
                </p>
              </div>
            ) : (
              <div>
                <h1 className="font-extrabold tracking-tight text-white text-balance" style={{ fontSize: "clamp(44px, 6.5vw, 78px)", lineHeight: 1.04 }}>
                  Secure messaging, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-100 via-orange-400 to-red-500">truly owned by you.</span>
                </h1>
                <p className="mt-6 text-neutral-200 text-base md:text-lg leading-relaxed max-w-xl font-sans drop-shadow">
                  Experience decentralized chat built for total privacy. Client-side encryption, immutable on-chain storage, and zero corporate surveillance.
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              {showSetupButton ? (
                <MessagingSetupButton />
              ) : (
                <>
                  <button
                    onClick={onExploreDemo}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ff5500] via-[#e63900] to-[#b31900] hover:from-[#ff661a] hover:to-[#cc2200] text-white font-bold text-sm tracking-wide uppercase transition-all shadow-[0_10px_35px_rgba(255,85,0,0.5)] hover:shadow-[0_15px_45px_rgba(255,85,0,0.7)] active:scale-95 flex items-center justify-center gap-2.5 font-mono"
                  >
                    <span>Explore Demo</span>
                    <AssetIcon name="rocket" size={16} tone="dark" />
                  </button>
                  <button
                    onClick={onConnectAccount}
                    className="px-8 py-4 rounded-2xl bg-[#140200]/80 hover:bg-[#240400] text-neutral-100 hover:text-white border border-orange-500/40 hover:border-orange-500/80 font-bold text-sm tracking-wide uppercase transition-all shadow-lg backdrop-blur-md active:scale-95 flex items-center justify-center gap-2.5 font-mono"
                  >
                    <span>Connect Wallet</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Social proof avatars */}
            {!appUser && (
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2.5">
                  {[DEMO_MEMBERS.alex, DEMO_MEMBERS.sarah, DEMO_MEMBERS.neoTrader].map((m) => (
                    <img
                      key={m.publicKey}
                      src={m.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shadow-2xl border-2 border-orange-500/60"
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-300 font-mono tracking-wide">
                  Instant sandbox preview — no wallet required to test.
                </span>
              </div>
            )}
          </div>

          {/* Interactive Crystal Ball / 3D Visual Element */}
          <div className="w-full lg:w-[40%] flex justify-center items-center relative min-h-[360px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="w-80 h-80 md:w-96 md:h-96 relative z-10">
              <CrystalizedBall
                preset="plasma"
                color="#ff5500"
                size={0.95}
                crackle={0.95}
                fill={0.65}
                interactive={true}
                hoverStrength={0.9}
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-32 relative z-10" aria-label="Features">
        <div className="text-center mb-16">
          <p className="text-xs font-mono mb-3 uppercase tracking-[0.3em] text-orange-400">
            Why Choose Supmate
          </p>
          <h2 className="font-extrabold tracking-tight text-white" style={{ fontSize: "clamp(32px, 4.5vw, 48px)" }}>
            Sovereign by Design. Built for Privacy.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {FEATURES.map((card) => (
            <div key={card.title} className="flex flex-col items-start space-y-4 group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-[0_0_30px_rgba(255,85,0,0.3)]"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 85, 0, 0.25), rgba(160, 20, 0, 0.1))",
                  border: "1px solid rgba(255, 85, 0, 0.5)",
                  color: card.accent,
                }}
              >
                {card.icon}
              </div>
              <h3 className="font-extrabold text-xl text-white tracking-tight">
                {card.title}
              </h3>
              <p className="leading-relaxed text-sm md:text-base text-neutral-300 font-sans">
                {card.desc}
              </p>
              <span className="font-mono uppercase text-[11px] tracking-widest text-orange-400 font-semibold pt-2">
                {card.meta}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECURITY / TRUST ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-32 relative z-10 border-t border-orange-500/20 pt-24" aria-label="Security model">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <SecurityItem
            icon={<ShieldCheckIcon size={24} />}
            title="Non-Custodial Vault"
            desc="Your cryptographic keys remain securely in your local identity vault. Supmate never stores or touches private seed phrases."
          />
          <SecurityItem
            icon={<ServerIcon size={24} />}
            title="Immutable Storage"
            desc="Messages persist on the decentralized blockchain. Public metadata ensures consensus, while message payloads remain fully encrypted."
          />
          <SecurityItem
            icon={<KeyIcon size={24} />}
            title="Access Control"
            desc="Advanced decentralized access groups strictly dictate channel permissions, guaranteeing absolute confidentiality for participants."
          />
        </div>
      </section>

      {/* ── INTERACTIVE ARCHITECTURE LIST ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-36 relative z-10 border-t border-orange-500/20 pt-24" aria-label="Architecture">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-5">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
              Architecture & Protocol Stack
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Powered by Decentralized L1 Protocol
            </h3>
            <p className="text-base text-neutral-300 leading-relaxed font-sans">
              Explore Supmate's next-generation modular framework. Zero remote telemetry, verifiable client-side cryptographic sovereignty, and on-chain ownership.
            </p>
          </div>
          <div className="lg:w-1/2 flex justify-center w-full">
            <AnimatedList
              items={[
                { icon: "💎", title: "Decentralized L1 Protocol", description: "Non-custodial Access Groups & Messaging", meta: "AES-GCM" },
                { icon: "⚡", title: "On-Chain Micro-Transactions", description: "Negligible gas fees & derived keys", meta: "Instant" },
                { icon: "⛓️", title: "Multi-Chain Readiness", description: "ENS resolution, EVM signatures & cross-chain tips", meta: "Universal" },
                { icon: "🛡️", title: "Client-Side Cryptography", description: "Absolute zero server storage of plaintext keys", meta: "Sovereign" },
              ]}
              animation="pop"
              theme="dark"
              width="100%"
              maxHeight={320}
              onItemSelect={(item) => console.log("Selected architecture item:", item)}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const SecurityItem: FC<{ icon: ReactNode; title: string; desc: string }> = ({
  icon,
  title,
  desc,
}) => (
  <div className="flex flex-col items-start space-y-4">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_25px_rgba(255,85,0,0.3)]"
    >
      {icon}
    </div>
    <h3 className="font-bold text-lg text-white tracking-tight">
      {title}
    </h3>
    <p className="leading-relaxed text-sm md:text-base text-neutral-300 font-sans">
      {desc}
    </p>
  </div>
);