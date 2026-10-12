import {
  Tab,
  TabPanel,
  Tabs,
  TabsBody,
  TabsHeader,
} from "@material-tailwind/react";
import { ChatType } from "deso-protocol";
import { FC } from "react";
import { getChatNameFromConversation } from "../utils/helpers";
import { ConversationMap } from "../utils/types";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";
import { MessagingStartNewConversation } from "./messaging-start-new-conversation";
import { shortenLongWord } from "./search-users";
import { StartGroupChat } from "./start-group-chat";

const formatChannelTime = (tsNanos: number): string => {
  const date = new Date(tsNanos / 1e6);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

/**
 * Bento 2 · Encrypted timeline index.
 *
 * A highly organized stream of open channels sorted by latest pulse. Each row
 * is name, a one-line muted preview, a tiny monospaced timestamp and a clean
 * solid monochrome dot for unread state — no badges, no decorative chrome.
 */
export const MessagingConversationAccount: FC<{
  conversations: ConversationMap;
  getUsernameByPublicKeyBase58Check: { [key: string]: string };
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
  const entries = Object.entries(conversations).sort(([aPub, convoA], [bPub, convoB]) => {
    if (convoA.messages.length === 0) {
      return aPub === selectedConversationPublicKey ? -1 : 1;
    }
    if (convoB.messages.length === 0) {
      return bPub === selectedConversationPublicKey ? 1 : -1;
    }
    return (
      convoB.messages[0].MessageInfo.TimestampNanos -
      convoA.messages[0].MessageInfo.TimestampNanos
    );
  });

  return (
    <div className="bento index-bento" aria-label="Encrypted channel index">
      {/* Head */}
      <div className="index-bento__head">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="index-bento__title">Channels</span>
          <span className="index-bento__count">/{entries.length}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <StartGroupChat onSuccess={rehydrateConversation} />
        </div>
      </div>

      <div className="index-bento__tools">
        <MessagingStartNewConversation rehydrateConversation={rehydrateConversation} />
      </div>

      <Tabs id="main-chat-tabs" value="chats" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pb-1 shrink-0">
          <TabsHeader
            className="flex items-center gap-0.5 p-0.5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
            }}
            indicatorProps={{
              className: "bg-[var(--bg-surface-elevated)] rounded-[10px] border border-[var(--border-specular)]",
            }}
          >
            <Tab
              key="chats"
              value="chats"
              className="flex-1 py-1.5 text-center"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="index-bento__title">Chats</span>
            </Tab>
            <Tab
              key="requests"
              value="requests"
              className="flex-1 py-1.5 text-center"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="index-bento__title">Requests</span>
            </Tab>
          </TabsHeader>
        </div>

        <TabsBody
          className="flex-1 overflow-hidden"
          animate={{
            mount: { transition: { duration: 0, times: 0 } },
            unmount: { transition: { duration: 0, times: 0 } },
          }}
        >
          <TabPanel key="chats" value="chats" className="h-full p-0 overflow-hidden">
            <div className="channel-list custom-scrollbar">
              {entries.map(([publicKey, conversation]) => {
                const isSelected = publicKey === selectedConversationPublicKey;
                const isGroup = conversation.ChatType === ChatType.GROUPCHAT;
                const firstMsg = conversation.messages[0];
                const unread = isUnread?.(publicKey) ?? false;
                const name =
                  getChatNameFromConversation(
                    conversation,
                    getUsernameByPublicKeyBase58Check
                  ) || shortenLongWord(publicKey, 6, 4);

                return (
                  <button
                    key={publicKey}
                    onClick={() => onClick(publicKey)}
                    className={`channel-item ${isSelected ? "channel-item--active" : ""}`}
                  >
                    <div className="channel-item__avatar">
                      <MessagingDisplayAvatar
                        publicKey={isGroup ? undefined : conversation.firstMessagePublicKey}
                        username={name}
                        diameter={36}
                        groupChat={isGroup}
                      />
                    </div>
                    <div className="channel-item__body">
                      <div className="channel-item__row">
                        <span className="channel-item__name">{name}</span>
                        {unread && <span className="channel-item__dot" aria-label="Unread" />}
                      </div>
                      <p className="channel-item__preview">
                        {firstMsg
                          ? firstMsg.DecryptedMessage || "Message encrypted…"
                          : "No messages yet"}
                      </p>
                    </div>
                    <span className="channel-item__time">
                      {firstMsg
                        ? formatChannelTime(firstMsg.MessageInfo.TimestampNanos)
                        : ""}
                    </span>
                  </button>
                );
              })}

              {entries.length === 0 && (
                <div className="channel-empty">
                  No open channels.
                  <br /> Start a conversation above.
                </div>
              )}
            </div>
          </TabPanel>

          <TabPanel
            key="requests"
            value="requests"
            className="h-full p-0 overflow-hidden"
          >
            <div className="channel-empty">No pending message requests.</div>
          </TabPanel>
        </TabsBody>
      </Tabs>
    </div>
  );
};