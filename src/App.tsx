import { AppUser, UserContext, UserContextType } from "contexts/UserContext";
import { DemoContext, ThemeMode } from "contexts/DemoContext";
import {
  AccessGroupEntryResponse,
  configure,
  createAccessGroup,
  getAllAccessGroups,
  getUsersStateless,
  identity,
  NOTIFICATION_EVENTS,
  User,
} from "deso-protocol";
import { uniqBy } from "lodash";
import * as process from "process";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Header } from "./components/header";
import { MessagingApp } from "./components/messaging-app";
import { RefreshContext } from "./contexts/RefreshContext";
import { SupmateAuthModal } from "./components/shared/auth-modal";
import { WarpTransitionOverlay } from "./components/shared/warp-transition";
import { SplashScreen } from "./components/shared/splash-screen";
import {
  DEFAULT_KEY_MESSAGING_GROUP_NAME,
  DESO_NETWORK,
  getTransactionSpendingLimits,
} from "./utils/constants";
import {
  playWarpSound,
  setSoundEnabled as configureSoundSystem,
} from "./utils/soundEffects";

configure({
  identityURI: process.env.REACT_APP_IDENTITY_URL,
  nodeURI: process.env.REACT_APP_NODE_URL,
  network: DESO_NETWORK,
  spendingLimitOptions: getTransactionSpendingLimits(""),
});

