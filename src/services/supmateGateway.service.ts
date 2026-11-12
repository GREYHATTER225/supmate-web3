/**
 * Supmate Real-Time Gateway Client
 * Connects to the local/hosted Supmate Gateway via WebSocket for instant push notifications
 * of new encrypted messages and block events, eliminating aggressive HTTP polling.
 */

type MessageHandler = (event: any) => void;

/** Exponential backoff configuration */
const BACKOFF_INITIAL_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;
/** After this many consecutive failures, stop reconnecting until connect() is called explicitly. */
const MAX_RECONNECT_ATTEMPTS = 5;

export class SupmateGatewayService {
  private static instance: SupmateGatewayService;
  private ws: WebSocket | null = null;
  private activePublicKey: string | null = null;
  private listeners = new Set<MessageHandler>();
  private reconnectTimer: any = null;

  /** Exponential backoff state */
  private reconnectDelay = BACKOFF_INITIAL_MS;

  /** Tracks the timestamp of the last received event for missed-event recovery on reconnect. */
  private lastEventTimestamp = 0;

  /** Sequence counter for missed events (incremented on each received event). */
  private missedSinceSeq = 0;

  /** Current connection state. */
  private _connectionStatus: "connected" | "connecting" | "disconnected" = "disconnected";

  /** Consecutive reconnect failure counter. Resets on successful open. */
  private reconnectAttempts = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): SupmateGatewayService {
    if (!this.instance) {
      this.instance = new SupmateGatewayService();
    }
    return this.instance;
  }

  /** Returns the current WebSocket connection status. */
  public get connectionStatus(): "connected" | "connecting" | "disconnected" {
    return this._connectionStatus;
  }

  public connect(publicKey?: string): void {
    if (publicKey) {
      this.activePublicKey = publicKey;
    }

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this._connectionStatus = "connecting";

    try {
      const gatewayWsUrl = process.env.REACT_APP_GATEWAY_WS_URL || "ws://localhost:5000/ws";
      this.ws = new WebSocket(gatewayWsUrl);

      this.ws.onopen = () => {
        this._connectionStatus = "connected";
        // Reset backoff and failure counter on successful connection
        this.reconnectDelay = BACKOFF_INITIAL_MS;
        this.reconnectAttempts = 0;

        if (this.activePublicKey) {
          // Send AUTH first; server will then expect SUBSCRIBE after AUTH_OK
          this.ws?.send(
            JSON.stringify({
              type: "AUTH",
              publicKey: this.activePublicKey,
              timestamp: Date.now(),
              resumeAfterTs: this.lastEventTimestamp,
            })
          );
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);

          // Handle AUTH_OK: now safe to subscribe
          if (data.type === "AUTH_OK") {
            if (this.activePublicKey) {
              this.ws?.send(
                JSON.stringify({ type: "SUBSCRIBE", publicKey: this.activePublicKey })
              );
            }
            return; // Don't forward AUTH_OK to listeners
          }

          // Handle MISSED_EVENTS: replay through all listeners
          if (data.type === "MISSED_EVENTS" && Array.isArray(data.events)) {
            for (const missedEvent of data.events) {
              // Update timestamp tracking
              if (typeof missedEvent.timestamp === "number") {
                if (missedEvent.timestamp > this.lastEventTimestamp) {
                  this.lastEventTimestamp = missedEvent.timestamp;
                }
              }
              this.missedSinceSeq++;
              for (const listener of this.listeners) {
                listener(missedEvent);
              }
            }
            return;
          }

          // Track timestamp for all other events
          if (typeof data.timestamp === "number" && data.timestamp > this.lastEventTimestamp) {
            this.lastEventTimestamp = data.timestamp;
          }
          this.missedSinceSeq++;

          for (const listener of this.listeners) {
            listener(data);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this._connectionStatus = "disconnected";
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this._connectionStatus = "disconnected";
      };
    } catch {
      this._connectionStatus = "disconnected";
      this.scheduleReconnect();
    }
  }

  /**
   * Schedules a reconnect with exponential backoff.
   * Delay starts at 1s, doubles on each failure, and is capped at 30s.
   * After MAX_RECONNECT_ATTEMPTS consecutive failures the loop stops to
   * avoid spamming ERR_CONNECTION_REFUSED in the browser console.
   * The loop resets automatically when connect() establishes a connection.
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;

    if (this.reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
      if (this.reconnectAttempts === MAX_RECONNECT_ATTEMPTS + 1) {
        // Log once so the developer knows why reconnects stopped.
        console.info(
          "[Supmate] Real-time gateway unavailable after " +
            MAX_RECONNECT_ATTEMPTS +
            " attempts. Messages will sync via blockchain polling. " +
            "Start the gateway server (`npm run server:dev`) to enable push notifications."
        );
      }
      return; // No more automatic reconnects — stop console spam.
    }

    const delay = this.reconnectDelay;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, BACKOFF_MAX_MS);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.activePublicKey) {
        this.connect();
      }
    }, delay);
  }

  public subscribeToMessages(handler: MessageHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.activePublicKey = null;
    this._connectionStatus = "disconnected";
    // Reset backoff and attempt counter when intentionally disconnecting
    this.reconnectDelay = BACKOFF_INITIAL_MS;
    this.reconnectAttempts = 0;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Notify gateway that a message was broadcast on-chain so the recipient's clients update instantly.
   */
  public async notifyRecipient(
    recipientPublicKey: string,
    senderPublicKey: string,
    txnHashHex: string
  ): Promise<void> {
    try {
      const gatewayHttpUrl =
        process.env.REACT_APP_GATEWAY_HTTP_URL || "http://localhost:5000";
      await fetch(`${gatewayHttpUrl}/api/notifications/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPublicKey,
          senderPublicKey,
          txnHashHex,
          timestamp: Date.now(),
        }),
      });
    } catch {
      // Non-critical: recipient will still receive message via next on-chain poll
    }
  }
}
