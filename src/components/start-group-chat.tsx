
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  addAccessGroupMembers,
  createAccessGroup,
} from "deso-protocol";
import { toast } from "react-toastify";

import { SearchUsers, SearchMenuItem } from "components/search-users";
import { UserContext } from "contexts/UserContext";
import { useMembers } from "../hooks/useMembers";
import { useMobile } from "../hooks/useMobile";
import { DEFAULT_KEY_MESSAGING_GROUP_NAME } from "../utils/constants";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";
import { MyInput } from "./form/my-input";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { IconButton } from "./ui/icon-button";

const ChromeStar = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
    aria-hidden="true">
    <defs>
      <linearGradient id="groupChrome" x1="10" y1="5" x2="90" y2="95">
        <stop stopColor="#fff" />
        <stop offset=".22" stopColor="#64748b" />
        <stop offset=".45" stopColor="#fff" />
        <stop offset=".7" stopColor="#475569" />
        <stop offset="1" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path
      d="M50 3 C57 37 63 43 97 50 C63 57 57 63 50 97 C43 63 37 57 3 50 C37 43 43 37 50 3Z"
      fill="url(#groupChrome)"
      stroke="#fff"
      strokeWidth="1.5"
    />
  </svg>
);

const GroupGlyph = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.7"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
    <path d="M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.5V20" />
  </svg>
);

