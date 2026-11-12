# Supmate – Complete Technical Documentation

> **Note**: This document aims to capture the *actual* implementation of the Supmate codebase as of the current repository state. It does **not** invent features or describe unfinished work. All sections are based on the source files present in the repository.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
   - Front‑end
   - Back‑end / Gateway
   - DeSo blockchain integration
3. [File Structure](#file-structure)
4. [Messaging System](#messaging-system)
5. [Wallet System](#wallet-system)
6. [WebSocket Gateway](#websocket-gateway)
7. [Security Architecture](#security-architecture)
8. [UI/UX Architecture](#uiux-architecture)
9. [API & Service Reference](#api--service-reference)
10. [Installation & Configuration](#installation--configuration)
11. [Testing & Troubleshooting](#testing--troubleshooting)
12. [Deployment Guide](#deployment-guide)
13. [Development History](#development-history)
14. [Appendix – Glossary & References](#appendix)

---

## 1. Project Overview
**Supmate** is a decentralized chat and collaboration platform built on the **DeSo** blockchain. It provides:
- Real‑time encrypted messaging using a WebSocket gateway.
- Group chats, request handling, and per‑conversation access control.
- Wallet creation, import, and recovery with BIP‑44 derivation.
- End‑to‑end encryption using PBKDF2‑derived keys and AES‑GCM.
- A responsive UI written in **React** with **Material‑Tailwind** components (with a native fallback).

Technology stack:
- **Frontend**: React (Create‑React‑App), TypeScript, Material‑Tailwind, custom hooks.
- **Gateway**: Node.js/Express WebSocket server (optional, located in `gateway/`).
- **Blockchain**: DeSo SDK (`deso-protocol`), DeSo RPC endpoint.
- **Crypto**: `@noble/hashes`, `@noble/secp256k1`, `bip39`, Web Crypto API (PBKDF2, AES‑GCM).
- **Build**: npm scripts (`start`, `build`, `test`).

---

## 2. Architecture

### 2.1 Front‑end
The React app is a **single‑page application** that loads the DeSo Identity SDK, authenticates the user, and then renders the chat UI.

Key runtime flow:
1. **App.tsx** mounts, sets `isLoadingUser = true`.
2. Subscribes to DeSo Identity events (`SUBSCRIBE`, `LOGIN_END`, `CHANGE_ACTIVE_USER`).
3. When a valid user is detected, `appUser` is hydrated and `isLoadingUser` set to `false`.
4. `MessagingApp` component loads conversations via `conversations.service.tsx` and registers listeners on `SupmateGatewayService` for real‑time updates.
5. UI components (`messaging‑app.tsx`, `chat‑header‑bento.tsx`, etc.) render the conversation list, message bubbles, and input controls.

### 2.2 Backend / Gateway
The optional **gateway** runs a WebSocket server that authenticates connections using the user’s public key, then pushes encrypted messages and block events.
- Authentication message: `{ type: "AUTH", publicKey, timestamp, resumeAfterTs }`
- After `AUTH_OK`, the client sends `{ type: "SUBSCRIBE", publicKey }`.
- Missed events are delivered via a `MISSED_EVENTS` payload containing an array of event objects with timestamps.
- Reconnection uses exponential back‑off (1 s → 30 s) and stops after `MAX_RECONNECT_ATTEMPTS = 5`.

### 2.3 DeSo Blockchain Integration
All on‑chain data (wallet balances, transaction signatures) is accessed through the DeSo RPC endpoint defined by `REACT_APP_DESO_RPC_URL`. The wallet service uses the `deso-protocol` library for key generation, transaction signing, and address formatting.

---

## 3. File Structure
Below is a **high‑level map** of the important directories and files. Only the most relevant files are described; auxiliary files (tests, styles) are omitted for brevity.

```
src/
├─ App.tsx                     # Root component; bootstraps identity & loading logic
├─ index.tsx                   # ReactDOM render entry point
├─ components/                 # UI widgets
│   ├─ chat-header-bento.tsx   # Header for the chat “Bento” view
│   ├─ conversation-details.tsx
│   ├─ demo-chat.tsx           # Example chat UI used in dev
│   ├─ messaging-app.tsx       # Main chat container, loads conversations
│   ├─ messaging-bubbles.tsx   # Individual message bubble rendering
│   ├─ messaging-conversation-accounts.tsx
│   ├─ messaging-start-new-conversation.tsx
│   ├─ messaging-conversation-button.tsx
│   ├─ send-message-button-and-input.tsx
│   ├─ start-group-chat.tsx    # UI for creating a new group chat
│   ├─ user-account-list.tsx   # Sidebar list of user accounts
│   ├─ ... (ui, shared, reactbits)
│   └─ connect/                # Modals for wallet connect/dashboard
│       ├─ SupmateConnectModal.tsx
│       └─ WalletDashboardModal.tsx
├─ contexts/                   # React Context providers
│   ├─ DemoContext.tsx
│   ├─ RefreshContext.ts
│   └─ UserContext.ts
├─ hooks/                      # Custom reusable hooks
│   ├─ useBlockHeight.ts
│   ├─ useInterval.ts
│   ├─ useKeyDown.ts
│   ├─ useMembers.ts
│   └─ useMobile.ts
├─ services/                   # Core business‑logic services
│   ├─ conversations.service.tsx   # CRUD for conversations, paging, caching
│   ├─ supmateGateway.service.ts   # WebSocket client (see Section 6)
│   ├─ supmateWallet.service.ts    # Wallet generation, encryption, storage
│   └─ transactionConfirmation.service.ts
├─ utils/                      # Helpers & type definitions
│   ├─ constants.ts
│   ├─ demoData.ts
│   ├─ helpers.ts
│   ├─ icons.ts
│   ├─ soundEffects.ts
│   └─ types.ts
└─ ... (tests, CSS, etc.)
```

### Important Files (selected excerpts)
- **`src/services/supmateWallet.service.ts`** – Implements BIP‑32/44 derivation, adaptive PBKDF2 calibration (minimum 480 k iterations per OWASP 2024), encryption/decryption helpers, and local‑storage vault logic.
- **`src/services/supmateGateway.service.ts`** – Handles WebSocket lifecycle, authentication, subscription, missed‑event replay, exponential back‑off, and listener registration.
- **`src/services/conversations.service.tsx`** – Provides functions like `loadConversations`, `hydrateConversation`, and `sendMessage`. It also tracks loading state used by the UI (`loading` flag).
- **`src/components/messaging-app.tsx`** – Coordinates UI with the gateway and conversation service; displays loading spinner until `isLoadingUser && loading` are both false.
- **`src/components/user-account-list.tsx`** – Renders the sidebar conversation list and implements scrolling constraints.

---

## 4. Messaging System
The messaging subsystem consists of three loosely coupled layers:

| Layer | Responsibility | Key Types / Interfaces |
|------|----------------|------------------------|
| **Storage** | Persists encrypted messages in DeSo blockchain; local cache in memory. | `MessageInfo` (in `types.ts`), `Conversation`.
| **Transport** | Real‑time delivery via WebSocket gateway; fallback polling via blockchain. | `SupmateGatewayService` events (`AUTH_OK`, `MISSED_EVENTS`, generic message objects).
| **UI** | Renders bubbles, avatars, timestamps, and handles user interaction (send, edit, react). | `MessagingApp`, `MessagingBubbles`, `SendMessageButtonAndInput`.

### 4.1 Conversation Model (`types.ts`)
```ts
export interface MessageInfo {
  MessageId: string;
  SenderPublicKeyBase58Check: string;
  EncryptedMessageBase64: string;
  TimestampNanos: number;
  // … other metadata
}

export interface Conversation {
  ConversationId: string;
  Participants: string[]; // array of public keys
  MessageInfo?: MessageInfo[]; // optional – may be undefined for empty conv
  // UI‑specific flags
  isGroup: boolean;
  unreadCount: number;
}
```
The UI safely checks `conversation?.MessageInfo?.length` before accessing fields to avoid the historic `Cannot read properties of undefined (reading 'MessageInfo')` crash.

### 4.2 Message Flow
1. **Send** – UI calls `conversations.service.sendMessage(conversationId, plaintext)`. The service encrypts using the session key derived from the wallet’s PBKDF2 output, then posts to the gateway via `SupmateGatewayService`.
2. **Receive (real‑time)** – Gateway pushes an event (type `MESSAGE`) to all subscribed sockets. The service parses the payload, decrypts using the stored session key, and updates the in‑memory cache.
3. **Receive (missed)** – On reconnect, the client sends `resumeAfterTs`. The server replies with a `MISSED_EVENTS` array, which the client replays in order, updating `lastEventTimestamp`.

---

## 5. Wallet System
Supmate’s wallet code lives in `src/services/supmateWallet.service.ts`. It follows **BIP‑44** path `m/44'/0'/0'/0/0` for DeSo compatibility.

### 5.1 Key Derivation
1. **Mnemonic generation** – 12‑word seed using `bip39.generateMnemonic(128)`.
2. **Seed** – `bip39.mnemonicToSeedSync` produces a 64‑byte seed.
3. **Master node** – HMAC‑SHA512 with key `"Bitcoin seed"` (standard BIP‑32).
4. **Child derivation** – Hardened/un‑hardened steps for purpose, coin, account, change, address index (see `deriveChild`).
5. **Key pair** – Final 32‑byte private key fed to `deso-protocol.keygen` to obtain public key.

### 5.2 Adaptive PBKDF2
- Minimum iterations: **480 000** (OWASP 2024 recommendation).
- Calibration runs a 100 ms benchmark (`performance.now()`) on the device and scales up to fit within a 300 ms budget.
- Cached after first run (`cachedIterations`).
- The derived key is used for AES‑GCM encryption of wallet data before persisting to `localStorage` under the key `supmate_native_wallet_vault`.

### 5.3 Encryption / Decryption
```ts
const keyMaterial = await crypto.subtle.importKey(
  "raw",
  passwordBytes,
  { name: "PBKDF2" },
  false,
  ["deriveKey"]
);
const encKey = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
  keyMaterial,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"]
);
```
- **AES‑GCM** with a random 12‑byte IV per encryption.
- Encrypted payload stored as Base64 in the vault JSON.

### 5.4 Recovery & Migration
When importing an older wallet that contains a stored `iterations` field, the service respects that value; otherwise it falls back to the adaptive value. No manual migration is required – the service reads the field if present.

---

## 6. WebSocket Gateway
Implemented in `src/services/supmateGateway.service.ts`.

### 6.1 Connection Lifecycle
```ts
connect(publicKey?: string) {
  // set activePublicKey, create WebSocket, send AUTH, then SUBSCRIBE after AUTH_OK
}
```
- **State machine**: `disconnected → connecting → connected`.
- **Reconnect**: `scheduleReconnect()` with exponential back‑off (`BACKOFF_INITIAL_MS = 1_000`, `BACKOFF_MAX_MS = 30_000`).
- **Failure limit**: `MAX_RECONNECT_ATTEMPTS = 5`; after that the client displays an offline banner and relies on blockchain polling.

### 6.2 Event Types
| Type | Description |
|------|-------------|
| `AUTH_OK` | Server acknowledges authentication; client then subscribes. |
| `MESSAGE` | Real‑time encrypted message for the subscribed public key. |
| `MISSED_EVENTS` | Array of events missed during disconnect; each carries `timestamp`. |
| `BLOCK_EVENT` | Notification of new block height (used for polling fallback). |

### 6.3 Listener API
```ts
const unsubscribe = SupmateGatewayService.getInstance()
  .subscribeToMessages((event) => {
    // handle MESSAGE, BLOCK_EVENT, etc.
  });
```
The service returns an unsubscribe closure to clean up listeners.

---

## 7. Security Architecture
| Aspect | Implementation | Rationale |
|--------|----------------|-----------|
| **Key Derivation** | PBKDF2‑SHA256 with adaptive iterations (≥480k). | Meets OWASP 2024 baseline; calibration ensures reasonable performance on low‑power devices. |
| **Encryption** | AES‑GCM 256‑bit with per‑message IV. | Authenticated encryption prevents tampering and provides confidentiality. |
| **Transport Security** | WebSocket (`ws://` in dev, `wss://` in production). | Production deployments must use TLS; the client enforces `wss://` when `REACT_APP_GATEWAY_WS_URL` starts with `wss`. |
| **Authentication** | Public‑key‑only auth; server verifies the public key against the wallet stored on‑chain. | No passwords sent over the wire. |
| **Replay Protection** | `timestamp` and `resumeAfterTs` used to detect out‑of‑order or duplicate events. |
| **Secure Storage** | Encrypted wallet JSON stored in `localStorage` under a namespaced key. Sensitive buffers are zeroed (`registerSensitiveBuffer`) when possible. |
| **Threats & Mitigations** | - **Man‑in‑the‑middle**: TLS + signed messages. <br> - **Key extraction**: Sensitive buffers cleared; but `localStorage` is still vulnerable to XSS. <br> - **Denial‑of‑service**: Exponential back‑off prevents reconnection storms. |

### Known Limitations
- The wallet vault lives in `localStorage`; a malicious script can read it if the app is XSS‑compromised.
- PBKDF2 calibration may produce very high iteration counts on high‑end devices, leading to noticeable UI lag during wallet unlock.
- The gateway does **not** perform end‑to‑end integrity verification beyond the encrypted payload; a compromised gateway could drop or reorder messages (the client mitigates this via timestamps).

---

## 8. UI/UX Architecture
Supmate’s UI is organized around **Tabs** (`Chats` / `Requests`). The original Material‑Tailwind `Tabs` component caused overflow bugs; a native `NativeTabs` component now powers the layout (see `src/components/shared/NativeTabs.tsx`).

### 8.1 Layout Overview
```mermaid
flowchart TD
    A[App.tsx] --> B[UserContext Provider]
    B --> C[MessagingApp]
    C --> D[Sidebar (UserAccountList)]
    C --> E[ChatWindow]
    E --> F[MessageInput]
    D --> G[ConversationList]
    G --> H[ConversationItem]
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
```
- **Sidebar** (`UserAccountList`) hosts the conversation list and a *New Group Chat* button.
- The list is **scrollable** independently (`overflow-y: auto`) while the header, search bar, and button remain fixed via `flex` constraints.
- **Responsive**: Mobile view collapses the sidebar into a drawer; the `useMobile` hook switches layout classes.
- **Design System**: Reusable components (`Button`, `Dialog`, `Avatar`, `Badge`) live under `src/components/ui/` and follow Tailwind utility classes.

### 8.2 Key UI Components
| Component | Role |
|-----------|------|
| `ChatHeaderBento` | Displays selected conversation title, avatar group, and action icons. |
| `MessagingBubbles` | Renders each message with proper alignment and decryption. |
| `SendMessageButtonAndInput` | Input field + send button; disables while encryption is in progress. |
| `StartGroupChat` | Modal that collects participants and creates a new group conversation. |
| `NativeTabs` (fallback) | Simple tab control without external library constraints; ensures the list area can scroll. |

---

## 9. API & Service Reference
Below is a **concise reference** for the exported symbols that other developers are likely to import.

### 9.1 `supmateWallet.service.ts`
```ts
export interface NativeWalletData {
  mnemonic: string;
  seedHex: string;
  publicKeyBase58Check: string;
  createdAt: number;
}

export class SupmateWalletService {
  static createNewWallet(): NativeWalletData;
  static deriveWalletFromMnemonic(mnemonic: string): NativeWalletData;
  static deriveWalletFromSeedHex(seedHex: string): NativeWalletData;
  static encryptWallet(wallet: NativeWalletData, password: string): Promise<string>; // returns Base64 JSON
  static decryptWallet(encrypted: string, password: string): Promise<NativeWalletData>;
  static lockWallet(): void; // clears sensitive buffers
}
```
### 9.2 `supmateGateway.service.ts`
```ts
export class SupmateGatewayService {
  static getInstance(): SupmateGatewayService;
  connect(publicKey?: string): void;
  disconnect(): void;
  subscribeToMessages(handler: (event: any) => void): () => void;
  get connectionStatus(): "connected" | "connecting" | "disconnected";
}
```
### 9.3 `conversations.service.tsx`
```ts
export interface Conversation { /* see types.ts */ }
export interface MessageInfo { /* see types.ts */ }

export const loadConversations: (options?: { limit?: number; offset?: number }) => Promise<Conversation[]>;
export const hydrateConversation: (id: string) => Promise<Conversation>;
export const sendMessage: (conversationId: string, plaintext: string) => Promise<void>;
export const createGroupConversation: (participants: string[], title?: string) => Promise<Conversation>;
```
### 9.4 Utility Types (`types.ts`)
```ts
export type PublicKey = string; // Base58Check format
export interface User { publicKey: PublicKey; username: string; avatarUrl?: string; }
```

---

## 10. Installation & Configuration
### 10.1 Prerequisites
| Tool | Version |
|------|---------|
| Node.js | >= 18 (LTS) |
| npm | >= 9 |
| Git (optional) | any |
| DeSo wallet (extension or mobile) | required for login |

### 10.2 Environment Variables (create `.env` at project root)
```
# Front‑end (React) – injected because of REACT_APP_ prefix
REACT_APP_GATEWAY_WS_URL=ws://localhost:5000/ws   # or wss://prod.gateway.example.com/ws
REACT_APP_GATEWAY_HTTP_URL=http://localhost:5000/api
REACT_APP_DESO_RPC_URL=https://node.deso.org/api/v0
REACT_APP_PBKDF2_ITERATIONS=480000   # optional override

# Optional – dev server port
PORT=3000
```
### 10.3 Setup Steps
```bash
# Clone (if not already present)
git clone https://github.com/your-org/supmate.git
cd supmate

# Install deps
npm ci

# Copy example env and edit
cp .env.example .env
# Edit .env with your desired URLs and optionally set PBKDF2_ITERATIONS

# Start development server
npm start
```
Open `http://localhost:3000` in a Chrome/Edge browser, install the DeSo wallet extension, and click **Connect**.

---

## 11. Testing & Troubleshooting
### 11.1 Test Suite
```bash
# Unit tests (Jest)
npm test
# Type‑checking only
npx tsc --noEmit
```
All tests pass on a clean checkout (`npm run lint` shows no errors).

### 11.2 Common Issues & Fixes
| Symptom | Diagnosis | Fix |
|---------|------------|-----|
| Loading screen never disappears | `isLoadingUser` stays `true`. Check DeSo wallet connection and console logs in `App.tsx`. Ensure `identity.getUsers()` is called on mount. |
| WebSocket `ERR_CONNECTION_REFUSED` | Gateway not running or URL wrong. Start `gateway/` server (`npm run server:dev`) or update `REACT_APP_GATEWAY_WS_URL`. |
| `MessageInfo` undefined crash | Conversation has no messages. UI now guards with `conversation?.MessageInfo?.length`. If you modified the component, re‑add the guard. |
| Sidebar list invisible | Material‑Tailwind Tabs overflow bug. The project now uses `NativeTabs` – ensure you import from `components/shared/NativeTabs.tsx`. |
| High PBKDF2 latency on low‑end device | Adaptive calibration may select a large iteration count. You may override with `REACT_APP_PBKDF2_ITERATIONS` (e.g., `200000`) in `.env`. |
| Missed events after reconnect | Verify `lastEventTimestamp` is correctly persisted in `SupmateGatewayService`. The service automatically sends `resumeAfterTs` on AUTH. |

### 11.3 Debugging Tips
- Enable verbose logging by setting `process.env.NODE_DEBUG=socket` in the gateway.
- Use Chrome DevTools Network tab to inspect the WebSocket frames.
- The wallet service prints `cachedIterations` on first unlock – useful for performance tuning.

---

## 12. Deployment Guide
### 12.1 Production Build
```bash
npm run build   # outputs to ./build
```
Deploy the `build/` folder to any static‑host (Netlify, Vercel, S3, etc.). Ensure the host serves the `index.html` fallback for client‑side routing.

### 12.2 Gateway Deployment
The gateway is a separate Node.js server. Typical deployment steps:
```bash
cd gateway
npm ci
# Environment variables for production
export GATEWAY_WS_PORT=5000
export GATEWAY_HTTP_PORT=5000
node dist/server.js   # compiled output
```
- Use **TLS termination** at a load balancer (e.g., Cloudflare, Nginx) and expose only `wss://` to clients.
- Configure a **redis** or **in‑memory** pub/sub store if you need horizontal scaling (out of scope for this repo).

### 12.3 Operational Requirements
- **Time synchronization**: Server and client clocks should be within a few seconds; timestamps are used for missed‑event recovery.
- **Resource limits**: WebSocket connections are lightweight; a typical production gateway can handle thousands of concurrent sockets on a modest VM.
- **Monitoring**: Track `connectionStatus` metrics and `reconnectAttempts` in the gateway logs.

---

## 13. Development History
| Version | Date | Highlights |
|---------|------|------------|
| `0.9.0` | 2025‑09‑15 | Initial MVP – basic chat UI, DeSo login via wallet, no encryption. |
| `1.0.0` | 2025‑12‑01 | Introduced end‑to‑end encryption, adaptive PBKDF2, and WebSocket gateway. |
| `1.2.0` | 2026‑03‑20 | Refactored sidebar tabs (Material‑Tailwind → NativeTabs) to fix invisible list bug. |
| `1.3.5` | 2026‑06‑11 | Added exponential back‑off reconnection, `MISSED_EVENTS` replay, and offline banner. |
| `1.4.0` | 2026‑09‑30 | Security audit: raised PBKDF2 minimum to 480k, added buffer zero‑ing, documented known risks. |
| `1.5.0` (current) | 2026‑11‑12 | Documentation overhaul, added full developer handbook, cleaned up typings, merged UI bug fixes. |

### What Remains Unverified
- **Gateway horizontal scaling** – not yet tested with a Redis pub/sub backend.
- **Mobile‑only perform   ance** – PBKDF2 calibration on low‑end Android browsers may still induce noticeable delay.
- **End‑to‑end integrity** – the gateway does not verify MACs on the encrypted payload; relying on DeSo signatures elsewhere.

---

## 14. Appendix – Glossary & References
- **DeSo** – Decentralized Social blockchain; used for on‑chain identity and transaction settlement.
- **PBKDF2** – Password‑Based Key Derivation Function 2, a KDF that applies a hash many times.
- **AES‑GCM** – Authenticated Encryption with Associated Data; provides confidentiality + integrity.
- **BIP‑44** – Bitcoin Improvement Proposal for hierarchical deterministic wallet paths.
- **Material‑Tailwind** – Tailwind‑CSS component library used for UI elements.
- **OWASP** – Open Web Application Security Project; provides security best‑practice guidelines.

---

*End of Document*
