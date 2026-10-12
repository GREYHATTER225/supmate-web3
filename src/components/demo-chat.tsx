import { FC } from "react";
import { ChatType } from "deso-protocol";
import { toast } from "react-toastify";
import {
  DEMO_MEMBERS,
  DEMO_USER,
  DEMO_USERNAME_MAP,
} from "../utils/demoData";
import { ConversationMap } from "../utils/types";
import { playClickSound } from "../utils/soundEffects";
import { ConversationDetailsPanel } from "./conversation-details";
import { SendMessageButtonAndInput } from "./send-message-button-and-input";
import { AssetIcon } from "./ui/asset-icon";
import { Badge } from "./ui/badge";
import { IconButton } from "./ui/icon-button";

/** Local monochrome glyphs (inline SVG — no external library). */
const SearchGlyph = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const StatsGlyph = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

// ── Demo message bubble ──────────────────────────────────────────
const DemoBubble: FC<{
  username: string;
  avatar: string;
  timestamp: string;
  text: string;
  isSender: boolean;
  isNew?: boolean;
}> = ({ username, avatar, timestamp, text, isSender, isNew = false }) => {
  return (
    <div
      className={`flex items-end gap-2.5 ${isSender ? "flex-row-reverse" : ""} ${
        isNew ? "animate-bubble-pop" : ""
      }`}
      style={{ marginBottom: 12 }}
    >
      <div className="shrink-0 flex flex-col items-center gap-1" style={{ width: 34 }}>
        <img
          src={avatar}
          alt={username}
          className="rounded-xl object-cover"
          style={{
            width: 34,
            height: 34,
            border: isSender ? "1.5px solid var(--line-emerald)" : "1.5px solid var(--line-subtle)",
            background: "var(--color-bg-overlay)",
          }}
        />
        <span className="font-mono" style={{ fontSize: 9, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
          {timestamp}
        </span>
      </div>

      <div className="flex flex-col max-w-[70%]" style={{ alignItems: isSender ? "flex-end" : "flex-start" }}>
        {!isSender && (
          <span
            className="mb-1 font-semibold"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              color: "var(--text-secondary)",
              paddingLeft: 12,
            }}
          >
            {username}
          </span>
        )}
        <div
          className="px-4 py-3 text-sm leading-relaxed break-words"
          style={
            isSender
              ? {
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 13.5,
                  // No container: stark white type floating on the obsidian mesh.
                  color: "#FFFFFF",
                  padding: "10px 2px 10px 14px",
                }
              : {
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 13.5,
                  borderRadius: "18px 18px 18px 6px",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-specular)",
                  boxShadow: "var(--shadow-elev-2)",
                }
          }
        >
          {text}
        </div>
      </div>
    </div>
  );
};

