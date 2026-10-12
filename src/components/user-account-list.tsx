import { MenuItem } from "@material-tailwind/react";
import { getUsersStateless, identity, User } from "deso-protocol";
import { Identity } from "deso-protocol/src/identity/identity";
import orderBy from "lodash/orderBy";
import { useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { UserContext } from "../contexts/UserContext";
import { formatDisplayName } from "../utils/helpers";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";

const COLLAPSED_ACCOUNTS_NUM = 3;
const EXPANDED_ACCOUNTS_NUM = 10;
const ACCOUNT_LIST_ITEM_HEIGHT_PX = 30;

type Account = {
  name: string;
  onclick: (key: string) => void;
  key: string;
  profile: User;
  hasProfile: boolean;
  isActive: boolean;
};

const UserAccountList = () => {
  const { appUser } = useContext(UserContext);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLoggedInUsers = async (loggedInUserKeys: Array<string>) => {
      if (loggedInUserKeys.length === 0) {
        return;
      }

      setLoading(true);

      try {
        const res = await getUsersStateless({
          PublicKeysBase58Check: loggedInUserKeys,
          SkipForLeaderboard: true,
        });

        if (res.UserList) {
          setUsers(res.UserList);
        }
      } catch (e) {
        toast.error(`Error fetching user profiles: ${e}`);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const snapshot = (identity as Identity<Storage>).snapshot();
    const activeUser = snapshot.currentUser;
    const alternateUsers = Object.keys(snapshot.alternateUsers || {});

    const loggedInUserKeys = [
      ...(activeUser ? [activeUser.publicKey] : []),
      ...alternateUsers,
    ];

    setUsers(
      loggedInUserKeys.map((key) => ({
        PublicKeyBase58Check: key,
      })) as User[]
    );

    fetchLoggedInUsers(loggedInUserKeys);
  }, [appUser]);

  useEffect(() => {
    const accounts = (users || []).map((user) => {
      const key = user.PublicKeyBase58Check;
      const isActive = key === appUser?.PublicKeyBase58Check;
      const profile = isActive && appUser ? appUser : user;
      const hasProfile = !!profile;

      return {
        name: formatDisplayName(user, ""),
        onclick: async (key: string) => identity.setActiveUser(key),
        key,
        profile,
        hasProfile,
        isActive,
      };
    });
    const sortedAccounts = orderBy(
      accounts,
      ["isActive", "hasProfile", "name"],
      ["desc", "desc", "asc"]
    );
    setAllAccounts(sortedAccounts);
  }, [users, appUser]);

  const visibleAccounts = showMore
    ? allAccounts
    : allAccounts.slice(0, COLLAPSED_ACCOUNTS_NUM);

  return (
    <div className="mb-0">
      {loading ? (
        <div className="flex justify-center my-2 h-[29px]">
          <ClipLoader color={"var(--color-emerald)"} loading={true} size={22} />
        </div>
      ) : (
        <>
          <section
            className="custom-scrollbar"
            aria-label="Logged-in accounts"
            style={
              showMore
                ? {
                    maxHeight: `${
                      EXPANDED_ACCOUNTS_NUM * ACCOUNT_LIST_ITEM_HEIGHT_PX
                    }px`,
                    overflowY: "scroll",
                  }
                : {}
            }
          >
            {visibleAccounts.map((option) => {
              return (
                <MenuItem
                  key={option.key}
                  onClick={() => option.onclick(option.key)}
                  className={`cursor-pointer py-1.5 px-3 rounded-xl my-0.5 text-sm ${
                    option.isActive
                      ? "bg-[var(--color-emerald-dim)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center">
                    <MessagingDisplayAvatar
                      publicKey={option.key}
                      username={option.name}
                      classNames="mr-2 ml-0"
                      diameter={26}
                    />
                    <div className="truncate text-sm">{option.name}</div>
                  </div>
                </MenuItem>
              );
            })}
          </section>

          {!showMore && allAccounts.length > COLLAPSED_ACCOUNTS_NUM && (
            <span
              className="text-xs text-left mx-3 mt-2 mb-3 block cursor-pointer"
              style={{ color: "var(--color-emerald)" }}
              onClick={(e) => {
                e.stopPropagation();
                setShowMore(true);
              }}
            >
              Show more
            </span>
          )}
        </>
      )}
    </div>
  );
};

export { UserAccountList };