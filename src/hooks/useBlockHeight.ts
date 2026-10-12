import { getAppState } from "deso-protocol";
import { useEffect, useState } from "react";

export interface BlockHeightState {
  height: number | null;
  isTestnet: boolean | null;
  live: boolean;
  syncing: boolean;
}

const INITIAL: BlockHeightState = {
  height: null,
  isTestnet: null,
  live: false,
  syncing: true,
};

/**
 * Live network tracker.
 *
 * Polls `getAppState` from the configured DeSo node and exposes the current
 * confirmed block height + network (testnet/mainnet). `live` stays false when
 * the node cannot be reached, so the UI can degrade honestly.
 */
export const useBlockHeight = (
  pollMs = 15000,
  enabled = true
): BlockHeightState => {
  const [state, setState] = useState<BlockHeightState>(INITIAL);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await getAppState();
        if (cancelled) return;
        setState({
          height: res.BlockHeight,
          isTestnet: res.IsTestnet,
          live: true,
          syncing: false,
        });
      } catch {
        if (cancelled) return;
        setState((prev) => ({ ...prev, live: false, syncing: false }));
      }
    };

    poll();
    const id = window.setInterval(poll, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, pollMs]);

  return state;
};