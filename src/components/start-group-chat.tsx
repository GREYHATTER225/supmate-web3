import { SearchUsers } from "components/search-users";
import { UserContext } from "contexts/UserContext";
import { addAccessGroupMembers, createAccessGroup } from "deso-protocol";
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useMembers } from "../hooks/useMembers";
import { useMobile } from "../hooks/useMobile";
import { DEFAULT_KEY_MESSAGING_GROUP_NAME } from "../utils/constants";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";
import { MyInput } from "./form/my-input";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { IconButton } from "./ui/icon-button";
import { AssetIcon } from "./ui/asset-icon";

/** Local monochrome trash glyph (inline SVG — no external library). */
const TrashGlyph = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export interface StartGroupChatProps {
  onSuccess: (pubKey: string) => void;
}

export const StartGroupChat = ({ onSuccess }: StartGroupChatProps) => {
  const { appUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatName, setChatName] = useState<string>("");
  const [formTouched, setFormTouched] = useState<boolean>(false);
  const { members, addMember, removeMember } = useMembers(setLoading, open);
  const membersAreaRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobile();

  const handleOpen = () => setOpen(!open);

  useEffect(() => {
    if (!open) {
      setFormTouched(false);
      setChatName("");
    }
  }, [open]);

  const onAddMember = async (member: any) => {
    addMember(member);
    if (membersAreaRef.current) {
      membersAreaRef.current.scrollTop = membersAreaRef.current.scrollHeight;
    }
  };

  const createGroupChat = async () => {
    setFormTouched(true);
    if (!chatName.trim()) {
      return;
    }
    if (members.length === 0) {
      toast.warning("Please add at least one member to the group");
      return;
    }
    if (!appUser) {
      toast.error("User is not logged in");
      return;
    }

    setLoading(true);
    try {
      await createAccessGroup({
        AccessGroupOwnerPublicKeyBase58Check: appUser.PublicKeyBase58Check,
        AccessGroupPublicKeyBase58Check: appUser.messagingPublicKeyBase58Check,
        AccessGroupKeyName: chatName.trim(),
        MinFeeRateNanosPerKB: 1000,
      });

      const memberPublicKeys = members.map((m) => m.id);
      await addAccessGroupMembers({
        AccessGroupOwnerPublicKeyBase58Check: appUser.PublicKeyBase58Check,
        AccessGroupKeyName: chatName.trim(),
        AccessGroupMemberList: memberPublicKeys.map((pubKey) => ({
          AccessGroupMemberPublicKeyBase58Check: pubKey,
          AccessGroupMemberKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
          EncryptedKey: "",
          ExtraData: {},
        })),
        MinFeeRateNanosPerKB: 1000,
      });

      toast.success(`Group "${chatName}" created successfully!`);
      handleOpen();
      onSuccess(appUser.PublicKeyBase58Check + chatName.trim());
    } catch (e: any) {
      toast.error(`Error creating group: ${e?.message || e}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <button
        onClick={handleOpen}
        className="btn-secondary w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider"
      >
        <AssetIcon name="members" size={15} />
        <span>New Group Chat</span>
      </button>

      <Dialog
        open={open}
        onClose={handleOpen}
        title="Create group chat"
        description="Groups are DeSo Access Groups — members encrypt and decrypt through the group's keys."
        maxWidth={isMobile ? 520 : 480}
        footer={
          <>
            <Button variant="ghost" onClick={handleOpen} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={loading}
              loadingLabel="Creating…"
              onClick={createGroupChat}
            >
              Create Group
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <MyInput
              label="Group Name"
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

          <div>
            <label className="field-label">Add Members (DeSo / Ethereum)</label>
            <SearchUsers
              onSelected={onAddMember}
              placeholder="Search user to add..."
            />
          </div>

          <div
            ref={membersAreaRef}
            className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar"
          >
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <MessagingDisplayAvatar publicKey={member.id} diameter={26} />
                  <span className="text-xs truncate">{member.text}</span>
                </div>
                <IconButton
                  size="sm"
                  label={`Remove ${member.text}`}
                  tone="danger"
                  onClick={() => removeMember(member.id)}
                >
                  <TrashGlyph size={13} />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    </Fragment>
  );
};
