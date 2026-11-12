
# ⚡ Supmate — Decentralized Web3 Messaging

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.2-38B2AC?logo=tailwind-css)
![DeSo](https://img.shields.io/badge/DeSo-Protocol-FF3E00?logo=blockchain)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

### Your Space. Your Keys. Your Conversations.

**A sovereign Web3 messaging experience built on DeSo.**

Non-custodial identity · On-device encryption · Real-time messaging

</div>

---

# 📸 Supmate — Project Demo

Explore the Supmate interface through the screenshots below.

## 🖥️ Application Screenshots

<table>
<tr>
<td align="center" width="50%">
<img src="./public/assets/demoimages/chatui.png" width="100%" alt="Supmate Chat Interface"/>
<br/>
<b>💬 Chat Interface</b>
<br/>
<sub>Main messaging experience</sub>
</td>
<td align="center" width="50%">
<img src="./public/assets/demoimages/home.png" width="100%" alt="Supmate Home Screen"/>
<br/>
<b>🏠 Home Screen</b>
<br/>
<sub>Supmate application landing interface</sub>
</td>
</tr>

<tr>
<td align="center" width="50%">
<img src="./public/assets/demoimages/demoscreen.png" width="100%" alt="Supmate Demo Screen"/>
<br/>
<b>🎬 Demo Screen</b>
<br/>
<sub>Application demonstration</sub>
</td>
<td align="center" width="50%">
<img src="./public/assets/demoimages/infoui.png" width="100%" alt="Supmate Information Interface"/>
<br/>
<b>ℹ️ Information UI</b>
<br/>
<sub>Application information interface</sub>
</td>
</tr>

<tr>
<td align="center" width="50%">
<img src="./public/assets/demoimages/login.png" width="100%" alt="Supmate Login Interface"/>
<br/>
<b>🔐 Login Interface</b>
<br/>
<sub>Wallet authentication experience</sub>
</td>
<td align="center" width="50%">
<img src="./public/assets/demoimages/text%20send.png" width="100%" alt="Supmate Message Sending Interface"/>
<br/>
<b>📨 Message Sending</b>
<br/>
<sub>Messaging interface preview</sub>
</td>
</tr>
</table>

---

# 📖 About the Project

Supmate is a portfolio-ready Web3 messaging application demonstrating how decentralized identity and blockchain technology can support modern communication.

Built using React, TypeScript and the DeSo protocol, Supmate combines decentralized wallet authentication, messaging functionality and a real-time communication interface.

### ✨ Core Highlights

- **🔐 Decentralized authentication** — Users authenticate through DeSo wallet identity.
- **🔒 Message encryption** — Supports client-side message encryption through the DeSo identity SDK when messaging access is available.
- **💬 Direct messaging** — Supports individual conversations.
- **👥 Group messaging** — Supports group conversations using DeSo access groups.
- **⚡ Real-time updates** — A lightweight WebSocket gateway supports message event delivery.
- **🎨 Modern interface** — Responsive UI with interactive components and animations.
- **🧪 Demo mode** — Explore supported UI flows using mock demo data without connecting a wallet.

The project is divided into two primary parts:

1. Frontend — React application.
2. Backend — Express and WebSocket gateway.

---

# 🛠️ Feature Overview

| Feature | Description |
|---|---|
| DeSo Authentication | Wallet-based identity and login |
| Direct Messaging | Individual messaging |
| Group Messaging | Group conversations |
| Message Encryption | Client-side encryption through DeSo SDK |
| Unencrypted Fallback | Explicit fallback when encryption is unavailable |
| WebSocket Gateway | Real-time message event relay |
| Demo Mode | Mock conversations and members |
| Conversation Management | Conversation lists and unread tracking |
| Responsive UI | Desktop and mobile layouts |
| Animated Components | Interactive visual components |
| Transaction Confirmation | Transaction-related confirmation handling |

---

# 🏗️ System Architecture

The following diagram illustrates the main application components and their relationships.

```mermaid
flowchart TB

    USER(["👤 User"])

    subgraph FRONTEND["🖥️ SUPMATE FRONTEND"]
        UI["React User Interface"]
        AUTH["DeSo Wallet Authentication"]
        MSG["Messaging Components"]
        SERVICE["Conversation Service"]
        WALLET["Wallet & Encryption Services"]

        UI --> AUTH
        UI --> MSG
        MSG --> SERVICE
        SERVICE --> WALLET
    end

    subgraph BLOCKCHAIN["⛓️ DeSo Infrastructure"]
        RPC["DeSo Node RPC"]
        IDENTITY["DeSo Identity SDK"]
        CHAIN["Blockchain Data"]
        
        WALLET --> IDENTITY
        SERVICE --> RPC
        RPC --> CHAIN
        IDENTITY --> CHAIN
    end

    subgraph BACKEND["⚙️ BACKEND GATEWAY"]
        EXPRESS["Express Server"]
        WS["WebSocket Relay"]
        CLIENTS["Connected WebSocket Clients"]

        EXPRESS --> WS
        WS --> CLIENTS
    end

    USER --> UI
    SERVICE <-->|"Message events"| WS
    CLIENTS --> SERVICE

    style FRONTEND fill:#172554,stroke:#3B82F6,color:#FFFFFF
    style BLOCKCHAIN fill:#3F2B16,stroke:#F59E0B,color:#FFFFFF
    style BACKEND fill:#142D24,stroke:#10B981,color:#FFFFFF
```

## 🔍 Architecture Components

### 1. Frontend

The React frontend manages:

- User interface.
- Wallet authentication.
- Conversation management.
- Message composition.
- Message display.
- Wallet and encryption interactions.

### 2. DeSo Infrastructure

The DeSo integration supports:

- Decentralized identity.
- Wallet authentication.
- Access group operations.
- Blockchain-based messaging operations.

### 3. Backend Gateway

The backend uses Express and WebSocket technology.

Its responsibilities include:

- WebSocket connections.
- Message event relay.
- Connected client communication.
- Gateway health and notification routes.

The gateway is separate from the frontend application.

---

# 🔄 Message Communication Flow

The following sequence diagram illustrates the intended message lifecycle.

```mermaid
sequenceDiagram

    autonumber

    actor Sender as Sender
    participant UI as Supmate Frontend
    participant SDK as DeSo Identity SDK
    participant RPC as DeSo Node
    participant WS as WebSocket Gateway
    actor Receiver as Recipient

    Sender->>UI: Compose message
    UI->>SDK: Request encryption / submission
    SDK->>RPC: Perform blockchain operation
    RPC-->>SDK: Operation response
    SDK-->>UI: Submission result

    UI->>WS: Message notification
    WS-->>Receiver: Relay event

    Receiver->>UI: Open conversation
    UI->>SDK: Retrieve conversation data
    SDK->>RPC: Fetch message data
    RPC-->>SDK: Message data
    SDK-->>UI: Return message
    UI-->>Receiver: Display conversation
```

**Note:** This is a conceptual workflow diagram. Exact event ordering, gateway behavior and blockchain transaction handling depend on the implemented service logic.

---

# 🌐 Deployment Architecture

Supmate can be deployed using separate frontend and backend services.

```mermaid
flowchart TB

    USER(["🌍 User"])

    subgraph CLOUD["☁️ Deployment Environment"]

        subgraph HOST["Frontend Hosting"]
            STATIC["React Production Build"]
            CDN["Static Asset Delivery"]
        end

        subgraph SERVER["Backend Hosting"]
            API["Express Gateway"]
            SOCKET["WebSocket Service"]
        end

    end

    subgraph EXTERNAL["External Infrastructure"]
        DESO["DeSo Blockchain / RPC"]
    end

    USER --> STATIC
    STATIC --> CDN
    STATIC --> API
    API --> SOCKET
    STATIC --> DESO

    style HOST fill:#172554,stroke:#3B82F6,color:#FFFFFF
    style SERVER fill:#142D24,stroke:#10B981,color:#FFFFFF
    style EXTERNAL fill:#3F2B16,stroke:#F59E0B,color:#FFFFFF
```

### Deployment Options

| Component | Possible Platform |
|---|---|
| Frontend | Vercel, Netlify or static hosting |
| Backend | Railway, Render or VPS |
| Blockchain | DeSo RPC |
| Source Code | GitHub |

These are deployment options, not confirmation that Supmate is currently deployed on those platforms.

---

# 🧰 Technology Stack

| Category | Technology |
|---|---|
| Frontend | React 18 |
| Programming Language | TypeScript |
| Styling | TailwindCSS |
| Blockchain | DeSo Protocol |
| Wallet Integration | DeSo Identity SDK |
| Backend | Node.js |
| Server Framework | Express |
| Real-time Communication | WebSocket |
| Testing | Jest |
| Version Control | Git and GitHub |

---

# 🧩 Project Structure

```text
Supmate/
│
├── public/
│   ├── assets/
│   │   ├── demo/
│   │   └── demoimages/
│   │       ├── chatui.png
│   │       ├── demoscreen.png
│   │       ├── home.png
│   │       ├── infoui.png
│   │       ├── login.png
│   │       └── text send.png
│   │
│   ├── favicon.png
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── connect/
│   │   ├── form/
│   │   ├── reactbits/
│   │   ├── shared/
│   │   └── ui/
│   │
│   ├── contexts/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   │
│   ├── App.tsx
│   └── index.tsx
│
├── server/
│   └── src/
│       ├── routes/
│       ├── services/
│       └── index.ts
│
├── .env.example
├── DEVELOPER_HANDBOOK.md
├── Dockerfile
├── package.json
├── package-lock.json
├── tailwind.config.js
└── README.md
```

---

# ⚙️ Installation & Development

## Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Git | Latest stable version |
| DeSo Wallet | Compatible DeSo wallet |

## 1. Clone the Repository

```bash
git clone https://github.com/GREYHATTER225/supmate-web3.git

cd supmate-web3
```

## 2. Install Dependencies

```bash
npm ci
```

## 3. Configure Environment Variables

Create your local environment file:

```bash
cp .env.example .env
```

Configure the required values in `.env`.

Never commit real credentials, API secrets or private keys.

## 4. Start the Frontend

```bash
npm start
```

The development server should be available at:

```text
http://localhost:3000
```

---

# ⚙️ Backend Setup

The backend gateway can be started separately.

```bash
cd server
npm ci
npm run dev
```

The example local WebSocket gateway endpoint is:

```text
ws://localhost:5000/ws
```

Configure the frontend gateway URL according to your environment.

---

# 🔐 Environment Variables

The following variables are documented for the project.

| Variable | Purpose |
|---|---|
| REACT_APP_GATEWAY_WS_URL | WebSocket gateway endpoint |
| REACT_APP_GATEWAY_HTTP_URL | Optional gateway HTTP endpoint |
| REACT_APP_DESO_RPC_URL | DeSo RPC endpoint |
| REACT_APP_PBKDF2_ITERATIONS | PBKDF2 key derivation setting |
| PORT | Frontend development server port |
| SERVER_PORT | Backend server port |
| SERVER_WS_PATH | WebSocket endpoint path |

Example values:

```env
REACT_APP_GATEWAY_WS_URL=ws://localhost:5000/ws

REACT_APP_GATEWAY_HTTP_URL=http://localhost:5000/api

REACT_APP_DESO_RPC_URL=https://node.deso.org/api/v0

REACT_APP_PBKDF2_ITERATIONS=480000

PORT=3000

SERVER_PORT=5000

SERVER_WS_PATH=/ws
```

**Security warning:** Frontend variables prefixed with `REACT_APP_` are embedded into the frontend bundle. Never place private keys, passwords or secret credentials in them.

---

# 📦 Production Build

Build the React application:

```bash
npm run build
```

The production output is generated in:

```text
build/
```

The resulting static files can be hosted on a compatible static hosting provider.

The WebSocket gateway must be deployed separately if real-time gateway functionality is required.

---

# 🔒 Security Considerations

Supmate is designed around decentralized identity and client-side messaging operations.

Important considerations:

- Never expose private wallet keys.
- Do not commit `.env` files containing credentials.
- Validate user input before processing.
- Use HTTPS and WSS in production.
- Validate WebSocket connections.
- Handle authentication and authorization carefully.
- Review message encryption and fallback behavior before production use.
- Do not assume that a WebSocket relay itself provides end-to-end encryption.

### Encryption and Fallback

When recipient messaging access is available, the application can use the DeSo SDK's encryption functionality.

If encryption is unavailable, the application provides an explicit fallback flow.

Users should understand whether a message is encrypted before sending it.

---

# 🧪 Testing & Project Status

Useful development commands:

```bash
# Run lint
npm run lint

# Run tests
npm test

# TypeScript check
npx tsc --noEmit

# Production build
npm run build
```

Previously recorded project checks:

| Check | Previously Recorded Result |
|---|---|
| Frontend Build | Successful |
| ESLint | 0 errors, 4 warnings |
| TypeScript | Check available |
| Jest | Test runner available |

These are previously recorded results and should be rerun against the current version before claiming a fresh verification.

---

# 📈 Roadmap

- [ ] Expand automated test coverage.
- [ ] Improve WebSocket reliability.
- [ ] Improve error handling.
- [ ] Expand message interaction features.
- [ ] Improve wallet connection experience.
- [ ] Add more detailed security documentation.
- [ ] Improve mobile experience.
- [ ] Add CI/CD automation.
- [ ] Expand developer documentation.

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Install dependencies.

```bash
npm ci
```

4. Run available project checks.

```bash
npm run lint
npm test
npm run build
```

5. Commit your changes.

```bash
git add .
git commit -m "Add your feature"
```

6. Push your branch and open a Pull Request.

---

# 📄 License

Supmate is released under the MIT License.

See the repository's license file for details.

---

<div align="center">

# ⚡ SUPMATE

### Your Space. Your Keys. Your Conversations.

**Decentralized identity. Modern communication. Web3.**

[GitHub Repository](https://github.com/GREYHATTER225/supmate-web3)

</div>
