import { FC } from "react";
import { DEFAULT_KEY_MESSAGING_GROUP_NAME } from "../utils/constants";
import { SearchUsers } from "./search-users";

/** Local monochrome search glyph (inline SVG — no external library). */
const SearchGlyph = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const MessagingStartNewConversation: FC<{
  rehydrateConversation: (publicKey: string) => void;
}> = ({ rehydrateConversation }) => {
  return (
    <div>
      <div className="mb-2">
        <SearchUsers
          onSelected={async (e) => {
            if (!e) {
              return;
            }
            await rehydrateConversation(
              e?.id + DEFAULT_KEY_MESSAGING_GROUP_NAME
            );
          }}
          placeholder="Search username, 0x address, .eth, or DeSo key..."
          className="search-input py-2 px-3"
        />
      </div>
      <p
        className="flex items-center gap-1.5 text-[11px] px-1 pb-2"
        style={{ color: "var(--text-faint)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <SearchGlyph size={11} />
        Resolves DeSo keys, 0x addresses &amp; ENS names
      </p>
    </div>
  );
};
