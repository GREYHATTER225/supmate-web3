
import {
  FC,
  ReactNode,
  CSSProperties,
  MouseEvent,
} from "react";

import { getProfileURL } from "../utils/helpers";
import { GeometricAvatar } from "./ui/geometric-avatar";

type ConditionalLinkProps = {
  children: ReactNode;
  condition: boolean;
  href: string;
  target?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function ConditionalLink({
  children,
  condition,
  href,
  target = "_blank",
  className = "",
  style,
  onClick,
}: ConditionalLinkProps) {
  if (!condition) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={target}
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

export const MessagingDisplayAvatar: FC<{
  publicKey?: string;
  username?: string;
  borderColor?: string;
  diameter: number;
  classNames?: string;
  groupChat?: boolean;
}> = ({
  publicKey,
  username,
  diameter,
  borderColor = "border-white",
  classNames = "",
}) => {
    // Stable identity: each public key generates the same avatar.
    const seed = publicKey || username || "supmate";

    const profileUrl = username
      ? getProfileURL(username)
      : "";

    const avatarStyle: CSSProperties = {
      width: diameter,
      height: diameter,
      minWidth: diameter,
      maxWidth: diameter,
      flexShrink: 0,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      borderRadius: "50%",
      padding: 2,
      position: "relative",
      background: `
      linear-gradient(
        135deg,
        #ffffff 0%,
        #cbd5e1 9%,
        #475569 20%,
        #f8fafc 32%,
        #111827 47%,
        #94a3b8 59%,
        #ffffff 72%,
        #334155 86%,
        #e2e8f0 100%
      )
    `,
      boxShadow: `
      0 0 0 1px rgba(255,255,255,0.25),
      0 0 12px rgba(255,255,255,0.10),
      0 0 18px rgba(34,211,238,0.12),
      inset 0 1px 3px rgba(255,255,255,0.75),
      inset 0 -2px 4px rgba(0,0,0,0.8)
    `,
      transition:
        "transform 220ms ease, box-shadow 220ms ease",
    };

    const holographicRingStyle: CSSProperties = {
      width: "100%",
      height: "100%",
      padding: 1,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      background: `
      conic-gradient(
        from 20deg,
        #ffffff,
        #5ee7ff,
        #6475ff,
        #ff65c5,
        #ffcc66,
        #8cffb5,
        #ffffff,
        #64748b,
        #ffffff
      )
    `,
      boxShadow:
        "inset 0 0 5px rgba(255,255,255,0.6)",
    };

    const avatarWellStyle: CSSProperties = {
      width: "100%",
      height: "100%",
      padding: 1,
      boxSizing: "border-box",
      borderRadius: "50%",
      overflow: "hidden",
      background:
        "radial-gradient(circle at 35% 20%, #26313b 0%, #080a0d 48%, #000000 100%)",
      border: "1px solid rgba(255,255,255,0.35)",
      boxShadow:
        "inset 0 2px 8px rgba(0,0,0,0.85), 0 0 4px rgba(255,255,255,0.15)",
    };

    return (
      <>
        <style>
          {`
          .supmate-chrome-avatar {
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          }

          .supmate-chrome-avatar:hover {
            transform: translateY(-2px) scale(1.045);
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.45),
              0 0 15px rgba(255,255,255,0.17),
              0 0 24px rgba(34,211,238,0.22),
              inset 0 1px 4px rgba(255,255,255,0.9);
          }

          .supmate-avatar-highlight {
            position: absolute;
            inset: 3px;
            border-radius: 50%;
            pointer-events: none;
            background:
              linear-gradient(
                145deg,
                rgba(255,255,255,0.35),
                transparent 28%,
                transparent 72%,
                rgba(255,255,255,0.12)
              );
            mix-blend-mode: screen;
          }

          @media (prefers-reduced-motion: reduce) {
            .supmate-chrome-avatar {
              transition: none !important;
            }
          }
        `}
        </style>

        <ConditionalLink
          className={`supmate-chrome-avatar ${classNames}`}
          style={avatarStyle}
          href={profileUrl}
          condition={!!username}
          target="_blank"
          onClick={(event) => event.stopPropagation()}
        >
          <span style={holographicRingStyle}>
            <span
              className={`rounded-full ${borderColor}`}
              style={avatarWellStyle}
              title={publicKey || username || "Supmate identity"}
            >
              <GeometricAvatar
                seed={seed}
                size={Math.max(1, diameter - 8)}
                title={username || publicKey || "Supmate identity"}
              />
            </span>
          </span>

          <span className="supmate-avatar-highlight" />
        </ConditionalLink>
      </>
    );
  };
