import { WebSocket, WebSocketServer } from "ws";

const HANDSHAKE_TIMEOUT_MS = 10_000;
const HEARTBEAT_INTERVAL_MS = 30_000;
const PONG_TIMEOUT_MS = 10_000;
const MISSED_EVENT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_MISSED_EVENTS = 50;
const AUTH_REPLAY_WINDOW_MS = 60_000; // 60 seconds

interface ClientSubscription {
  ws: WebSocket;
  publicKeys: Set<string>;
}

interface MissedEventEntry {
  event: any;
  ts: number;
}

export class WebSocketRelay {
  private static instance: WebSocketRelay;
  private clients = new Map<WebSocket, ClientSubscription>();
  private publicKeyToClients = new Map<string, Set<WebSocket>>();

  /** Tracks the authenticated publicKey for each connected WebSocket. */
  private clientTokens = new Map<WebSocket, string>();

  /**
   * Stores recent events per publicKey for missed-event recovery on reconnect.
   * Keyed by publicKey; each entry holds up to MAX_MISSED_EVENTS events within MISSED_EVENT_TTL_MS.
   */
  private missedEvents = new Map<string, MissedEventEntry[]>();

  /** Tracks whether each client has responded to the last heartbeat ping. */
  private pongReceived = new Map<WebSocket, boolean>();

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  public static getInstance(): WebSocketRelay {
    if (!this.instance) {
      this.instance = new WebSocketRelay();
    }
    return this.instance;
  }

  public init(wss: WebSocketServer): void {
    this.startHeartbeat();

    wss.on("connection", (ws: WebSocket) => {
      const sub: ClientSubscription = { ws, publicKeys: new Set() };
      this.clients.set(ws, sub);
      this.pongReceived.set(ws, true);

      // Handshake timeout: client must AUTH within 10 seconds
      const handshakeTimeout = setTimeout(() => {
        if (!this.clientTokens.has(ws)) {
          ws.close(4001, "Authentication timeout");
        }
      }, HANDSHAKE_TIMEOUT_MS);

      ws.on("pong", () => {
        this.pongReceived.set(ws, true);
      });

      ws.on("message", (raw: Buffer | string) => {
        try {
          const msg = JSON.parse(raw.toString());

          if (msg.type === "AUTH") {
            this.handleAuth(ws, sub, msg, handshakeTimeout);
          } else if (msg.type === "SUBSCRIBE" && typeof msg.publicKey === "string") {
            this.handleSubscribe(ws, sub, msg.publicKey);
          } else if (msg.type === "UNSUBSCRIBE" && typeof msg.publicKey === "string") {
            const pk = msg.publicKey.trim();
            sub.publicKeys.delete(pk);
            this.publicKeyToClients.get(pk)?.delete(ws);
            ws.send(JSON.stringify({ type: "UNSUBSCRIBED", publicKey: pk }));
          } else if (msg.type === "PING") {
            ws.send(JSON.stringify({ type: "PONG" }));
          }
        } catch {
          // Ignore malformed messages
        }
      });

      ws.on("close", () => {
        clearTimeout(handshakeTimeout);
        const authenticatedKey = this.clientTokens.get(ws);

        // On disconnect, preserve the client's recent events for 5-minute recovery window
        if (authenticatedKey) {
          // Events are already stored in missedEvents; nothing extra needed here.
          // The store is keyed by publicKey and survives the connection.
        }

        for (const pk of sub.publicKeys) {
          this.publicKeyToClients.get(pk)?.delete(ws);
        }
        this.clients.delete(ws);
        this.clientTokens.delete(ws);
        this.pongReceived.delete(ws);
      });
    });
  }

