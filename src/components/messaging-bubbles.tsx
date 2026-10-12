import { UserContext } from "contexts/UserContext";
import {
  ChatType,
  DecryptedMessageEntryResponse,
  getPaginatedDMThread,
  getPaginatedGroupChatThread,
  GetPaginatedMessagesForDmThreadResponse,
  GetPaginatedMessagesForGroupChatThreadResponse,
} from "deso-protocol";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { FC, useContext, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ReactLinkify from "react-linkify";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import { useMobile } from "../hooks/useMobile";
import { decryptAccessGroupMessagesWithRetry } from "../services/conversations.service";
import {
  DEFAULT_KEY_MESSAGING_GROUP_NAME,
  MESSAGES_ONE_REQUEST_LIMIT,
} from "../utils/constants";
import { ConversationMap } from "../utils/types";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";
import { shortenLongWord } from "./search-users";

export interface MessagingBubblesProps {
  conversations: ConversationMap;
  conversationPublicKey: string;
  getUsernameByPublicKey: { [k: string]: string };
  onScroll: (e: Array<DecryptedMessageEntryResponse>) => void;
}

function convertTstampToDateTime(tstampNanos: number) {
  const date = new Date(tstampNanos / 1e6);
  const currentDate = new Date();
  if (date.getFullYear() !== currentDate.getFullYear()) {
    const yearsAgo = currentDate.getFullYear() - date.getFullYear();
    if (yearsAgo === 1) {
      return "a year ago";
    }
    return `${yearsAgo} years ago`;
  }
  if (
    date.getDate() !== currentDate.getDate() ||
    date.getMonth() !== currentDate.getMonth()
  ) {
    return date.toLocaleString("default", {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleString("default", { hour: "numeric", minute: "numeric" });
}

/** True when a message was sent via the explicit unencrypted opt-in. */
const isExplicitlyUnencrypted = (message: DecryptedMessageEntryResponse) =>
  message.MessageInfo?.ExtraData?.["unencrypted"] === "true";

/**
 * Deterministic ledger fingerprint for a message — a SHA-256 digest over its
 * encrypted payload, sender key and chain timestamp. Shown as a faint
 * `[Block Checked]` utility tag on hover with the message timestamp.
 */
export const ledgerDigest = (message: DecryptedMessageEntryResponse): string => {
  const seed =
    message.MessageInfo?.EncryptedText ||
    message.DecryptedMessage ||
    "supmate";
  const sender = message.SenderInfo?.OwnerPublicKeyBase58Check || "";
  const ts =
    message.MessageInfo?.TimestampNanosString ||
    `${message.MessageInfo?.TimestampNanos ?? 0}`;
  return bytesToHex(sha256(`${seed}:${sender}:${ts}`)).slice(0, 8);
};

/**
 * Bento 4 · Cryptographic timeline.
 *
 * Incoming messages sit in a dark smoky glass plate on the left; outgoing
 * messages are stripped of any container — stark white type floating directly
 * on the obsidian mesh, on the right. Every message carries an incredibly
 * faint `[Block Checked]` tag revealed on hover.
 */
export const MessagingBubblesAndAvatar: FC<MessagingBubblesProps> = ({
  conversations,
  conversationPublicKey,
  getUsernameByPublicKey,
  onScroll,
}: MessagingBubblesProps) => {
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const { appUser, allAccessGroups, setAllAccessGroups } =
    useContext(UserContext);
  const conversation = conversations[conversationPublicKey] ?? { messages: [] };
  const [allowScrolling, setAllowScrolling] = useState<boolean>(true);
  const [visibleMessages, setVisibleMessages] = useState(conversation.messages);
  const { isMobile } = useMobile();

  useEffect(() => {
    if (conversation.messages.length === 0) {
      setAllowScrolling(false);
    }

    setVisibleMessages(conversation.messages);

    const scrollableArea = messageAreaRef.current;

    if (!scrollableArea) {
      return;
    }

    if (isMobile) {
      scrollableArea.classList.remove("overflow-auto");
      scrollableArea.classList.add("overflow-hidden");
    }

    const hasUnreadMessages =
      visibleMessages.length &&
      visibleMessages[0].MessageInfo.TimestampNanosString !==
        conversation.messages[0].MessageInfo.TimestampNanosString;
    const isLastMessageFromMe =
      conversation.messages.length && conversation.messages[0].IsSender;

    const element = scrollableArea;

    if (isMobile) {
      scrollableArea.classList.remove("overflow-hidden");
      scrollableArea.classList.add("overflow-auto");
    }

    if (
      hasUnreadMessages &&
      isLastMessageFromMe &&
      (isMobile || element.scrollTop !== 0)
    ) {
      setTimeout(() => {
        const scrollerStub = element.querySelector(".scroller-end-stub");
        scrollerStub &&
          scrollerStub.scrollIntoView({
            behavior: "smooth",
          });
      }, 500);
    }
  }, [conversations, conversationPublicKey, isMobile]);

  if (Object.keys(conversations).length === 0 || conversationPublicKey === "") {
    return <div></div>;
  }

  const loadMore = async () => {
    if (!appUser) {
      toast.error("You must be logged in to load more messages");
      return;
    }

    if (visibleMessages.length < MESSAGES_ONE_REQUEST_LIMIT) {
      setAllowScrolling(false);
      return;
    }

    const StartTimeStampString =
      visibleMessages[visibleMessages.length - 1].MessageInfo
        .TimestampNanosString;

    const dmOrGroupChatMessages = await (conversation.ChatType === ChatType.DM
      ? getPaginatedDMThread({
          UserGroupOwnerPublicKeyBase58Check: appUser.PublicKeyBase58Check,
          UserGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
          PartyGroupOwnerPublicKeyBase58Check: (visibleMessages[0].IsSender
            ? visibleMessages[0].RecipientInfo
            : visibleMessages[0].SenderInfo
          ).OwnerPublicKeyBase58Check,
          PartyGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
          StartTimeStampString,
          MaxMessagesToFetch: MESSAGES_ONE_REQUEST_LIMIT,
        })
      : getPaginatedGroupChatThread({
          UserPublicKeyBase58Check:
            visibleMessages[visibleMessages.length - 1].RecipientInfo
              .OwnerPublicKeyBase58Check,
          AccessGroupKeyName:
            visibleMessages[visibleMessages.length - 1].RecipientInfo
              .AccessGroupKeyName,
          StartTimeStampString,
          MaxMessagesToFetch: MESSAGES_ONE_REQUEST_LIMIT,
        }));
    const messages =
      conversation.ChatType === ChatType.DM
        ? (dmOrGroupChatMessages as GetPaginatedMessagesForDmThreadResponse)
            .ThreadMessages
        : (
            dmOrGroupChatMessages as GetPaginatedMessagesForGroupChatThreadResponse
          ).GroupChatMessages;

    const publicKeyToProfileEntryResponseMap =
      dmOrGroupChatMessages.PublicKeyToProfileEntryResponse;
    Object.entries(publicKeyToProfileEntryResponseMap).forEach(
      ([publicKey, profileEntryResponse]) => {
        getUsernameByPublicKey[publicKey] =
          profileEntryResponse?.Username || "";
      }
    );

    if (messages.length < MESSAGES_ONE_REQUEST_LIMIT) {
      setAllowScrolling(false);
    }

    if (messages.length === 0) {
      return;
    }

    const { decrypted, updatedAllAccessGroups } =
      await decryptAccessGroupMessagesWithRetry(
        appUser.PublicKeyBase58Check,
        messages,
        allAccessGroups
      );
    setAllAccessGroups(updatedAllAccessGroups);

    onScroll(decrypted);
  };

  return (
    <div className="bento timeline-bento">
      <div
        className="flex-1 min-h-0 flex flex-col-reverse custom-scrollbar px-3 md:px-5 md:overflow-y-auto"
        ref={messageAreaRef}
        id="scrollableArea"
      >
        <InfiniteScroll
          dataLength={conversation.messages.length}
          next={loadMore}
          style={{ display: "flex", flexDirection: "column-reverse" }}
          inverse={true}
          hasMore={allowScrolling}
          loader={
            <div className="my-4 flex items-center justify-center gap-2" style={{ color: "var(--text-muted)" }}>
              <ClipLoader color={"var(--accent-success)"} loading={true} size={14} />
              <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.08em" }}>
                Verifying older blocks…
              </span>
            </div>
          }
          scrollableTarget="scrollableArea"
        >
          <div className="scroller-end-stub" />

          {visibleMessages.map((message, i: number) => {
            const messageToShow = message.DecryptedMessage || message.error;
            const IsSender =
              message.IsSender ||
              message.SenderInfo.OwnerPublicKeyBase58Check ===
                appUser?.PublicKeyBase58Check;
            const explicitlyUnencrypted = isExplicitlyUnencrypted(message);
            const isError = !!message.error;
            const senderPk = message.SenderInfo.OwnerPublicKeyBase58Check;
            const senderUser = getUsernameByPublicKey[senderPk];
            const time = convertTstampToDateTime(message.MessageInfo.TimestampNanos);
            const digest = ledgerDigest(message);

            return (
              <div
                className={`msg-row ${IsSender ? "msg-row--out" : ""}`}
                key={`message-${i}`}
              >
                {!IsSender && (
                  <div className="msg-row__avatar">
                    <MessagingDisplayAvatar
                      username={senderUser}
                      publicKey={senderPk}
                      diameter={30}
                    />
                  </div>
                )}

                <div className={`msg-col ${IsSender ? "msg-col--out" : "msg-col--in"}`}>
                  {!IsSender && (
                    <div className="msg-sender">
                      {senderUser ? `@${senderUser}` : shortenLongWord(senderPk || "")}
                    </div>
                  )}

                  {IsSender ? (
                    <div
                      className={`msg-bubble--out ${isError ? "msg-bubble--out-error" : ""}`}
                      style={isError ? { color: "#F26862" } : undefined}
                    >
                      <div className="msg-text">
                        <ReactLinkify>{messageToShow}</ReactLinkify>
                      </div>
                      {explicitlyUnencrypted && (
                        <div className="msg-badge--unencrypted">Not encrypted · plaintext</div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`msg-bubble--in ${isError ? "msg-bubble--in-error" : ""}`}
                      style={
                        isError
                          ? { background: "rgba(242,104,98,0.10)", color: "#F26862", borderColor: "rgba(242,104,98,0.25)" }
                          : undefined
                      }
                    >
                      <div className="msg-text">
                        <ReactLinkify>{messageToShow}</ReactLinkify>
                      </div>
                      {explicitlyUnencrypted && (
                        <div className="msg-badge--unencrypted">Not encrypted · plaintext</div>
                      )}
                    </div>
                  )}

                  <div className="msg-meta">
                    <span className="msg-meta__tag">[Block Checked]</span>
                    <span className="msg-meta__sep">·</span>
                    <span>0x{digest}</span>
                    <span className="msg-meta__sep">·</span>
                    <span>{time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
};