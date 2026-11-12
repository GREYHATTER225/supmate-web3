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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-400 border border-orange-500/30 hover:border-orange-500/60 shadow-[0_0_15px_rgba(255,85,0,0.15)]"
      >
        <AssetIcon name="members" size={15} />
        <span className="hidden sm:inline font-mono tracking-wider">Members</span>
      </button>

      <Dialog
        open={open}
        onClose={handleOpen}
        title={`Group members · ${groupName}`}
        description="Members of this DeSo Access Group can encrypt and decrypt messages in the conversation."
        footer={
          <Button variant="ghost" onClick={handleOpen} className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl font-mono text-xs uppercase tracking-wider">
            Close
          </Button>
        }
      >
        <div className="space-y-4 text-neutral-100">
          {isGroupOwner && (
            <div>
              <label className="field-label text-orange-400 font-mono text-xs uppercase tracking-wider block mb-1.5">Add member to group</label>
              <SearchUsers
                onSelected={(m) => m && addMember(m)}
                placeholder="Search user to add..."
              />
            </div>
          )}

          <div
            className="text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-400"
          >
            Current members ({members.length})
          </div>

          <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
            {loading ? (
              <div className="flex justify-center p-6">
                <ClipLoader color="#ff5500" size={22} />
              </div>
            ) : members.length === 0 ? (
              <p className="text-xs py-4 text-center font-mono text-neutral-500">
                No members loaded.
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/80 border border-orange-500/20 hover:border-orange-500/40 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <div className="rounded-xl overflow-hidden border border-orange-500/30 shrink-0 bg-neutral-950 p-0.5">
                      <MessagingDisplayAvatar
                        publicKey={member.id}
                        diameter={26}
                      />
                    </div>
                    <span className="text-xs font-medium text-neutral-200 truncate">{member.text}</span>
                    {member.id === ownerKey && (
                      <span
                        className="inline-flex items-center gap-1 shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_10px_rgba(255,85,0,0.2)]"
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