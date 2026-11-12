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
    let activeHydrationSeq = 0;

    const hydrateUser = async (currentUser: any) => {
      if (!currentUser?.publicKey) {
        setUserState((state) => ({
          ...state,
          appUser: null,
          isLoadingUser: false,
        }));
        return;
      }

      const seq = ++activeHydrationSeq;
      setUserState((state) => ({ ...state, isLoadingUser: true }));

      try {
        const messagingPublicKeyBase58Check =
          currentUser.primaryDerivedKey?.messagingPublicKeyBase58Check ||
          currentUser.publicKey;

        // Fetch user info and access groups with 10s network timeout
        const fetchPromise = Promise.all([
          getUser(currentUser.publicKey),
          getAllAccessGroups({ PublicKeyBase58Check: currentUser.publicKey }),
        ]);

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("DeSo user info request timed out")), 10000)
        );

        const [userRes, accessGroupsRes] = await Promise.race([fetchPromise, timeoutPromise]);

        if (seq !== activeHydrationSeq) return;

        let groupsOwned = accessGroupsRes?.AccessGroupsOwned || [];
        const groupsMember = accessGroupsRes?.AccessGroupsMember || [];

        const hasDefaultKey = groupsOwned.some(
          (g: any) => g.AccessGroupKeyName === DEFAULT_KEY_MESSAGING_GROUP_NAME
        );

        if (!hasDefaultKey && currentUser.primaryDerivedKey?.messagingPublicKeyBase58Check) {
          try {
            await createAccessGroup({
              AccessGroupOwnerPublicKeyBase58Check: currentUser.publicKey,
              AccessGroupPublicKeyBase58Check: messagingPublicKeyBase58Check,
              AccessGroupKeyName: DEFAULT_KEY_MESSAGING_GROUP_NAME,
              MinFeeRateNanosPerKB: 1000,
            });

            const refreshed = await getAllAccessGroups({
              PublicKeyBase58Check: currentUser.publicKey,
            });
            if (seq === activeHydrationSeq && refreshed?.AccessGroupsOwned) {
              groupsOwned = refreshed.AccessGroupsOwned;
            }
          } catch (createErr) {
            console.warn("Auto-create default-key access group skipped/failed:", createErr);
          }
        }

        if (seq !== activeHydrationSeq) return;

        const baseUser: User | null = userRes?.UserList?.[0] ?? null;
        const appUser: AppUser | null = baseUser
          ? {
              ...baseUser,
              messagingPublicKeyBase58Check,
              accessGroupsOwned: groupsOwned,
            }
          : ({
              PublicKeyBase58Check: currentUser.publicKey,
              BalanceNanos: 0,
              messagingPublicKeyBase58Check,
              accessGroupsOwned: groupsOwned,
            } as unknown as AppUser);

        const allAccessGroups = groupsOwned.concat(groupsMember);

        setUserState((state) => ({
          ...state,
          appUser,
          allAccessGroups,
          isLoadingUser: false,
        }));

        if (baseUser && baseUser.BalanceNanos === 0) {
          window.clearInterval(pollingIntervalId);
          pollingIntervalId = window.setInterval(async () => {
            try {
              const res = await getUser(currentUser.publicKey);
              const user = res.UserList?.[0];
              if (user && user.BalanceNanos > 0 && seq === activeHydrationSeq) {
                setUserState((state) => ({
                  ...state,
                  appUser: {
                    ...user,
                    messagingPublicKeyBase58Check,
                  },
                }));
                window.clearInterval(pollingIntervalId);
              }
            } catch {
              // Ignore polling errors
            }
          }, 3000);
        }
      } catch (err) {
        console.error("User hydration error:", err);
        if (seq === activeHydrationSeq) {
          setUserState((state) => ({
            ...state,
            appUser: {
              PublicKeyBase58Check: currentUser.publicKey,
              BalanceNanos: 0,
              messagingPublicKeyBase58Check: currentUser.publicKey,
              accessGroupsOwned: [],
            } as unknown as AppUser,
            isLoadingUser: false,
          }));
        }
      }
    };

    // 1. Initial snapshot: hydrate immediately from SDK cache without waiting for an event
    try {
      const snapshotRes: any =
        typeof identity.snapshot === "function" ? identity.snapshot() : null;
      if (snapshotRes && typeof snapshotRes.then === "function") {
        snapshotRes
          .then((s: any) => {
            if (s?.currentUser) {
              hydrateUser(s.currentUser);
            } else {
              setUserState((state) => ({ ...state, isLoadingUser: false }));
            }
          })
          .catch((err: any) => {
            console.warn("Initial identity snapshot failed:", err);
            setUserState((state) => ({ ...state, isLoadingUser: false }));
          });
      } else if (snapshotRes?.currentUser) {
        hydrateUser(snapshotRes.currentUser);
      } else {
        setUserState((state) => ({ ...state, isLoadingUser: false }));
      }
    } catch (err) {
      console.warn("Initial identity snapshot call error:", err);
      setUserState((state) => ({ ...state, isLoadingUser: false }));
    }

    // 2. Safety guard: ensure isLoadingUser never stays stuck permanently
    const safetyTimer = setTimeout(() => {
      setUserState((state) => {
        if (state.isLoadingUser) {
          console.warn("[Supmate] Loading safety timer fired; unblocking UI.");
          return { ...state, isLoadingUser: false };
        }
        return state;
      });
    }, 6000);

    // 3. Subscribe to identity events for login, logout, and user switching
    identity.subscribe(({ event, currentUser, alternateUsers }) => {
      if (!currentUser && !alternateUsers) {
        window.clearInterval(pollingIntervalId);
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

      if (currentUser) {
        hydrateUser(currentUser);
        return;
      }

      if (event === NOTIFICATION_EVENTS.LOGOUT_END) {
        window.clearInterval(pollingIntervalId);
        if (alternateUsers) {
          const fallbackUser = Object.values(alternateUsers)[0];
          identity.setActiveUser(fallbackUser.publicKey);
          return;
        }
      }
    });

    return () => {
      window.clearInterval(pollingIntervalId);
      clearTimeout(safetyTimer);
    };
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
