
import { FC, ReactNode, useMemo, useState } from "react";
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

// ======================================================
// ICONS
// ======================================================

const Icon: FC<{
  name: string;
  size?: number;
  className?: string;
}> = ({ name, size = 18, className = "" }) => {
  const icons: Record<string, ReactNode> = {
    messages: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    activity: (
      <>
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.8v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-2.8h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.8v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
    back: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12M6 6l12 12" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
        <path d="M22 2 11 13" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name] || icons.messages}
    </svg>
  );
};

// ======================================================
// CHAT HELPERS
// ======================================================

const getChatMeta = (key: string, isGroup: boolean) => {
  const name = isGroup
    ? DEMO_MEMBERS.neonSquad.name
    : DEMO_USERNAME_MAP[key] || "Unknown user";

  const avatar = isGroup
    ? DEMO_MEMBERS.neonSquad.avatar
    : key === DEMO_MEMBERS.alex.publicKey
      ? DEMO_MEMBERS.alex.avatar
      : key === DEMO_MEMBERS.sarah.publicKey
        ? DEMO_MEMBERS.sarah.avatar
        : DEMO_MEMBERS.neoTrader.avatar;

  return { name, avatar };
};

const formatTime = (timestamp?: number | null) => {
  if (
    timestamp === undefined ||
    timestamp === null ||
    !Number.isFinite(timestamp) ||
    timestamp <= 0
  ) {
    return "";
  }

  const date = new Date(timestamp / 1e6);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ======================================================
// AVATAR
// ======================================================

const Avatar: FC<{
  src: string;
  name: string;
  size?: "sm" | "md" | "lg";
}> = ({ src, name, size = "md" }) => {
  const dimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-11 h-11",
  };

  return (
    <img
      src={src}
      alt={name}
      className={`
        ${dimensions[size]}
        shrink-0 rounded-full
        object-cover
        border border-white/[0.10]
        bg-[#151C26]
      `}
    />
  );
};

// ======================================================
// NAVIGATION BUTTON
// ======================================================