const TrashGlyph = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const ArrowGlyph = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const groupStyles = `
  .supmate-group {
    --pearl: #f5f6fa;
    --silver: #dce1eb;
    --blue: #3159f5;
    --ink: #202535;
    --muted: #8992a3;
    color: var(--ink);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .supmate-group *,
  .supmate-group *::before,
  .supmate-group *::after {
    box-sizing: border-box;
  }

  .supmate-group__surface {
    position: relative;
    overflow: hidden;
    padding: 19px;
    border-radius: 23px;
    border: 1px solid rgba(255,255,255,.95);
    background:
      radial-gradient(ellipse at 5% 0%,rgba(255,255,255,.95),transparent 40%),
      linear-gradient(145deg,#f9fafc,#e8ebf2 55%,#dce1e9);
    box-shadow:
      10px 12px 28px rgba(20,31,55,.10),
      -8px -8px 22px rgba(255,255,255,.95),
      inset 0 1px 2px white;
  }

  .supmate-group__surface::before {
    content: "";
    position: absolute;
    width: 240px;
    height: 240px;
    right: -120px;
    top: -145px;
    border-radius: 50%;
    pointer-events: none;
    background: conic-gradient(
      from 0deg,
      rgba(80,140,255,.17),
      rgba(226,91,207,.12),
      rgba(70,226,223,.16),
      rgba(255,196,99,.15),
      rgba(80,140,255,.17)
    );
    filter: blur(20px);
  }

  .supmate-group__hero {
    position: relative;
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 15px;
    border: 1px solid rgba(255,255,255,.95);
    border-radius: 18px;
    background: linear-gradient(145deg,#fff,#e9edf5);
    box-shadow:
      7px 8px 17px rgba(32,43,67,.10),
      -6px -6px 15px rgba(255,255,255,.95),
      inset 0 1px 1px white;
  }

  .supmate-group__brand {
    width: 53px;
    height: 53px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 17px;
    background: linear-gradient(145deg,#f8fafc,#cbd2df);
    border: 1px solid rgba(255,255,255,.95);
    box-shadow:
      5px 6px 12px rgba(32,43,67,.15),
      -4px -4px 10px white,
      inset 0 1px 2px white;
  }

  .supmate-group__eyebrow {
    color: #718096;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .19em;
    text-transform: uppercase;
  }

  .supmate-group__title {
    margin-top: 4px;
    color: #202535;
    font-size: 19px;
    font-weight: 900;
    letter-spacing: -.055em;
    line-height: 1.2;
  }

  .supmate-group__subtitle {
    margin-top: 5px;
    color: #8891a1;
    font-size: 10px;
    line-height: 1.5;
  }

  .supmate-group__ticket {
    position: relative;
    margin-top: 15px;
    padding: 12px 14px;
    overflow: hidden;
    border-radius: 15px;
    color: white;
    background:
      linear-gradient(120deg,rgba(255,255,255,.12),transparent 45%),
      linear-gradient(110deg,#172d8f,#3159f5 35%,#7958e9 65%,#20a9c5);
    box-shadow:
      0 7px 17px rgba(49,89,245,.20),
      inset 0 1px 1px rgba(255,255,255,.4);
  }

  .supmate-group__ticket::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      115deg,
      transparent 10%,
      rgba(255,255,255,.2) 35%,
      transparent 60%
    );
  }

  .supmate-group__ticket-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .supmate-group__ticket-label {
    color: rgba(255,255,255,.72);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .17em;
  }

  .supmate-group__ticket-name {
    margin-top: 4px;
    overflow: hidden;
    color: white;
    font-size: 14px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .supmate-group__ticket-count {
    flex-shrink: 0;
    padding: 7px 10px;
    border: 1px solid rgba(255,255,255,.35);
    border-radius: 10px;
    background: rgba(255,255,255,.15);
    font-size: 10px;
    font-weight: 800;
    backdrop-filter: blur(10px);
  }

  .supmate-group__section {
    position: relative;
    margin-top: 17px;
  }

  .supmate-group__section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 9px;
    color: #596274;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .supmate-group__section-number {
    color: #3159f5;
    font-family: 'JetBrains Mono',monospace;
    font-size: 10px;
    letter-spacing: 0;
  }

  .supmate-group__input-wrap {
    padding: 3px;
    border: 1px solid rgba(255,255,255,.95);
    border-radius: 13px;
    background: linear-gradient(145deg,#dce1ea,#f8f9fc);
    box-shadow:
      inset 4px 4px 9px rgba(55,65,85,.10),
      inset -4px -4px 9px white;
  }

  .supmate-group__input-wrap input {
    width: 100%;
    min-height: 42px;
    border: 0 !important;
    outline: 0 !important;
    border-radius: 10px !important;
    background: transparent !important;
    color: #202535 !important;
    box-shadow: none !important;
    font-size: 12px !important;
  }

  .supmate-group__input-wrap input::placeholder {
    color: #9aa2b1 !important;
  }

  .supmate-group__input-wrap input:focus {
    box-shadow: none !important;
    outline: none !important;
  }

  .supmate-group__search {
    padding: 4px;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 14px;
    background: linear-gradient(145deg,#e0e5ed,#f9fafc);
    box-shadow:
      inset 4px 4px 9px rgba(55,65,85,.10),
      inset -4px -4px 9px white;
  }

  .supmate-group__search .supmate-user-search-input,
  .supmate-group__search .search-input {
    color: #202535 !important;
  }

  .supmate-group__search .supmate-user-search-input::placeholder,
  .supmate-group__search .search-input::placeholder {
    color: #929baa !important;
  }

  .supmate-group__search .supmate-user-search-results {
    z-index: 100;
  }

  .supmate-group__members {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 190px;
    overflow-y: auto;
    padding: 2px 5px 7px 2px;
    scrollbar-width: thin;
    scrollbar-color: #9ba8c0 transparent;
  }

  .supmate-group__member {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 9px;
    min-width: 0;
    padding: 9px 10px;
    border: 1px solid rgba(255,255,255,.95);
    border-radius: 14px;
    background: linear-gradient(145deg,#fff,#e9edf4);
    box-shadow:
      4px 5px 10px rgba(36,48,74,.09),
      -3px -3px 9px white;
    animation: supmate-member-in .22s ease both;
  }

  .supmate-group__member-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .supmate-group__member-avatar {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: linear-gradient(145deg,#fff,#cbd2df);
    box-shadow:
      3px 3px 7px rgba(36,48,74,.14),
      -3px -3px 7px white;
  }

  .supmate-group__member-name {
    overflow: hidden;
    color: #283044;
    font-size: 11px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .supmate-group__member-status {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 4px;
    color: #8a93a2;
    font-size: 9px;
  }

  .supmate-group__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 6px rgba(34,197,94,.45);
  }

  .supmate-group__remove {
    display: grid;
    width: 33px;
    height: 33px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 10px;
    color: #e15b68;
    background: linear-gradient(145deg,#fff,#e9eaf0);
    box-shadow: 3px 3px 7px rgba(36,48,74,.10),-3px -3px 7px white;
    cursor: pointer;
    transition: transform .18s ease, background .18s ease;
  }

  .supmate-group__remove:hover {
    transform: scale(1.06);
    background: #fff0f1;
  }

  .supmate-group__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    padding: 20px 10px;
    border: 1px dashed #c6cdd9;
    border-radius: 14px;
    color: #8791a2;
    text-align: center;
    font-size: 10px;
  }

  .supmate-group__empty-icon {
    color: #3159f5;
    opacity: .8;
  }

  .supmate-group__footer-note {
    margin-top: 13px;
    padding: 10px 11px;
    border: 1px solid rgba(255,255,255,.8);
    border-radius: 12px;
    background: rgba(255,255,255,.45);
    color: #7b8595;
    font-size: 9px;
    line-height: 1.6;
  }

  .supmate-group__footer-note strong {
    color: #475569;
  }

  .supmate-group__dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
  }

  .supmate-group__create {
    display: inline-flex;
    min-height: 42px;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 0 17px;
    border: 1px solid rgba(255,255,255,.65);
    border-radius: 12px;
    color: white;
    background: linear-gradient(125deg,#3159f5,#4938dc 65%,#6b43df);
    box-shadow:
      0 5px 14px rgba(49,89,245,.25),
      inset 0 1px 1px rgba(255,255,255,.4);
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
    transition: transform .2s ease,box-shadow .2s ease;
  }

  .supmate-group__create:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      0 8px 20px rgba(49,89,245,.35),
      inset 0 1px 1px rgba(255,255,255,.5);
  }

  .supmate-group__create:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .supmate-group__create:active:not(:disabled) {
    transform: scale(.97);
  }

  @keyframes supmate-member-in {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media(max-width: 480px) {
    .supmate-group__surface {
      padding: 13px;
      border-radius: 18px;
    }

    .supmate-group__title {
      font-size: 17px;
    }

    .supmate-group__dialog-footer {
      flex-wrap: wrap;
    }

    .supmate-group__create {
      flex: 1;
    }
  }

  @media(prefers-reduced-motion:reduce) {
    .supmate-group__member {
      animation: none;
    }

    .supmate-group__create,
    .supmate-group__remove {
      transition: none;
    }
  }
`;

