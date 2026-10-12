import { FC, ReactElement } from "react";
import { getProfileURL } from "../utils/helpers";
import { GeometricAvatar } from "./ui/geometric-avatar";

function ConditionalLink({
  children,
  condition,
  href,
  target,
  className,
  style,
  onClick,
}: {
  children: ReactElement;
  condition: boolean;
  href: string;
  target: string;
  className: string;
  style: any;
  onClick: (e: any) => void;
}) {
  return condition ? (
    <a
      href={href}
      target={target}
      rel="noreferrer"
      className={`w-full ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </a>
  ) : (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

/**
 * Identity avatar for conversations and the account menu.
 *
 * Supmate renders a procedurally generated geometric glyph seeded by the
 * public key — no external avatar service is fetched and no profile photo is
 * shown, keeping the interface minimal and locally deterministic. When a
 * username is known the glyph remains a link to the on-chain profile.
 */
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
  // The geometric composition is derived from the public key (or username),
  // so every identity resolves to a stable, locally-generated glyph.
  const seed = publicKey || username || "supmate";

  return (
    <ConditionalLink
      className={`block ${classNames}`}
      style={{
        width: `${diameter}px`,
        maxWidth: `${diameter}px`,
        minWidth: `${diameter}px`,
      }}
      href={getProfileURL(username)}
      condition={!!username}
      target="_blank"
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className={`block rounded-full ${borderColor}`}
        style={{
          height: `${diameter}px`,
          width: `${diameter}px`,
          overflow: "hidden",
          lineHeight: 0,
        }}
        title={publicKey}
      >
        <GeometricAvatar seed={seed} size={diameter} title={username || publicKey} />
      </span>
    </ConditionalLink>
  );
};
