import { FC, useEffect, useState } from "react";

/**
 * Compact network gas ticker — `● 12 Gwei`.
 *
 * Anchors the composer contextually to the chain infrastructure with the
 * disciplined sage dot. The value drifts slowly so the ticker reads as live
 * telemetry rather than a static label.
 */
export const GasTicker: FC<{ className?: string }> = ({ className = "" }) => {
  const [gwei, setGwei] = useState(12);

  useEffect(() => {
    const id = window.setInterval(() => {
      setGwei((prev) => {
        const drift = Math.random() < 0.5 ? -1 : 1;
        const next = prev + drift + (Math.random() < 0.25 ? drift : 0);
        return Math.min(20, Math.max(8, next));
      });
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={`gas-ticker ${className}`.trim()} title="Estimated network fee">
      <span className="gas-ticker__dot" />
      <span className="gas-ticker__value">{gwei} Gwei</span>
    </span>
  );
};