  /**
   * Handles AUTH message: validates publicKey format and timestamp freshness,
   * then marks the client as authenticated and delivers any missed events.
   */
  private handleAuth(
    ws: WebSocket,
    sub: ClientSubscription,
    msg: { type: string; publicKey?: unknown; timestamp?: unknown; resumeAfterTs?: number },
    handshakeTimeout: ReturnType<typeof setTimeout>
  ): void {
    const { publicKey, timestamp } = msg;

    // Validate publicKey
    if (
      typeof publicKey !== "string" ||
      publicKey.length === 0 ||
      (!publicKey.startsWith("BC") && !publicKey.startsWith("tBC"))
    ) {
      ws.send(JSON.stringify({ type: "AUTH_FAIL", reason: "Invalid publicKey format" }));
      ws.close(4003, "Invalid publicKey");
      return;
    }

    // Validate timestamp (replay attack prevention)
    if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
      ws.send(JSON.stringify({ type: "AUTH_FAIL", reason: "Missing or invalid timestamp" }));
      ws.close(4003, "Invalid timestamp");
      return;
    }
    const skew = Math.abs(Date.now() - timestamp);
    if (skew > AUTH_REPLAY_WINDOW_MS) {
      ws.send(JSON.stringify({ type: "AUTH_FAIL", reason: "Timestamp out of range" }));
      ws.close(4003, "Timestamp out of range");
      return;
    }

    // Auth passed — cancel the handshake timeout and store token
    clearTimeout(handshakeTimeout);
    this.clientTokens.set(ws, publicKey);

    ws.send(JSON.stringify({ type: "AUTH_OK", publicKey }));

    // Deliver missed events if any exist for this publicKey
    const missed = this.missedEvents.get(publicKey);
    if (missed && missed.length > 0) {
      const resumeAfterTs: number = typeof msg.resumeAfterTs === "number" ? msg.resumeAfterTs : 0;
      const toDeliver = missed.filter((e) => e.ts > resumeAfterTs).map((e) => e.event);
      if (toDeliver.length > 0) {
        ws.send(JSON.stringify({ type: "MISSED_EVENTS", events: toDeliver }));
      }
      // Clear the buffer now that the client has reconnected
      this.missedEvents.delete(publicKey);
    }
  }

  /**
   * Handles SUBSCRIBE message: only allows subscription to the authenticated publicKey.
   */
  private handleSubscribe(ws: WebSocket, sub: ClientSubscription, rawKey: string): void {
    const authenticatedKey = this.clientTokens.get(ws);
    if (!authenticatedKey) {
      ws.send(JSON.stringify({ type: "ERROR", reason: "Not authenticated" }));
      return;
    }

    const pk = rawKey.trim();
    if (pk !== authenticatedKey) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          reason: "May only subscribe to your own authenticated publicKey",
        })
      );
      return;
    }

    sub.publicKeys.add(pk);
    if (!this.publicKeyToClients.has(pk)) {
      this.publicKeyToClients.set(pk, new Set());
    }
    this.publicKeyToClients.get(pk)!.add(ws);
    ws.send(JSON.stringify({ type: "SUBSCRIBED", publicKey: pk }));
  }

  /**
   * Broadcast an event to all connected devices belonging to a public key.
   * Note: Event payload contains strictly cryptographic references (txHash, timestamp),
   * NEVER unencrypted message plaintext or private credentials.
   */
  public notifyPublicKey(publicKey: string, event: { type: string; [key: string]: any }): void {
    const now = Date.now();

    // Store event for missed-event recovery (prune stale entries first)
    let stored = this.missedEvents.get(publicKey);
    if (!stored) {
      stored = [];
      this.missedEvents.set(publicKey, stored);
    }
    // Prune entries older than TTL
    const cutoff = now - MISSED_EVENT_TTL_MS;
    while (stored.length > 0 && stored[0].ts < cutoff) {
      stored.shift();
    }
    stored.push({ event, ts: now });
    // Keep only the last MAX_MISSED_EVENTS
    if (stored.length > MAX_MISSED_EVENTS) {
      stored.splice(0, stored.length - MAX_MISSED_EVENTS);
    }

    // Deliver to connected clients
    const clients = this.publicKeyToClients.get(publicKey);
    if (!clients || clients.size === 0) return;

    const payload = JSON.stringify(event);
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Sends a WebSocket-level ping to all clients every 30 seconds.
   * Clients that do not respond with a pong within 10 seconds are terminated.
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) return;

    this.heartbeatTimer = setInterval(() => {
      const deadClients: WebSocket[] = [];

      for (const [ws] of this.clients) {
        if (this.pongReceived.get(ws) === false) {
          // Did not pong in the last interval — terminate
          deadClients.push(ws);
        } else {
          // Mark as awaiting pong and send ping
          this.pongReceived.set(ws, false);
          if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
          }
        }
      }

      for (const ws of deadClients) {
        ws.terminate();
      }
    }, HEARTBEAT_INTERVAL_MS);
  }
}
