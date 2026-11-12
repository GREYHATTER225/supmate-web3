
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

    const { height, isTestnet, syncing } = useBlockHeight(
      15000,
      !isDemo && !!appUser
    );

    const username = appUser?.ProfileEntryResponse?.Username;
    const handle = username ? `@${username}` : "";
    const key = appUser?.PublicKeyBase58Check ?? "";
    const balance = appUser?.BalanceNanos;

    const displayName = isDemo
      ? demoName || DEMO_USER.name
      : handle || shortenLongWord(key) || "Not connected";

    const displayKey = isDemo
      ? demoHandle || DEMO_USER.handle
      : key;

    const avatarSeed = isDemo
      ? demoPublicKey || DEMO_USER.publicKey
      : key;

    const network = (isTestnet ?? !IS_MAINNET)
      ? "TESTNET"
      : "MAINNET";

    const sessionLabel = isDemo
      ? "SANDBOX"
      : syncing
        ? "SYNCING"
        : appUser
          ? "ACTIVE"
          : "OFFLINE";

    const sessionColor = isDemo
      ? "text-violet-300"
      : syncing
        ? "text-amber-300"
        : appUser
          ? "text-lime-300"
          : "text-neutral-500";

    return (
      <section
        className="
        bento identity-bento relative isolate flex flex-col
        justify-between gap-5 overflow-hidden rounded-[24px]
        border border-white/[0.09] bg-[#0b1014] p-5 text-white
        shadow-[0_18px_55px_rgba(0,0,0,0.42)]
        transition-all duration-300
        hover:border-cyan-300/25
      "
        aria-label="Identity and wallet panel"
      >
        {/* Background atmosphere */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-400/[0.10] blur-[85px]" />
          <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-lime-400/[0.07] blur-[80px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-transparent" />

          {/* Fine technical grid */}
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "linear-gradient(to bottom right, black, transparent 75%)",
            }}
          />

          {/* Small halftone accent */}
          <div
            className="absolute right-5 top-16 h-20 w-20 opacity-[0.16]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(103,232,249,0.9) 1px, transparent 1px)",
              backgroundSize: "6px 6px",
              maskImage:
                "radial-gradient(circle, black 10%, transparent 75%)",
            }}
          />
        </div>

        {/* Top edge */}
        <div className="absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-30" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
            </span>

            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
              Identity Protocol
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-md border border-cyan-300/15 bg-cyan-300/[0.06] px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-cyan-200/80 sm:inline-flex">
              ID / 01
            </span>

            <span className="
            rounded-full border border-white/[0.10]
            bg-white/[0.045] px-2.5 py-1
            font-mono text-[9px] tracking-widest text-neutral-300
          ">
              {isDemo ? "SANDBOX" : "DESO L1"}
            </span>
          </div>
        </div>

        {/* Identity details */}
        <div className="relative flex min-w-0 items-center gap-4">
          <div className="
          relative shrink-0 rounded-[20px]
          border border-cyan-300/25 bg-[#101a20] p-1.5
          shadow-[0_0_30px_rgba(34,211,238,0.10)]
        ">
            <div className="overflow-hidden rounded-[14px]">
              <GeometricAvatar
                seed={avatarSeed}
                size={48}
                title={displayName}
              />
            </div>

            <span className="
            absolute -bottom-1 -right-1 h-3.5 w-3.5
            rounded-full border-[3px] border-[#0b1014]
            bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.55)]
          " />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-bold tracking-tight text-white">
              {displayName}
            </div>

            {displayKey && (
              isDemo ? (
                <div className="mt-1 truncate font-mono text-[11px] text-neutral-500">
                  {displayKey}
                </div>
              ) : (
                <SaveToClipboard
                  text={key}
                  className="
                  mt-1 inline-flex max-w-full items-center gap-2
                  rounded-lg border border-white/[0.08]
                  bg-white/[0.045] px-2.5 py-1.5
                  font-mono text-[10px] text-neutral-400
                  transition-all duration-200
                  hover:border-cyan-300/30 hover:bg-cyan-300/[0.07]
                  hover:text-cyan-200
                "
                  copyIcon={<AssetIcon name="copy" size={11} active />}
                  copiedIcon={
                    <AssetIcon name="copyFilled" size={11} tone="accent" active />
                  }
                >
                  <span className="truncate">
                    {shortenLongWord(key, 8, 5)}
                  </span>
                </SaveToClipboard>
              )
            )}
          </div>
        </div>

        {/* Wallet metrics */}
        <div className="relative grid grid-cols-3 gap-2 border-t border-white/[0.09] pt-4">

          {/* Session */}
          <div className="
          min-w-0 rounded-xl border border-white/[0.07]
          bg-white/[0.035] p-3
          shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]
          transition-colors hover:border-lime-300/20
        ">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
              Session
            </div>

            <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide ${sessionColor}`}>
              <span className={`
              h-1.5 w-1.5 shrink-0 rounded-full
              ${isDemo ? "bg-violet-300" : syncing ? "bg-amber-300" : appUser ? "bg-lime-300" : "bg-neutral-600"}
              ${!isDemo && syncing ? "animate-pulse" : ""}
            `} />
              <span className="truncate">{sessionLabel}</span>
            </div>
          </div>

          {/* Network */}
          <div className="
          min-w-0 rounded-xl border border-white/[0.07]
          bg-white/[0.035] p-3
          shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]
          transition-colors hover:border-cyan-300/20
        ">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
              Network
            </div>

            <div className={`
            mt-2 truncate text-[11px] font-bold tracking-wide
            ${network === "MAINNET" ? "text-cyan-200" : "text-amber-300"}
          `}>
              {network}
            </div>
          </div>

          {/* Balance / Ledger */}
          <div className="
          min-w-0 rounded-xl border border-white/[0.07]
          bg-white/[0.035] p-3
          shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]
          transition-colors hover:border-violet-300/20
        ">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
              {typeof balance === "number" && !isDemo ? "Balance" : "Ledger"}
            </div>

            <div className="mt-2 truncate text-[11px] font-bold tracking-wide text-violet-200">
              {typeof balance === "number" && !isDemo
                ? `${desoNanosToDeso(balance).toFixed(2)} DESO`
                : height
                  ? `#${height.toLocaleString()}`
                  : "—"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
          <span className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
            Supmate Sovereign Identity
          </span>

          <span className="
          shrink-0 rounded-md border border-lime-300/15
          bg-lime-300/[0.045] px-2 py-1
          font-mono text-[9px] tracking-wider text-lime-200/70
        ">
            {isDemo ? "LOCAL SESSION" : "NON-CUSTODIAL"}
          </span>
        </div>
      </section>
    );
  };
