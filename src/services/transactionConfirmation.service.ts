/**
 * DeSo Transaction Confirmation Service
 *
 * A submitted DeSo transaction passes through three states:
 *   1. PENDING   – accepted by the node mempool, not yet in a block
 *   2. CONFIRMED – included in a finalized block
 *   3. FAILED    – dropped or rejected post-submission
 *
 * This service polls the DeSo node's transaction-info endpoint until
 * the transaction reaches CONFIRMED or times out.
 *
 * Security note: This service only reads publicly-visible transaction data
 * from the blockchain. No private keys or plaintext content are involved.
 */

export type TxStatus = "pending" | "confirmed" | "failed" | "timeout";

export interface TxConfirmationResult {
  txnHashHex: string;
  status: TxStatus;
  blockHeight?: number;
  elapsedMs: number;
  attempts: number;
}

interface GetTransactionResponse {
  TxnFound: boolean;
  /** Present when the transaction is still in the mempool (not yet mined). */
  MempoolTxn?: unknown;
  /** Block height at which the transaction was mined, when confirmed. */
  BlockHeight?: number;
}

export class TransactionConfirmationService {
  private static nodeUrl =
    process.env.REACT_APP_NODE_URL || "https://node.deso.org";

  /**
   * Polls for confirmation of a DeSo transaction.
   *
   * @param txnHashHex  - The transaction hash returned by the node.
   * @param timeoutMs   - How long to wait before marking as timeout. Default: 90,000 ms (1.5 min).
   * @param intervalMs  - How often to poll. Default: 3,000 ms.
   * @param onProgress  - Optional callback called on each poll attempt.
   */
  public static async waitForConfirmation(
    txnHashHex: string,
    timeoutMs = 90_000,
    intervalMs = 3_000,
    onProgress?: (attempt: number, status: TxStatus) => void
  ): Promise<TxConfirmationResult> {
    const startMs = Date.now();
    let attempts = 0;
    let notFoundCount = 0;

    while (Date.now() - startMs < timeoutMs) {
      attempts += 1;
      let status: TxStatus = "pending";

      try {
        const url = `${TransactionConfirmationService.nodeUrl}/api/v0/get-transaction?TxnHashHex=${encodeURIComponent(txnHashHex)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data: GetTransactionResponse = await res.json();
          if (data.TxnFound === true && !data.MempoolTxn) {
            // Mined in a block — confirmed.
            return {
              txnHashHex,
              status: "confirmed",
              blockHeight: data.BlockHeight,
              elapsedMs: Date.now() - startMs,
              attempts,
            };
          } else if (data.TxnFound === true && data.MempoolTxn) {
            // Still in mempool — pending.
            notFoundCount = 0;
            status = "pending";
          } else {
            // TxnFound === false
            notFoundCount += 1;
            if (notFoundCount >= 3) {
              return {
                txnHashHex,
                status: "failed",
                elapsedMs: Date.now() - startMs,
                attempts,
              };
            }
            status = "pending";
          }
        }
        // Non-OK HTTP responses: treat as transient, keep polling.
      } catch {
        // Network error — treat as transient, keep polling.
      }

      onProgress?.(attempts, status);

      // Wait for the next poll interval, but cap at the remaining timeout.
      const remaining = timeoutMs - (Date.now() - startMs);
      if (remaining <= 0) {
        return { txnHashHex, status: "timeout", elapsedMs: Date.now() - startMs, attempts };
      }
      await new Promise<void>((resolve) =>
        setTimeout(resolve, Math.min(intervalMs, remaining))
      );
    }

    return {
      txnHashHex,
      status: "timeout",
      elapsedMs: Date.now() - startMs,
      attempts,
    };
  }

  /**
   * Non-blocking fire-and-forget version that calls the callback when done.
   */
  public static trackInBackground(
    txnHashHex: string,
    callback: (result: TxConfirmationResult) => void
  ): void {
    TransactionConfirmationService.waitForConfirmation(txnHashHex).then(
      callback,
      // Should never reject, but guard just in case.
      (err) => {
        console.error("[TransactionConfirmationService] unexpected error:", err);
        callback({
          txnHashHex,
          status: "failed",
          elapsedMs: 0,
          attempts: 0,
        });
      }
    );
  }
}
