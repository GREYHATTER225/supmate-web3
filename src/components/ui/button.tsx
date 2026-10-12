import { ButtonHTMLAttributes, ForwardedRef, forwardRef, ReactNode } from "react";
import { ClipLoader } from "react-spinners";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-[13px] rounded-[10px]",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-[15px] rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leadingIcon,
      trailingIcon,
      loading = false,
      loadingLabel,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...rest
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const btnClass = variantClasses[variant];
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        className={[
          btnClass,
          sizeClasses[size],
          fullWidth ? "w-full" : "",
          className,
        ].join(" ")}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? (
          <>
            <ClipLoader size={16} color={variant === "primary" ? "#0A0D12" : undefined} />
            {loadingLabel && <span>{loadingLabel}</span>}
          </>
        ) : (
          <>
            {leadingIcon}
            {children}
            {trailingIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";