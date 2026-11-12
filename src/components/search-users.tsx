
import { Combobox } from "@headlessui/react";
import {
  getProfiles,
  getSingleProfile,
  identity,
  ProfileEntryResponse,
} from "deso-protocol";
import { ethers } from "ethers";
import debounce from "lodash/debounce";
import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";

import { UserContext } from "../contexts/UserContext";
import {
  isMaybeDeSoPublicKey,
  isMaybeENSName,
  isMaybeETHAddress,
} from "../utils/helpers";
import { MessagingDisplayAvatar } from "./messaging-display-avatar";
import { MyErrorLabel } from "./form/my-error-label";

export const shortenLongWord = (
  key: string | null,
  endFirstPartAfter = 6,
  startSecondPartAfter = 6,
  separator = "..."
) => {
  if (
    !key ||
    key.length <=
    endFirstPartAfter + startSecondPartAfter + separator.length
  ) {
    return key || "";
  }

  return [
    key.slice(0, endFirstPartAfter),
    separator,
    key.slice(-startSecondPartAfter),
  ].join("");
};

export const nameOrFormattedKey = (
  profile: ProfileEntryResponse | null,
  key: string
) => {
  return profile?.Username || shortenLongWord(key, 6, 6);
};

export interface SearchMenuItem {
  id: string;
  profile: ProfileEntryResponse | null;
  text: string;
}

interface SearchUsersProps {
  placeholder?: string;
  hasPersistentDisplayValue?: boolean;
  initialValue?: string;
  onSelected: (item: SearchMenuItem | null) => void;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onTyping?: (
    query: string,
    setItems: (items: SearchMenuItem[]) => void
  ) => void;
  className?: string;
}

const searchUsersStyles = `
  .supmate-user-search {
    position: relative;
    width: 100%;
    color: #f8fafc;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .supmate-user-search * {
    box-sizing: border-box;
  }

  .supmate-user-search .supmate-user-search-input {
    width: 100%;
    min-width: 0;
    min-height: 43px;
    padding: 10px 12px !important;
    border: 0 !important;
    border-radius: 10px !important;
    outline: none !important;
    color: #f8fafc !important;
    background: transparent !important;
    box-shadow: none !important;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .01em;
    transition: color .2s ease;
  }

  .supmate-user-search .supmate-user-search-input::placeholder {
    color: rgba(203,213,225,.53) !important;
    opacity: 1;
  }

  .supmate-user-search .supmate-user-search-input:focus {
    outline: none !important;
    border: 0 !important;
    box-shadow: none !important;
  }

  .supmate-user-search .supmate-user-search-input.field-error {
    color: #fca5a5 !important;
  }

  .supmate-user-search-results {
    position: absolute;
    z-index: 60;
    top: calc(100% + 10px);
    left: 0;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 6px;
    border: 1px solid rgba(255,255,255,.24);
    border-radius: 15px;

    background:
      radial-gradient(
        ellipse at 10% 0%,
        rgba(34,211,238,.09),
        transparent 42%
      ),
      linear-gradient(
        145deg,
        rgba(25,29,36,.98),
        rgba(5,7,10,.99)
      );

    box-shadow:
      0 16px 45px rgba(0,0,0,.72),
      0 0 0 1px rgba(255,255,255,.04),
      inset 0 1px 1px rgba(255,255,255,.16);

    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    scrollbar-width: thin;
    scrollbar-color: #64748b transparent;
  }

  .supmate-user-search-results::-webkit-scrollbar {
    width: 5px;
  }

  .supmate-user-search-results::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: linear-gradient(#e2e8f0, #64748b);
  }

  .supmate-user-search-option {
    position: relative;
    display: flex;
    min-height: 55px;
    align-items: center;
    gap: 11px;
    padding: 8px 10px;
    margin: 2px 0;
    overflow: hidden;
    border: 1px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    color: #cbd5e1;
    transition:
      background .18s ease,
      border-color .18s ease,
      transform .18s ease;
  }

  .supmate-user-search-option[data-active="true"] {
    color: #fff;
    border-color: rgba(255,255,255,.20);
    background:
      linear-gradient(
        110deg,
        rgba(255,255,255,.13),
        rgba(34,211,238,.08),
        rgba(255,255,255,.025)
      );
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.13),
      0 3px 12px rgba(0,0,0,.3);
  }

  .supmate-user-search-option[data-active="true"]::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      180deg,
      #fff,
      #67e8f9,
      #a78bfa
    );
    box-shadow: 0 0 9px rgba(34,211,238,.65);
  }

  .supmate-user-search-avatar {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.25);
    border-radius: 50%;
    background: linear-gradient(145deg,#64748b,#080a0d);
    box-shadow:
      0 0 8px rgba(255,255,255,.08),
      inset 0 1px 2px rgba(255,255,255,.35);
  }

  .supmate-user-search-details {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .supmate-user-search-name {
    overflow: hidden;
    color: #f8fafc;
    font-size: 12px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .supmate-user-search-key {
    overflow: hidden;
    color: #84909f;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .supmate-user-search-arrow {
    flex-shrink: 0;
    color: #cbd5e1;
    opacity: .6;
    font-size: 15px;
    transition: transform .18s ease, opacity .18s ease;
  }

  .supmate-user-search-option[data-active="true"]
  .supmate-user-search-arrow {
    opacity: 1;
    transform: translateX(2px);
  }

  .supmate-user-search-loading,
  .supmate-user-search-empty {
    display: flex;
    min-height: 66px;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px;
    color: #9ca3af;
    font-size: 11px;
    text-align: center;
  }

  .supmate-user-search-label {
    padding: 7px 10px 9px;
    color: #64748b;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .supmate-user-search-error {
    margin-top: 5px;
  }

  @media(prefers-reduced-motion: reduce) {
    .supmate-user-search-option,
    .supmate-user-search-arrow {
      transition: none;
    }
  }
`;

