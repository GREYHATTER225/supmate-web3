import { UserContext } from "contexts/UserContext";
import { DemoContext } from "contexts/DemoContext";
import {
  ChatType,
  DecryptedMessageEntryResponse,
  getPaginatedAccessGroupMembers,
  getPaginatedDMThread,
  getPaginatedGroupChatThread,
} from "deso-protocol";
import { useInterval } from "hooks/useInterval";
import { FC, useContext, useEffect, useRef, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import { RefreshContext } from "../contexts/RefreshContext";
import { useMobile } from "../hooks/useMobile";
import { useBlockHeight } from "../hooks/useBlockHeight";
import {
  decryptAccessGroupMessagesWithRetry,
  encryptAndSendNewMessage,
  getConversations,
  MESSAGING_ENCRYPTION_UNAVAILABLE_MESSAGE,
} from "../services/conversations.service";
import {
  BASE_TITLE,
  DEFAULT_KEY_MESSAGING_GROUP_NAME,
  MAX_MEMBERS_IN_GROUP_SUMMARY_SHOWN,
  MAX_MEMBERS_TO_REQUEST_IN_GROUP,
  MESSAGES_ONE_REQUEST_LIMIT,
  REFRESH_MESSAGES_INTERVAL_MS,
  REFRESH_MESSAGES_MOBILE_INTERVAL_MS,
  TITLE_DIVIDER,
} from "../utils/constants";
import {
  getChatNameFromConversation,
  hasSetupMessaging,
} from "../utils/helpers";
import { ConversationMap } from "../utils/types";
import { DEMO_CONVERSATIONS, DEMO_MEMBERS } from "../utils/demoData";
import { LandingPage } from "./landing-page";
import { DemoChatWorkspace } from "./demo-chat";
import { ManageMembersDialog } from "./manage-members-dialog";
import { MessagingBubblesAndAvatar } from "./messaging-bubbles";
import { MessagingConversationAccount } from "./messaging-conversation-accounts";
import { MessagingConversationButton } from "./messaging-conversation-button";
import { SendMessageButtonAndInput } from "./send-message-button-and-input";
import { ConversationDetailsPanel } from "./conversation-details";
import { IdentityPanel } from "./identity-panel";
import { ChatHeaderBento } from "./chat-header-bento";
import { playClickSound, playReceiveSound } from "../utils/soundEffects";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AssetIcon } from "./ui/asset-icon";
import { shortenLongWord } from "./search-users";

