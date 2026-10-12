import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { UserContext } from "contexts/UserContext";
import { identity } from "deso-protocol";
import { useContext } from "react";
import { toast } from "react-toastify";
import { RefreshContext } from "../contexts/RefreshContext";
import { DemoContext } from "../contexts/DemoContext";
import { formatDisplayName, getProfileURL } from "../utils/helpers";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";
import { SaveToClipboard } from "./shared/save-to-clipboard";
import { UserAccountList } from "./user-account-list";
import { DEMO_USER } from "../utils/demoData";
import { playClickSound } from "../utils/soundEffects";
import { Badge } from "./ui/badge";
import { IconButton } from "./ui/icon-button";
import { AssetIcon } from "./ui/asset-icon";

/** Local, monochrome volume glyphs (inline SVG — no external library). */
const VolumeOn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9.4 9.4 0 0 1 0 13" />
  </svg>
);

const VolumeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
    <path d="m16 9 5 6M21 9l-5 6" />
  </svg>
);

export const Header = () => {
  const { appUser } = useContext(UserContext);
  const { setLockRefresh } = useContext(RefreshContext);
  const {
    isDemoMode,
    setIsAuthModalOpen,
    triggerWarpTransition,
    soundEnabled,
    setSoundEnabled,
  } = useContext(DemoContext);

  const currentUserDisplay = isDemoMode
    ? DEMO_USER.name
    : appUser
    ? formatDisplayName(appUser)
    : null;

  return (
    <header
      className="flex justify-between items-center px-4 md:px-6 fixed top-0 z-50 w-full glass-mid"
      style={{ height: "var(--header-h)" }}
    >
      {/* Brand */}
      <a href="/" className="flex items-center gap-3 group" aria-label="Supmate Home">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] shrink-0"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-specular)",
            boxShadow: "var(--shadow-elev-1)",
          }}
        >
          <AssetIcon name="chatLogo" size={17} tone="none" active />
        </div>

        <div className="flex flex-col leading-none">
          <span
            className="font-extrabold tracking-wider"
            style={{ fontSize: 15, letterSpacing: "0.1em" }}
          >
            SUPMATE
          </span>
          <span
            className="hidden sm:block"
            style={{
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Sovereign Web3 Chat
          </span>
        </div>

        {isDemoMode && (
          <Badge tone="accent" pulse uppercase className="ml-1">
            Sandbox
          </Badge>
        )}
      </a>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Sound toggle */}
        <IconButton
          size="md"
          label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) playClickSound();
          }}
        >
          {soundEnabled ? <VolumeOn /> : <VolumeOff />}
        </IconButton>

        {/* Explore demo */}
        {!appUser && !isDemoMode && (
          <button
            onClick={() => triggerWarpTransition(true)}
            className="btn-secondary hidden sm:inline-flex"
            style={{ padding: "7px 16px", fontSize: 13 }}
          >
            Explore Demo
          </button>
        )}

        {/* Connect button */}
        {!appUser && (
          <button
            onClick={() => {
              playClickSound();
              setIsAuthModalOpen(true);
            }}
            className="btn-primary"
            style={{ padding: "8px 18px", fontSize: 13 }}
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Connect</span>
          </button>
        )}

        {/* Account menu */}
        {(appUser || isDemoMode) && (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-semibold" style={{ fontSize: 13 }}>
                {currentUserDisplay}
              </span>
              {isDemoMode && (
                <span
                  className="mono"
                  style={{ fontSize: 9, color: "var(--accent-success)", letterSpacing: "0.12em" }}
                >
                  SANDBOX
                </span>
              )}
            </div>

            <Menu placement="bottom-end">
              <MenuHandler>
                <div
                  className="cursor-pointer rounded-full transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96] p-[2px]"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-specular)",
                    boxShadow: "var(--shadow-elev-1)",
                  }}
                >
                  <div className="rounded-full overflow-hidden" style={{ background: "var(--bg-surface-elevated)" }}>
                    {isDemoMode ? (
                      <img src={DEMO_USER.avatar} alt="Demo" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <MessagingDisplayAvatar publicKey={appUser?.PublicKeyBase58Check} diameter={32} />
                    )}
                  </div>
                </div>
              </MenuHandler>

              <MenuList
                className="p-2 text-white rounded-2xl glass-hi"
                style={{ minWidth: 220 }}
              >
                <div className="px-3 py-2 mb-1 flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <span className="label-caps" style={{ fontSize: 10 }}>
                    {isDemoMode ? "Mock Profile" : "Account"}
                  </span>
                  {!isDemoMode && (
                    <button
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]"
                      style={{
                        background: "var(--color-emerald-dim)",
                        border: "1px solid var(--line-emerald)",
                        color: "var(--color-emerald)",
                      }}
                      onClick={async () => {
                        setLockRefresh(true);
                        try { await identity.login(); } catch (e) { toast.error(`Login error: ${e}`); }
                        setLockRefresh(false);
                      }}
                    >
                      <AssetIcon name="changeUser" size={13} active />
                      <span>Switch</span>
                    </button>
                  )}
                </div>

                {!isDemoMode && <UserAccountList />}

                {appUser?.ProfileEntryResponse && (
                  <MenuItem className="flex items-center p-0 hover:bg-white/5 rounded-xl my-0.5">
                    <a
                      href={getProfileURL(appUser.ProfileEntryResponse.Username)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full outline-0"
                    >
                      <div className="w-full flex items-center py-2 px-3 gap-3 text-sm text-white">
                        <AssetIcon name="externalLink" size={15} />
                        <span>My Profile</span>
                      </div>
                    </a>
                  </MenuItem>
                )}

                {appUser && (
                  <MenuItem className="flex items-center py-2 px-3 gap-3 text-white hover:bg-white/5 rounded-xl my-0.5 text-sm">
                    <SaveToClipboard
                      text={appUser.PublicKeyBase58Check}
                      copyIcon={<AssetIcon name="copy" size={15} />}
                      copiedIcon={<AssetIcon name="copyFilled" size={15} tone="accent" active />}
                    >
                      <span>Copy Public Key</span>
                    </SaveToClipboard>
                  </MenuItem>
                )}

                <MenuItem className="flex items-center p-0 hover:bg-white/5 rounded-xl my-0.5">
                  <a href="https://wallet.deso.com" target="_blank" rel="noreferrer" className="w-full outline-0">
                    <div className="w-full flex items-center py-2 px-3 gap-3 text-sm text-white">
                      <AssetIcon name="deso" size={15} />
                      <span>DeSo Wallet</span>
                    </div>
                  </a>
                </MenuItem>

                <MenuItem className="flex items-center p-0 hover:bg-white/5 rounded-xl my-0.5">
                  <a href="https://github.com/deso-protocol/deso-chat-protocol" target="_blank" rel="noreferrer" className="w-full outline-0">
                    <div className="w-full flex items-center py-2 px-3 gap-3 text-sm text-white">
                      <AssetIcon name="externalLink" size={15} />
                      <span>Source Code</span>
                    </div>
                  </a>
                </MenuItem>

                <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: 4, paddingTop: 4 }}>
                  {isDemoMode ? (
                    <MenuItem
                      className="flex items-center gap-3 py-2 px-3 text-sm rounded-xl"
                      style={{ color: "var(--color-danger)" }}
                      onClick={() => triggerWarpTransition(false)}
                    >
                      <AssetIcon name="logout" size={15} />
                      <span>Exit Demo Mode</span>
                    </MenuItem>
                  ) : (
                    appUser && (
                      <MenuItem
                        className="flex items-center gap-3 py-2 px-3 text-sm rounded-xl"
                        style={{ color: "var(--color-danger)" }}
                        onClick={async () => {
                          setLockRefresh(true);
                          try { await identity.logout(); } catch (e) { toast.error(`Logout error: ${e}`); }
                          setLockRefresh(false);
                        }}
                      >
                        <AssetIcon name="logout" size={15} />
                        <span>Disconnect</span>
                      </MenuItem>
                    )
                  )}
                </div>
              </MenuList>
            </Menu>
          </div>
        )}
      </div>
    </header>
  );
};
