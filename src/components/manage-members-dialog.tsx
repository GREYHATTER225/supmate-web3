import React, { Fragment, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { useMembers } from "../hooks/useMembers";
import { Conversation } from "../utils/types";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";
import { SearchUsers } from "./search-users";
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

/** Local monochrome owner/crown glyph (inline SVG — no external library). */
const OwnerGlyph = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 17h18" />
    <path d="M4 17 3 6.5l5.2 4L12 4l3.8 6.5L21 6.5 20 17" />
  </svg>
);

export interface ManageMembersDialogProps {
  onSuccess: () => void;
  conversation: Conversation;
  isGroupOwner: boolean;
}

export const ManageMembersDialog = ({
  conversation,
  isGroupOwner,
}: ManageMembersDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { members, addMember, removeMember } = useMembers(
    setLoading,
    open,
    conversation
  );

  const handleOpen = () => setOpen(!open);
  const groupName =
    conversation.messages[0]?.RecipientInfo?.AccessGroupKeyName || "Group";
  const ownerKey =
    conversation.messages[0]?.RecipientInfo?.OwnerPublicKeyBase58Check;

  return (
    <Fragment>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border-subtle)",
          color: "var(--color-emerald)",
        }}
      >
        <AssetIcon name="members" size={15} />
        <span className="hidden sm:inline">Members</span>
      </button>

      <Dialog
        open={open}
        onClose={handleOpen}
        title={`Group members · ${groupName}`}
        description="Members of this DeSo Access Group can encrypt and decrypt messages in the conversation."
        footer={
          <Button variant="ghost" onClick={handleOpen}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          {isGroupOwner && (
            <div>
              <label className="field-label">Add member to group</label>
              <SearchUsers
                onSelected={(m) => m && addMember(m)}
                placeholder="Search user to add..."
              />
            </div>
          )}

          <div
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Current members ({members.length})
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-4">
                <ClipLoader color="var(--color-emerald)" size={22} />
              </div>
            ) : members.length === 0 ? (
              <p className="text-xs py-3" style={{ color: "var(--text-faint)" }}>
                No members loaded.
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <MessagingDisplayAvatar
                      publicKey={member.id}
                      diameter={26}
                    />
                    <span className="text-xs truncate">{member.text}</span>
                    {member.id === ownerKey && (
                      <span
                        className="inline-flex items-center gap-1 shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                        style={{
                          background: "var(--color-emerald-dim)",
                          color: "var(--color-emerald)",
                        }}
                        title="Group owner"
                      >
                        <OwnerGlyph size={10} />
                        Owner
                      </span>
                    )}
                  </div>
                  {isGroupOwner && (
                    <IconButton
                      size="sm"
                      label={`Remove ${member.text}`}
                      tone="danger"
                      onClick={() => removeMember(member.id)}
                    >
                      <TrashGlyph size={13} />
                    </IconButton>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Dialog>
    </Fragment>
  );
};
