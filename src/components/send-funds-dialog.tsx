import { AppUser } from "contexts/UserContext";
import { identity } from "deso-protocol";
import { desoNanosToDeso } from "../utils/helpers";
import { shortenLongWord } from "./search-users";
import { AlertNotification } from "./shared/alert-notification";
import { SaveToClipboard } from "./shared/save-to-clipboard";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";

/** Local monochrome wallet glyph (inline SVG — no external library). */
const WalletGlyph = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M16 12h.01" />
    <path d="M3 9h18" />
  </svg>
);

export interface SendFundsDialogProps {
  appUser: AppUser;
  onClose: () => void;
}

export const SendFundsDialog = ({ appUser, onClose }: SendFundsDialogProps) => {
  const formSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <form
        name="start-group-chat-form"
        onSubmit={formSubmit}
        className="space-y-4"
      >
        <AlertNotification type="info">
          <div className="break-words text-center" style={{ color: "var(--text-secondary)" }}>
            No $DESO found for your address:
            <div className="mt-2">
              <div
                className="inline-block px-4 py-2 rounded-lg font-mono text-xs"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <SaveToClipboard text={appUser.PublicKeyBase58Check}>
                  {shortenLongWord(appUser.PublicKeyBase58Check, 8, 8)}
                </SaveToClipboard>
              </div>
            </div>
            <p className="mt-3 text-xs">
              Use the button below to add some with phone verification, or send
              $DESO from another wallet.
            </p>
          </div>
        </AlertNotification>

        <div className="text-center">
          <div style={{ fontSize: 22 }}>
            Your balance:{" "}
            <b style={{ color: "var(--color-emerald)" }}>
              {desoNanosToDeso(appUser.BalanceNanos)} $DESO
            </b>
          </div>
          <div className="text-xs italic mt-1" style={{ color: "var(--text-faint)" }}>
            We refresh your balance every 3 seconds.
          </div>

          <div className="mt-4">
            <Button
              variant="primary"
              leadingIcon={<WalletGlyph size={16} />}
              onClick={() => {
                identity.verifyPhoneNumber();
              }}
            >
              Get $DESO
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