export const SearchUsers = ({
  placeholder = "Search for users",
  hasPersistentDisplayValue = false,
  initialValue = "",
  onSelected,
  error,
  onFocus,
  onBlur,
  onTyping,
  className = "search-input py-2 px-3",
}: SearchUsersProps) => {
  const [menuItems, setMenuItems] = useState<SearchMenuItem[]>([]);
  const [inputValue, setInputValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const { appUser } = useContext(UserContext);

  const provider = useMemo(
    () => new ethers.providers.InfuraProvider("homestead"),
    []
  );

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const searchForPublicKey = async (
    publicKey: string
  ): Promise<SearchMenuItem> => {
    const res = await getSingleProfile({
      PublicKeyBase58Check: publicKey,
      NoErrorOnMissing: true,
    });

    const item: SearchMenuItem = {
      id: publicKey,
      profile: res?.Profile || null,
      text: nameOrFormattedKey(res?.Profile || null, publicKey),
    };

    await onSelected(item);
    setInputValue("");
    setMenuItems([]);

    return item;
  };

  const _getProfiles = async (query: string) => {
    try {
      if (isMaybeENSName(query)) {
        const ethAddress = await provider.resolveName(query);

        if (!ethAddress) {
          throw new Error(`Unable to resolve ENS name ${query}`);
        }

        const desoPublicKey =
          await identity.ethereumAddressToDesoAddress(ethAddress);

        await searchForPublicKey(desoPublicKey);
        return;
      }

      if (isMaybeETHAddress(query)) {
        const desoPublicKey =
          await identity.ethereumAddressToDesoAddress(query);

        await searchForPublicKey(desoPublicKey);
        return;
      }

      if (isMaybeDeSoPublicKey(query)) {
        await searchForPublicKey(query);
        return;
      }

      const res = await getProfiles({
        PublicKeyBase58Check: "",
        Username: "",
        UsernamePrefix: query,
        Description: "",
        OrderBy: "",
        NumToFetch: 7,
        ReaderPublicKeyBase58Check:
          appUser?.PublicKeyBase58Check ?? "",
        ModerationType: "",
        FetchUsersThatHODL: false,
        AddGlobalFeedBool: false,
      });

      setMenuItems(
        (res.ProfilesFound || []).map((profile) => ({
          id: profile.PublicKeyBase58Check,
          profile,
          text: nameOrFormattedKey(
            profile,
            profile.PublicKeyBase58Check
          ),
        }))
      );
    } catch (error: any) {
      if (
        error?.message
          ?.toString()
          .startsWith(
            "GetSingleProfile: could not find profile for username or public key"
          )
      ) {
        setMenuItems([]);
        return;
      }

      toast.error(`Search error: ${error?.message || error}`);
      setMenuItems([]);
    }
  };

  const getProfilesDebounced = useMemo(
    () =>
      debounce(async (query: string) => {
        setLoading(true);

        try {
          await _getProfiles(query);
        } finally {
          setLoading(false);
        }
      }, 500),
    [appUser?.PublicKeyBase58Check, provider]
  );

  useEffect(() => {
    return () => {
      getProfilesDebounced.cancel();
    };
  }, [getProfilesDebounced]);

  const shownItems = menuItems;

  return (
    <div className="supmate-user-search">
      <style>{searchUsersStyles}</style>

      <Combobox
        nullable
        value={inputValue}
        onChange={(value) => {
          if (!value) {
            setInputValue("");
            setMenuItems([]);
            onSelected(null);
            return;
          }

          const menuItem = shownItems.find(
            ({ id }) => id === value
          );

          if (!menuItem) return;

          if (hasPersistentDisplayValue) {
            setInputValue(menuItem.id);
          } else {
            setInputValue("");
          }

          setMenuItems([]);
          onSelected(menuItem);
        }}
      >
        <div className="relative">
          <Combobox.Input
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            className={`supmate-user-search-input ${className} ${error ? "field-error" : ""
              }`}
            onChange={async (event) => {
              const query = event.target.value.trim();

              setInputValue(query);

              if (!query) {
                getProfilesDebounced.cancel();
                setLoading(false);
                setMenuItems([]);
                return;
              }

              if (onTyping) {
                onTyping(query, (items: SearchMenuItem[]) => {
                  setMenuItems(items);
                });
                return;
              }

              await getProfilesDebounced(query);
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            displayValue={(value: string) => value}
          />

          <div className="supmate-user-search-error">
            <MyErrorLabel error={error} />
          </div>
        </div>

        <Combobox.Options
          className={`supmate-user-search-results ${loading || shownItems.length > 0
              ? ""
              : "hidden"
            }`}
        >
          <div className="supmate-user-search-label">
            {loading ? "Searching identities" : "Matching identities"}
          </div>

          {loading && (
            <li className="supmate-user-search-loading">
              <ClipLoader
                color="#a5f3fc"
                loading
                size={19}
              />
              Resolving identity...
            </li>
          )}

          {!loading &&
            shownItems.map(({ id, profile, text }) => (
              <Combobox.Option
                key={id}
                value={id}
                as={Fragment}
              >
                {({ active }) => (
                  <li
                    className="supmate-user-search-option"
                    data-active={active}
                  >
                    <div className="supmate-user-search-avatar">
                      {profile && (
                        <MessagingDisplayAvatar
                          publicKey={profile.PublicKeyBase58Check}
                          username={profile.Username}
                          diameter={34}
                          classNames="mx-0"
                        />
                      )}
                    </div>

                    <div className="supmate-user-search-details">
                      <span className="supmate-user-search-name">
                        {text}
                      </span>

                      <span className="supmate-user-search-key">
                        {shortenLongWord(id, 9, 9)}
                      </span>
                    </div>

                    <span className="supmate-user-search-arrow">
                      ↗
                    </span>
                  </li>
                )}
              </Combobox.Option>
            ))}

          {!loading && shownItems.length === 0 && (
            <li className="supmate-user-search-empty">
              Start typing to discover DeSo identities.
            </li>
          )}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};
