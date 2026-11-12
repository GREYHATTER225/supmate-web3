
import { getUsersStateless, identity, User } from "deso-protocol";
import { Identity } from "deso-protocol/src/identity/identity";
import orderBy from "lodash/orderBy";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { UserContext } from "../contexts/UserContext";
import { formatDisplayName } from "../utils/helpers";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";

const COLLAPSED_ACCOUNTS_NUM = 3;
const EXPANDED_ACCOUNTS_NUM = 10;

type Account = {
  key: string;
  name: string;
  profile: User;
  hasProfile: boolean;
  isActive: boolean;
};


const isRealProfile = (user?: User): boolean => {
  if (!user) return false;

  return Object.entries(user).some(
    ([key, value]) =>
      key !== "PublicKeyBase58Check" &&
      value !== undefined &&
      value !== null &&
      value !== ""
  );
};


const IdentityGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="19"
    height="19"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2 14.5 9.5 22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />
  </svg>
);

const AccountCheck = () => (
  <svg
    viewBox="0 0 24 24"
    width="17"
    height="17"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const AccountArrow = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M7 7h10v10" />
  </svg>
);

const accountStyles = `
.identity-vault {
  position: relative;
  isolation: isolate;
  width: 100%;
  overflow: hidden;
  padding: 13px;
  border: 1px solid rgba(255,255,255,.105);
  border-radius: 19px;
  background:
    radial-gradient(ellipse at 5% 0%, rgba(103,232,249,.09), transparent 42%),
    radial-gradient(ellipse at 100% 100%, rgba(249,115,22,.075), transparent 45%),
    linear-gradient(145deg, rgba(25,29,36,.97), rgba(8,10,14,.97));
  box-shadow:
    0 15px 35px rgba(0,0,0,.32),
    inset 0 1px 0 rgba(255,255,255,.075);
}

.identity-vault::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: .13;
  background-image: radial-gradient(rgba(255,255,255,.45) .65px, transparent .65px);
  background-size: 8px 8px;
  mask-image: linear-gradient(130deg, black, transparent 70%);
}

.identity-vault::after {
  content: "";
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.48), transparent);
}

.identity-vault__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 11px;
}

.identity-vault__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f1f5f9;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: .19em;
}

.identity-vault__symbol {
  display: grid;
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  place-items: center;
  color: #a5f3fc;
  border: 1px solid rgba(103,232,249,.25);
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(103,232,249,.15), rgba(255,255,255,.025));
  box-shadow: 0 0 15px rgba(34,211,238,.08);
}

.identity-vault__count {
  padding: 5px 8px;
  color: #a5f3fc;
  border: 1px solid rgba(103,232,249,.2);
  border-radius: 7px;
  background: rgba(34,211,238,.055);
  font-family: monospace;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .08em;
}

.identity-vault__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  max-height: 480px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 2px 3px 3px;
  scrollbar-width: thin;
  scrollbar-color: rgba(148,163,184,.35) transparent;
  overscroll-behavior: contain;
}

.identity-vault__list::-webkit-scrollbar {
  width: 4px;
}

.identity-vault__list::-webkit-scrollbar-thumb {
  border-radius: 20px;
  background: rgba(148,163,184,.3);
}

.identity-card {
  position: relative;
  isolation: isolate;
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 65px;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  padding: 9px 10px;
  border: 1px solid rgba(255,255,255,.095);
  border-radius: 17px;
  text-align: left;
  cursor: pointer;
  transition:
    transform .25s ease,
    border-color .25s ease,
    box-shadow .25s ease,
    background .25s ease;
  -webkit-tap-highlight-color: transparent;
}

.identity-card::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  pointer-events: none;
  opacity: .55;
  background: linear-gradient(115deg, rgba(255,255,255,.075), transparent 36%, transparent 70%, rgba(255,255,255,.035));
}

.identity-card::after {
  content: "";
  position: absolute;
  z-index: 2;
  top: -80%;
  left: -55%;
  width: 35%;
  height: 260%;
  pointer-events: none;
  transform: rotate(25deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.17), transparent);
  transition: left .65s ease;
}

.identity-card:hover::after {
  left: 125%;
}

.identity-card:hover {
  transform: translateY(-2px);
}

.identity-card:active {
  transform: scale(.985);
}

.identity-card:focus-visible {
  outline: 2px solid #67e8f9;
  outline-offset: 3px;
}

.identity-card--active {
  color: #422006;
  border-color: rgba(255,219,133,.8);
  background:
    linear-gradient(110deg, rgba(255,255,255,.28), transparent 35%, rgba(255,255,255,.1)),
    linear-gradient(110deg, #ffd66d 0%, #ffbd3c 48%, #f58b25 100%);
  box-shadow:
    0 7px 22px rgba(245,158,11,.17),
    inset 0 1px 0 rgba(255,255,255,.6),
    inset 0 -2px 5px rgba(120,53,15,.12);
}

.identity-card--active:hover {
  box-shadow:
    0 9px 28px rgba(245,158,11,.26),
    inset 0 1px 0 rgba(255,255,255,.65);
}

.identity-card--inactive {
  color: #f8fafc;
  background:
    linear-gradient(120deg, rgba(255,255,255,.065), transparent 45%),
    linear-gradient(145deg, rgba(39,49,68,.92), rgba(17,23,34,.97));
  box-shadow:
    0 6px 16px rgba(0,0,0,.2),
    inset 0 1px 0 rgba(255,255,255,.055);
}

.identity-card--inactive:hover {
  border-color: rgba(103,232,249,.38);
  box-shadow:
    0 8px 23px rgba(34,211,238,.09),
    inset 0 1px 0 rgba(255,255,255,.1);
}

.identity-card--switching {
  opacity: .72;
  cursor: wait;
  pointer-events: none;
}

.identity-card__number {
  display: grid;
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid rgba(255,255,255,.26);
  border-radius: 50%;
  color: #e2e8f0;
  background: rgba(255,255,255,.08);
  box-shadow: 0 2px 7px rgba(0,0,0,.2), inset 0 1px 2px rgba(255,255,255,.12);
  font-family: monospace;
  font-size: 10px;
  font-weight: 900;
}

.identity-card--active .identity-card__number {
  color: #78350f;
  border-color: rgba(120,53,15,.25);
  background: rgba(255,255,255,.48);
}

.identity-card__avatar {
  display: grid;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  place-items: center;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,.25);
  border-radius: 50%;
  background: rgba(0,0,0,.2);
  box-shadow: 0 3px 12px rgba(0,0,0,.28), inset 0 1px 2px rgba(255,255,255,.2);
}

.identity-card--active .identity-card__avatar {
  border-color: rgba(255,255,255,.8);
  box-shadow: 0 0 0 2px rgba(255,255,255,.19), 0 3px 12px rgba(120,53,15,.2);
}

.identity-card__details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.identity-card__name {
  overflow: hidden;
  color: inherit;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identity-card__key {
  overflow: hidden;
  color: rgba(226,232,240,.58);
  font-family: monospace;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identity-card--active .identity-card__key {
  color: rgba(120,53,15,.72);
}

.identity-card__status {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  color: rgba(226,232,240,.62);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .1em;
  white-space: nowrap;
}

.identity-card--active .identity-card__status {
  color: #78350f;
}

.identity-card__status-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #67e8f9;
  box-shadow: 0 0 8px rgba(103,232,249,.8);
}

.identity-card--active .identity-card__status-dot {
  background: #78350f;
  box-shadow: none;
}

.identity-card__action {
  display: grid;
  width: 27px;
  height: 27px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 9px;
  color: #cbd5e1;
  background: rgba(255,255,255,.055);
}

.identity-card--active .identity-card__action {
  color: #78350f;
  border-color: rgba(120,53,15,.2);
  background: rgba(255,255,255,.27);
}

.identity-vault__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.identity-vault__expand {
  border: 0;
  padding: 5px 2px;
  color: #67e8f9;
  background: transparent;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .07em;
  cursor: pointer;
}

.identity-vault__expand:hover {
  color: #cffafe;
}

.identity-vault__footer-note {
  color: rgba(148,163,184,.65);
  font-family: monospace;
  font-size: 8px;
  letter-spacing: .08em;
}

.identity-vault__empty {
  padding: 19px 8px;
  color: #94a3b8;
  text-align: center;
  font-size: 11px;
}

.identity-card-enter {
  animation: identity-card-enter .32s ease both;
}

@keyframes identity-card-enter {
  from {
    opacity: 0;
    transform: translateY(7px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 420px) {
  .identity-vault {
    padding: 10px;
  }

  .identity-card {
    gap: 8px;
    padding: 8px;
  }

  .identity-card__number {
    width: 22px;
    height: 22px;
  }

  .identity-card__avatar {
    width: 35px;
    height: 35px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .identity-card,
  .identity-card::after {
    transition: none;
  }

  .identity-card-enter {
    animation: none;
  }
}
`;

