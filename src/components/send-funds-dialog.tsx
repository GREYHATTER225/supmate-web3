
import React from "react";
import { AppUser } from "contexts/UserContext";
import { identity } from "deso-protocol";
import { desoNanosToDeso } from "../utils/helpers";
import { shortenLongWord } from "./search-users";
import { AlertNotification } from "./shared/alert-notification";
import { SaveToClipboard } from "./shared/save-to-clipboard";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";

const WalletGlyph = ({ size = 19 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M16 12h.01M3 9h18" />
  </svg>
);

const ChromeStar = () => (
  <svg width="38" height="38" viewBox="0 0 100 100" fill="none"
    aria-hidden="true">
    <defs>
      <linearGradient id="fundsChrome" x1="10" y1="5" x2="90" y2="95">
        <stop stopColor="#fff" />
        <stop offset=".25" stopColor="#64748b" />
        <stop offset=".48" stopColor="#fff" />
        <stop offset=".72" stopColor="#475569" />
        <stop offset="1" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path d="M50 3 C57 37 63 43 97 50 C63 57 57 63 50 97 C43 63 37 57 3 50 C37 43 43 37 50 3Z"
      fill="url(#fundsChrome)" stroke="white" strokeWidth="1.5" />
  </svg>
);

const fundsStyles = `
  .supmate-funds {
    color: #f8fafc;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .supmate-funds * {
    box-sizing: border-box;
  }

  .supmate-funds__hero {
    position: relative;
    overflow: hidden;
    padding: 17px;
    border: 1px solid rgba(255,255,255,.2);
    border-radius: 17px;
    background:
      radial-gradient(ellipse at 5% 0%,rgba(34,211,238,.12),transparent 48%),
      radial-gradient(ellipse at 100% 100%,rgba(217,70,239,.08),transparent 45%),
      linear-gradient(145deg,#20252d,#080a0d 72%);
    box-shadow:
      inset 0 1px 1px rgba(255,255,255,.25),
      0 12px 30px rgba(0,0,0,.4);
  }

  .supmate-funds__hero::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(120deg,transparent 25%,rgba(255,255,255,.07) 45%,transparent 62%);
  }

  .supmate-funds__brand {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
  }

  .supmate-funds__icon {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.38);
    border-radius: 15px;
    background: linear-gradient(145deg,#737e8c,#171b22 52%,#050608);
    box-shadow: inset 0 1px 3px rgba(255,255,255,.5),
      0 0 15px rgba(34,211,238,.12);
  }

  .supmate-funds__eyebrow {
    color: #a5f3fc;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .19em;
  }

  .supmate-funds__heading {
    margin-top: 4px;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.04em;
  }

  .supmate-funds__description {
    position: relative;
    margin-top: 13px;
    color: #a1a1aa;
    font-size: 11px;
    line-height: 1.7;
  }

  .supmate-funds__address {
    margin-top: 16px;
    padding: 14px;
    border: 1px solid rgba(255,255,255,.19);
    border-radius: 13px;
    background: linear-gradient(145deg,rgba(255,255,255,.09),rgba(0,0,0,.4));
    box-shadow: inset 0 1px 2px rgba(255,255,255,.12);
  }

  .supmate-funds__label {
    margin-bottom: 9px;
    color: #9ca3af;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .15em;
    text-transform: uppercase;
  }

  .supmate-funds__key {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #e2e8f0;
    font-family: 'JetBrains Mono',monospace;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .supmate-funds__balance {
    margin-top: 15px;
    padding: 17px;
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 15px;
    background:
      linear-gradient(120deg,rgba(255,255,255,.09),transparent 55%),
      #080a0d;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.15),
      0 7px 20px rgba(0,0,0,.25);
    text-align: center;
  }

  .supmate-funds__balance-label {
    color: #9ca3af;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .supmate-funds__balance-value {
    margin-top: 7px;
    color: #a5f3fc;
    font-size: 27px;
    font-weight: 900;
    letter-spacing: -.045em;
    text-shadow: 0 0 18px rgba(34,211,238,.2);
  }

  .supmate-funds__refresh {
    margin-top: 6px;
    color: #737d8b;
    font-size: 10px;
  }

  .supmate-funds__rainbow {
    height: 2px;
    margin-top: 15px;
    border-radius: 10px;
    background: linear-gradient(90deg,#60a5fa,#a78bfa,#f472b6,#fbbf24,#4ade80,#22d3ee);
  }

  .supmate-funds__action {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
`;

export interface SendFundsDialogProps {
  appUser: AppUser;
  onClose: () => void;
}

export const SendFundsDialog = ({
  appUser,
  onClose,
}: SendFundsDialogProps) => {
  const formSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      title="Add $DESO to get started"
      description="Your account has no $DESO balance. A small amount pays the network fee for your first messages."
      maxWidth={480}
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <style>{fundsStyles}</style>

      <div className="supmate-funds">
        <form
          name="start-group-chat-form"
          onSubmit={formSubmit}
          className="space-y-4"
        >
          <section className="supmate-funds__hero">
            <div className="supmate-funds__brand">
              <div className="supmate-funds__icon">
                <ChromeStar />
              </div>
              <div>
                <div className="supmate-funds__eyebrow">
                  SUPMATE WALLET
                </div>
                <div className="supmate-funds__heading">
                  Fund your identity
                </div>
              </div>
            </div>

            <p className="supmate-funds__description">
              Your DeSo account needs a small balance to initialize
              decentralized messaging and pay its network transaction fee.
            </p>
            <div className="supmate-funds__rainbow" />
          </section>

          <AlertNotification type="info">
            <div className="text-center break-words"
              style={{ color: "var(--text-secondary)" }}>
              No $DESO found for your address:

              <div className="supmate-funds__address">
                <div className="supmate-funds__label">
                  Your DeSo public key
                </div>
                <div className="supmate-funds__key">
                  <SaveToClipboard text={appUser.PublicKeyBase58Check}>
                    {shortenLongWord(
                      appUser.PublicKeyBase58Check,
                      8,
                      8
                    )}
                  </SaveToClipboard>
                </div>
              </div>

              <p className="mt-3 text-xs">
                Use phone verification to get $DESO, or send $DESO
                from another wallet.
              </p>
            </div>
          </AlertNotification>

          <section className="supmate-funds__balance">
            <div className="supmate-funds__balance-label">
              Current wallet balance
            </div>

            <div className="supmate-funds__balance-value">
              {desoNanosToDeso(appUser.BalanceNanos)} $DESO
            </div>

            <div className="supmate-funds__refresh">
              Balance refreshes every 3 seconds.
            </div>
          </section>

          <div className="supmate-funds__action">
            <Button
              variant="primary"
              leadingIcon={<WalletGlyph size={17} />}
              onClick={() => {
                void identity.verifyPhoneNumber();
              }}
            >
              Get $DESO
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
