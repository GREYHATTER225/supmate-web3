
import { useContext, useState, CSSProperties } from "react";
import { createAccessGroup, getAllAccessGroups } from "deso-protocol";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";

import { UserContext } from "contexts/UserContext";
import { DemoContext } from "contexts/DemoContext";
import { DEFAULT_KEY_MESSAGING_GROUP_NAME } from "utils/constants";
import { hasSetupMessaging } from "utils/helpers";
import { SendFundsDialog } from "./send-funds-dialog";
import { playClickSound } from "../utils/soundEffects";
import { Button } from "./ui/button";

const WalletGlyph = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M16 12h.01M3 9h18" />
  </svg>
);

const BoltGlyph = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
  </svg>
);

const ShieldCheckGlyph = ({ size = 19 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ChromeStar = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M50 3 C57 37 63 43 97 50 C63 57 57 63 50 97 C43 63 37 57 3 50 C37 43 43 37 50 3Z"
      fill="url(#supmateChrome)"
      stroke="white"
      strokeWidth="1.5"
    />
    <defs>
      <linearGradient id="supmateChrome" x1="15" y1="8" x2="85" y2="92">
        <stop stopColor="#fff" />
        <stop offset=".25" stopColor="#64748b" />
        <stop offset=".48" stopColor="#fff" />
        <stop offset=".7" stopColor="#475569" />
        <stop offset="1" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
  </svg>
);

const setupStyles = `
  .supmate-setup {
    position: relative;
    width: 100%;
    color: #f8fafc;
    font-family: inherit;
  }

  .supmate-setup * {
    box-sizing: border-box;
  }

  .supmate-setup-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.13);
    border-radius: 20px;
    padding: 19px;
    background:
      radial-gradient(ellipse at 0% 0%, rgba(34,211,238,.09), transparent 45%),
      radial-gradient(ellipse at 100% 100%, rgba(217,70,239,.07), transparent 45%),
      linear-gradient(145deg, rgba(27,31,38,.91), rgba(5,7,10,.97));
    box-shadow:
      0 15px 45px rgba(0,0,0,.35),
      inset 0 1px 0 rgba(255,255,255,.13);
  }

  .supmate-setup-card::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      115deg,
      transparent 15%,
      rgba(255,255,255,.045) 38%,
      transparent 53%
    );
  }

  .supmate-setup-top {
    position: relative;
    display: flex;
    align-items: center;
    gap: 13px;
    margin-bottom: 17px;
  }

  .supmate-setup-star {
    display: flex;
    width: 45px;
    height: 45px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.25);
    border-radius: 14px;
    background: linear-gradient(145deg, #343a43, #080a0d 65%);
    box-shadow: 0 0 18px rgba(34,211,238,.12),
      inset 0 1px 2px rgba(255,255,255,.35);
  }

  .supmate-setup-eyebrow {
    color: #9ca3af;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .19em;
    text-transform: uppercase;
  }

  .supmate-setup-heading {
    margin-top: 3px;
    color: #f8fafc;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: -.035em;
  }

  .supmate-setup-description {
    position: relative;
    margin: 0 0 17px;
    color: #a1a1aa;
    font-size: 12px;
    line-height: 1.65;
  }

  .supmate-setup-actions {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .supmate-setup-action {
    position: relative;
    display: inline-flex;
    min-height: 43px;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 0 16px;
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 12px;
    color: #f8fafc;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .01em;
    cursor: pointer;
    overflow: hidden;
    transition: transform .2s ease, border-color .2s ease,
      box-shadow .2s ease, filter .2s ease;
  }

  .supmate-setup-action:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(255,255,255,.65);
    box-shadow: 0 7px 20px rgba(0,0,0,.35),
      0 0 14px rgba(34,211,238,.12);
    filter: brightness(1.12);
  }

  .supmate-setup-action:active:not(:disabled) {
    transform: scale(.98);
  }

  .supmate-setup-action:disabled {
    cursor: not-allowed;
    opacity: .65;
  }

  .supmate-setup-primary {
    background: linear-gradient(130deg, #f8fafc, #aeb9c8 45%, #e5e7eb);
    color: #050608;
    border-color: rgba(255,255,255,.8);
    box-shadow: inset 0 1px 1px rgba(255,255,255,.9),
      0 4px 16px rgba(255,255,255,.08);
  }

  .supmate-setup-secondary {
    background: linear-gradient(135deg, rgba(30,35,45,.95), rgba(5,7,10,.95));
    border-color: rgba(34,211,238,.28);
  }

  .supmate-setup-holo {
    height: 2px;
    width: 100%;
    margin-top: 17px;
    border-radius: 10px;
    opacity: .8;
    background: linear-gradient(
      90deg,
      #60a5fa,
      #a78bfa,
      #f472b6,
      #fbbf24,
      #4ade80,
      #22d3ee
    );
  }

  .supmate-setup-ready {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid rgba(74,222,128,.23);
    border-radius: 13px;
    background: linear-gradient(120deg, rgba(22,163,74,.10), rgba(3,7,8,.8));
    color: #bbf7d0;
    font-size: 12px;
    font-weight: 700;
  }

  .supmate-setup-ready-dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 10px rgba(74,222,128,.8);
  }

  .supmate-setup-loading {
    display: flex;
    min-height: 100px;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 16px;
    background: rgba(10,12,16,.85);
  }

  @media(max-width: 480px) {
    .supmate-setup-actions {
      flex-direction: column;
    }

    .supmate-setup-action {
      width: 100%;
    }
  }

  @media(prefers-reduced-motion: reduce) {
    .supmate-setup-action {
      transition: none;
    }
  }
`;

export const MessagingSetupButton = () => {
  const { appUser, isLoadingUser, setAccessGroups, setAllAccessGroups } =
    useContext(UserContext);

  const { setIsAuthModalOpen, triggerWarpTransition } =
    useContext(DemoContext);

  const [isSettingUpMessage, setIsSettingUpMessaging] =
    useState<boolean>(false);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  if (hasSetupMessaging(appUser)) {
    return (
      <div className="supmate-setup">
        <style>{setupStyles}</style>
        <div className="supmate-setup-ready">
          <span className="supmate-setup-ready-dot" />
          <ShieldCheckGlyph size={17} />
          <span>Account ready for on-chain messaging</span>
        </div>
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div className="supmate-setup">
        <style>{setupStyles}</style>
        <div className="supmate-setup-loading">
          <ClipLoader color="#67e8f9" loading size={30} />
        </div>
      </div>
    );
  }

  if (!appUser) {
    return (
      <div className="supmate-setup">
        <style>{setupStyles}</style>

        <section className="supmate-setup-card">
          <div className="supmate-setup-top">
            <div className="supmate-setup-star">
              <ChromeStar size={27} />
            </div>
            <div>
              <div className="supmate-setup-eyebrow">
                SUPMATE IDENTITY
              </div>
              <div className="supmate-setup-heading">
                Enter your messaging space
              </div>
            </div>
          </div>

          <p className="supmate-setup-description">
            Connect your DeSo account to initialize your identity and use
            decentralized messaging. You can also explore the demo first.
          </p>

          <div className="supmate-setup-actions">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsAuthModalOpen(true);
              }}
              className="supmate-setup-action supmate-setup-primary"
            >
              <WalletGlyph size={17} />
              Connect Account
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                triggerWarpTransition(true);
              }}
              className="supmate-setup-action supmate-setup-secondary"
            >
              <BoltGlyph size={17} />
              Explore Demo
            </button>
          </div>

          <div className="supmate-setup-holo" />
        </section>
      </div>
    );
  }

  if (appUser.BalanceNanos === 0) {
    return (
      <div className="supmate-setup">
        <style>{setupStyles}</style>

        <section className="supmate-setup-card">
          <div className="supmate-setup-top">
            <div className="supmate-setup-star">
              <WalletGlyph size={22} />
            </div>
            <div>
              <div className="supmate-setup-eyebrow">
                WALLET INITIALIZATION
              </div>
              <div className="supmate-setup-heading">
                Get $DESO to initialize
              </div>
            </div>
          </div>

          <p className="supmate-setup-description">
            Your account needs a $DESO balance to create its messaging
            access group on-chain.
          </p>

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

          <div className="supmate-setup-holo" />
        </section>
      </div>
    );
  }

  const initializeMessaging = async () => {
    if (isSettingUpMessage) return;

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
        throw new Error("Did not get any access groups");
      }

      setAccessGroups(AccessGroupsOwned);

      setAllAccessGroups(
        AccessGroupsOwned.concat(AccessGroupsMember || [])
      );

      toast.success("Account initialized for decentralized messaging!");
    } catch (error) {
      toast.error("Something went wrong when setting up the account");
      console.error("Supmate messaging initialization error:", error);
    } finally {
      setIsSettingUpMessaging(false);
    }
  };

  return (
    <div className="supmate-setup">
      <style>{setupStyles}</style>

      <section className="supmate-setup-card">
        <div className="supmate-setup-top">
          <div className="supmate-setup-star">
            <ChromeStar size={27} />
          </div>

          <div>
            <div className="supmate-setup-eyebrow">
              DECENTRALIZED MESSAGING
            </div>
            <div className="supmate-setup-heading">
              Initialize your identity
            </div>
          </div>
        </div>

        <p className="supmate-setup-description">
          Create your on-chain messaging access group to start sending
          private messages through Supmate.
        </p>

        <div className="supmate-setup-actions">
          <button
            type="button"
            disabled={isSettingUpMessage}
            onClick={initializeMessaging}
            className="supmate-setup-action supmate-setup-primary"
          >
            {isSettingUpMessage ? (
              <>
                <ClipLoader color="#111827" loading size={17} />
                Initializing...
              </>
            ) : (
              <>
                <ShieldCheckGlyph size={18} />
                Set up messaging
              </>
            )}
          </button>
        </div>

        <div className="supmate-setup-holo" />
      </section>
    </div>
  );
};