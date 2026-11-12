import { FC } from "react";
import { shortenLongWord } from "./search-users";
import { Badge } from "./ui/badge";

interface ConversationDetailsPanelProps {
  chatName: string;
  isGroup: boolean;
  publicKey?: string;
  isDemo?: boolean;
  onClose: () => void;
}

const FEE_RATE_NANOS_PER_KB = 1000;

/** Local monochrome glyphs (inline SVG — no external library). */
const ShieldGlyph = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ServerGlyph = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="7" rx="2" />
    <rect x="3" y="13" width="18" height="7" rx="2" />
    <path d="M7 7.5h.01M7 16.5h.01" />
  </svg>
);

const LinkGlyph = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
    <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
  </svg>
);

const FlaskGlyph = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
    <path d="M7.5 15h9" />
  </svg>
);

/**
 * Conversation details / security rail.
 *
 * Re-imagined with a top-notch cyber-glass dark orange/amber aesthetic
 * inspired by high-end dashboard cards and floating bento design principles.
 */
export const ConversationDetailsPanel: FC<ConversationDetailsPanelProps> = ({
  chatName,
  isGroup,
  publicKey,
  isDemo = false,
  onClose,
}) => (
  <aside
    className="w-full md:w-[320px] lg:w-[340px] flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0 relative bg-neutral-950/95 backdrop-blur-2xl border-l border-orange-500/20 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] z-30"
    aria-label="Conversation details"
  >
    {/* Ambient lighting glow */}
    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

    {/* Header */}
    <div className="p-4 flex items-center justify-between shrink-0 border-b border-orange-500/15 relative z-10 bg-neutral-900/40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.2)]">
          <ShieldGlyph size={15} />
        </div>
        <div>
          <h4 className="font-bold text-xs tracking-wide text-neutral-100 uppercase">
            Conversation Details
          </h4>
          <p className="font-mono text-[10px] text-neutral-400 tracking-wider">
            SECURITY &amp; TELEMETRY
          </p>
        </div>
      </div>
      <button
        className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 hover:border-orange-500/40 transition-all active:scale-95"
        onClick={onClose}
        aria-label="Close details"
      >
        <span aria-hidden="true" className="text-base leading-none">×</span>
      </button>
    </div>

    {/* Content Container */}
    <div className="p-4 space-y-3.5 relative z-10">

      {/* Channel Identity Card */}
      <section className="relative p-4 rounded-2xl bg-neutral-900/80 border border-orange-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden group hover:border-orange-500/40 transition-all">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-amber-500" />

        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] tracking-widest text-orange-400 uppercase flex items-center gap-1.5">
            <LinkGlyph size={11} />
            {isGroup ? "Group channel" : "Direct channel"}
          </span>
          {isDemo && <Badge tone="warning" uppercase>Simulated</Badge>}
        </div>

        <div className="font-bold text-sm tracking-tight text-white truncate">
          {chatName}
        </div>

        <div className="font-mono text-[11px] text-neutral-400 truncate mt-1 bg-neutral-950/60 px-2.5 py-1 rounded-lg border border-neutral-800/80">
          {isGroup
            ? "Access-group backed"
            : publicKey
              ? shortenLongWord(publicKey, 10, 8)
              : "—"}
        </div>
      </section>

      {/* Model Summary Bento Card */}
      <section className="p-4 rounded-2xl bg-neutral-900/80 border border-orange-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80">
          <div className="text-orange-400">
            <ServerGlyph size={14} />
          </div>
          <span className="font-bold text-xs tracking-wide text-neutral-200">
            HOW THIS CHANNEL WORKS
          </span>
        </div>

        <div className="space-y-2.5 text-xs text-neutral-300 font-sans">
          <div className="flex justify-between items-center gap-4 py-1 border-b border-neutral-800/40">
            <span className="text-neutral-400 text-[11px] font-mono">Encryption</span>
            <span className="text-right font-medium text-[11px] text-neutral-200">
              DeSo Access Group keys
            </span>
          </div>

          <div className="flex justify-between items-center gap-4 py-1 border-b border-neutral-800/40">
            <span className="text-neutral-400 text-[11px] font-mono">Storage</span>
            <span className="text-right font-medium text-[11px] text-orange-400">DeSo blockchain</span>
          </div>

          <div className="flex justify-between items-center gap-4 py-1 border-b border-neutral-800/40">
            <span className="text-neutral-400 text-[11px] font-mono">Fee rate</span>
            <span className="font-mono text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {FEE_RATE_NANOS_PER_KB.toLocaleString()} nanos/KB
            </span>
          </div>

          <div className="flex justify-between items-center gap-4 py-1">
            <span className="text-neutral-400 text-[11px] font-mono">Signing</span>
            <span className="text-right font-medium text-[11px] text-neutral-200">
              Derived keys (auth)
            </span>
          </div>
        </div>
      </section>

      {/* Caveat Card */}
      {isDemo ? (
        <section className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 flex gap-3 shadow-lg shadow-amber-500/5">
          <div className="text-amber-400 shrink-0 mt-0.5">
            <FlaskGlyph size={16} />
          </div>
          <p className="text-[11.5px] leading-relaxed text-amber-200/90 font-medium">
            This is a local preview. Messages never leave your browser and are not truly encrypted — no wallet or blockchain is involved.
          </p>
        </section>
      ) : (
        <section className="p-4 rounded-2xl bg-neutral-900/60 border border-orange-500/20 flex gap-3">
          <div className="text-orange-400 shrink-0 mt-0.5">
            <ShieldGlyph size={16} />
          </div>
          <p className="text-[11.5px] leading-relaxed text-neutral-300">
            End-to-end encryption applies when both parties have messaging set up. Unverified recipients require an explicit opt-in.
          </p>
        </section>
      )}

    </div>
  </aside>
);
