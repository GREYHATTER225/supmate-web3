import { FC, useContext } from "react";
import { AppUser, UserContext } from "contexts/UserContext";
import { DemoContext } from "contexts/DemoContext";
import { IS_MAINNET } from "../utils/constants";
import { desoNanosToDeso } from "../utils/helpers";
import { DEMO_USER } from "../utils/demoData";
import { useBlockHeight } from "../hooks/useBlockHeight";
import { shortenLongWord } from "./search-users";
import { AssetIcon } from "./ui/asset-icon";
import { GeometricAvatar } from "./ui/geometric-avatar";
import { SaveToClipboard } from "./shared/save-to-clipboard";

/**
 * Bento 1 · Identity & wallet state controller.
 *
 * The user's active session as a single obsidian plate: a procedurally
 * generated geometric avatar (no photography), the ENS-style handle or
 * truncated on-chain key in monospace, and a sparse row of session/network
 * telemetry. Colour is reserved for the single confirmation dot.
 */
export const IdentityPanel: FC<{
  appUser?: AppUser | null;
  isDemo?: boolean;
  demoName?: string;
  demoHandle?: string;
  demoPublicKey?: string;
}> = ({
  appUser: appUserProp,
  isDemo: isDemoProp,
  demoName,
  demoHandle,
  demoPublicKey,
}) => {
  const { appUser: contextUser } = useContext(UserContext);
  const { isDemoMode } = useContext(DemoContext);
  const appUser = appUserProp !== undefined ? appUserProp : contextUser;
  const isDemo = isDemoProp ?? isDemoMode;
  const { height, isTestnet, syncing } = useBlockHeight(15000, !isDemo && !!appUser);

  if (isDemo) {
    return (
      <section className="bento identity-bento" aria-label="Identity panel">
        <div className="identity-bento__head">
          <div className="identity-bento__avatar">
            <GeometricAvatar
              seed={demoPublicKey || DEMO_USER.publicKey}
              size={48}
              title={demoName || DEMO_USER.name}
            />
          </div>
          <div className="identity-bento__id">
            <div className="identity-bento__name">{demoName || DEMO_USER.name}</div>
            <div className="identity-bento__key">
              <span className="mono">{demoHandle || DEMO_USER.handle}</span>
            </div>
          </div>
        </div>

        <div className="identity-bento__meta">
          <div className="identity-meta-row">
            <span className="identity-meta-row__label">Session</span>
            <span className="mono-chip" style={{ color: "var(--color-amber)" }}>SANDBOX</span>
          </div>
          <div className="identity-meta-row">
            <span className="identity-meta-row__label">Network</span>
            <span className="mono-chip">
              {(isTestnet ?? IS_MAINNET) ? "DeSo testnet" : "DeSo mainnet"}
            </span>
          </div>
          <div className="identity-meta-row">
            <span className="identity-meta-row__label">Ledger</span>
            <span className="mono-chip">
              {height ? `#${height.toLocaleString()}` : "—"}
            </span>
          </div>
        </div>
      </section>
    );
  }

  const username = appUser?.ProfileEntryResponse?.Username;
  const handle = username ? `@${username}` : "";
  const key = appUser?.PublicKeyBase58Check ?? "";
  const balance = appUser?.BalanceNanos;

  return (
    <section className="bento identity-bento" aria-label="Identity panel">
      <div className="identity-bento__head">
        <div className="identity-bento__avatar">
          <GeometricAvatar seed={key} size={48} title={username || key || "Supmate"} />
        </div>
        <div className="identity-bento__id">
          <div className="identity-bento__name">{handle || shortenLongWord(key) || "Not connected"}</div>
          {key && (
            <SaveToClipboard
              text={key}
              className="identity-bento__key"
              copyIcon={<AssetIcon name="copy" size={11} active />}
              copiedIcon={<AssetIcon name="copyFilled" size={11} tone="accent" active />}
            >
              <span>{shortenLongWord(key, 8, 5)}</span>
            </SaveToClipboard>
          )}
        </div>
      </div>

      <div className="identity-bento__meta">
        <div className="identity-meta-row">
          <span className="identity-meta-row__label">Session</span>
          <span className="mono-chip">
            <span
              className="status-dot"
              style={{ display: "inline-block", marginRight: 6, verticalAlign: 1 }}
            />
            {syncing ? "SYNCING" : "ACTIVE"}
          </span>
        </div>
        <div className="identity-meta-row">
          <span className="identity-meta-row__label">Network</span>
          <span className="mono-chip">
            {(isTestnet ?? IS_MAINNET) ? "DeSo testnet" : "DeSo mainnet"}
          </span>
        </div>
        {typeof balance === "number" && (
          <div className="identity-meta-row">
            <span className="identity-meta-row__label">Balance</span>
            <span className="mono-chip">{desoNanosToDeso(balance).toFixed(4)} DeSo</span>
          </div>
        )}
      </div>
    </section>
  );
};