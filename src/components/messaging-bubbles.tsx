
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
import { AssetIcon } from "./ui/asset-icon";

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
    return yearsAgo === 1 ? "a year ago" : `${yearsAgo} years ago`;
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

  return date.toLocaleString("default", {
    hour: "numeric",
    minute: "numeric",
  });
}

const isExplicitlyUnencrypted = (
  message: DecryptedMessageEntryResponse
) => message?.MessageInfo?.ExtraData?.["unencrypted"] === "true";

export const ledgerDigest = (
  message: DecryptedMessageEntryResponse
): string => {
  const seed =
    message?.MessageInfo?.EncryptedText ||
    message?.DecryptedMessage ||
    "supmate";

  const sender =
    message?.SenderInfo?.OwnerPublicKeyBase58Check || "";

  const ts =
    message?.MessageInfo?.TimestampNanosString ||
    `${message?.MessageInfo?.TimestampNanos ?? 0}`;

  return bytesToHex(sha256(`${seed}:${sender}:${ts}`)).slice(0, 8);
};

export const MessagingBubblesAndAvatar: FC<MessagingBubblesProps> = ({
  conversations,
  conversationPublicKey,
  getUsernameByPublicKey,
  onScroll,
}) => {
  const messageAreaRef = useRef<HTMLDivElement>(null);

  const {
    appUser,
    allAccessGroups,
    setAllAccessGroups,
  } = useContext(UserContext);

  const conversation = conversations[conversationPublicKey] ?? {
    messages: [],
  };

  const [allowScrolling, setAllowScrolling] = useState(true);
  const [visibleMessages, setVisibleMessages] = useState(
    conversation.messages
  );

  const { isMobile } = useMobile();

  useEffect(() => {
    const msgs = conversation?.messages ?? [];

    if (msgs.length === 0) {
      setAllowScrolling(false);
    }

    setVisibleMessages(msgs);

    const scrollableArea = messageAreaRef.current;
    if (!scrollableArea) return;

    if (isMobile) {
      scrollableArea.classList.remove("overflow-auto");
      scrollableArea.classList.add("overflow-hidden");
    }

    const hasUnreadMessages =
      visibleMessages.length > 0 &&
      msgs.length > 0 &&
      visibleMessages[0]?.MessageInfo?.TimestampNanosString !==
      msgs[0]?.MessageInfo?.TimestampNanosString;

    const isLastMessageFromMe =
      msgs.length > 0 && Boolean(msgs[0]?.IsSender);

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
        const stub = element.querySelector(".scroller-end-stub");

        stub?.scrollIntoView({
          behavior: "smooth",
        });
      }, 500);
    }
  }, [conversations, conversationPublicKey, isMobile]);

  const loadMore = async () => {
    if (!appUser) {
      toast.error("You must be logged in to load more messages");
      return;
    }

    if (visibleMessages.length < MESSAGES_ONE_REQUEST_LIMIT) {
      setAllowScrolling(false);
      return;
    }

    const lastMsg = visibleMessages[visibleMessages.length - 1];

    const StartTimeStampString =
      lastMsg?.MessageInfo?.TimestampNanosString || "";

    const dmOrGroupChatMessages =
      await (conversation.ChatType === ChatType.DM
        ? getPaginatedDMThread({
          UserGroupOwnerPublicKeyBase58Check:
            appUser.PublicKeyBase58Check,
          UserGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
          PartyGroupOwnerPublicKeyBase58Check: (() => {
            const firstMsg = visibleMessages[0];
            if (!firstMsg) return "";

            let partyKey = (
              firstMsg.IsSender
                ? firstMsg.RecipientInfo
                : firstMsg.SenderInfo
            )?.OwnerPublicKeyBase58Check || "";

            if (partyKey.endsWith("default-key")) {
              partyKey = partyKey.slice(
                0,
                -"default-key".length
              );
            }

            return partyKey;
          })(),
          PartyGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
          StartTimeStampString,
          MaxMessagesToFetch: MESSAGES_ONE_REQUEST_LIMIT,
        })
        : getPaginatedGroupChatThread({
          UserPublicKeyBase58Check:
            lastMsg?.RecipientInfo?.OwnerPublicKeyBase58Check || "",
          AccessGroupKeyName:
            lastMsg?.RecipientInfo?.AccessGroupKeyName || "",
          StartTimeStampString,
          MaxMessagesToFetch: MESSAGES_ONE_REQUEST_LIMIT,
        }));

    const messages =
      conversation.ChatType === ChatType.DM
        ? (
          dmOrGroupChatMessages as GetPaginatedMessagesForDmThreadResponse
        ).ThreadMessages
        : (
          dmOrGroupChatMessages as GetPaginatedMessagesForGroupChatThreadResponse
        ).GroupChatMessages;

    const profileMap =
      dmOrGroupChatMessages.PublicKeyToProfileEntryResponse;

    Object.entries(profileMap).forEach(
      ([publicKey, profile]) => {
        getUsernameByPublicKey[publicKey] =
          profile?.Username || "";
      }
    );

    if (messages.length < MESSAGES_ONE_REQUEST_LIMIT) {
      setAllowScrolling(false);
    }

    if (messages.length === 0) return;

    const { decrypted, updatedAllAccessGroups } =
      await decryptAccessGroupMessagesWithRetry(
        appUser.PublicKeyBase58Check,
        messages,
        allAccessGroups
      );

    setAllAccessGroups(updatedAllAccessGroups);
    onScroll(decrypted);
  };

  if (
    Object.keys(conversations).length === 0 ||
    conversationPublicKey === ""
  ) {
    return (
      <div className="supmate-timeline-empty">
        <div className="supmate-empty-orbit">
          <AssetIcon name="chatLogo" size={26} tone="none" />
          <span>POP!</span>
        </div>

        <h3>Sovereign End-to-End Chat</h3>

        <p>
          Select a channel or search for a DeSo user to begin
          private, on-chain communication.
        </p>
      </div>
    );
  }

  return (
    <div className="supmate-liquid-timeline">
      <style>{`
        .supmate-liquid-timeline {
          --glass-white: rgba(255,255,255,.075);
          --glass-edge: rgba(255,255,255,.15);
          position: relative;
          isolation: isolate;
          display: flex;
          flex: 1 1 auto;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          color: #f8fafc;
          border: 1px solid rgba(255,255,255,.105);
          border-radius: 24px;
          background:
            radial-gradient(ellipse at 50% -20%, rgba(255,255,255,.045), transparent 58%),
            linear-gradient(145deg, #08090b 0%, #050608 55%, #090a0d 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.09),
            inset 0 -1px 0 rgba(255,255,255,.025),
            0 24px 65px rgba(0,0,0,.42);
        }

        .supmate-liquid-timeline::before {
          content: "";
          position: absolute;
          z-index: 0;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          background:
            linear-gradient(118deg,
              transparent 8%,
              rgba(255,255,255,.035) 25%,
              transparent 42%,
              transparent 68%,
              rgba(255,255,255,.018) 82%,
              transparent 94%);
          opacity: .85;
        }

        .supmate-liquid-timeline::after {
          content: "";
          position: absolute;
          z-index: 0;
          inset: 1px;
          pointer-events: none;
          border-radius: inherit;
          background:
            radial-gradient(ellipse at 8% 5%, rgba(34,211,238,.045), transparent 30%),
            radial-gradient(ellipse at 95% 95%, rgba(217,70,239,.035), transparent 32%);
        }

        .supmate-glass-glint {
          position: absolute;
          z-index: 0;
          top: 0;
          left: -60%;
          width: 38%;
          height: 100%;
          pointer-events: none;
          transform: skewX(-18deg);
          background: linear-gradient(90deg,
            transparent,
            rgba(255,255,255,.025),
            rgba(255,255,255,.065),
            transparent);
          animation: supmate-glass-drift 14s ease-in-out infinite;
        }

        .supmate-glass-dots {
          position: absolute;
          z-index: 0;
          width: 110px;
          height: 110px;
          pointer-events: none;
          opacity: .14;
          background-image: radial-gradient(rgba(255,255,255,.5) 1px, transparent 1px);
          background-size: 8px 8px;
          mask-image: radial-gradient(circle, black, transparent 72%);
        }

        .supmate-glass-dots--top {
          top: 15px;
          right: 22px;
        }

        .supmate-glass-dots--bottom {
          bottom: 18px;
          left: 15px;
          opacity: .07;
        }

        .supmate-message-scroll {
          position: relative;
          z-index: 1;
          display: flex;
          flex: 1 1 auto;
          flex-direction: column-reverse;
          min-width: 0;
          min-height: 0;
          overflow-y: auto;
          padding: 26px clamp(12px, 3vw, 34px);
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.14) transparent;
        }

        .supmate-message-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .supmate-message-scroll::-webkit-scrollbar-thumb {
          border-radius: 20px;
          background: rgba(255,255,255,.13);
        }

        .supmate-message-row {
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 11px;
          width: 100%;
          min-width: 0;
          margin-bottom: 25px;
        }

        .supmate-message-row--out {
          flex-direction: row-reverse;
        }

        .supmate-message-avatar {
          flex: 0 0 36px;
          width: 36px;
          height: 36px;
          margin-bottom: 24px;
          padding: 2px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.26);
          border-radius: 12px;
          background: linear-gradient(145deg, rgba(255,255,255,.35), rgba(255,255,255,.035));
          box-shadow: 0 5px 18px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.35);
        }

        .supmate-message-column {
          display: flex;
          flex: 0 1 auto;
          flex-direction: column;
          align-items: flex-start;
          width: fit-content;
          min-width: 0;
          max-width: min(74%, 690px);
        }

        .supmate-message-column--out {
          align-items: flex-end;
        }

        .supmate-sender-label {
          display: flex;
          align-items: center;
          gap: 7px;
          max-width: 100%;
          margin: 0 0 8px 5px;
          overflow: hidden;
          color: #a5f3fc;
          font: 800 9px/1.3 "JetBrains Mono", monospace;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .supmate-sender-label span:last-child {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .supmate-sender-dot {
          flex: 0 0 6px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #67e8f9;
          box-shadow: 0 0 10px rgba(103,232,249,.75);
        }

        .supmate-comic-bubble {
          position: relative;
          isolation: isolate;
          width: fit-content;
          max-width: 100%;
          padding: 13px 16px;
          overflow-wrap: anywhere;
          font-size: 13px;
          line-height: 1.7;
          animation: supmate-comic-pop .38s cubic-bezier(.2,.9,.25,1.2) both;
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .supmate-comic-bubble:hover {
          transform: translateY(-2px);
        }

        .supmate-comic-bubble--out {
          color: #09090b;
          font-weight: 650;
          border: 2px solid #030405;
          border-radius: 19px 19px 5px 19px;
          background:
            radial-gradient(circle at 92% 12%, rgba(255,255,255,.85) 0 1px, transparent 2px),
            linear-gradient(132deg, #fef08a 0%, #fbbf24 35%, #fb923c 67%, #fb7185 100%);
          box-shadow:
            4px 4px 0 #000,
            5px 5px 0 rgba(255,255,255,.12),
            0 9px 25px rgba(249,115,22,.13),
            inset 0 1px 0 rgba(255,255,255,.8);
        }

        .supmate-comic-bubble--out::before {
          content: "";
          position: absolute;
          z-index: -1;
          right: 13px;
          top: 0;
          width: 62px;
          height: 100%;
          opacity: .14;
          pointer-events: none;
          background-image: radial-gradient(#111 1px, transparent 1.3px);
          background-size: 6px 6px;
          mask-image: linear-gradient(135deg, transparent, black);
        }

        .supmate-comic-bubble--out::after {
          content: "";
          position: absolute;
          right: -2px;
          bottom: -8px;
          width: 15px;
          height: 15px;
          border-right: 2px solid #030405;
          border-bottom: 2px solid #030405;
          background: #fb7185;
          transform: skewY(35deg) rotate(8deg);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
        }

        .supmate-comic-bubble--in {
          color: #f4f4f5;
          border: 2px solid #020306;
          border-radius: 19px 19px 19px 5px;
          background:
            radial-gradient(circle at 8% 10%, rgba(255,255,255,.07) 0 1px, transparent 2px),
            linear-gradient(145deg, #242a34 0%, #171b24 55%, #101319 100%);
          box-shadow:
            4px 4px 0 #000,
            5px 5px 0 rgba(255,255,255,.10),
            0 9px 25px rgba(0,0,0,.4),
            inset 0 1px 0 rgba(255,255,255,.17);
        }

        .supmate-comic-bubble--in::before {
          content: "";
          position: absolute;
          z-index: -1;
          left: 12px;
          bottom: 4px;
          width: 62px;
          height: 60%;
          opacity: .13;
          pointer-events: none;
          background-image: radial-gradient(#67e8f9 1px, transparent 1.3px);
          background-size: 6px 6px;
          mask-image: radial-gradient(circle at bottom left, black, transparent 75%);
        }

        .supmate-comic-bubble--in::after {
          content: "";
          position: absolute;
          left: -2px;
          bottom: -8px;
          width: 15px;
          height: 15px;
          border-left: 2px solid #020306;
          border-bottom: 2px solid #020306;
          background: #171b24;
          transform: skewY(-35deg) rotate(-8deg);
          clip-path: polygon(0 0, 100% 100%, 0 100%);
        }

        .supmate-comic-bubble--error {
          color: #fecaca !important;
          border-color: #7f1d1d !important;
          background: linear-gradient(135deg, #450a0a, #1c080b) !important;
          box-shadow: 4px 4px 0 #000, 0 0 20px rgba(239,68,68,.12);
        }

        .supmate-message-text {
          position: relative;
          z-index: 2;
          overflow-wrap: anywhere;
          word-break: normal;
        }

        .supmate-message-text a {
          color: inherit;
          text-decoration: underline;
          text-decoration-color: currentColor;
          text-underline-offset: 3px;
        }

        .supmate-message-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          max-width: 100%;
          margin-top: 9px;
          padding: 0 3px;
          color: #71717a;
          font: 8px/1.5 "JetBrains Mono", monospace;
          letter-spacing: .045em;
        }

        .supmate-message-column--out .supmate-message-meta {
          justify-content: flex-end;
          text-align: right;
        }

        .supmate-message-meta__verified {
          color: #a3e635;
        }

        .supmate-message-meta__verified::before {
          content: "";
          display: inline-block;
          width: 5px;
          height: 5px;
          margin-right: 5px;
          border-radius: 50%;
          background: #a3e635;
          box-shadow: 0 0 8px rgba(163,230,53,.6);
        }

        .supmate-plaintext-warning {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 11px;
          padding: 6px 9px;
          border: 1px solid rgba(248,113,113,.4);
          border-radius: 6px;
          color: #fecaca;
          background: rgba(127,29,29,.25);
          font: 800 9px/1.4 "JetBrains Mono", monospace;
        }

        .supmate-comic-stamp {
          position: absolute;
          z-index: 3;
          top: -9px;
          right: -9px;
          padding: 3px 6px;
          border: 2px solid #030405;
          border-radius: 5px;
          color: #030405;
          background: #a3e635;
          box-shadow: 2px 2px 0 #000;
          font: 1000 8px/1 "JetBrains Mono", monospace;
          transform: rotate(9deg);
        }

        .supmate-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 20px 0;
          color: #71717a;
          font: 9px "JetBrains Mono", monospace;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .supmate-loader-icon {
          display: grid;
          width: 35px;
          height: 35px;
          place-items: center;
          border: 1px solid rgba(103,232,249,.25);
          border-radius: 12px;
          background: rgba(103,232,249,.055);
        }

        .supmate-timeline-empty {
          position: relative;
          isolation: isolate;
          display: flex;
          min-height: 360px;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 30px;
          text-align: center;
          background: #050608;
          color: #fff;
        }

        .supmate-empty-orbit {
          position: relative;
          display: grid;
          width: 68px;
          height: 68px;
          margin-bottom: 23px;
          place-items: center;
          border: 2px solid #030405;
          border-radius: 20px;
          color: #fff;
          background: linear-gradient(145deg, #a5f3fc, #818cf8 55%, #e879f9);
          box-shadow: 5px 5px 0 #000, 0 0 35px rgba(34,211,238,.13);
          transform: rotate(-5deg);
        }

        .supmate-empty-orbit span {
          position: absolute;
          top: -10px;
          right: -17px;
          padding: 5px 7px;
          border: 2px solid #000;
          border-radius: 5px;
          color: #111;
          background: #facc15;
          box-shadow: 2px 2px 0 #000;
          font: 1000 9px "JetBrains Mono", monospace;
          transform: rotate(10deg);
        }

        .supmate-timeline-empty h3 {
          margin: 0 0 8px;
          font: 900 15px "Plus Jakarta Sans", sans-serif;
        }

        .supmate-timeline-empty p {
          max-width: 380px;
          margin: 0;
          color: #85858f;
          font: 12px/1.7 "Plus Jakarta Sans", sans-serif;
        }

        @keyframes supmate-comic-pop {
          0% {
            opacity: 0;
            transform: translateY(9px) scale(.94);
          }
          72% {
            opacity: 1;
            transform: translateY(-2px) scale(1.015);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes supmate-glass-drift {
          0%, 100% { left: -60%; opacity: 0; }
          12% { opacity: .65; }
          48% { left: 120%; opacity: .4; }
          55% { opacity: 0; }
        }

        @media (max-width: 767px) {
          .supmate-message-scroll {
            padding: 18px 11px;
          }

          .supmate-message-column {
            max-width: 82%;
          }

          .supmate-message-row {
            gap: 8px;
            margin-bottom: 21px;
          }

          .supmate-message-avatar {
            flex-basis: 32px;
            width: 32px;
            height: 32px;
          }

          .supmate-comic-bubble {
            padding: 11px 13px;
            font-size: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .supmate-glass-glint,
          .supmate-comic-bubble {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="supmate-glass-glint" />
      <div className="supmate-glass-dots supmate-glass-dots--top" />
      <div className="supmate-glass-dots supmate-glass-dots--bottom" />

      <div
        ref={messageAreaRef}
        id="scrollableArea"
        className="supmate-message-scroll custom-scrollbar"
      >
        <InfiniteScroll
          dataLength={conversation.messages.length}
          next={loadMore}
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            width: "100%",
            minWidth: 0,
            overflow: "visible",
          }}
          inverse
          hasMore={allowScrolling}
          loader={
            <div className="supmate-loader">
              <span className="supmate-loader-icon">
                <ClipLoader color="#67E8F9" loading size={13} />
              </span>
              Verifying older blocks...
            </div>
          }
          scrollableTarget="scrollableArea"
        >
          <div className="scroller-end-stub" />

          {visibleMessages.map((message, i: number) => {
            const messageToShow =
              message.DecryptedMessage || message.error;

            const isSender =
              message.IsSender ||
              message.SenderInfo?.OwnerPublicKeyBase58Check ===
              appUser?.PublicKeyBase58Check;

            const explicitlyUnencrypted =
              isExplicitlyUnencrypted(message);

            const isError = !!message.error;

            const senderPk =
              message?.SenderInfo?.OwnerPublicKeyBase58Check || "";

            const senderUser = senderPk
              ? getUsernameByPublicKey[senderPk]
              : undefined;

            const time = convertTstampToDateTime(
              message?.MessageInfo?.TimestampNanos || 0
            );

            const digest = ledgerDigest(message);

            return (
              <div
                key={`message-${i}`}
                className={`supmate-message-row ${isSender ? "supmate-message-row--out" : ""
                  }`}
              >
                {!isSender && (
                  <div className="supmate-message-avatar">
                    <MessagingDisplayAvatar
                      username={senderUser}
                      publicKey={senderPk}
                      diameter={30}
                    />
                  </div>
                )}

                <div
                  className={`supmate-message-column ${isSender
                      ? "supmate-message-column--out"
                      : ""
                    }`}
                >
                  {!isSender && (
                    <div className="supmate-sender-label">
                      <span className="supmate-sender-dot" />
                      <span>
                        {senderUser
                          ? `@${senderUser}`
                          : shortenLongWord(senderPk || "")}
                      </span>
                    </div>
                  )}

                  <div
                    className={`supmate-comic-bubble ${isSender
                        ? "supmate-comic-bubble--out"
                        : "supmate-comic-bubble--in"
                      } ${isError
                        ? "supmate-comic-bubble--error"
                        : ""
                      }`}
                  >
                    {isSender && !isError && (
                      <span className="supmate-comic-stamp">
                        SENT!
                      </span>
                    )}

                    <div className="supmate-message-text">
                      <ReactLinkify>
                        {messageToShow}
                      </ReactLinkify>
                    </div>

                    {explicitlyUnencrypted && (
                      <div className="supmate-plaintext-warning">
                        <span>⚠</span>
                        Not encrypted · plaintext
                      </div>
                    )}
                  </div>

                  <div className="supmate-message-meta">
                    <span className="supmate-message-meta__verified">
                      BLOCK CHECKED
                    </span>
                    <span>·</span>
                    <span>0x{digest}</span>
                    <span>·</span>
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