export interface StartGroupChatProps {
  onSuccess: (pubKey: string) => void;
}

export const StartGroupChat = ({
  onSuccess,
}: StartGroupChatProps) => {
  const { appUser } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatName, setChatName] = useState("");
  const [formTouched, setFormTouched] = useState(false);

  const { members, addMember, removeMember } =
    useMembers(setLoading, open);

  const membersAreaRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobile();

  const handleOpen = () => {
    if (loading) return;
    setOpen((current) => !current);
  };

  useEffect(() => {
    if (!open) {
      setFormTouched(false);
      setChatName("");
    }
  }, [open]);

  const onAddMember = (member: SearchMenuItem | null) => {
    if (!member) return;

    if (members.some((existing) => existing.id === member.id)) {
      toast.info("This member is already in the group");
      return;
    }

    addMember(member);

    requestAnimationFrame(() => {
      if (membersAreaRef.current) {
        membersAreaRef.current.scrollTop =
          membersAreaRef.current.scrollHeight;
      }
    });
  };

  const createGroupChat = async () => {
    setFormTouched(true);

    const trimmedName = chatName.trim();

    if (!trimmedName) return;

    if (members.length === 0) {
      toast.warning("Please add at least one member to the group");
      return;
    }

    if (!appUser) {
      toast.error("User is not logged in");
      return;
    }

    if (trimmedName === DEFAULT_KEY_MESSAGING_GROUP_NAME) {
      toast.error("Choose a different group name");
      return;
    }

    setLoading(true);

    try {
      await createAccessGroup({
        AccessGroupOwnerPublicKeyBase58Check:
          appUser.PublicKeyBase58Check,
        AccessGroupPublicKeyBase58Check:
          appUser.messagingPublicKeyBase58Check,
        AccessGroupKeyName: trimmedName,
        MinFeeRateNanosPerKB: 1000,
      });

      const memberPublicKeys = members.map((member) => member.id);

      await addAccessGroupMembers({
        AccessGroupOwnerPublicKeyBase58Check:
          appUser.PublicKeyBase58Check,
        AccessGroupKeyName: trimmedName,
        AccessGroupMemberList: memberPublicKeys.map((pubKey) => ({
          AccessGroupMemberPublicKeyBase58Check: pubKey,
          AccessGroupMemberKeyName:
            DEFAULT_KEY_MESSAGING_GROUP_NAME,
          EncryptedKey: "",
          ExtraData: {},
        })),
        MinFeeRateNanosPerKB: 1000,
      });

      toast.success(`Group "${trimmedName}" created successfully!`);

      setOpen(false);
      onSuccess(appUser.PublicKeyBase58Check + trimmedName);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);

      toast.error(`Error creating group: ${message}`);
      console.error("Supmate group creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <style>{groupStyles}</style>

      <button
        type="button"
        onClick={handleOpen}
        className="btn-secondary w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider"
      >
        <GroupGlyph size={16} />
        <span>New Group Chat</span>
      </button>

      <Dialog
        open={open}
        onClose={handleOpen}
        title="Create group chat"
        description="Design your own private group space."
        maxWidth={isMobile ? 520 : 480}
        footer={
          <div className="supmate-group__dialog-footer">
            <Button
              variant="ghost"
              onClick={handleOpen}
              disabled={loading}
            >
              Cancel
            </Button>

            <button
              type="button"
              className="supmate-group__create"
              onClick={createGroupChat}
              disabled={loading || !chatName.trim() || members.length === 0}
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <GroupGlyph size={16} />
                  Create Group
                  <ArrowGlyph size={15} />
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="supmate-group">
          <div className="supmate-group__surface">
            <div className="supmate-group__hero">
              <div className="supmate-group__brand">
                <ChromeStar size={36} />
              </div>

              <div className="min-w-0">
                <div className="supmate-group__eyebrow">
                  SUPMATE · PRIVATE SPACE
                </div>

                <div className="supmate-group__title">
                  Create your circle.
                </div>

                <div className="supmate-group__subtitle">
                  A new space for your people.
                </div>
              </div>
            </div>

            <div className="supmate-group__ticket">
              <div className="supmate-group__ticket-inner">
                <div className="min-w-0">
                  <div className="supmate-group__ticket-label">
                    YOUR GROUP IDENTITY
                  </div>

                  <div className="supmate-group__ticket-name">
                    {chatName.trim() || "UNTITLED COLLECTIVE"}
                  </div>
                </div>

                <div className="supmate-group__ticket-count">
                  {members.length + 1} MEMBERS
                </div>
              </div>
            </div>

            <div className="supmate-group__section">
              <div className="supmate-group__section-heading">
                <span>01 / Name your group</span>
                <span className="supmate-group__section-number">
                  IDENTITY
                </span>
              </div>

              <div className="supmate-group__input-wrap">
                <MyInput
                  label=""
                  placeholder="e.g. Supmate Guild Alpha"
                  value={chatName}
                  setValue={setChatName}
                  error={
                    formTouched && !chatName.trim()
                      ? "Group name is required"
                      : undefined
                  }
                />
              </div>
            </div>

            <div className="supmate-group__section">
              <div className="supmate-group__section-heading">
                <span>02 / Invite your people</span>
                <span className="supmate-group__section-number">
                  {members.length} ADDED
                </span>
              </div>

              <div className="supmate-group__search">
                <SearchUsers
                  onSelected={onAddMember}
                  placeholder="Find username, DeSo or Ethereum address..."
                />
              </div>
            </div>

            <div className="supmate-group__section">
              <div className="supmate-group__section-heading">
                <span>03 / Your collective</span>
                <span className="supmate-group__section-number">
                  {members.length + 1} TOTAL
                </span>
              </div>

              <div
                ref={membersAreaRef}
                className="supmate-group__members"
              >
                <div className="supmate-group__member">
                  <div className="supmate-group__member-info">
                    <div className="supmate-group__member-avatar">
                      <ChromeStar size={24} />
                    </div>

                    <div className="min-w-0">
                      <div className="supmate-group__member-name">
                        You · Group creator
                      </div>
                      <div className="supmate-group__member-status">
                        <span className="supmate-group__status-dot" />
                        Group administrator
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold text-blue-600">
                    OWNER
                  </span>
                </div>

                {members.map((member) => (
                  <div
                    key={member.id}
                    className="supmate-group__member"
                  >
                    <div className="supmate-group__member-info">
                      <div className="supmate-group__member-avatar">
                        <MessagingDisplayAvatar
                          publicKey={member.id}
                          username={member.profile?.Username}
                          diameter={32}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="supmate-group__member-name">
                          {member.text}
                        </div>
                        <div className="supmate-group__member-status">
                          <span className="supmate-group__status-dot" />
                          Invited member
                        </div>
                      </div>
                    </div>

                    <IconButton
                      size="sm"
                      label={`Remove ${member.text}`}
                      tone="danger"
                      onClick={() => removeMember(member.id)}
                    >
                      <TrashGlyph size={14} />
                    </IconButton>
                  </div>
                ))}

                {members.length === 0 && (
                  <div className="supmate-group__empty">
                    <span className="supmate-group__empty-icon">
                      <GroupGlyph size={25} />
                    </span>
                    <strong>No members added yet</strong>
                    Search for people above to build your collective.
                  </div>
                )}
              </div>
            </div>

            <div className="supmate-group__footer-note">
              <strong>🔐 Private by design.</strong> Group members use
              DeSo Access Groups and their associated keys for messaging.
              Your group is created on-chain.
            </div>
          </div>
        </div>
      </Dialog>
    </Fragment>
  );
};
