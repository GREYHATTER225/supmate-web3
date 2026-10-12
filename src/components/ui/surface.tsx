import { HTMLAttributes, ReactNode } from "react";

export type SurfaceElevation = "flat" | "raised" | "overlay";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevation?: SurfaceElevation;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const elevationClasses: Record<SurfaceElevation, string> = {
  flat: "surface",
  raised: "surface-elevated",
  overlay: "surface-overlay",
};

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
} as const;

export const Surface = ({
  children,
  elevation = "raised",
  interactive = false,
  padding = "md",
  className = "",
  ...rest
}: SurfaceProps) => {
  const interactiveClasses = interactive
    ? "transition-all duration-150 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-elev-2)]"
    : "";
  return (
    <div
      className={[
        elevationClasses[elevation],
        paddingClasses[padding],
        interactiveClasses,
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
};