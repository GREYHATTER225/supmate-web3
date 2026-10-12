import { FC } from "react";
import { shortenLongWord } from "./search-users";
import { IconButton } from "./ui/icon-button";
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
 * Shows only information that is real and verifiable in the deployed
 * product: channel identity, storage model, encryption model, and the
 * fee rate from the codebase constant (1,000 nanos/KB).
 */
export const ConversationDetailsPanel: FC<ConversationDetailsPanelProps> = ({
  chatName,
  isGroup,
  publicKey,
  isDemo = false,
  onClose,
}) => (
  <aside
    className="w-full md:w-[320px] lg:w-[340px] flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0"
    style={{
      background: "var(--bg-surface)",
      borderLeft: "1px solid var(--border-subtle)",
      zIndex: 30,
    }}
    aria-label="Conversation details"
  >
    {/* Header */}
    <div
      className="p-4 flex items-center justify-between shrink-0"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--color-emerald-dim)", color: "var(--color-emerald)", border: "1px solid var(--line-emerald)" }}
        >
          <ShieldGlyph size={14} />
        </div>
        <div>
          <h4 className="font-bold text-[13px]">
            Conversation Details
          </h4>
          <p className="mono text-[10px]" style={{ color: "var(--text-muted)" }}>
            Channel info &amp; security model
          </p>
        </div>
      </div>
      <IconButton size="sm" label="Close details" onClick={onClose}>
        <span aria-hidden="true" style={{ lineHeight: 1, fontSize: 16 }}>×</span>
      </IconButton>
    </div>

    <div className="p-4 space-y-3">
      {/* Channel identity */}
      <section
        className="p-4"
        style={{
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-surface-elevated)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="label-caps" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <LinkGlyph size={11} />
            {isGroup ? "Group channel" : "Direct channel"}
          </span>
          {isDemo && <Badge tone="warning" uppercase>Simulated</Badge>}
        </div>
        <div className="font-bold text-sm truncate">
          {chatName}
        </div>
        <div className="mono text-[11px] truncate mt-1" style={{ color: "var(--text-muted)" }}>
          {isGroup
            ? "Access-group backed"
            : publicKey
            ? shortenLongWord(publicKey, 10, 8)
            : "—"}
        </div>
      </section>

      {/* Model summary */}
      <section
        className="p-4 space-y-3"
        style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", background: "var(--bg-surface-elevated)" }}
      >
        <div className="flex items-center gap-2">
          <ServerGlyph size={14} />
          <span className="font-bold text-[12.5px]">
            How this channel works
          </span>
        </div>

        <div className="space-y-2.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <div className="flex justify-between gap-4">
            <span style={{ color: "var(--text-muted)" }}>Encryption</span>
            <span className="text-right">
              DeSo Access Group keys, decrypted on your device
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span style={{ color: "var(--text-muted)" }}>Storage</span>
            <span className="text-right">DeSo blockchain (on-chain)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span style={{ color: "var(--text-muted)" }}>Fee rate</span>
            <span className="mono">{FEE_RATE_NANOS_PER_KB.toLocaleString()} nanos/KB</span>
          </div>
          <div className="flex justify-between gap-4">
            <span style={{ color: "var(--text-muted)" }}>Signing</span>
            <span className="text-right">
              Derived keys after one-time authorization
            </span>
          </div>
        </div>
      </section>

      {/* Honest caveats */}
      {isDemo ? (
        <section
          className="p-4 flex gap-3"
          style={{
            borderRadius: "var(--radius-lg)",
            background: "var(--color-amber-dim)",
            border: "1px solid rgba(232,179,75,0.25)",
          }}
        >
          <FlaskGlyph size={16} />
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            This is a local preview. Messages here never leave your browser and
            are not truly encrypted — no wallet or blockchain is involved.
          </p>
        </section>
      ) : (
        <section
          className="p-4 flex gap-3"
          style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-elevated)",
          }}
        >
          <ShieldGlyph size={16} />
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            End-to-end encryption applies when both parties have messaging set
            up. If a recipient has not set up messaging, sending requires an
            explicit opt-in, and those messages are labelled as unencrypted.
          </p>
        </section>
      )}
    </div>
  </aside>
);