// ── Demo conversation sidebar item ───────────────────────────────────
const DemoConvoItem: FC<{
  avatar: string;
  name: string;
  lastMsg: string;
  time: string;
  isSelected: boolean;
  isGroup?: boolean;
  unread?: number;
  onClick: () => void;
}> = ({ avatar, name, lastMsg, time, isSelected, isGroup, unread, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-left [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
    style={{
      background: isSelected ? "var(--color-emerald-dim)" : "transparent",
      border: isSelected ? "1px solid var(--line-emerald)" : "1px solid transparent",
    }}
  >
    <div className="relative shrink-0">
      <img
        src={avatar}
        alt={name}
        className="rounded-2xl object-cover"
        style={{
          width: 44,
          height: 44,
          background: "var(--color-bg-overlay)",
          border: isSelected ? "1.5px solid var(--line-emerald)" : "1.5px solid var(--line-subtle)",
        }}
      />
      <span
        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
        style={{ background: "var(--color-emerald)", border: "2px solid var(--color-bg-surface)" }}
      />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <span
          className="font-semibold truncate text-sm"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--text-primary)" }}
        >
          {name}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 10, color: "var(--text-faint)", flexShrink: 0, marginLeft: 6 }}
        >
          {time}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs truncate flex-1" style={{ color: "var(--text-muted)" }}>
          {lastMsg}
        </p>
        {unread ? (
          <span
            className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ml-2"
            style={{ background: "var(--color-emerald)", color: "#0A0D12", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {unread}
          </span>
        ) : (
          isGroup && (
            <Badge tone="info" uppercase className="shrink-0 ml-2">
              Group
            </Badge>
          )
        )}
      </div>
    </div>
  </button>
);

// ── Demo workspace ───────────────────────────────────────────────────
export interface DemoChatWorkspaceProps {
  demoConversations: ConversationMap;
  selectedDemoConvoKey: string;
  onSelectDemoConvo: (key: string) => void;
  onSendMessage: (text: string) => void;
  isIntelOpen: boolean;
  onToggleIntel: () => void;
  onExitDemo: () => void;
}

/**
 * Sandbox demo-mode workspace. Every interaction here is local and
 * simulated — clearly labelled, never misrepresented as a real on-chain
 * transaction or as real end-to-end encryption.
 */
export const DemoChatWorkspace: FC<DemoChatWorkspaceProps> = ({
  demoConversations,
  selectedDemoConvoKey,
  onSelectDemoConvo,
  onSendMessage,
  isIntelOpen,
  onToggleIntel,
  onExitDemo,
}) => {
  const demoConvo = demoConversations[selectedDemoConvoKey];
  const isDemoGroup = demoConvo?.ChatType === ChatType.GROUPCHAT;
  const demoChatName = isDemoGroup
    ? DEMO_MEMBERS.neonSquad.name
    : DEMO_USERNAME_MAP[selectedDemoConvoKey] || "Chat";
  const convos = Object.entries(demoConversations);

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--color-bg-deep)" }}>
      {/* Sandbox banner */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: "var(--color-emerald-dim)",
          borderBottom: "1px solid var(--line-emerald)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Badge tone="accent" pulse uppercase>
            Sandbox
          </Badge>
          <span className="text-xs hidden sm:inline" style={{ color: "var(--text-muted)" }}>
            Local simulated state — no blockchain transactions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            size="sm"
            label="Toggle conversation details"
            active={isIntelOpen}
            tone="accent"
            onClick={() => {
              playClickSound();
              onToggleIntel();
            }}
          >
            <StatsGlyph size={13} />
          </IconButton>
          <button
            className="btn-ghost text-[12px] transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] inline-flex items-center gap-1.5"
            onClick={onExitDemo}
          >
            Exit Demo
            <AssetIcon name="logout" size={13} />
          </button>
        </div>
      </div>

      {/* Chat layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ── */}
        <aside
          className="w-full md:w-[300px] flex flex-col shrink-0 border-r"
          style={{
            background: "var(--color-bg-surface)",
            borderColor: "var(--line-strong)",
            boxShadow: "var(--shadow-elev-2)",
          }}
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3
                className="font-bold text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--text-primary)" }}
              >
                Messages
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {convos.length} conversations
              </p>
            </div>
            <IconButton
              size="md"
              label="New conversation (connect wallet)"
              tone="accent"
              onClick={() => toast.info("New conversation: connect your wallet")}
            >
              <AssetIcon name="addUser" size={18} />
            </IconButton>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-specular)",
              }}
            >
              <span style={{ color: "var(--text-faint)", display: "inline-flex" }}>
                <SearchGlyph size={14} />
              </span>
              <span style={{ fontSize: 13, color: "var(--text-faint)" }}>
                Search conversations…
              </span>
            </div>
          </div>

          {/* Section label */}
          <div className="px-4 pb-2">
            <span
              className="font-mono uppercase"
              style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.12em" }}
            >
              All · {convos.length}
            </span>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
            {convos.map(([key, convo]) => {
              const isGroup = convo.ChatType === ChatType.GROUPCHAT;
              const name = isGroup ? DEMO_MEMBERS.neonSquad.name : DEMO_USERNAME_MAP[key] || "User";
              const lastMsg = convo.messages[0]?.DecryptedMessage || "";
              const avatar = isGroup
                ? DEMO_MEMBERS.neonSquad.avatar
                : key === DEMO_MEMBERS.alex.publicKey
                ? DEMO_MEMBERS.alex.avatar
                : key === DEMO_MEMBERS.sarah.publicKey
                ? DEMO_MEMBERS.sarah.avatar
                : DEMO_MEMBERS.neoTrader.avatar;
              const isAlex = key === DEMO_MEMBERS.alex.publicKey;
              const time = isAlex ? "12m" : key === DEMO_MEMBERS.sarah.publicKey ? "3h" : isGroup ? "2m" : "5h";
              return (
                <DemoConvoItem
                  key={key}
                  avatar={avatar}
                  name={name}
                  lastMsg={lastMsg}
                  time={time}
                  isSelected={key === selectedDemoConvoKey}
                  isGroup={isGroup}
                  unread={isAlex ? 2 : undefined}
                  onClick={() => {
                    playClickSound();
                    onSelectDemoConvo(key);
                  }}
                />
              );
            })}
          </div>

          {/* User profile row */}
          <div
            className="p-4 flex items-center gap-3"
            style={{ borderTop: "1px solid var(--line-subtle)", background: "var(--bg-surface-elevated)" }}
          >
            <img
              src={DEMO_USER.avatar}
              alt={DEMO_USER.name}
              className="w-9 h-9 rounded-xl object-cover"
              style={{ border: "1.5px solid var(--line-emerald)" }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {DEMO_USER.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-emerald)" }}>
                @{DEMO_USER.handle}
              </div>
            </div>
            <Badge tone="accent" uppercase>Preview</Badge>
          </div>
        </aside>

        {/* ── MAIN CHAT ── */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: "var(--color-bg-deep)" }}>
          {/* Chat header */}
          <header
            className="flex items-center justify-between px-5 py-4 shrink-0 glass-mid"
            style={{ borderBottom: "1px solid var(--line-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-specular)",
                }}
              >
                <AssetIcon
                  name={isDemoGroup ? "groupChat" : "defaultProfile"}
                  size={16}
                  tone="light"
                  active
                />
              </div>
              <div>
                <h4 className="font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {demoChatName}
                </h4>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {isDemoGroup ? "4 members · Group · Simulated reply bot" : "Direct · Simulated reply bot"}
                </p>
              </div>
            </div>
          </header>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar flex flex-col-reverse"
            style={{ padding: "20px 24px" }}
          >
            {demoConvo?.messages.map((msg, idx) => {
              const isMe = msg.IsSender;
              const senderPub = msg.SenderInfo?.OwnerPublicKeyBase58Check;
              const senderName = isMe ? DEMO_USER.name : DEMO_USERNAME_MAP[senderPub] || "User";
              const senderAvatar = isMe
                ? DEMO_USER.avatar
                : senderPub === DEMO_MEMBERS.sarah.publicKey
                ? DEMO_MEMBERS.sarah.avatar
                : senderPub === DEMO_MEMBERS.alex.publicKey
                ? DEMO_MEMBERS.alex.avatar
                : DEMO_MEMBERS.neoTrader.avatar;
              const ts = new Date(msg.MessageInfo?.TimestampNanos / 1e6).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <DemoBubble
                  key={idx}
                  username={senderName}
                  avatar={senderAvatar}
                  timestamp={ts}
                  text={msg.DecryptedMessage}
                  isSender={isMe}
                  isNew={idx === 0}
                />
              );
            })}
          </div>

          {/* Composer */}
          <div className="p-3 md:p-4" style={{ borderTop: "1px solid var(--line-subtle)" }}>
            <SendMessageButtonAndInput onClick={onSendMessage} showEncryptionNote={false} />
          </div>
        </div>

        {/* ── INTEL DRAWER ── */}
        {isIntelOpen && (
          <ConversationDetailsPanel
            chatName={demoChatName}
            isGroup={isDemoGroup}
            publicKey={selectedDemoConvoKey}
            isDemo
            onClose={() => {
              playClickSound();
              onToggleIntel();
            }}
          />
        )}
      </div>
    </div>
  );
};
