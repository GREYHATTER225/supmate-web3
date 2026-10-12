import { ButtonHTMLAttributes, ForwardedRef, forwardRef, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  size?: "sm" | "md";
  tone?: "default" | "accent" | "danger";
  active?: boolean;
}

const sizeClasses = {
  sm: "w-7 h-7 rounded-lg text-[15px]",
  md: "w-8 h-8 rounded-[10px] text-base",
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      label,
      size = "md",
      tone = "default",
      active = false,
      className = "",
      ...rest
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const toneClasses = {
      default: active
        ? "bg-white/10 text-white border-white/20"
        : "bg-transparent text-[var(--text-muted)] border-transparent hover:bg-white/6 hover:text-[var(--text-primary)]",
      accent: active
        ? "bg-[var(--color-emerald-dim)] text-[var(--color-emerald)] border-[var(--line-emerald)]"
        : "bg-transparent text-[var(--text-muted)] border-transparent hover:bg-white/6 hover:text-[var(--text-primary)]",
      danger: "bg-transparent text-[var(--text-muted)] border-transparent hover:text-[var(--color-danger)]",
    } as const;

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={[
          "inline-flex items-center justify-center shrink-0 border transition-all duration-200 cursor-pointer",
          "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          "active:scale-[0.98]",
          sizeClasses[size],
          toneClasses[tone],
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
