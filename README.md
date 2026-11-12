# Supmate — Decentralized Web3 Messaging

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.2-%2338B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![DeSo Protocol](https://img.shields.io/badge/DeSo%20Protocol-2.6.4-FF3E00?logo=blockchain)](https://deso.org/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](#license)

---

## ✨ Hero

<div align="center">
<p>
  <img src="./public/assets/demoimages/chatui.png" alt="Supmate chat UI" width="720"/>
</p>
<h1>Supmate</h1>
<h3>Secure, sovereign, and real‑time Web3 chat</h3>
<p>
  A React‑based messenger built on the <strong>DeSo blockchain</strong>. Users authenticate with a DeSo wallet, messages are encrypted on‑device, and a lightweight WebSocket gateway delivers them instantly.
</p>
</div>

---

## 📖 About the Project

Supmate is a **portfolio‑ready** web application that showcases how decentralized identity and on‑chain data can power a modern messaging experience.

* **Sovereign login** – users sign in using any DeSo wallet (browser extension, mobile app, or hardware).
* **End‑to‑end encryption** – when the recipient has a messaging access group, the message is encrypted client‑side with a PBKDF2‑derived key and stored on‑chain; otherwise the UI offers an explicit *unencrypted* fallback.
* **Real‑time delivery** – a tiny Express + `ws` gateway relays new messages via WebSocket, handling reconnection and exponential back‑off.
* **Fully responsive UI** – Tailwind‑CSS and custom components give a desktop‑first layout that collapses gracefully to mobile.
* **Demo mode** – a built‑in mock environment (`DemoContext`) lets you explore UI flows without a wallet.

The codebase is deliberately split into **frontend** (`src/`) and **backend gateway** (`server/`). Both can be built and deployed independently.

---

## 🛠️ Feature Overview

| Feature | Implementation Detail |
|---|---|
| **DeSo wallet authentication** | Uses `deso-protocol` SDK (`identity.getUsers`, `identity.login`). |
| **Encrypted DM & group messaging** | `encryptAndSendNewMessage` encrypts via `identity.encryptMessage`; decryption via `identity.decryptMessage`. |
| **Fallback to plaintext** | When the recipient lacks a messaging key the UI prompts the user; the message is sent as hex‑encoded bytes with `unencrypted=true` extra data. |
| **WebSocket gateway** | `server/src/services/websocketRelay.ts` runs an Express server (`/ws`) that forwards `newMessage` events to connected clients. |
| **Group chats** | Access groups are fetched with `getAllAccessGroups`; group messages are handled the same way as DMs, distinguished by `ChatType.GROUP`. |
| **Conversation list & unread tracking** | `MessagingApp` maintains a `lastSeenNanosRef` map; UI highlights unread threads. |
| **Demo mode** | `DemoContext` provides static `DEMO_CONVERSATIONS` and `DEMO_MEMBERS` for UI prototyping. |
| **Responsive layout** | Tailwind breakpoints + `useMobile` hook; UI components adapt to < 640 px width. |
| **Sound effects & UI polish** | `playClickSound`, `playReceiveSound`, `AnimatedList`, `CrystalizedBall` components. |
| **Lint & format** | ESLint (`npm run lint`) with 4 unused‑code warnings; Prettier auto‑formatting. |
| **Testing** | Jest test runner (`npm test`) and TypeScript `--noEmit` checks. |

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Frontend [Supmate React App]
        A[User Interface] --> B[DeSo Identity SDK]
        B --> C[Conversation Service]
        C --> D[WebSocket Gateway (ws://…)]
        C --> E[DeSo RPC (https://node.deso.org/api/v0)]
    end
    subgraph Backend [Express WebSocket Relay]
        D --> F[ws Server]
        F --> G[Broadcast to connected clients]
    end
    style Frontend fill:#2d2d2d,color:#fff
    style Backend fill:#1e3a5f,color:#fff
```

* **Frontend** – built with CRA, TypeScript, Tailwind. All crypto happens in the browser; no secrets leave the client.
* **Backend gateway** – thin Express wrapper that only proxies WebSocket messages; it does **not** hold private keys.
* **DeSo RPC** – read‑only endpoints used for fetching user profiles, access groups, and message threads.

---

## 🧩 Project Structure

```
Supmate/
├─ public/                     # static assets, index.html
│   └─ assets/
│       ├─ demo/                # built demo assets (icons, screenshots)
│       └─ demoimages/          # UI screenshots used in the README
├─ src/                        # React source
│   ├─ components/             # UI components (chat bubbles, dialogs, etc.)
│   ├─ contexts/               # React contexts (User, Demo, Refresh)
│   ├─ hooks/                  # custom hooks (useInterval, useMobile…)
│   ├─ services/               # API wrappers (conversations, gateway, tx confirmations)
│   └─ utils/                  # constants, helpers, type definitions
├─ server/                     # lightweight Express + WS gateway
│   ├─ src/
│   │   ├─ routes/            # health, notifications endpoints
│   │   └─ services/          # websocketRelay.ts
│   └─ dist/                  # compiled output (npm run server:build)
├─ .env.example                # template for required env vars
├─ DEVELOPER_HANDBOOK.md       # full technical handbook (linked from README)
├─ Dockerfile                  # optional container build
├─ package.json & lockfile
├─ tailwind.config.js
└─ README.md                   # ← this file
```

---

## ⚙️ Installation & Development

### Prerequisites

| Tool | Minimum version |
|------|-----------------|
| **Node.js** | 18 LTS |
| **npm** | 9.x |
| **DeSo wallet** | any (browser extension, mobile, or hardware) |

### Steps

```bash
# 1️⃣ Clone the repository (skip if you already have the code)
git clone https://github.com/GREYHATTER225/supmate-web3.git
cd supmate-web3

# 2️⃣ Install dependencies (uses the exact lockfile)
npm ci

# 3️⃣ Create a local .env file – copy the example and edit as needed
cp .env.example .env
#   Open .env and set the values you need (see section below).

# 4️⃣ Run the development server
npm start
```

The app will be reachable at **http://localhost:3000**. Open it, connect your DeSo wallet, and you should see the chat interface.

### Backend (optional) – WebSocket gateway

If you want to run the local gateway (useful for debugging or non‑production deployments):

```bash
cd server
npm ci               # install server deps
npm run dev           # starts Express + WS on http://localhost:5000
```

The frontend expects `REACT_APP_GATEWAY_WS_URL` to point at the gateway (default `ws://localhost:5000/ws`).

---

## 📦 Production Build & Deployment

```bash
# Build the static bundle (CRA will output to ./build)
npm run build
```

The `build/` directory can be served by **any static host** (Netlify, Vercel, GitHub Pages, traditional web server). Because Supmate also needs a WebSocket gateway for real‑time updates, you have two typical deployment patterns:

1. **Static‑only host + external gateway** – Deploy the frontend to Netlify/Vercel and point `REACT_APP_GATEWAY_WS_URL` to a hosted gateway (e.g., Railway, Render). This is the simplest production setup.
2. **Full‑stack container** – Build a Docker image that serves the static files (via `serve` or an Nginx container) *and* runs the Express gateway side‑by‑side. The provided `Dockerfile` demonstrates this pattern.

### Example: Vercel (static) + Railway (gateway)

1. Push the repo to GitHub.
2. Connect the repository to Vercel – Vercel automatically runs `npm install && npm run build`.
3. In Vercel ➜ Settings ➜ Environment Variables, add the same variables from `.env.example` (prefixed with `REACT_APP_`).
4. Deploy the gateway on Railway (choose the `server` folder, run `npm run server:dev`).
5. Set `REACT_APP_GATEWAY_WS_URL` in Vercel to the Railway WebSocket endpoint (e.g., `wss://my-supmate-gateway.up.railway.app/ws`).

---

## 🔐 Environment Variables

Only variables prefixed with `REACT_APP_` are embedded in the front‑end bundle. The backend uses its own `.env` (generated from `server/.env.example`).

| Variable | Scope | Description | Example |
|----------|-------|------------|---------|
| `REACT_APP_GATEWAY_WS_URL` | Frontend | WebSocket endpoint for real‑time messages. | `ws://localhost:5000/ws` |
| `REACT_APP_GATEWAY_HTTP_URL` | Frontend | Optional HTTP API of the gateway (used for health checks). | `http://localhost:5000/api` |
| `REACT_APP_DESO_RPC_URL` | Frontend | DeSo node RPC endpoint. | `https://node.deso.org/api/v0` |
| `REACT_APP_PBKDF2_ITERATIONS` | Frontend | PBKDF2 iteration count for key‑derivation (default **480000**). | `480000` |
| `PORT` | Frontend (optional) | Port used by `npm start`. | `3000` |
| `SERVER_PORT` | Backend | Port the Express gateway listens on. | `5000` |
| `SERVER_WS_PATH` | Backend | WS endpoint path (default `/ws`). | `/ws` |

Create a **`.env`** file at the project root (copy from `.env.example`) and list the keys you need. Do **not** commit real secrets.

---

## 🧪 Testing & Project Status

```bash
# Run the Jest test suite (currently minimal but passes)
npm test

# Type‑checking without emitting files
npx tsc --noEmit
```

* **Lint** – `npm run lint` yields **0 errors** and **4 warnings** (unused imports). They can be fixed safely after functional testing.
* **Build** – `npm run build` succeeds, producing a production‑ready static bundle.
* **Runtime** – Manual testing confirms:
  * Login / logout works with a DeSi wallet.
  * Direct messages and group chats display and update in real time.
  * Unencrypted fallback prompt appears when a recipient lacks a messaging key.
  * Mobile layout collapses correctly.
* **Known issues** – None critical; remaining ESLint warnings are cosmetic.

---

## 📈 Roadmap

- [ ] Resolve ESLint unused‑code warnings.
- [ ] Add unit tests for `conversations.service` and gateway.
- [ ] Implement message reactions (currently UI‑only).
- [ ] Provide a Docker Compose setup that runs both frontend and gateway together.
- [ ] Document CI/CD workflow (GitHub Actions) for automatic deployment.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your‑feature`).
3. Keep the TypeScript compiler and lint clean:
   ```bash
   npm run lint -- --fix
   npx tsc --noEmit
   ```
4. Write tests for any new logic.
5. Push your branch and open a Pull Request with a clear description.
6. Follow the existing code‑style (Prettier + ESLint).

---

## 📄 License

Supmate is released under the **MIT License**. See the `LICENSE` file for the full text.
