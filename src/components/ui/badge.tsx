import { HTMLAttributes, ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
  pulse?: boolean;
  uppercase?: boolean;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    "bg-white/6 text-[var(--text-secondary)] border-[var(--line-subtle)]",
  accent:
    "bg-[var(--color-emerald-dim)] text-[var(--color-emerald)] border-[rgba(56,217,160,0.28)]",
  success:
    "bg-[var(--color-emerald-dim)] text-[var(--color-emerald)] border-[rgba(56,217,160,0.3)]",
  warning:
    "bg-[rgba(232,179,75,0.12)] text-[var(--color-amber)] border-[rgba(232,179,75,0.3)]",
  danger:
    "bg-[var(--color-danger-dim)] text-[var(--color-danger)] border-[rgba(242,104,98,0.3)]",
  info:
    "bg-[var(--color-cyan-dim)] text-[var(--color-cyan)] border-[rgba(85,198,242,0.28)]",
};

export const Badge = ({
  children,
  tone = "neutral",
  pulse = false,
  uppercase = true,
  className = "",
  ...rest
}: BadgeProps) => {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold border tracking-wide",
        toneClasses[tone],
        uppercase ? "uppercase" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
          style={{ background: "currentColor" }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};