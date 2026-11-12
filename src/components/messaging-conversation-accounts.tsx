
import { ChatType } from "deso-protocol";
import { FC, useState } from "react";

import { getChatNameFromConversation } from "../utils/helpers";
import { ConversationMap } from "../utils/types";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";
import { MessagingStartNewConversation } from "./messaging-start-new-conversation";
import { shortenLongWord } from "./search-users";
import { StartGroupChat } from "./start-group-chat";

/* -------------------------------------------------------------------------- */
/* Time formatting                                                            */
/* -------------------------------------------------------------------------- */

const formatChannelTime = (tsNanos: number): string => {
  if (!tsNanos) return "";

  const date = new Date(tsNanos / 1e6);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

/* -------------------------------------------------------------------------- */
/* Local icons                                                                */
/* -------------------------------------------------------------------------- */

const ChannelGlyph = ({ size = 22 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2.5 14.7 9.3 21.5 12l-6.8 2.7L12 21.5l-2.7-6.8L2.5 12l6.8-2.7L12 2.5Z" />
  </svg>
);

const SearchSparkle = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m12 2 1.9 7.1L21 11l-7.1 1.9L12 20l-1.9-7.1L3 11l7.1-1.9L12 2Z" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Scoped layout and visual styling                                           */
/* -------------------------------------------------------------------------- */

const channelStyles = `
  .index-bento {
    position: relative;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: visible;
    isolation: isolate;
  }

  .index-bento__header,
  .index-bento__search,
  .index-bento__tabs-header {
    flex-shrink: 0;
  }

  .index-bento__tabs-content {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: visible;
  }

  .index-bento .channel-list {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(148,163,184,.35) transparent;
    -webkit-overflow-scrolling: touch;
  }

  .index-bento .channel-list::-webkit-scrollbar {
    width: 5px;
  }

  .index-bento .channel-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .index-bento .channel-list::-webkit-scrollbar-thumb {
    border-radius: 20px;
    background: rgba(148,163,184,.28);
  }

  .index-bento .channel-list::-webkit-scrollbar-thumb:hover {
    background: rgba(103,232,249,.55);
  }

  .index-bento__reflection {
    position: absolute;
    top: 0;
    left: 8%;
    right: 8%;
    height: 1px;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.55),
      transparent
    );
  }

  .index-bento__search-shell {
    position: relative;
    overflow: visible;
    border: 1px solid rgba(255,255,255,.13);
    border-radius: 17px;
    padding: 5px;
    background: rgba(0,0,0,.28);
    box-shadow:
      inset 0 2px 8px rgba(0,0,0,.36),
      0 1px 0 rgba(255,255,255,.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transition: border-color .25s ease, box-shadow .25s ease;
  }

  .index-bento__search-shell:focus-within {
    border-color: rgba(103,232,249,.48);
    box-shadow:
      inset 0 2px 8px rgba(0,0,0,.36),
      0 0 20px rgba(34,211,238,.09);
  }

  .index-bento__search-shell .search-input {
    min-width: 0;
    color: #f8fafc;
    background: transparent;
  }

  .index-bento__search-shell .search-input::placeholder {
    color: #77818e;
  }

  .index-bento__search-shell input:focus {
    outline: none;
  }

  .index-bento__search-shell [role="listbox"] {
    z-index: 100;
  }

  .index-bento__channel {
    animation: index-channel-enter .25s ease both;
  }

  .index-bento__channel:focus-visible {
    outline: 2px solid rgba(103,232,249,.75);
    outline-offset: 2px;
  }

  .index-bento__empty {
    min-height: 190px;
  }

  @media(max-width: 767px) {
    .index-bento {
      flex: 1 1 auto;
      height: auto;
      min-height: 380px;
      max-height: 65vh;
    }

    .index-bento .channel-list {
      min-height: 0;
    }
  }

  @media(prefers-reduced-motion: reduce) {
    .index-bento__channel {
      animation: none;
    }
  }

  @keyframes index-channel-enter {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/* -------------------------------------------------------------------------- */
/* Conversation list                                                          */
/* -------------------------------------------------------------------------- */

export const MessagingConversationAccount: FC<{
  conversations: ConversationMap;
  getUsernameByPublicKeyBase58Check: {
    [key: string]: string;
  };
  selectedConversationPublicKey: string;
  onClick: (publicKey: string) => void;
  rehydrateConversation: (publicKey?: string) => void;
  isUnread?: (publicKey: string) => boolean;
}> = ({
  conversations,
  getUsernameByPublicKeyBase58Check,
  selectedConversationPublicKey,
  onClick,
  rehydrateConversation,
  isUnread,
}) => {
    const [activeTab, setActiveTab] =
      useState<"chats" | "requests">("chats");

    const entries = Object.entries(conversations || {}).sort(
      ([aPub, convoA], [bPub, convoB]) => {
        const aMsgs = convoA?.messages ?? [];
        const bMsgs = convoB?.messages ?? [];

        const aTime = aMsgs[0]?.MessageInfo?.TimestampNanos ?? 0;
        const bTime = bMsgs[0]?.MessageInfo?.TimestampNanos ?? 0;

        const aHasMessages = aMsgs.length > 0;
        const bHasMessages = bMsgs.length > 0;

        if (aHasMessages !== bHasMessages) {
          return aHasMessages ? -1 : 1;
        }

        if (!aHasMessages && !bHasMessages) {
          if (aPub === selectedConversationPublicKey) return -1;
          if (bPub === selectedConversationPublicKey) return 1;
        }

        return bTime - aTime;
      }
    );

    return (
      <>
        <style>{channelStyles}</style>

        <section
          className="
          bento index-bento relative isolate
          flex flex-1 flex-col
          min-h-0 min-w-0
          overflow-hidden rounded-[24px]
          border border-white/[0.11]
          bg-[#0c1015] text-white
          shadow-[0_22px_65px_rgba(0,0,0,0.42)]
        "
          aria-label="Encrypted channel index"
        >
          {/* Ambient liquid-glass lighting */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-fuchsia-500/[0.12] blur-[85px]" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-400/[0.09] blur-[90px]" />
            <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-amber-300/[0.045] blur-[75px]" />

            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.055] via-transparent to-white/[0.015]" />

            <div
              className="absolute right-3 top-20 h-24 w-24 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(251,191,36,0.95) 1px, transparent 1px)",
                backgroundSize: "7px 7px",
                maskImage:
                  "radial-gradient(circle, black 5%, transparent 75%)",
              }}
            />
          </div>

          <div className="index-bento__reflection" />

          {/* HEADER */}
          <header
            className="
            index-bento__header relative
            flex shrink-0 flex-col gap-3
            border-b border-white/[0.08] p-4
          "
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                  relative flex h-10 w-10 shrink-0
                  rotate-[-5deg] items-center justify-center
                  rounded-[14px] border border-amber-200/25
                  bg-gradient-to-br from-amber-300/[0.19]
                  via-orange-400/[0.09] to-rose-400/[0.10]
                  text-amber-200
                  shadow-[0_5px_22px_rgba(251,146,60,0.12)]
                  transition-transform duration-300
                  hover:rotate-6 hover:scale-110
                "
                >
                  <ChannelGlyph size={22} />

                  <span
                    className="
                    absolute -right-1 -top-1
                    h-3 w-3 rounded-full
                    border-2 border-[#0c1015]
                    bg-cyan-300
                    shadow-[0_0_10px_rgba(103,232,249,0.7)]
                  "
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-[17px] font-extrabold tracking-tight text-white">
                      Channels
                    </h2>

                    <span
                      className="
                      shrink-0 rounded-full
                      border border-white/[0.12]
                      bg-white/[0.07] px-2 py-0.5
                      font-mono text-[10px] font-bold
                      tabular-nums text-neutral-300
                    "
                      aria-label={`${entries.length} conversations`}
                    >
                      {entries.length}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-400">
                    Your private conversation space
                  </p>
                </div>
              </div>

              <span
                className="
                hidden shrink-0 rounded-md
                border border-cyan-300/15
                bg-cyan-300/[0.05] px-2 py-1
                font-mono text-[8px] tracking-widest
                text-cyan-200/70 sm:inline-flex
              "
              >
                PRIVATE / 01
              </span>
            </div>

            {/* GROUP CHAT BUTTON */}
            <div
              className="
              w-full min-w-0
              [&_button]:!flex
              [&_button]:!min-h-[42px]
              [&_button]:!w-full
              [&_button]:!items-center
              [&_button]:!justify-center
              [&_button]:!gap-2
              [&_button]:!rounded-xl
              [&_button]:!border
              [&_button]:!border-white/[0.12]
              [&_button]:!bg-white/[0.055]
              [&_button]:!px-3
              [&_button]:!py-2.5
              [&_button]:!text-[11px]
              [&_button]:!font-bold
              [&_button]:!tracking-wide
              [&_button]:!text-neutral-100
              [&_button]:!shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]
              [&_button]:!transition-all
              [&_button]:!duration-300
              [&_button:hover]:!border-cyan-200/30
              [&_button:hover]:!bg-cyan-300/[0.09]
              [&_button:hover]:!shadow-[0_0_22px_rgba(34,211,238,0.08)]
              [&_button:active]:!scale-[0.985]
            "
            >
              <StartGroupChat onSuccess={rehydrateConversation} />
            </div>
          </header>

          {/* SEARCH */}
          <div
            className="
            index-bento__search relative shrink-0
            border-b border-white/[0.08] p-3.5
          "
          >
            <div className="index-bento__search-shell">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-transparent" />

              <div className="relative min-w-0">
                <MessagingStartNewConversation
                  rehydrateConversation={rehydrateConversation}
                />
              </div>

              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <SearchSparkle />
              </div>
            </div>

            <div className="mt-2 flex items-start gap-2 px-2 text-[10px] leading-relaxed text-neutral-500">
              <span className="mt-0.5 shrink-0 text-cyan-300/70">⌕</span>
              <span>Resolves DeSo keys, 0x addresses and ENS names</span>
            </div>
          </div>

          {/* TABS */}
          <div className="index-bento__tabs-header shrink-0 px-3.5 pb-3 pt-3.5">
            <div
              role="tablist"
              className="
              flex items-center gap-1
              rounded-[17px] border border-white/[0.10]
              bg-black/30 p-1
              shadow-[inset_0_2px_7px_rgba(0,0,0,0.35)]
              backdrop-blur-xl
            "
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035)",
              }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "chats"}
                onClick={() => setActiveTab("chats")}
                className={`
                flex-1 rounded-xl py-2.5 text-center transition-all duration-200
                ${activeTab === "chats"
                    ? "border border-white/[0.13] bg-gradient-to-br from-white/[0.15] via-white/[0.08] to-white/[0.035] shadow-[0_3px_14px_rgba(0,0,0,0.25)] text-neutral-100"
                    : "border border-transparent text-neutral-400 hover:text-neutral-200"
                  }
              `}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span className="text-[11px] font-bold tracking-wide">
                  Chats
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "requests"}
                onClick={() => setActiveTab("requests")}
                className={`
                flex-1 rounded-xl py-2.5 text-center transition-all duration-200
                ${activeTab === "requests"
                    ? "border border-white/[0.13] bg-gradient-to-br from-white/[0.15] via-white/[0.08] to-white/[0.035] shadow-[0_3px_14px_rgba(0,0,0,0.25)] text-neutral-100"
                    : "border border-transparent text-neutral-400 hover:text-neutral-200"
                  }
              `}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span className="text-[11px] font-bold tracking-wide">
                  Requests
                </span>
              </button>
            </div>
          </div>

          {/* INDEPENDENTLY SCROLLABLE CONTENT */}
          <div className="index-bento__tabs-content">
            {activeTab === "chats" && (
              <div
                className="
                channel-list custom-scrollbar
                flex-1 min-h-0 min-w-0
                overflow-x-hidden overflow-y-auto
                overscroll-contain px-2.5 pb-3
              "
                aria-label="Your conversations"
              >
                {entries.map(([publicKey, conversation]) => {
                  const isSelected =
                    publicKey === selectedConversationPublicKey;

                  const isGroup =
                    conversation.ChatType === ChatType.GROUPCHAT;

                  const firstMsg = conversation.messages?.[0];
                  const unread = isUnread?.(publicKey) ?? false;

                  const name =
                    getChatNameFromConversation(
                      conversation,
                      getUsernameByPublicKeyBase58Check
                    ) || shortenLongWord(publicKey, 6, 4);

                  const messagePreview = firstMsg
                    ? firstMsg.DecryptedMessage || "Message encrypted…"
                    : "No messages yet";

                  const timestamp =
                    firstMsg?.MessageInfo?.TimestampNanos;

                  return (
                    <button
                      key={publicKey}
                      type="button"
                      onClick={() => onClick(publicKey)}
                      aria-current={isSelected ? "true" : undefined}
                      className={`
                      index-bento__channel
                      group relative mb-2 flex w-full min-w-0
                      items-center gap-2.5 overflow-hidden
                      rounded-[17px] border px-2.5 py-3
                      text-left transition-all duration-300 ease-out
                      active:scale-[0.985]
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-cyan-300/60
                      ${isSelected
                          ? `
                            border-cyan-200/25
                            bg-gradient-to-r
                            from-cyan-300/[0.12]
                            via-white/[0.055]
                            to-fuchsia-300/[0.045]
                            shadow-[0_7px_25px_rgba(34,211,238,0.07),inset_0_1px_0_rgba(255,255,255,0.07)]
                          `
                          : `
                            border-white/[0.045]
                            bg-white/[0.02]
                            hover:-translate-y-[1px]
                            hover:border-white/[0.12]
                            hover:bg-white/[0.055]
                            hover:shadow-[0_8px_22px_rgba(0,0,0,0.20)]
                          `
                        }
                    `}
                    >
                      {isSelected && (
                        <>
                          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.04] via-transparent to-transparent" />

                          <span
                            className="
                            pointer-events-none absolute left-0
                            top-3 h-[calc(100%-24px)] w-[3px]
                            rounded-r-full
                            bg-gradient-to-b from-cyan-200
                            via-blue-300 to-fuchsia-300
                            shadow-[0_0_12px_rgba(103,232,249,0.55)]
                          "
                          />
                        </>
                      )}

                      {/* Avatar */}
                      <div
                        className="
                        relative z-[1] shrink-0
                        rounded-[14px] border border-white/[0.12]
                        bg-gradient-to-br from-white/[0.10]
                        to-white/[0.025] p-0.5
                        shadow-[0_4px_14px_rgba(0,0,0,0.25)]
                        transition-transform duration-300
                        group-hover:scale-[1.045]
                      "
                      >
                        <div className="overflow-hidden rounded-[11px]">
                          <MessagingDisplayAvatar
                            publicKey={
                              isGroup
                                ? undefined
                                : conversation.firstMessagePublicKey
                            }
                            username={isGroup ? undefined : name}
                            diameter={36}
                            groupChat={isGroup}
                          />

                          {isGroup && (
                            <div
                              className="
                              flex h-9 w-9 items-center
                              justify-center rounded-[11px]
                              bg-gradient-to-br
                              from-violet-400/30
                              to-blue-500/20
                              text-violet-100
                            "
                              aria-label="Group conversation"
                            >
                              <ChannelGlyph size={19} />
                            </div>
                          )}
                        </div>

                        {unread && (
                          <span
                            className="
                            absolute -right-1 -top-1
                            h-3 w-3 rounded-full
                            border-2 border-[#0c1015]
                            bg-rose-400
                            shadow-[0_0_11px_rgba(251,113,133,0.7)]
                          "
                          />
                        )}
                      </div>

                      {/* Name and preview */}
                      <div className="relative z-[1] min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span
                            className={`
                            min-w-0 flex-1 truncate
                            text-[12px] tracking-tight
                            ${unread
                                ? "font-extrabold text-white"
                                : "font-semibold text-neutral-200"
                              }
                          `}
                          >
                            {name}
                          </span>

                          {isGroup && (
                            <span
                              className="
                              shrink-0 rounded-md
                              border border-violet-300/20
                              bg-violet-300/[0.09]
                              px-1.5 py-0.5
                              font-mono text-[8px] font-bold
                              tracking-wider text-violet-200
                            "
                            >
                              GROUP
                            </span>
                          )}
                        </div>

                        <p
                          className={`
                          mt-1 truncate text-[10px] leading-relaxed
                          ${unread
                              ? "font-medium text-neutral-200"
                              : "text-neutral-500"
                            }
                        `}
                        >
                          {messagePreview}
                        </p>
                      </div>

                      {/* Timestamp and unread indicator */}
                      <div
                        className="
                        relative z-[1] flex shrink-0
                        flex-col items-end gap-2
                        self-stretch pt-0.5
                      "
                      >
                        <span
                          className="
                          whitespace-nowrap font-mono
                          text-[9px] tabular-nums
                          text-neutral-500
                        "
                        >
                          {timestamp ? formatChannelTime(timestamp) : ""}
                        </span>

                        {unread && (
                          <span
                            className="
                            rounded-full
                            border border-rose-300/20
                            bg-rose-300/[0.10] px-1.5 py-0.5
                            font-mono text-[8px] font-bold
                            tracking-wider text-rose-200
                          "
                          >
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Hover glow */}
                      <span
                        className="
                        pointer-events-none absolute -right-12
                        -top-12 h-28 w-28 rounded-full
                        bg-cyan-300/[0.075] blur-2xl
                        opacity-0 transition-opacity duration-300
                        group-hover:opacity-100
                      "
                      />
                    </button>
                  );
                })}

                {/* Empty state */}
                {entries.length === 0 && (
                  <div
                    className="
                    index-bento__empty
                    flex w-full flex-col
                    items-center justify-center
                    px-5 py-8 text-center
                  "
                  >
                    <div
                      className="
                      relative mb-4 flex h-14 w-14
                      rotate-[-5deg] items-center justify-center
                      rounded-[19px] border border-amber-200/20
                      bg-gradient-to-br from-amber-300/[0.14]
                      via-rose-300/[0.08] to-fuchsia-300/[0.07]
                      text-amber-200
                      shadow-[0_8px_30px_rgba(251,146,60,0.10)]
                      transition-transform duration-300
                      hover:rotate-6 hover:scale-110
                    "
                    >
                      <ChannelGlyph size={28} />

                      <span
                        className="
                        absolute -right-3 -top-2
                        rotate-[9deg] rounded-lg
                        border border-cyan-200/25
                        bg-cyan-300/[0.09] px-1.5 py-1
                        font-mono text-[8px] font-black
                        text-cyan-200
                      "
                      >
                        POP!
                      </span>
                    </div>

                    <p className="text-[13px] font-bold text-neutral-100">
                      No open channels
                    </p>

                    <p
                      className="
                      mt-1 max-w-[205px] text-[11px]
                      leading-relaxed text-neutral-500
                    "
                    >
                      Start a conversation above to create your first
                      private channel.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div
                className="
                flex flex-1 min-h-[190px]
                flex-col items-center justify-center
                px-5 py-8 text-center
              "
              >
                <div
                  className="
                  relative mb-4 flex h-14 w-14
                  rotate-[-5deg] items-center justify-center
                  rounded-[19px] border border-violet-300/20
                  bg-gradient-to-br from-violet-300/[0.15]
                  to-blue-300/[0.07]
                  text-violet-200
                  shadow-[0_8px_25px_rgba(139,92,246,0.10)]
                  transition-transform duration-300
                  hover:rotate-6 hover:scale-110
                "
                >
                  ↗
                </div>

                <p className="text-[12px] font-semibold text-neutral-200">
                  No pending message requests
                </p>

                <p
                  className="
                  mt-1 text-[10px] leading-relaxed
                  text-neutral-500
                "
                >
                  New requests will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </>
    );
  };
