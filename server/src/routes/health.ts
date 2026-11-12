import { Router, Request, Response } from "express";
import { WebSocketRelay } from "../services/websocketRelay";

export const healthRouter = Router();

healthRouter.get("/", async (_req: Request, res: Response) => {
  const nodeUrl = process.env.DESO_NODE_URL || "https://node.deso.org";
  let nodeOnline = false;
  let blockHeight = 0;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const nodeRes = await fetch(`${nodeUrl}/api/v0/health-check`, { signal: controller.signal });
    clearTimeout(timeout);
    nodeOnline = nodeRes.ok;
  } catch {
    nodeOnline = false;
  }

  res.json({
    status: "ok",
    service: "supmate-backend-gateway",
    version: "1.0.0",
    nodeUrl,
    nodeOnline,
    activeWebSocketClients: WebSocketRelay.getInstance().getConnectedClientsCount(),
    timestamp: Date.now(),
  });
});
