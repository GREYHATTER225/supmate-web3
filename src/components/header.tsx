
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { UserContext } from "contexts/UserContext";
import { identity } from "deso-protocol";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { RefreshContext } from "../contexts/RefreshContext";
import { DemoContext } from "../contexts/DemoContext";
import { formatDisplayName, getProfileURL } from "../utils/helpers";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";
import { SaveToClipboard } from "./shared/save-to-clipboard";
import { UserAccountList } from "./user-account-list";
import { DEMO_USER } from "../utils/demoData";
import { playClickSound } from "../utils/soundEffects";
import { AssetIcon } from "./ui/asset-icon";
import { WalletDashboardModal } from "./connect/WalletDashboardModal";

const VolumeOn = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9.4 9.4 0 0 1 0 13" />
  </svg>
);

const VolumeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
    <path d="m16 9 5 6M21 9l-5 6" />
  </svg>
);

export const Header = () => {
  const { appUser } = useContext(UserContext);
  const { setLockRefresh } = useContext(RefreshContext);
  const [isWalletDashboardOpen, setIsWalletDashboardOpen] = useState(false);

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

  const handleLogout = async () => {
    setLockRefresh(true);
    try {
      await identity.logout();
    } catch (e) {
      toast.error(`Logout error: ${e}`);
    } finally {
      setLockRefresh(false);
    }
  };

  const handleSwitch = async () => {
    setLockRefresh(true);
    try {
      await identity.login();
    } catch (e) {
      toast.error(`Login error: ${e}`);
    } finally {
      setLockRefresh(false);
    }
  };

  return (
    <>
      <header
        className="
          fixed top-0 z-50 w-full
          flex items-center justify-between
          px-4 md:px-7
          border-b-[3px] border-[#171717]
          bg-[#fff6e7]
          shadow-[0_5px_0_rgba(20,20,20,0.12)]
        "
        style={{
          height: "var(--header-h)",
          backgroundImage:
            "radial-gradient(#d8cbb7 0.7px, transparent 0.7px)",
          backgroundSize: "9px 9px",
        }}
      >
        {/* Brand */}
        <a
          href="/"
          aria-label="Supmate Home"
          className="relative z-10 flex items-center gap-3 group"
        >
          <div className="
            relative flex h-11 w-11 items-center justify-center
            rounded-xl border-[2.5px] border-[#171717]
            bg-[#167fc0] text-white
            shadow-[3px_3px_0_#171717]
            transition-transform group-hover:-rotate-3
          ">
            <AssetIcon name="chatLogo" size={23} tone="none" active />
            <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-[#171717] bg-[#ef3928]" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="
              text-[19px] font-black tracking-[0.13em]
              text-[#171717]
            ">
              SUPMATE
            </span>
            <span className="
              mt-1 font-mono text-[9px] font-bold
              tracking-[0.18em] text-[#59534c]
            ">
              SOVEREIGN WEB3 CHAT
            </span>
          </div>

          {isDemoMode && (
            <span className="
              ml-1 rounded-sm border-2 border-[#171717]
              bg-[#ffca45] px-2 py-1
              font-mono text-[9px] font-black uppercase
              text-[#171717] shadow-[2px_2px_0_#171717]
            ">
              Demo
            </span>
          )}
        </a>

        {/* Center comic-style navigation label */}
        <div className="hidden lg:flex items-center gap-7">
          <span className="
            font-black text-[11px] uppercase
            tracking-wider text-[#242424]
          ">
            SOVEREIGN MESSAGING
          </span>

          <span className="h-1.5 w-1.5 rounded-full bg-[#ef3928]" />

          <span className="
            font-mono text-[10px] font-bold
            tracking-widest text-[#777067]
          ">
            BUILT ON DESO
          </span>
        </div>

        {/* Right controls */}
        <div className="relative z-10 flex items-center gap-2 md:gap-3">

          {/* Sound */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playClickSound();
            }}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl border-2 border-[#171717]
              bg-white text-[#171717]
              shadow-[2px_2px_0_#171717]
              transition-all hover:-translate-y-0.5
              hover:bg-[#ffca45] active:translate-y-0
              active:shadow-none
            "
          >
            {soundEnabled ? <VolumeOn /> : <VolumeOff />}
          </button>

          {/* Demo */}
          {!appUser && !isDemoMode && (
            <button
              type="button"
              onClick={() => triggerWarpTransition(true)}
              className="
                hidden sm:inline-flex items-center
                rounded-xl border-2 border-[#171717]
                bg-[#1689c8] px-4 py-2.5
                font-mono text-[10px] font-black uppercase
                tracking-wider text-white
                shadow-[3px_3px_0_#171717]
                transition-all hover:-translate-y-0.5
                hover:shadow-[4px_4px_0_#171717]
                active:translate-y-0 active:shadow-none
              "
            >
              Explore Demo
            </button>
          )}

          {/* Connect */}
          {!appUser && (
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsAuthModalOpen(true);
              }}
              className="
                rounded-xl border-2 border-[#171717]
                bg-[#ef3928] px-4 md:px-5 py-2.5
                font-mono text-[10px] font-black uppercase
                tracking-wider text-white
                shadow-[3px_3px_0_#171717]
                transition-all hover:-translate-y-0.5
                hover:bg-[#d9281c]
                hover:shadow-[4px_4px_0_#171717]
                active:translate-y-0 active:shadow-none
              "
            >
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          )}

          {/* Account */}
          {(appUser || isDemoMode) && (
            <div className="flex items-center gap-3">

              <div className="hidden md:flex flex-col items-end">
                <span className="
                  max-w-[150px] truncate text-xs
                  font-black text-[#171717]
                ">
                  {currentUserDisplay}
                </span>
                <span className="
                  mt-0.5 font-mono text-[9px]
                  font-bold tracking-widest text-[#777067]
                ">
                  {isDemoMode ? "SANDBOX MODE" : "CONNECTED"}
                </span>
              </div>

              <Menu placement="bottom-end">
                <MenuHandler>
                  <button
                    type="button"
                    aria-label="Open account menu"
                    className="
                      rounded-xl border-[2.5px] border-[#171717]
                      bg-[#ffca45] p-1
                      shadow-[3px_3px_0_#171717]
                      transition-all hover:-translate-y-0.5
                      hover:rotate-2 active:translate-y-0
                      active:shadow-none
                    "
                  >
                    <div className="
                      h-8 w-8 overflow-hidden rounded-lg
                      border border-[#171717] bg-white
                    ">
                      {isDemoMode ? (
                        <img
                          src={DEMO_USER.avatar}
                          alt="Demo profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MessagingDisplayAvatar
                          publicKey={appUser?.PublicKeyBase58Check}
                          diameter={32}
                        />
                      )}
                    </div>
                  </button>
                </MenuHandler>

                <MenuList
                  className="
                    rounded-xl border-[2px] border-[#171717]
                    bg-[#fff6e7] p-2 text-[#171717]
                    shadow-[6px_6px_0_#171717]
                  "
                  style={{ minWidth: 245 }}
                >
                  <div className="
                    mb-2 flex items-center justify-between
                    border-b-2 border-[#171717]/15
                    px-3 py-3
                  ">
                    <span className="
                      font-mono text-[10px] font-black
                      uppercase tracking-widest
                    ">
                      {isDemoMode ? "Mock Profile" : "Account Control"}
                    </span>

                    {!isDemoMode && (
                      <button
                        type="button"
                        onClick={handleSwitch}
                        className="
                          flex items-center gap-1.5
                          rounded-md border-2 border-[#171717]
                          bg-[#ffca45] px-2.5 py-1
                          text-[10px] font-black
                          shadow-[2px_2px_0_#171717]
                          hover:bg-[#ffb82e]
                        "
                      >
                        <AssetIcon name="changeUser" size={13} active />
                        Switch
                      </button>
                    )}
                  </div>

                  {!isDemoMode && <UserAccountList />}

                  {appUser?.ProfileEntryResponse && (
                    <MenuItem className="
                      my-1 rounded-lg p-0
                      hover:bg-[#1689c8]/10
                    ">
                      <a
                        href={getProfileURL(appUser.ProfileEntryResponse.Username)}
                        target="_blank"
                        rel="noreferrer"
                        className="
                          flex w-full items-center gap-3
                          px-3 py-2.5 text-xs font-bold
                        "
                      >
                        <AssetIcon name="externalLink" size={15} />
                        My Profile
                      </a>
                    </MenuItem>
                  )}

                  {appUser && (
                    <MenuItem
                      onClick={() => setIsWalletDashboardOpen(true)}
                      className="
                        my-1 flex items-center gap-3
                        rounded-lg px-3 py-2.5
                        text-xs font-bold text-[#d72f21]
                        hover:bg-[#ef3928]/10
                      "
                    >
                      <span>💎</span>
                      Supmate Wallet Manager
                    </MenuItem>
                  )}

                  {appUser && (
                    <MenuItem className="
                      my-1 rounded-lg px-3 py-2.5
                      hover:bg-[#1689c8]/10
                    ">
                      <SaveToClipboard
                        text={appUser.PublicKeyBase58Check}
                        copyIcon={<AssetIcon name="copy" size={15} />}
                        copiedIcon={
                          <AssetIcon name="copyFilled" size={15} tone="accent" active />
                        }
                      >
                        <span className="flex items-center gap-3 text-xs font-bold">
                          <AssetIcon name="copy" size={15} />
                          Copy Public Key
                        </span>
                      </SaveToClipboard>
                    </MenuItem>
                  )}

                  <MenuItem className="
                    my-1 rounded-lg p-0
                    hover:bg-[#1689c8]/10
                  ">
                    <a
                      href="https://wallet.deso.com"
                      target="_blank"
                      rel="noreferrer"
                      className="
                        flex w-full items-center gap-3
                        px-3 py-2.5 text-xs font-bold
                      "
                    >
                      <AssetIcon name="deso" size={15} />
                      DeSo Wallet
                    </a>
                  </MenuItem>

                  <MenuItem className="
                    my-1 rounded-lg p-0
                    hover:bg-[#1689c8]/10
                  ">
                    <a
                      href="https://github.com/deso-protocol/deso-chat-protocol"
                      target="_blank"
                      rel="noreferrer"
                      className="
                        flex w-full items-center gap-3
                        px-3 py-2.5 text-xs font-bold
                      "
                    >
                      <AssetIcon name="externalLink" size={15} />
                      Source Code
                    </a>
                  </MenuItem>

                  <div className="mt-2 border-t-2 border-[#171717]/15 pt-2">
                    {isDemoMode ? (
                      <MenuItem
                        onClick={() => triggerWarpTransition(false)}
                        className="
                          flex items-center gap-3 rounded-lg
                          px-3 py-2.5 text-xs font-black
                          uppercase tracking-wider text-[#d72f21]
                          hover:bg-[#ef3928]/10
                        "
                      >
                        <AssetIcon name="logout" size={15} />
                        Exit Demo Mode
                      </MenuItem>
                    ) : (
                      appUser && (
                        <MenuItem
                          onClick={handleLogout}
                          className="
                            flex items-center gap-3 rounded-lg
                            px-3 py-2.5 text-xs font-black
                            uppercase tracking-wider text-[#d72f21]
                            hover:bg-[#ef3928]/10
                          "
                        >
                          <AssetIcon name="logout" size={15} />
                          Disconnect
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

      {appUser && (
        <WalletDashboardModal
          isOpen={isWalletDashboardOpen}
          onClose={() => setIsWalletDashboardOpen(false)}
          publicKey={appUser.PublicKeyBase58Check}
          desoBalanceNanos={appUser.BalanceNanos}
          onDisconnect={handleLogout}
        />
      )}
    </>
  );
};
