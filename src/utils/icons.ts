/**
 * Semantic local icon registry.
 *
 * Supmate renders icons exclusively from the local /assets directory —
 * no external icon library is fetched at runtime. Each entry is mapped to a
 * semantic name so components never depend on raw file paths.
 *
 * Conventions:
 *  - UI glyphs are flat single-colour PNGs (some ship black, some white).
 *    `AssetIcon` normalises them to a common tone via CSS filters, so the
 *    source colour of a glyph is not significant — use `tone` to pick one.
 *  - Brand artwork (chatLogo, deso, logoWhite) is colour by design and must be
 *    rendered with `tone="none"`, otherwise the filters wash it out.
 *  - Demo avatar artwork lives in /assets/demo and is registered separately in
 *    `demoData.ts` (DEMO_AVATARS) — it is not an icon and must not be filtered.
 *
 * Icons that have no local artwork (trash, owner/crown, link, server, flask)
 * are rendered as small inline SVGs next to their component, following the
 * convention established in `manage-members-dialog.tsx`.
 */
export const ICONS = {
  /* session / identity */
  addUser: "/assets/add-user.png",
  changeUser: "/assets/change-user.png",
  logout: "/assets/logout.png",

  /* messaging */
  send: "/assets/send.png",
  groupChat: "/assets/group-chat.png",
  members: "/assets/members.png",
  leftChevron: "/assets/left-chevron.png",

  /* clipboard / navigation */
  copy: "/assets/copy.png",
  copyFilled: "/assets/copy-filled.png",
  externalLink: "/assets/external-link.png",

  /* brand — colour artwork, render with tone="none" */
  chatLogo: "/assets/chat-logo.png",
  logoWhite: "/assets/logo-white.png",
  rocket: "/assets/rocket.png",
  deso: "/assets/deso.webp",

  /* fallbacks */
  defaultProfile: "/assets/default-profile-pic.png",
} as const;

export type IconName = keyof typeof ICONS;

export const iconSrc = (name: IconName): string => ICONS[name];