function App() {
  const [userState, setUserState] = useState<UserContextType>({
    appUser: null,
    isLoadingUser: true,
    setAccessGroups: (accessGroupsOwned: AccessGroupEntryResponse[]) =>
      setUserState((state) => {
        if (!state.appUser) {
          throw new Error("cannot set access groups without a logged in user!");
        }
        const currAppUser = state.appUser;
        return { ...state, appUser: { ...currAppUser, accessGroupsOwned } };
      }),
    setAllAccessGroups: (newAllAccessGroups: AccessGroupEntryResponse[]) => {
      setUserState((state) => {
        if (!state.appUser) {
          throw new Error("cannot set access groups without a logged in user!");
        }

        const allAccessGroups = uniqBy(
          state.allAccessGroups.concat(newAllAccessGroups),
          (group) => {
            return (
              group.AccessGroupOwnerPublicKeyBase58Check +
              group.AccessGroupKeyName
            );
          }
        );

        return {
          ...state,
          allAccessGroups,
        };
      });
    },
    allAccessGroups: [],
  });

  const [lockRefresh, setLockRefresh] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("cyber-dark");
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Transition & Audio & Bento states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [isIntelOpen, setIsIntelOpen] = useState(false);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    configureSoundSystem(val);
  };

  const triggerWarpTransition = (
    targetDemoState: boolean,
    onFinished?: () => void
  ) => {
    playWarpSound();
    setTransitionMessage(
      targetDemoState
        ? "INITIALIZING SUPMATE DECENTRALIZED SANDBOX..."
        : "EXITING DEMO MODE · RESTORING ON-CHAIN MATRIX..."
    );
    setIsTransitioning(true);

    setTimeout(() => {
      setIsDemoMode(targetDemoState);
    }, 450);

    setTimeout(() => {
      setIsTransitioning(false);
      if (onFinished) onFinished();
    }, 850);
  };

  useEffect(() => {
    let pollingIntervalId = 0;

    identity.subscribe(({ event, currentUser, alternateUsers }) => {
      if (!currentUser && !alternateUsers) {
        setUserState((state) => ({
          ...state,
          appUser: null,
          isLoadingUser: false,
        }));
        return;
      }

      if (
        event === NOTIFICATION_EVENTS.AUTHORIZE_DERIVED_KEY_START &&
        currentUser
      ) {
        setUserState((state) => ({ ...state, isLoadingUser: true }));
        return;
      }

      if (
        currentUser &&
        currentUser?.publicKey !== userState.appUser?.PublicKeyBase58Check &&
        [
          NOTIFICATION_EVENTS.SUBSCRIBE,
          NOTIFICATION_EVENTS.LOGIN_END,
          NOTIFICATION_EVENTS.CHANGE_ACTIVE_USER,
        ].includes(event)
      ) {
        const { messagingPublicKeyBase58Check } =
          currentUser.primaryDerivedKey;

        setUserState((state) => ({ ...state, isLoadingUser: true }));
        Promise.all([
          getUser(currentUser.publicKey),
          getAllAccessGroups({
            PublicKeyBase58Check: currentUser.publicKey,
          }),
        ])
          .then(([userRes, { AccessGroupsOwned, AccessGroupsMember }]) => {
            if (
              !AccessGroupsOwned?.find(
                ({ AccessGroupKeyName }) =>
                  AccessGroupKeyName === DEFAULT_KEY_MESSAGING_GROUP_NAME
              )
            ) {
              return createAccessGroup({
                AccessGroupOwnerPublicKeyBase58Check: currentUser.publicKey,
                AccessGroupPublicKeyBase58Check:
                  messagingPublicKeyBase58Check,
                AccessGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
                MinFeeRateNanosPerKB: 1000,
              }).then(() => {
                return getAllAccessGroups({
                  PublicKeyBase58Check: currentUser.publicKey,
                }).then((groups) => {
                  const user: User | null = userRes.UserList?.[0] ?? null;
                  const appUser: AppUser | null = user && {
                    ...user,
                    messagingPublicKeyBase58Check,
                    accessGroupsOwned: groups.AccessGroupsOwned,
                  };
                  const allAccessGroups = (AccessGroupsOwned || []).concat(
                    AccessGroupsMember || []
                  );

                  setUserState((state) => ({
                    ...state,
                    appUser,
                    allAccessGroups,
                  }));

                  return user;
                });
              });
            } else {
              const user: User | null = userRes.UserList?.[0] ?? null;
              const appUser: AppUser | null = user && {
                ...user,
                messagingPublicKeyBase58Check,
                accessGroupsOwned: AccessGroupsOwned,
              };
              const allAccessGroups = (AccessGroupsOwned || []).concat(
                AccessGroupsMember || []
              );

              setUserState((state) => ({
                ...state,
                appUser,
                allAccessGroups,
              }));

              return user;
            }
          })
          .then((user) => {
            if (!user) return;
            window.clearInterval(pollingIntervalId);
            if (user.BalanceNanos === 0) {
              pollingIntervalId = window.setInterval(async () => {
                getUser(currentUser.publicKey).then((res) => {
                  const user = res.UserList?.[0];
                  if (user && user.BalanceNanos > 0) {
                    setUserState((state) => ({
                      ...state,
                      appUser: {
                        ...user,
                        messagingPublicKeyBase58Check,
                      },
                    }));
                    window.clearInterval(pollingIntervalId);
                  }
                });
              }, 3000);
            }
          })
          .finally(() => {
            setUserState((state) => ({ ...state, isLoadingUser: false }));
          });
        return;
      }

      if (event === NOTIFICATION_EVENTS.LOGOUT_END) {
        if (alternateUsers) {
          const fallbackUser = Object.values(alternateUsers)[0];
          identity.setActiveUser(fallbackUser.publicKey);
          return;
        }
        return;
      }
    });
  }, []);

  return (
    <UserContext.Provider value={userState}>
      <RefreshContext.Provider value={{ lockRefresh, setLockRefresh }}>
        <DemoContext.Provider
          value={{
            isDemoMode,
            setIsDemoMode,
            theme,
            setTheme,
            isAuthModalOpen,
            setIsAuthModalOpen,
            isTransitioning,
            transitionMessage,
            triggerWarpTransition,
            soundEnabled,
            setSoundEnabled,
            isIntelOpen,
            setIsIntelOpen,
          }}
        >
          {showSplash && (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          )}
          <div
            className={`App theme-${theme}`}
            style={{ visibility: showSplash ? "hidden" : "visible" }}
          >
            <Header />

            <section
              className="overflow-hidden"
              style={{ height: "calc(100% - var(--header-h))", marginTop: "var(--header-h)" }}
            >
              <MessagingApp />
            </section>

            <SupmateAuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              onExploreDemo={() => triggerWarpTransition(true)}
            />

            <WarpTransitionOverlay
              isActive={isTransitioning}
              message={transitionMessage}
            />

            <ToastContainer theme="dark" />
          </div>
        </DemoContext.Provider>
      </RefreshContext.Provider>
    </UserContext.Provider>
  );
}

const getUser = async (publicKey: string) =>
  getUsersStateless({
    PublicKeysBase58Check: [publicKey],
    SkipForLeaderboard: true,
    IncludeBalance: true,
    GetUnminedBalance: true,
  });

export default App;