const RailButton: FC<{
  icon: ReactNode;
  active?: boolean;
  label: string;
  onClick: () => void;
}> = ({ icon, active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    aria-pressed={active}
    className={`
      relative w-10 h-10
      rounded-xl
      flex items-center justify-center
      transition-all duration-200
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-orange-500
      ${active
        ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
        : "text-[#8392A5] hover:text-[#DDE8F4] hover:bg-white/[0.05] border border-transparent"
      }
    `}
  >
    {icon}

    {active && (
      <span className="
        absolute -left-[13px]
        w-[3px] h-5
        rounded-full
        bg-orange-500
      " />
    )}
  </button>
);

// ======================================================
// CONVERSATION LIST ITEM
// ======================================================

const ChatListItem: FC<{
  avatar: string;
  name: string;
  lastMsg: string;
  time: string;
  isSelected: boolean;
  isGroup: boolean;
  onClick: () => void;
}> = ({
  avatar,
  name,
  lastMsg,
  time,
  isSelected,
  isGroup,
  onClick,
}) => (
    <button
      type="button"
      onClick={onClick}
      aria-current={isSelected ? "true" : undefined}
      className={`
      w-full flex items-center gap-3
      px-3 py-3
      text-left rounded-xl
      border transition-all duration-200
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-orange-500
      ${isSelected
          ? "bg-[#17212E] border-orange-500/35"
          : "bg-transparent border-transparent hover:bg-[#111923] hover:border-white/[0.05]"
        }
    `}
    >
      <div className="relative shrink-0">
        <Avatar src={avatar} name={name} />

        <span className={`
        absolute bottom-0 right-0
        w-2.5 h-2.5 rounded-full
        border-2 border-[#090E15]
        ${isGroup ? "bg-sky-400" : "bg-[#78889B]"}
      `} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`
          text-[13px] font-semibold truncate
          ${isSelected ? "text-white" : "text-[#D6DFEA]"}
        `}>
            {name}
          </span>

          <span className="text-[10px] text-[#75869A] shrink-0">
            {time}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-[#8494A8] truncate">
            {lastMsg || "Start a conversation"}
          </p>

          {isGroup && (
            <span className="
            text-[9px] tracking-wider
            text-sky-300/80 shrink-0
          ">
              GROUP
            </span>
          )}
        </div>
      </div>
    </button>
  );

// ======================================================
// MESSAGE BUBBLE
// ======================================================

const MessageBubble: FC<{
  username: string;
  avatar: string;
  timestamp: string;
  text: string;
  isSender: boolean;
}> = ({
  username,
  avatar,
  timestamp,
  text,
  isSender,
}) => (
    <div className={`
    flex items-end gap-3 mb-5
    ${isSender ? "flex-row-reverse" : "flex-row"}
  `}>
      {!isSender && (
        <Avatar
          src={avatar}
          name={username}
          size="sm"
        />
      )}

      <div className={`
      flex flex-col
      max-w-[88%] sm:max-w-[75%] lg:max-w-[72%]
      ${isSender ? "items-end" : "items-start"}
    `}>
        {!isSender && (
          <span className="
          text-[10px] font-medium
          text-[#91A7BD]
          mb-1.5 px-1
        ">
            {username}
          </span>
        )}

        <div className={`
        px-4 py-3
        text-[13px] sm:text-[13.5px]
        leading-[1.7]
        whitespace-pre-wrap break-words
        ${isSender
            ? "bg-gradient-to-br from-[#F97316] to-[#C95117] text-white rounded-2xl rounded-br-[5px] border border-orange-300/20"
            : "bg-[#151E2A] text-[#E0E8F1] rounded-2xl rounded-bl-[5px] border border-sky-100/[0.10]"
          }
      `}>
          {text}
        </div>

        <span className="
        text-[9px] text-[#71849A]
        mt-1.5 px-1
      ">
          {timestamp}
        </span>
      </div>
    </div>
  );

// ======================================================
// PROPS
// ======================================================

export interface DemoChatWorkspaceProps {
  demoConversations: ConversationMap;
  selectedDemoConvoKey: string;
  onSelectDemoConvo: (key: string) => void;
  onSendMessage: (text: string) => void;
  isIntelOpen: boolean;
  onToggleIntel: () => void;
  onExitDemo: () => void;
}

// ======================================================
// MAIN SUPMATE WORKSPACE
// ======================================================

export const DemoChatWorkspace: FC<DemoChatWorkspaceProps> = ({
  demoConversations,
  selectedDemoConvoKey,
  onSelectDemoConvo,
  onSendMessage,
  isIntelOpen,
  onToggleIntel,
  onExitDemo,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "groups">("all");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [activeRail, setActiveRail] = useState("messages");

  // Current conversation
  const demoConvo = demoConversations[selectedDemoConvoKey];

  const isDemoGroup =
    demoConvo?.ChatType === ChatType.GROUPCHAT;

  const demoChatName = isDemoGroup
    ? DEMO_MEMBERS.neonSquad.name
    : DEMO_USERNAME_MAP[selectedDemoConvoKey] || "Chat";

  // Conversation list
  const conversations = useMemo(() => {
    return Object.entries(demoConversations)
      .map(([key, convo]) => {
        const isGroup = convo.ChatType === ChatType.GROUPCHAT;
        const meta = getChatMeta(key, isGroup);

        const latestMessage = convo.messages[0];

        return {
          key,
          isGroup,
          ...meta,
          lastMessage: latestMessage?.DecryptedMessage || "",
          timestamp: Number(
            latestMessage?.MessageInfo?.TimestampNanos
          ),
        };
      })
      .filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(search.trim().toLowerCase());

        const matchesFilter =
          filter === "all" || item.isGroup;

        return matchesSearch && matchesFilter;
      });
  }, [demoConversations, search, filter]);

  // Current conversation avatar
  const currentMeta = getChatMeta(
    selectedDemoConvoKey,
    isDemoGroup
  );

  return (
    <div className="
      w-full h-full min-h-0
      flex overflow-hidden
      bg-[#05080D]
      text-white
      font-sans antialiased
    ">

      {/* ==============================================
          LEFT ICON RAIL
      ============================================== */}

      <aside className="
        hidden sm:flex
        w-[66px] shrink-0
        flex-col items-center
        py-5 gap-4
        bg-[#070B11]
        border-r border-white/[0.07]
      ">

        <RailButton
          label="Messages"
          active={activeRail === "messages"}
          onClick={() => setActiveRail("messages")}
          icon={<Icon name="messages" size={19} />}
        />

        <div className="w-7 h-px bg-white/[0.08] my-1" />

        <RailButton
          label="Telemetry"
          active={activeRail === "activity"}
          onClick={() => {
            setActiveRail("activity");
            onToggleIntel();
          }}
          icon={<Icon name="activity" size={19} />}
        />

        <RailButton
          label="Settings"
          active={activeRail === "settings"}
          onClick={() => {
            setActiveRail("settings");
            toast.info("Settings are not available in this demo.");
          }}
          icon={<Icon name="settings" size={19} />}
        />

        <div className="mt-auto">
          <button
            type="button"
            onClick={onExitDemo}
            title="Exit demo"
            aria-label="Exit demo"
            className="
              w-10 h-10 rounded-full
              overflow-hidden
              border border-white/10
              hover:border-orange-500/50
              transition-colors
            "
          >
            <img
              src={DEMO_USER.avatar}
              alt={DEMO_USER.name}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </aside>

      {/* ==============================================
          CONVERSATION SIDEBAR
      ============================================== */}

      <aside className={`
        w-full sm:w-[280px] lg:w-[320px]
        shrink-0 flex flex-col
        bg-[#090E15]
        border-r border-white/[0.07]
        ${mobileChatOpen
          ? "hidden sm:flex"
          : "flex"
        }
      `}>

        {/* Sidebar heading */}
        <div className="px-5 pt-6 pb-4">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="
                text-[19px]
                font-semibold
                tracking-tight
                text-white
              ">
                Messages
              </h2>

              <p className="
                text-[11px]
                text-[#8294A9]
                mt-1
              ">
                Your conversations
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                toast.info(
                  "Connect wallet to create a new conversation."
                );
              }}
              title="New conversation"
              aria-label="New conversation"
              className="
                w-10 h-10 rounded-xl
                flex items-center justify-center
                bg-[#F97316]
                text-white
                hover:bg-[#FF8A35]
                shadow-[0_4px_18px_rgba(249,115,22,0.20)]
                active:scale-95
                transition-all
              "
            >
              <Icon name="plus" size={21} />
            </button>
          </div>

          {/* Search */}
          <div className="
            h-10 px-3
            flex items-center gap-2.5
            rounded-lg
            bg-[#111925]
            border border-white/[0.08]
            focus-within:border-orange-500/50
            transition-colors
          ">
            <span className="text-[#8395A9]">
              <Icon name="search" size={16} />
            </span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="
                w-full min-w-0
                bg-transparent
                outline-none
                text-xs text-white
                placeholder:text-[#697B90]
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="
                  text-[#8B9AAC]
                  hover:text-white
                "
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-4">

            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`
                px-3 py-1.5
                rounded-lg
                text-[11px]
                transition-all
                ${filter === "all"
                  ? "bg-orange-500/[0.12] text-orange-300 border border-orange-500/30"
                  : "text-[#91A0B2] border border-transparent hover:text-white"
                }
              `}
            >
              All chats
            </button>

            <button
              type="button"
              onClick={() => setFilter("groups")}
              className={`
                px-3 py-1.5
                rounded-lg
                text-[11px]
                transition-all
                ${filter === "groups"
                  ? "bg-orange-500/[0.12] text-orange-300 border border-orange-500/30"
                  : "text-[#91A0B2] border border-transparent hover:text-white"
                }
              `}
            >
              Groups
            </button>

          </div>
        </div>

        {/* Conversation list */}
        <div className="
          flex-1 min-h-0
          overflow-y-auto
          px-3 pb-3
          custom-scrollbar
        ">

          <div className="
            px-2 py-3
            text-[9px]
            font-semibold
            tracking-[0.20em]
            uppercase
            text-[#6F8196]
          ">
            Conversations · {conversations.length}
          </div>

          {conversations.map((item) => (
            <ChatListItem
              key={item.key}
              avatar={item.avatar}
              name={item.name}
              lastMsg={item.lastMessage}
              time={formatTime(item.timestamp)}
              isSelected={
                item.key === selectedDemoConvoKey
              }
              isGroup={item.isGroup}
              onClick={() => {
                playClickSound();
                onSelectDemoConvo(item.key);
                setMobileChatOpen(true);
              }}
            />
          ))}

          {conversations.length === 0 && (
            <div className="
              py-12 px-5
              flex flex-col items-center
              text-center
            ">
              <div className="
                w-11 h-11 rounded-xl
                flex items-center justify-center
                bg-[#131E2B]
                text-[#8CA2B9]
                mb-3
              ">
                <Icon name="search" size={21} />
              </div>

              <p className="text-xs text-[#A4B2C1]">
                No conversations found
              </p>

              <p className="
                text-[10px] text-[#718196]
                mt-1
              ">
                Try another search.
              </p>
            </div>
          )}
        </div>

        {/* Profile footer */}
        <div className="
          p-4
          border-t border-white/[0.07]
          flex items-center gap-3
          bg-[#080D13]
        ">
          <Avatar
            src={DEMO_USER.avatar}
            name={DEMO_USER.name}
          />

          <div className="flex-1 min-w-0">
            <p className="
              text-xs font-semibold
              text-white truncate
            ">
              {DEMO_USER.name}
            </p>

            <p className="
              text-[10px]
              text-[#8496AA]
              mt-0.5
            ">
              Demo account
            </p>
          </div>

          <button
            type="button"
            onClick={onExitDemo}
            aria-label="Exit demo"
            title="Exit demo"
            className="
              text-[#8393A6]
              hover:text-orange-400
              transition-colors
            "
          >
            <AssetIcon name="logout" size={16} />
          </button>
        </div>
      </aside>

      {/* ==============================================
          CENTRAL CHAT WORKSPACE
      ============================================== */}

      <main className={`
        flex-1 min-w-0 min-h-0
        flex flex-col
        bg-[#05080D]
        relative
        ${mobileChatOpen
          ? "flex"
          : "hidden sm:flex"
        }
      `}>

        {demoConvo ? (
          <>
            {/* Chat header */}
            <header className="
              h-[72px] shrink-0
              px-4 sm:px-7
              flex items-center justify-between
              bg-[#080D14]
              border-b border-white/[0.07]
              relative z-10
            ">

              <div className="
                flex items-center gap-3
                min-w-0
              ">

                {/* Mobile back */}
                <button
                  type="button"
                  onClick={() => setMobileChatOpen(false)}
                  aria-label="Back to conversations"
                  className="
                    sm:hidden
                    w-9 h-9 rounded-lg
                    flex items-center justify-center
                    text-[#A0B1C3]
                    hover:bg-white/[0.05]
                  "
                >
                  <Icon name="back" size={20} />
                </button>

                <Avatar
                  src={currentMeta.avatar}
                  name={demoChatName}
                  size="lg"
                />

                <div className="min-w-0">
                  <h3 className="
                    text-sm font-semibold
                    text-white truncate
                  ">
                    {isDemoGroup && (
                      <span className="text-orange-400 mr-1.5">
                        ⚡
                      </span>
                    )}
                    {demoChatName}
                  </h3>

                  <p className="
                    text-[10px]
                    text-[#8295AA]
                    mt-1
                  ">
                    {isDemoGroup
                      ? "Group conversation"
                      : "Direct conversation"}
                  </p>
                </div>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-1.5">

                <button
                  type="button"
                  onClick={() => {
                    toast.info(
                      "Conversation search is not implemented in this demo."
                    );
                  }}
                  title="Search conversation"
                  aria-label="Search conversation"
                  className="
                    w-9 h-9 rounded-lg
                    flex items-center justify-center
                    text-[#8FA0B3]
                    hover:text-orange-400
                    hover:bg-orange-500/[0.08]
                    transition-all
                  "
                >
                  <Icon name="search" size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onToggleIntel();
                  }}
                  title="Conversation details"
                  aria-label="Conversation details"
                  aria-expanded={isIntelOpen}
                  className={`
                    w-9 h-9 rounded-lg
                    flex items-center justify-center
                    transition-all
                    ${isIntelOpen
                      ? "text-orange-400 bg-orange-500/[0.12]"
                      : "text-[#8FA0B3] hover:text-orange-400 hover:bg-orange-500/[0.08]"
                    }
                  `}
                >
                  <Icon name="info" size={19} />
                </button>

              </div>
            </header>

            {/* Message area */}
            <section className="
              flex-1 min-h-0
              relative overflow-hidden
              flex flex-col
            ">

              {/* Subtle atmospheric background */}
              <div
                aria-hidden="true"
                className="
                  absolute pointer-events-none
                  top-[15%] left-[35%]
                  w-[420px] h-[420px]
                  rounded-full
                  bg-sky-500/[0.025]
                  blur-[130px]
                "
              />

              <div
                className="
                  relative z-10
                  flex-1 min-h-0
                  overflow-y-auto
                  px-4 sm:px-8 lg:px-12
                  py-8
                  custom-scrollbar
                "
              >
                {/* Centered message column */}
                <div className="
                  w-full max-w-[1000px]
                  mx-auto
                  flex flex-col-reverse
                ">

                  {demoConvo.messages.map((msg, idx) => {
                    const isMe = msg.IsSender;

                    const senderPub =
                      msg.SenderInfo?.OwnerPublicKeyBase58Check;

                    const senderName = isMe
                      ? DEMO_USER.name
                      : DEMO_USERNAME_MAP[senderPub] || "User";

                    const senderAvatar = isMe
                      ? DEMO_USER.avatar
                      : senderPub === DEMO_MEMBERS.sarah.publicKey
                        ? DEMO_MEMBERS.sarah.avatar
                        : senderPub === DEMO_MEMBERS.alex.publicKey
                          ? DEMO_MEMBERS.alex.avatar
                          : DEMO_MEMBERS.neoTrader.avatar;

                    const timestamp = formatTime(
                      Number(
                        msg.MessageInfo?.TimestampNanos
                      )
                    );

                    return (
                      <MessageBubble
                        key={`
                          ${senderPub || "sender"}-
                          ${msg.MessageInfo?.TimestampNanos ?? idx}-
                          ${idx}
                        `}
                        username={senderName}
                        avatar={senderAvatar}
                        timestamp={timestamp}
                        text={msg.DecryptedMessage || ""}
                        isSender={isMe}
                      />
                    );
                  })}

                  {demoConvo.messages.length === 0 && (
                    <div className="
                      min-h-[350px]
                      flex flex-col
                      items-center justify-center
                      text-center
                    ">
                      <div className="
                        w-16 h-16 rounded-2xl
                        flex items-center justify-center
                        bg-orange-500/[0.10]
                        border border-orange-500/20
                        text-orange-400
                        mb-5
                      ">
                        <Icon name="messages" size={27} />
                      </div>

                      <h3 className="
                        text-base font-semibold
                        text-white
                      ">
                        Start a conversation
                      </h3>

                      <p className="
                        text-xs text-[#8496AA]
                        mt-2 max-w-xs
                      ">
                        Send your first message to begin.
                      </p>
                    </div>
                  )}

                </div>
              </div>
            </section>

            {/* Message composer */}
            <footer className="
              shrink-0
              px-4 sm:px-7
              pt-4 pb-4
              bg-[#080D14]
              border-t border-white/[0.07]
              relative z-10
            ">
              <div className="
                w-full max-w-[1000px]
                mx-auto
                rounded-xl
                bg-[#111925]
                border border-white/[0.09]
                hover:border-white/[0.14]
                focus-within:border-orange-500/40
                p-2
                transition-colors
              ">
                <SendMessageButtonAndInput
                  onClick={onSendMessage}
                  showEncryptionNote={false}
                />
              </div>

              <div className="
                max-w-[1000px] mx-auto
                flex items-center justify-between
                mt-2 px-1
              ">
                <span className="
                  text-[9px]
                  text-[#687B91]
                ">
                  SUPMATE · DEMO ENVIRONMENT
                </span>

                <span className="
                  flex items-center gap-1.5
                  text-[9px]
                  text-[#8294A8]
                ">
                  <span className="
                    w-1.5 h-1.5 rounded-full
                    bg-sky-400
                  " />
                  Local demo
                </span>
              </div>
            </footer>
          </>
        ) : (
          /* No selected conversation */
          <div className="
            flex-1
            flex flex-col
            items-center justify-center
            px-6 text-center
          ">
            <div className="
              w-16 h-16 rounded-2xl
              flex items-center justify-center
              bg-[#111B27]
              border border-white/[0.08]
              text-orange-400
              mb-5
            ">
              <Icon name="messages" size={28} />
            </div>

            <h2 className="
              text-xl font-semibold
              text-white
            ">
              Your conversations
            </h2>

            <p className="
              text-sm text-[#8192A6]
              mt-2 max-w-sm
            ">
              Select a conversation from the sidebar
              to start messaging.
            </p>
          </div>
        )}

      </main>

      {/* ==============================================
          CONVERSATION DETAILS PANEL
      ============================================== */}

      {isIntelOpen && demoConvo && (
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
  );
};
