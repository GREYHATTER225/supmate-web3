import { FC, useMemo } from "react";

/**
 * Deterministic, procedurally generated geometric avatar (Boring Avatars style).
 *
 * Avatars are rendered locally as inline SVG — no network fetch, no cartoon
 * photography. The composition is derived from a stable seed (a public key or
 * username) so a given identity always maps to the same minimal glyph.
 *
 * The palette is intentionally restrained: obsidian backgrounds, slate
 * geometry, and — only rarely — a single disciplined accent.
 */

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small seeded PRNG for stable, reproducible compositions. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BACKGROUNDS = ["#0E1116", "#11151C", "#141922", "#0F1319"];
const GEOMETRY = ["#1C242E", "#28313D", "#39434F", "#4A5563", "#5B6774"];
const ACCENTS = ["#86EFAC", "#93C5FD"];

type Shape =
  | { kind: "circle"; cx: number; cy: number; r: number; fill: string }
  | { kind: "rect"; x: number; y: number; w: number; h: number; rx: number; fill: string };

export const GeometricAvatar: FC<{
  seed?: string;
  size?: number;
  className?: string;
  title?: string;
}> = ({ seed = "", size = 32, className = "", title }) => {
  const shapes = useMemo<{ bg: string; shapes: Shape[] }>(() => {
    const h = hashString(seed || "supmate");
    const rand = mulberry32(h);

    const bg = BACKGROUNDS[h % BACKGROUNDS.length];

    // Roughly 1 in 6 avatars carry a single accent; the rest stay monochrome.
    const useAccent = h % 6 === 0;
    const accent = ACCENTS[(h >>> 2) % ACCENTS.length];

    const pick = (allowAccent: boolean) => {
      if (allowAccent && rand() > 0.5) return accent;
      return GEOMETRY[Math.floor(rand() * GEOMETRY.length)];
    };

    const out: Shape[] = [];

    // Primary mass — a large soft circle.
    out.push({
      kind: "circle",
      cx: 28 + rand() * 44,
      cy: 28 + rand() * 44,
      r: 26 + rand() * 16,
      fill: pick(false),
    });

    // Secondary plate — a rounded rectangle.
    out.push({
      kind: "rect",
      x: rand() * 55,
      y: rand() * 55,
      w: 26 + rand() * 22,
      h: 26 + rand() * 22,
      rx: 10 + rand() * 10,
      fill: pick(false),
    });

    // Accent speck — small, disciplined.
    out.push({
      kind: "circle",
      cx: 18 + rand() * 64,
      cy: 18 + rand() * 64,
      r: 6 + rand() * 8,
      fill: pick(useAccent),
    });

    return { bg, shapes: out };
  }, [seed]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title || "Avatar"}
      className={className}
      style={{ display: "block", borderRadius: "50%" }}
    >
      <rect width="100" height="100" fill={shapes.bg} />
      {shapes.shapes.map((s, i) =>
        s.kind === "circle" ? (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />
        ) : (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            rx={s.rx}
            fill={s.fill}
          />
        )
      )}
    </svg>
  );
};
