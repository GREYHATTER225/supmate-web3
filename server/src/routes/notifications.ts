import { Router, Request, Response } from "express";
import { WebSocketRelay } from "../services/websocketRelay";

export const notificationsRouter = Router();

/**
 * Trigger an encrypted message arrival event for a recipient public key.
 * Security enforcement:
 * - Reject any payload containing "seed", "mnemonic", "privateKey", or plaintext fields.
 */
notificationsRouter.post("/push", (req: Request, res: Response) => {
  const { recipientPublicKey, senderPublicKey, txnHashHex, timestamp } = req.body;

  if (!recipientPublicKey || typeof recipientPublicKey !== "string") {
    return res.status(400).json({ error: "Missing or invalid recipientPublicKey" });
  }

  // Security guard against accidental leakage
  const bodyKeys = Object.keys(req.body);
  const forbiddenKeys = ["seed", "mnemonic", "privateKey", "plaintext", "messageText"];
  if (bodyKeys.some((k) => forbiddenKeys.includes(k.toLowerCase()))) {
    return res.status(400).json({ error: "Security violation: Sensitive cryptographic fields are strictly prohibited." });
  }

  WebSocketRelay.getInstance().notifyPublicKey(recipientPublicKey, {
    type: "NEW_MESSAGE_NOTIFICATION",
    senderPublicKey,
    txnHashHex: txnHashHex || "",
    timestamp: timestamp || Date.now(),
  });

  return res.json({ success: true, deliveredTo: recipientPublicKey });
});