// ═══════════════════════════════════════════════════════
// MAIN MESSAGING APP
// ═══════════════════════════════════════════════════════
export const MessagingApp: FC = () => {
  const { appUser, isLoadingUser, allAccessGroups, setAllAccessGroups } =
    useContext(UserContext);
  const { lockRefresh, setLockRefresh } = useContext(RefreshContext);
  const {
    isDemoMode,
    triggerWarpTransition,
    isIntelOpen,
    setIsIntelOpen,
    setIsAuthModalOpen,
  } = useContext(DemoContext);

  const [usernameByPublicKeyBase58Check] =
    useState<{ [key: string]: string }>({});
  const [autoFetchConversations, setAutoFetchConversations] = useState(false);
  const [pubKeyPlusGroupName, setPubKeyPlusGroupName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [selectedConversationPublicKey, setSelectedConversationPublicKey] =
    useState("");
  const [conversations, setConversations] = useState<ConversationMap>({});
  const [membersByGroupKey, setMembersByGroupKey] = useState<{
    [groupKey: string]: any;
  }>({});
  const { isMobile } = useMobile();

  // Live network tracker: confirmed block height + chain identity.
  const chainEnabled = !!appUser && !isDemoMode && hasSetupMessaging(appUser);
  const blockHeightState = useBlockHeight(15000, chainEnabled);

  // Read/unread ledger for the channel index. A channel is unread when its
  // latest message is incoming and newer than the last time it was opened.
  const lastSeenNanosRef = useRef<Record<string, number>>({});
  const [, setTimelineTick] = useState(0);

  const markConversationRead = (key: string) => {
    const top = conversations[key]?.messages[0];
    if (top) {
      lastSeenNanosRef.current[key] = top.MessageInfo.TimestampNanos;
    }
    setTimelineTick((t) => t + 1);
  };

  const isConversationUnread = (key: string): boolean => {
    const top = conversations[key]?.messages[0];
    if (!top || top.IsSender) return false;
    const seen = lastSeenNanosRef.current[key] ?? 0;
    return top.MessageInfo.TimestampNanos > seen;
  };

  // The open conversation is always read the moment its thread refreshes.
  useEffect(() => {
    if (isDemoMode || !selectedConversationPublicKey) return;
    const top = conversations[selectedConversationPublicKey]?.messages[0];
    if (top) {
      lastSeenNanosRef.current[selectedConversationPublicKey] =
        top.MessageInfo.TimestampNanos;
    }
  }, [conversations, selectedConversationPublicKey, isDemoMode]);

  // Explicit opt-in state for unencrypted delivery (recipient has no
  // messaging set up). Nothing is ever sent unencrypted without the user
  // confirming this dialog.
  const [pendingUnencrypted, setPendingUnencrypted] = useState<{
    conversationPublicKey: string;
    messageToSend: string;
    recipientPublicKey: string;
    recipientAccessGroupKeyName: string;
    mockMessage: DecryptedMessageEntryResponse;
    oldMessages: DecryptedMessageEntryResponse[];
  } | null>(null);

  // Demo state
  const [demoConversations, setDemoConversations] =
    useState<ConversationMap>(DEMO_CONVERSATIONS);
  const [selectedDemoConvoKey, setSelectedDemoConvoKey] = useState<string>(
    DEMO_MEMBERS.neonSquad.publicKey
  );

  const lockRefreshRef = useRef(lockRefresh);
  const selectedConversationPublicKeyRef = useRef(selectedConversationPublicKey);

  useEffect(() => {
    lockRefreshRef.current = lockRefresh;
    selectedConversationPublicKeyRef.current = selectedConversationPublicKey;
  });

  useEffect(() => {
    if (isDemoMode) return;
    if (!appUser) return;
    if (hasSetupMessaging(appUser)) {
      setLoading(true);
      setAutoFetchConversations(true);
      rehydrateConversation("", !isMobile, isLoadingUser);
    } else {
      setLoading(false);
    }
  }, [appUser, isMobile, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    setSelectedConversationPublicKey("");
    setLockRefresh(isLoadingUser);
    if (isLoadingUser && appUser) setLoading(true);
  }, [isLoadingUser, appUser, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) { document.title = "Demo · Supmate"; return; }
    if (conversations[selectedConversationPublicKey]) {
      const chatName = getChatNameFromConversation(
        conversations[selectedConversationPublicKey],
        usernameByPublicKeyBase58Check
      );
      if (chatName) document.title = [chatName, BASE_TITLE].join(TITLE_DIVIDER);
    }
    return () => { document.title = BASE_TITLE; };
  }, [selectedConversationPublicKey, conversations, usernameByPublicKeyBase58Check, isDemoMode]);

  // Resolve group-chat member profiles so member messages can show usernames.
  // For every group conversation we load the access-group members and cache the
  // publicKey -> profile map under `ownerPublicKey + groupName`. A ref tracks
  // already-fetched groups so the 5s poller does not re-request them forever.
  const fetchedGroupKeysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (isDemoMode || !appUser) return;
    const pendingGroupConversations = Object.values(conversations).filter(
      (convo) => {
        if (convo.ChatType !== ChatType.GROUPCHAT) return false;
        const info = convo.messages[0]?.RecipientInfo;
        if (!info) return false;
        const groupKey = info.OwnerPublicKeyBase58Check + info.AccessGroupKeyName;
        return !fetchedGroupKeysRef.current.has(groupKey);
      }
    );
    if (pendingGroupConversations.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        pendingGroupConversations.map(async (convo) => {
          const { OwnerPublicKeyBase58Check, AccessGroupKeyName } =
            convo.messages[0].RecipientInfo;
          const groupKey = OwnerPublicKeyBase58Check + AccessGroupKeyName;
          fetchedGroupKeysRef.current.add(groupKey);
          try {
            const res = await getPaginatedAccessGroupMembers({
              AccessGroupOwnerPublicKeyBase58Check: OwnerPublicKeyBase58Check,
              AccessGroupKeyName,
              MaxMembersToFetch:
                MAX_MEMBERS_TO_REQUEST_IN_GROUP +
                MAX_MEMBERS_IN_GROUP_SUMMARY_SHOWN,
            });
            return [groupKey, res.PublicKeyToProfileEntryResponse ?? {}] as const;
          } catch (e) {
            console.error(e);
            return [groupKey, {}] as const;
          }
        })
      );
      if (!cancelled) {
        setMembersByGroupKey((prev) => ({
          ...prev,
          ...Object.fromEntries(entries),
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversations, appUser, isDemoMode]);

  useInterval(
    async () => {
      if (isDemoMode) return;
      const initConversationKey = selectedConversationPublicKey;
      if (!appUser || !selectedConversationPublicKey || lockRefreshRef.current || !navigator.onLine) return;
      try {
        const { updatedConversations } = await getConversation(initConversationKey);
        if (initConversationKey === selectedConversationPublicKeyRef.current) {
          setConversations(updatedConversations);
        }
      } catch (e) { console.error(e); }
    },
    isMobile ? REFRESH_MESSAGES_MOBILE_INTERVAL_MS : REFRESH_MESSAGES_INTERVAL_MS
  );

  const getConversation = async (conversationKey: string): Promise<{ updatedConversations: ConversationMap; pubKeyPlusGroupName: string; }> => {
    if (!appUser) {
      return {
        updatedConversations: conversations,
        pubKeyPlusGroupName: conversationKey,
      };
    }
    const isGroupChat = conversations[conversationKey]?.ChatType === ChatType.GROUPCHAT;
    let newMessages: DecryptedMessageEntryResponse[] = [];
    let pkpgn = conversationKey;

    if (isGroupChat) {
      const groupName = conversations[conversationKey].messages[0].RecipientInfo.AccessGroupKeyName;
      const ownerPublicKey = conversations[conversationKey].messages[0].RecipientInfo.OwnerPublicKeyBase58Check;
      pkpgn = ownerPublicKey + groupName;
      const groupChatThreadResponse = await getPaginatedGroupChatThread({
        UserPublicKeyBase58Check: ownerPublicKey,
        AccessGroupKeyName: groupName,
        StartTimeStampString: "",
        MaxMessagesToFetch: MESSAGES_ONE_REQUEST_LIMIT,
      });
      newMessages = (await decryptAccessGroupMessagesWithRetry(appUser.PublicKeyBase58Check, groupChatThreadResponse.GroupChatMessages, allAccessGroups)).decrypted.reverse();
    } else {
      const dmThreadResponse = await getPaginatedDMThread({
        UserGroupOwnerPublicKeyBase58Check: appUser.PublicKeyBase58Check,
        UserGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
        PartyGroupOwnerPublicKeyBase58Check: conversationKey,
        PartyGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
        StartTimeStampString: "",
        MaxMessagesToFetch: MESSAGES_ONE_REQUEST_LIMIT,
      });
      newMessages = (await decryptAccessGroupMessagesWithRetry(appUser.PublicKeyBase58Check, dmThreadResponse.ThreadMessages, allAccessGroups)).decrypted.reverse();
    }

    return {
      updatedConversations: { ...conversations, [conversationKey]: { ...conversations[conversationKey], messages: newMessages } },
      pubKeyPlusGroupName: pkpgn,
    };
  };

  const rehydrateConversation = async (
    publicKey?: string,
    autoSelectFirstConversation = false,
    disableLoading = false
  ) => {
    if (!appUser) return;
    if (!disableLoading) setLoading(true);
    setLockRefresh(true);
    try {
      const { conversations: fetchedConversations, updatedAllAccessGroups } = await getConversations(appUser.PublicKeyBase58Check, allAccessGroups);
      if (updatedAllAccessGroups?.length) setAllAccessGroups(updatedAllAccessGroups);
      setConversations(fetchedConversations);

      const isGroupChat = fetchedConversations[publicKey || ""]?.ChatType === ChatType.GROUPCHAT;
      if (publicKey && isGroupChat) {
        const groupName = fetchedConversations[publicKey].messages[0].RecipientInfo.AccessGroupKeyName;
        const ownerPublicKey = fetchedConversations[publicKey].messages[0].RecipientInfo.OwnerPublicKeyBase58Check;
        setPubKeyPlusGroupName(ownerPublicKey + groupName);
      } else {
        setPubKeyPlusGroupName(publicKey || "");
      }

      if (autoSelectFirstConversation && Object.keys(fetchedConversations).length) {
        const firstConvoKey = Object.keys(fetchedConversations)[0];
        setSelectedConversationPublicKey(firstConvoKey);
        const { updatedConversations, pubKeyPlusGroupName: pk } = await getConversation(firstConvoKey);
        setConversations(updatedConversations);
        setPubKeyPlusGroupName(pk);
      }
    } catch (e: any) {
      toast.error(`Error loading conversations: ${e.toString()}`);
    } finally {
      setLoading(false);
      setLockRefresh(false);
    }
  };

  // Demo send — purely local simulation.
  const handleDemoSendMessage = (messageText: string) => {
    const activeConvo = demoConversations[selectedDemoConvoKey];
    if (!activeConvo) return;
    const mockMsg: DecryptedMessageEntryResponse = {
      DecryptedMessage: messageText,
      IsSender: true,
      SenderInfo: { OwnerPublicKeyBase58Check: DEMO_MEMBERS.neonSquad.publicKey, AccessGroupKeyName: "default-key" },
      RecipientInfo: {
        OwnerPublicKeyBase58Check: selectedDemoConvoKey,
        AccessGroupKeyName: activeConvo.ChatType === ChatType.GROUPCHAT ? "group" : "default-key",
      },
      MessageInfo: { TimestampNanos: Date.now() * 1e6, TimestampNanosString: `${Date.now() * 1e6}` },
    } as any;

    setDemoConversations((prev) => ({
      ...prev,
      [selectedDemoConvoKey]: { ...prev[selectedDemoConvoKey], messages: [mockMsg, ...prev[selectedDemoConvoKey].messages] },
    }));

    setTimeout(() => {
      const isGuild = activeConvo.ChatType === ChatType.GROUPCHAT;
      const responder = isGuild ? DEMO_MEMBERS.sarah : DEMO_MEMBERS.alex;
      const replies = isGuild
        ? ["This is amazing! The Supmate sandbox is so smooth ✨", "Real-time updates in demo mode — impressive!", "That message sent instantly. No gas popups 🚀"]
        : ["Got it! (Demo reply — no real blockchain tx)", "Looks great! I love the clean design.", "Sandbox mode is perfect for UI testing 💎"];
      const replyMsg: DecryptedMessageEntryResponse = {
        DecryptedMessage: replies[Math.floor(Math.random() * replies.length)],
        IsSender: false,
        SenderInfo: { OwnerPublicKeyBase58Check: responder.publicKey, AccessGroupKeyName: "default-key" },
        RecipientInfo: { OwnerPublicKeyBase58Check: DEMO_MEMBERS.neonSquad.publicKey, AccessGroupKeyName: "default-key" },
        MessageInfo: { TimestampNanos: Date.now() * 1e6, TimestampNanosString: `${Date.now() * 1e6}` },
      } as any;
      playReceiveSound();
      setDemoConversations((prev) => ({
        ...prev,
        [selectedDemoConvoKey]: { ...prev[selectedDemoConvoKey], messages: [replyMsg, ...prev[selectedDemoConvoKey].messages] },
      }));
    }, 1200);
  };

  const sendMessageToConversation = async (
    messageToSend: string,
    allowUnencryptedFallback: boolean,
    isUnencryptedOptimistic: boolean
  ) => {
    if (!appUser) {
      throw new Error("You must be connected to send messages.");
    }
    const selectedConversation = conversations[selectedConversationPublicKey];
    const recipientPublicKey = selectedConversation.ChatType === ChatType.DM ? selectedConversation.firstMessagePublicKey : selectedConversation.messages[0].RecipientInfo.OwnerPublicKeyBase58Check;
    const recipientAccessGroupKeyName = selectedConversation.ChatType === ChatType.DM ? DEFAULT_KEY_MESSAGING_GROUP_NAME : selectedConversation.messages[0].RecipientInfo.AccessGroupKeyName;
    const TimestampNanos = new Date().getTime() * 1e6;
    const mockMessage = {
      DecryptedMessage: messageToSend,
      IsSender: true,
      SenderInfo: { OwnerPublicKeyBase58Check: appUser.PublicKeyBase58Check, AccessGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME },
      RecipientInfo: { OwnerPublicKeyBase58Check: recipientPublicKey, AccessGroupKeyName: recipientAccessGroupKeyName },
      MessageInfo: {
        TimestampNanos,
        TimestampNanosString: `${TimestampNanos}`,
        ExtraData: isUnencryptedOptimistic ? { unencrypted: "true" } : {},
      },
    } as DecryptedMessageEntryResponse;
    const oldMessages = conversations[selectedConversationPublicKey].messages;
    setConversations((prev) => ({ ...prev, [selectedConversationPublicKey]: { ...prev[selectedConversationPublicKey], messages: [mockMessage, ...oldMessages] } }));
    setLockRefresh(true);
    try {
      await encryptAndSendNewMessage(
        messageToSend,
        appUser.PublicKeyBase58Check,
        recipientPublicKey,
        recipientAccessGroupKeyName,
        DEFAULT_KEY_MESSAGING_GROUP_NAME,
        allowUnencryptedFallback
      );
    } catch (e: any) {
      if (allowUnencryptedFallback) {
        // If the explicit opt-in send still fails, roll back and surface.
        setConversations((prev) => ({ ...prev, [selectedConversationPublicKey]: { ...prev[selectedConversationPublicKey], messages: oldMessages } }));
        toast.error(`Send error: ${e.toString()}`);
        throw e;
      }
      if (String(e?.message).includes(MESSAGING_ENCRYPTION_UNAVAILABLE_MESSAGE)) {
        // Recipient has no encrypted messaging set up. Roll back the
        // optimistic message and ask for explicit opt-in.
        setConversations((prev) => ({ ...prev, [selectedConversationPublicKey]: { ...prev[selectedConversationPublicKey], messages: oldMessages } }));
        setPendingUnencrypted({
          conversationPublicKey: selectedConversationPublicKey,
          messageToSend,
          recipientPublicKey,
          recipientAccessGroupKeyName,
          mockMessage,
          oldMessages,
        });
        throw new Error(MESSAGING_ENCRYPTION_UNAVAILABLE_MESSAGE);
      }
      setConversations((prev) => ({ ...prev, [selectedConversationPublicKey]: { ...prev[selectedConversationPublicKey], messages: oldMessages } }));
      toast.error(`Send error: ${e.toString()}`);
      throw e;
    } finally {
      setLockRefresh(false);
    }
  };

  const conversationsReady = Object.keys(conversations).length > 0;
  const selectedConversation = conversations[selectedConversationPublicKey];
  const isGroupChat = selectedConversation?.ChatType === ChatType.GROUPCHAT;
  const isGroupOwner = isGroupChat && selectedConversation.messages[0]?.RecipientInfo?.OwnerPublicKeyBase58Check === appUser?.PublicKeyBase58Check;
  const getCurrentChatName = () => !selectedConversation ? "" : (getChatNameFromConversation(selectedConversation, usernameByPublicKeyBase58Check) || "");
  const groupMemberMap = isGroupChat && selectedConversation?.messages[0] ? membersByGroupKey[selectedConversation.messages[0].RecipientInfo.OwnerPublicKeyBase58Check + selectedConversation.messages[0].RecipientInfo.AccessGroupKeyName] || {} : {};
  const activeChatUsersMap: { [key: string]: string } = { ...usernameByPublicKeyBase58Check };
  Object.entries(groupMemberMap).forEach(([pk, profile]: [string, any]) => {
    if (profile?.Username) activeChatUsersMap[pk] = profile.Username;
  });

  const peerPublicKey = isGroupChat
    ? selectedConversation?.messages[0]?.RecipientInfo?.OwnerPublicKeyBase58Check
    : selectedConversation?.firstMessagePublicKey;
  const peerUsername = peerPublicKey
    ? typeof activeChatUsersMap[peerPublicKey] === "string"
      ? activeChatUsersMap[peerPublicKey]
      : (activeChatUsersMap[peerPublicKey] as any)?.Username || undefined
    : undefined;
  const peerLabel = peerUsername
    ? `@${peerUsername}`
    : peerPublicKey
    ? shortenLongWord(peerPublicKey)
    : undefined;

  // ═══ DEMO MODE UI ═══
  if (isDemoMode) {
    return (
      <DemoChatWorkspace
        demoConversations={demoConversations}
        selectedDemoConvoKey={selectedDemoConvoKey}
        onSelectDemoConvo={(key) => {
          playClickSound();
          setSelectedDemoConvoKey(key);
        }}
        onSendMessage={handleDemoSendMessage}
        isIntelOpen={isIntelOpen}
        onToggleIntel={() => setIsIntelOpen(!isIntelOpen)}
        onExitDemo={() => triggerWarpTransition(false)}
      />
    );
  }

  // ═══ LOADING / LANDING ═══
  return (
    <div className="h-full overflow-y-auto custom-scrollbar" style={{ background: "var(--color-bg-deep)" }}>
      {(!conversationsReady || !hasSetupMessaging(appUser) || isLoadingUser || loading) && (
        <div className="relative">
          {(autoFetchConversations || isLoadingUser || loading) && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-specular)",
                  boxShadow: "var(--shadow-elev-2)",
                }}
              >
                <AssetIcon name="chatLogo" size={22} tone="none" active />
              </div>
              <h3 className="font-bold text-white text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Loading Supmate
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Syncing your decentralized message streams…
              </p>
              <ClipLoader color="var(--accent-success)" loading={true} size={32} />
            </div>
          )}

          {!autoFetchConversations && !hasSetupMessaging(appUser) && !isLoadingUser && !loading && (
            <LandingPage
              onConnectAccount={() => setIsAuthModalOpen(true)}
              onExploreDemo={() => triggerWarpTransition(true)}
              showSetupButton={!!appUser}
              appUser={appUser}
            />
          )}

          {!autoFetchConversations && hasSetupMessaging(appUser) && !isLoadingUser && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)]">
              <MessagingConversationButton onClick={rehydrateConversation} />
            </div>
          )}
        </div>
      )}

      {/* ═══ MODULAR BENTO WORKSPACE ═══ */}
      {hasSetupMessaging(appUser) && conversationsReady && appUser && !isLoadingUser && !loading && (
        <div
          className={`bento-workspace ${isIntelOpen ? "bento-workspace--with-details" : ""} h-full`}
          style={{ background: "var(--color-bg-deep)" }}
        >
          {/* Left rail · Bento 1 (identity) + Bento 2 (channel index) */}
          <div className={`bento-rail ${selectedConversationPublicKey ? "hidden md:flex" : "flex"}`}>
            <IdentityPanel />

            <MessagingConversationAccount
              rehydrateConversation={rehydrateConversation}
              onClick={async (key: string) => {
                if (key === selectedConversationPublicKey) return;
                markConversationRead(key);
                setSelectedConversationPublicKey(key);
                setLoadingConversation(true);
                setLockRefresh(true);
                try {
                  const { updatedConversations, pubKeyPlusGroupName: pk } = await getConversation(key);
                  setConversations(updatedConversations);
                  setPubKeyPlusGroupName(pk);
                } finally {
                  setLoadingConversation(false);
                  setLockRefresh(false);
                }
              }}
              conversations={conversations}
              getUsernameByPublicKeyBase58Check={usernameByPublicKeyBase58Check}
              selectedConversationPublicKey={selectedConversationPublicKey}
              isUnread={isConversationUnread}
            />
          </div>

          {/* Main column · Bento 3 (header) + Bento 4 (timeline) + Bento 5 (composer) */}
          <div className={`bento-main ${selectedConversationPublicKey ? "flex" : "hidden md:flex"}`}>
            <ChatHeaderBento
              chatName={getCurrentChatName() || "Select a channel"}
              peerLabel={peerLabel}
              isGroup={!!isGroupChat}
              onBack={() => setSelectedConversationPublicKey("")}
              blockHeight={blockHeightState.height}
              isTestnet={blockHeightState.isTestnet}
              live={blockHeightState.live}
              syncing={blockHeightState.syncing}
              detailsOpen={isIntelOpen}
              onToggleDetails={() => setIsIntelOpen(!isIntelOpen)}
              manageMembers={
                isGroupChat && selectedConversation ? (
                  <ManageMembersDialog
                    conversation={selectedConversation}
                    onSuccess={rehydrateConversation}
                    isGroupOwner={!!isGroupOwner}
                  />
                ) : undefined
              }
            />

            <div className="flex-1 min-h-0 flex flex-col">
              {loadingConversation ? (
                <div className="bento timeline-bento items-center justify-center">
                  <ClipLoader color="var(--accent-success)" loading={true} size={32} />
                </div>
              ) : (
                <MessagingBubblesAndAvatar
                  conversationPublicKey={pubKeyPlusGroupName}
                  conversations={conversations}
                  getUsernameByPublicKey={activeChatUsersMap}
                  onScroll={(e: Array<DecryptedMessageEntryResponse>) => {
                    setConversations((prev) => ({
                      ...prev,
                      [selectedConversationPublicKey]: {
                        ...prev[selectedConversationPublicKey],
                        messages: [...prev[selectedConversationPublicKey].messages, ...e],
                      },
                    }));
                  }}
                />
              )}
            </div>

            <SendMessageButtonAndInput
              key={selectedConversationPublicKey}
              onClick={async (messageToSend: string) => {
                try {
                  await sendMessageToConversation(messageToSend, false, false);
                } catch (e: any) {
                  if (String(e?.message).includes(MESSAGING_ENCRYPTION_UNAVAILABLE_MESSAGE)) {
                    // Opt-in dialog is open; keep the composer text.
                    return;
                  }
                  return Promise.reject(e);
                }
              }}
            />
          </div>

          {/* Details rail · third column on desktop */}
          {isIntelOpen && (
            <div className="bento-rail hidden md:flex">
              <ConversationDetailsPanel
                chatName={getCurrentChatName() || "Direct Conversation"}
                isGroup={!!isGroupChat}
                publicKey={selectedConversationPublicKey}
                onClose={() => setIsIntelOpen(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* ═══ UNENCRYPTED DELIVERY OPT-IN DIALOG ═══ */}
      <Dialog
        open={!!pendingUnencrypted}
        onClose={() => setPendingUnencrypted(null)}
        title="Send without encryption?"
        description="The recipient hasn't set up encrypted messaging on DeSo yet. This message would be stored on-chain as plaintext — it would not be end-to-end encrypted."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingUnencrypted(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!pendingUnencrypted) return;
                const pending = pendingUnencrypted;
                setPendingUnencrypted(null);
                try {
                  await sendMessageToConversation(pending.messageToSend, true, true);
                  toast.info("Message sent unencrypted (explicit opt-in).");
                } catch (e) {
                  toast.error(`Send error: ${e}`);
                }
              }}
            >
              Send unencrypted anyway
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex gap-3 p-3.5 rounded-xl" style={{ background: "var(--color-amber)12", border: "1px solid rgba(232,179,75,0.25)" }}>
            <Badge tone="warning" uppercase className="shrink-0">Warning</Badge>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Anyone who can read the DeSo chain can see this message's content. This is the
              opposite of end-to-end encryption — require your recipient to set up their
              messaging keys for private conversation instead.
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  );
};