const UserAccountList = () => {
  const { appUser } = useContext(UserContext);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [switchingKey, setSwitchingKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLoggedInUsers = async () => {
      const snapshot = (identity as Identity<Storage>).snapshot();

      const activeUser = snapshot.currentUser;
      const alternateUsers = Object.keys(snapshot.alternateUsers || {});

      const keys = [
        ...new Set([
          ...(activeUser ? [activeUser.publicKey] : []),
          ...alternateUsers,
        ]),
      ].filter(Boolean);

      if (keys.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const placeholders = keys.map(
        (key) => ({ PublicKeyBase58Check: key }) as User
      );

      setUsers(placeholders);
      setLoading(true);

      try {
        const response = await getUsersStateless({
          PublicKeysBase58Check: keys,
          SkipForLeaderboard: true,
        });

        if (cancelled) return;

        if (response.UserList) {
          const fetchedByKey = new Map(
            response.UserList.map((user) => [
              user.PublicKeyBase58Check,
              user,
            ])
          );

          setUsers(
            keys.map(
              (key) =>
                fetchedByKey.get(key) ??
                ({ PublicKeyBase58Check: key } as User)
            )
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching account profiles:", error);
          toast.error("Unable to load some account profiles.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLoggedInUsers();

    return () => {
      cancelled = true;
    };
  }, [appUser]);

  const accounts = useMemo(() => {
    const mapped = (users || []).map((user) => {
      const key = user.PublicKeyBase58Check;
      const isActive = key === appUser?.PublicKeyBase58Check;

      const profile =
        isActive && appUser
          ? appUser
          : user;

      const hasProfile = isRealProfile(profile);

      return {
        key,
        name: formatDisplayName(profile, "") || "Unknown identity",
        profile,
        hasProfile,
        isActive,
      };
    });

    return orderBy(
      mapped,
      ["isActive", "hasProfile", "name"],
      ["desc", "desc", "asc"]
    );
  }, [users, appUser]);

  const visibleAccounts = showMore
    ? accounts
    : accounts.slice(0, COLLAPSED_ACCOUNTS_NUM);

  const handleAccountSwitch = useCallback(
    async (key: string) => {
      if (switchingKey || key === appUser?.PublicKeyBase58Check) return;

      setSwitchingKey(key);

      try {
        await identity.setActiveUser(key);
        toast.success("Active identity switched.");
      } catch (error) {
        console.error("Account switch failed:", error);
        toast.error("Unable to switch account. Please try again.");
      } finally {
        setSwitchingKey(null);
      }
    },
    [switchingKey, appUser?.PublicKeyBase58Check]
  );

  return (
    <>
      <style>{accountStyles}</style>

      <section className="identity-vault" aria-label="Identity vault">
        <div className="identity-vault__heading">
          <div className="identity-vault__title">
            <span className="identity-vault__symbol">
              <IdentityGlyph />
            </span>
            <span>IDENTITY VAULT</span>
          </div>

          <span className="identity-vault__count">
            {String(accounts.length).padStart(2, "0")} CONNECTED
          </span>
        </div>

        {visibleAccounts.length > 0 ? (
          <div
            className="identity-vault__list custom-scrollbar"
            aria-label="Logged-in accounts"
          >
            {visibleAccounts.map((account, index) => {
              const isSwitching = switchingKey === account.key;

              return (
                <button
                  key={account.key}
                  type="button"
                  disabled={Boolean(switchingKey) || account.isActive}
                  onClick={() => handleAccountSwitch(account.key)}
                  className={`
                    identity-card identity-card-enter
                    ${account.isActive
                      ? "identity-card--active"
                      : "identity-card--inactive"
                    }
                    ${isSwitching ? "identity-card--switching" : ""}
                  `}
                  style={{ animationDelay: `${index * 45}ms` }}
                  aria-current={account.isActive ? "true" : undefined}
                  aria-label={
                    account.isActive
                      ? `${account.name}, active account`
                      : `Switch to ${account.name}`
                  }
                >
                  <span className="identity-card__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="identity-card__avatar">
                    <MessagingDisplayAvatar
                      publicKey={account.key}
                      username={account.name}
                      classNames="m-0"
                      diameter={34}
                    />
                  </span>

                  <span className="identity-card__details">
                    <span className="identity-card__name">
                      {account.name}
                    </span>

                    <span className="identity-card__key">
                      {account.key.slice(0, 7)}...{account.key.slice(-5)}
                    </span>

                    <span className="identity-card__status">
                      <span className="identity-card__status-dot" />
                      {isSwitching
                        ? "SWITCHING..."
                        : account.isActive
                          ? "ACTIVE IDENTITY"
                          : account.hasProfile
                            ? "CONNECTED IDENTITY"
                            : "PROFILE UNAVAILABLE"}
                    </span>
                  </span>

                  <span className="identity-card__action">
                    {isSwitching ? (
                      <ClipLoader size={13} color="currentColor" />
                    ) : account.isActive ? (
                      <AccountCheck />
                    ) : (
                      <AccountArrow />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="identity-vault__empty">
            {loading ? (
              <ClipLoader size={21} color="#67e8f9" />
            ) : (
              "No connected identities found."
            )}
          </div>
        )}

        <div className="identity-vault__footer">
          {accounts.length > COLLAPSED_ACCOUNTS_NUM && (
            <button
              type="button"
              className="identity-vault__expand"
              onClick={() => setShowMore((previous) => !previous)}
              aria-expanded={showMore}
            >
              {showMore
                ? "COLLAPSE ↑"
                : `VIEW ALL +${accounts.length - COLLAPSED_ACCOUNTS_NUM} ↓`}
            </button>
          )}

          <span className="identity-vault__footer-note">
            {loading ? "SYNCING PROFILES" : "DESO · NON-CUSTODIAL"}
          </span>
        </div>
      </section>
    </>
  );
};

export { UserAccountList };
