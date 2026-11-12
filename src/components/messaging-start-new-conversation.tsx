
import { FC } from "react";
import { DEFAULT_KEY_MESSAGING_GROUP_NAME } from "../utils/constants";
import { SearchUsers } from "./search-users";

const SearchGlyph = ({ size = 17 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const ChromeStar = ({ size = 17 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M50 3 C57 37 63 43 97 50 C63 57 57 63 50 97 C43 63 37 57 3 50 C37 43 43 37 50 3Z"
      fill="url(#supmate-search-star)"
      stroke="rgba(255,255,255,.8)"
      strokeWidth="1.5"
    />
    <defs>
      <linearGradient
        id="supmate-search-star"
        x1="10"
        y1="5"
        x2="90"
        y2="95"
      >
        <stop stopColor="#fff" />
        <stop offset=".25" stopColor="#64748b" />
        <stop offset=".48" stopColor="#fff" />
        <stop offset=".7" stopColor="#475569" />
        <stop offset="1" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
  </svg>
);

const searchStyles = `
  .supmate-search {
    width: 100%;
    position: relative;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .supmate-search * {
    box-sizing: border-box;
  }

  .supmate-search-shell {
    position: relative;
    display: flex;
    align-items: center;
    gap: 11px;
    width: 100%;
    min-height: 54px;
    padding: 5px 7px 5px 15px;
    overflow: hidden;
    border-radius: 15px;

    background:
      radial-gradient(
        ellipse at 15% 0%,
        rgba(255,255,255,.10),
        transparent 45%
      ),
      linear-gradient(
        145deg,
        #252a31 0%,
        #101317 27%,
        #030405 70%,
        #171c22 100%
      );

    border: 1px solid transparent;
    background-clip: padding-box;

    box-shadow:
      0 0 0 1px rgba(255,255,255,.38),
      0 0 0 2px rgba(71,85,105,.35),
      0 8px 24px rgba(0,0,0,.5),
      inset 0 1px 1px rgba(255,255,255,.38),
      inset 0 -2px 5px rgba(0,0,0,.85);

    transition:
      box-shadow .25s ease,
      transform .25s ease;
  }

  .supmate-search-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background:
      linear-gradient(
        115deg,
        transparent 12%,
        rgba(255,255,255,.10) 25%,
        rgba(255,255,255,.025) 35%,
        transparent 53%
      );
    background-size: 220% 100%;
    animation: supmate-search-reflection 7s ease-in-out infinite;
  }

  .supmate-search-shell::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    pointer-events: none;
    background: linear-gradient(
      120deg,
      rgba(255,255,255,.9),
      rgba(148,163,184,.3) 20%,
      rgba(255,255,255,.08) 45%,
      rgba(34,211,238,.3) 70%,
      rgba(255,255,255,.65)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  .supmate-search-shell:focus-within {
    transform: translateY(-1px);
    box-shadow:
      0 0 0 1px rgba(255,255,255,.8),
      0 0 0 2px rgba(34,211,238,.35),
      0 0 22px rgba(34,211,238,.13),
      0 12px 30px rgba(0,0,0,.55),
      inset 0 1px 2px rgba(255,255,255,.5);
  }

  .supmate-search-icon {
    position: relative;
    z-index: 2;
    display: flex;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    color: #f8fafc;
    background: linear-gradient(
      145deg,
      #7c8795,
      #252b34 42%,
      #080a0d 80%
    );
    border: 1px solid rgba(255,255,255,.32);
    box-shadow:
      inset 0 1px 2px rgba(255,255,255,.5),
      0 2px 7px rgba(0,0,0,.65);
  }

  .supmate-search-content {
    position: relative;
    z-index: 2;
    flex: 1;
    min-width: 0;
  }

  .supmate-search-content .search-input {
    width: 100%;
    min-width: 0;
    min-height: 37px;
    padding: 8px 4px !important;
    border: 0 !important;
    outline: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    color: #f8fafc !important;
    box-shadow: none !important;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .01em;
  }

  .supmate-search-content .search-input::placeholder {
    color: rgba(203,213,225,.58) !important;
    opacity: 1;
  }

  .supmate-search-content .search-input:focus {
    outline: none !important;
    border: 0 !important;
    box-shadow: none !important;
  }

  .supmate-search-hint {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 5px 3px;
    color: #858d99;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .015em;
    line-height: 1.5;
  }

  .supmate-search-hint-icon {
    display: flex;
    color: #cbd5e1;
    opacity: .85;
  }

  .supmate-search-hint-star {
    display: flex;
    margin-left: auto;
    color: #cbd5e1;
    opacity: .65;
  }

  @keyframes supmate-search-reflection {
    0%, 20% {
      background-position: 120% 0;
      opacity: .35;
    }
    55% {
      background-position: -100% 0;
      opacity: .9;
    }
    80%, 100% {
      background-position: -100% 0;
      opacity: .35;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .supmate-search-shell,
    .supmate-search-shell::before {
      animation: none;
      transition: none;
    }
  }
`;

export const MessagingStartNewConversation: FC<{
  rehydrateConversation: (publicKey: string) => void;
}> = ({ rehydrateConversation }) => {
  return (
    <div className="supmate-search">
      <style>{searchStyles}</style>

      <div className="supmate-search-shell">
        <div className="supmate-search-icon">
          <SearchGlyph size={18} />
        </div>

        <div className="supmate-search-content">
          <SearchUsers
            onSelected={async (e) => {
              if (!e) return;

              await rehydrateConversation(
                e.id + DEFAULT_KEY_MESSAGING_GROUP_NAME
              );
            }}
            placeholder="Search username, 0x address, .eth, or DeSo key..."
            className="search-input"
          />
        </div>

        <div className="supmate-search-hint-star">
          <ChromeStar size={21} />
        </div>
      </div>

      <div className="supmate-search-hint">
        <span className="supmate-search-hint-icon">
          <SearchGlyph size={12} />
        </span>
        Resolves DeSo keys, 0x addresses &amp; ENS names
        <span style={{ color: "#64748b" }}>·</span>
        <span style={{ color: "#a5f3fc" }}>Identity search</span>
      </div>
    </div>
  );
};
