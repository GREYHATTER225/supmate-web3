import { FC } from "react";
import { IconName, iconSrc } from "../../utils/icons";

export type AssetIconTone = "light" | "dark" | "accent" | "none";

interface AssetIconProps {
  name: IconName;
  size?: number;
  className?: string;
  alt?: string;
  /** Glyph tone. Default "light" renders a neutral white monochrome glyph. */
  tone?: AssetIconTone;
  /** Full opacity (default mutes the glyph for the luxe system). */
  active?: boolean;
}

const toneFilter: Record<AssetIconTone, string> = {
  light: "grayscale(1) brightness(0) invert(1)",
  dark: "grayscale(1) brightness(0)",
  accent:
    "grayscale(1) brightness(0) invert(1) sepia(1) saturate(6) hue-rotate(58deg) brightness(1.05)",
  none: "none",
};

/**
 * Renders a local /assets icon as a monochrome glyph.
 *
 * The PNGs are desaturated to a single neutral tone via the `.asset-icon`
 * utility class so they sit cleanly inside the obsidian design system. Tone
 * and opacity variants are opt-in for the < 3% of the viewport that carries
 * colour or emphasis.
 */
export const AssetIcon: FC<AssetIconProps> = ({
  name,
  size = 16,
  className = "",
  alt = "",
  tone = "light",
  active = false,
}) => {
  return (
    <img
      src={iconSrc(name)}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={!alt}
      draggable={false}
      className={`asset-icon ${className}`.trim()}
      style={{
        width: size,
        height: size,
        filter: toneFilter[tone],
        opacity: active ? 0.95 : tone === "none" ? 1 : 0.55,
      }}
    />
  );
};
