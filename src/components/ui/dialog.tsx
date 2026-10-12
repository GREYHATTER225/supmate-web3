import {
  FC,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./icon-button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
}

/**
 * Accessible modal dialog.
 * - Renders into a portal
 * - Locks page scroll while open
 * - Traps Escape to close
 * - Restores focus to the previously focused element on close
 * - Announces title / description via aria
 */
export const Dialog: FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 520,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const titleId = "sm-dialog-title";
  const bodyId = "sm-dialog-body";

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the panel so keyboard users land inside the dialog.
    const t = window.setTimeout(() => panelRef.current?.focus(), 20);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: "rgba(7,8,10,0.78)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? bodyId : undefined}
        tabIndex={-1}
        className="relative w-full glass-hi animate-scale-in flex flex-col outline-none max-h-[90vh]"
        style={{ maxWidth, borderRadius: "var(--radius-xl)", overflow: "hidden" }}
      >
        {title && (
          <div
            className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 shrink-0"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div>
              <h2
                id={titleId}
                className="font-bold leading-snug"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17 }}
              >
                {title}
              </h2>
              {description && (
                <p
                  id={bodyId}
                  className="mt-1 text-[13px] leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {description}
                </p>
              )}
            </div>
            <IconButton size="sm" label="Close dialog" onClick={onClose}>
              <span aria-hidden="true" style={{ lineHeight: 1, fontSize: 18 }}>×</span>
            </IconButton>
          </div>
        )}

        <div
          className="px-6 py-5 overflow-y-auto custom-scrollbar grow"
          style={{ minHeight: 0 }}
        >
          {children}
        </div>

        {footer && (
          <div
            className="px-6 py-4 shrink-0 flex items-center justify-end gap-2.5"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
