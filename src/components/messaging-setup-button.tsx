import { UserContext } from "contexts/UserContext";
import { DemoContext } from "contexts/DemoContext";
import { createAccessGroup, getAllAccessGroups } from "deso-protocol";
import { useContext, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import { DEFAULT_KEY_MESSAGING_GROUP_NAME } from "utils/constants";
import { hasSetupMessaging } from "utils/helpers";
import { SendFundsDialog } from "./send-funds-dialog";
import { playClickSound } from "../utils/soundEffects";
import { Button } from "./ui/button";

/** Local monochrome glyphs (inline SVG — no external library). */
const WalletGlyph = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M16 12h.01" />
    <path d="M3 9h18" />
  </svg>
);

const BoltGlyph = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
  </svg>
);

const ShieldCheckGlyph = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const MessagingSetupButton = () => {
  const { appUser, isLoadingUser, setAccessGroups, setAllAccessGroups } =
    useContext(UserContext);
  const { setIsAuthModalOpen, triggerWarpTransition } = useContext(DemoContext);
  const [isSettingUpMessage, setIsSettingUpMessaging] =
    useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  if (hasSetupMessaging(appUser)) {
    return (
      <div className="text-sm" style={{ color: "var(--text-muted)" }}>
        Account is ready for on-chain messaging.
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div className="flex justify-center my-4">
        <ClipLoader
          color={"var(--color-emerald)"}
          loading={true}
          size={32}
          className="mt-2"
        />
      </div>
    );
  }

  if (!appUser) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
        <button
          onClick={() => {
            playClickSound();
            setIsAuthModalOpen(true);
          }}
          className="btn-primary"
        >
          <WalletGlyph size={16} />
          <span>Connect Account</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            triggerWarpTransition(true);
          }}
          className="btn-secondary"
        >
          <BoltGlyph size={15} />
          <span>Explore Demo</span>
        </button>
      </div>
    );
  }

  if (appUser.BalanceNanos === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          variant="secondary"
          leadingIcon={<WalletGlyph size={16} />}
          onClick={() => {
            playClickSound();
            setOpenDialog(true);
          }}
        >
          Get $DESO to initialize
        </Button>
        {openDialog && (
          <SendFundsDialog
            appUser={appUser}
            onClose={() => setOpenDialog(false)}
          />
        )}
      </div>
    );
  }

  return (
    <button
      disabled={isSettingUpMessage}
      onClick={async () => {
        playClickSound();
        setIsSettingUpMessaging(true);
        try {
          await createAccessGroup({
            AccessGroupOwnerPublicKeyBase58Check: appUser.PublicKeyBase58Check,
            AccessGroupPublicKeyBase58Check:
              appUser.messagingPublicKeyBase58Check,
            AccessGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
            MinFeeRateNanosPerKB: 1000,
          });

          const { AccessGroupsOwned, AccessGroupsMember } =
            await getAllAccessGroups({
              PublicKeyBase58Check: appUser.PublicKeyBase58Check,
            });

          if (!AccessGroupsOwned) {
            throw new Error("did not get any access groups");
          }

          setAccessGroups(AccessGroupsOwned);
          setAllAccessGroups(AccessGroupsOwned.concat(AccessGroupsMember || []));
          toast.success("Account initialized for decentralized messaging!");
        } catch (e: any) {
          toast.error("Something went wrong when setting up the account");
          console.error(e);
        }
        setIsSettingUpMessaging(false);
      }}
      className="btn-primary"
    >
      {isSettingUpMessage ? (
        <ClipLoader color={"#07080A"} loading={true} size={18} />
      ) : (
        <>
          <ShieldCheckGlyph size={18} />
          <span>Set up messaging</span>
        </>
      )}
    </button>
  );
};
