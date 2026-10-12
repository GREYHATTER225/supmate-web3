<div align="center">
  <h1>⚡ SUPMATE</h1>
  <h3>Your Space. Your Keys. Your Conversations.</h3>
  <p><strong>A sovereign Web3 messaging experience built on DeSo.</strong></p>
  <p>Non-custodial identity · Honest message states · A calm, focused chat experience</p>
  <img src="public/assets/logo-white.png" alt="Supmate logo" width="160" />
  <br />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&amp;logo=react&amp;logoColor=white" alt="React 18" height="25" />
  <img src="https://img.shields.io/badge/TypeScript-4.9-3178C6?style=for-the-badge&amp;logo=typescript&amp;logoColor=white" alt="TypeScript 4.9" height="25" />
  <img src="https://img.shields.io/badge/WEB3-DeSo-00C2A8?style=for-the-badge" alt="DeSo Web3" height="25" />
  <img src="https://img.shields.io/badge/MODES-Preview%20%2B%20On--Chain-8B5CF6?style=for-the-badge" alt="Preview and on-chain modes" height="25" />
  <img src="https://img.shields.io/badge/SECURITY-Transparency%20First-10B981?style=for-the-badge&amp;logo=letsencrypt&amp;logoColor=white" alt="Transparency-first security approach" height="25" />
  <br /><br />
  <a href="https://deso.org"><img src="https://img.shields.io/badge/Powered%20by-DeSo-111827?style=flat-square" alt="Powered by DeSo" /></a>
  <img src="https://img.shields.io/badge/License-See%20Repository-lightgrey?style=flat-square" alt="License information" />
  <p><em>⚡ Less noise. More ownership. Better conversations. 🔐</em></p>
</div>

[!IMPORTANT]
This README documents the intended product behavior and architecture. It is not an independent security audit. Feature descriptions and security properties must be verified against the current source code and test results before release.

🧭 Explore Supmate

<table width="100%">
  <tr>
    <td align="center" width="25%"><a href="#-about-supmate"><strong>🌌 About</strong></a><br /><sub>Product vision</sub></td>
    <td align="center" width="25%"><a href="#-features"><strong>✨ Features</strong></a><br /><sub>What it does</sub></td>
    <td align="center" width="25%"><a href="#-design-direction"><strong>🎨 Design</strong></a><br /><sub>UI principles</sub></td>
    <td align="center" width="25%"><a href="#-security-and-privacy-model"><strong>🔐 Security</strong></a><br /><sub>Honest by design</sub></td>
  </tr>
  <tr>
    <td align="center"><a href="#-technology-stack"><strong>🧰 Tech stack</strong></a><br /><sub>Tools & frameworks</sub></td>
    <td align="center"><a href="#-getting-started"><strong>🚀 Get started</strong></a><br /><sub>Run locally</sub></td>
    <td align="center"><a href="#-architecture-overview"><strong>🏗️ Architecture</strong></a><br /><sub>How it fits together</sub></td>
    <td align="center"><a href="#-deployment"><strong>🐳 Deployment</strong></a><br /><sub>Build & ship</sub></td>
  </tr>
</table>

<!-- Optional product preview: upload a GIF through the GitHub README editor or an issue/comment, then replace SUPMATE_PREVIEW_GIF_URL. GitHub will host the uploaded media at a githubusercontent URL. Keep this block commented until a real URL is available.
<p align="center"><img src="SUPMATE_PREVIEW_GIF_URL" alt="Supmate interface preview" width="900" /></p>
-->

🪪 Project at a glance

<table width="100%">
  <tr>
    <td align="center" valign="top" width="33%">
      <h3>💬 Messaging</h3>
      <p>Direct messages and group conversations through the documented DeSo Access Group flow.</p>
      <img src="https://img.shields.io/badge/CORE-DMs%20%26%20Groups-0F766E?style=flat-square" alt="Direct and group messaging" />
    </td>
    <td align="center" valign="top" width="33%">
      <h3>🔐 Transparency</h3>
      <p>Communicate encryption availability and distinguish unencrypted delivery clearly.</p>
      <img src="https://img.shields.io/badge/PRINCIPLE-No%20Silent%20Fallback-B45309?style=flat-square" alt="No silent plaintext fallback" />
    </td>
    <td align="center" valign="top" width="33%">
      <h3>🧪 Preview</h3>
      <p>Explore the interface with local mock conversations without a wallet.</p>
      <img src="https://img.shields.io/badge/MODE-Local%20Demo-6D28D9?style=flat-square" alt="Local preview mode" />
    </td>
  </tr>
</table>

🌌 About Supmate

Supmate is a Web3 messaging application built around the DeSo blockchain. It aims to give people more control over their digital conversations through non-custodial identity, Access Group-based messaging, and clear communication about message-protection state.

Supmate supports direct messages, group conversations, identity search across supported formats, and a local Preview mode that lets people explore the interface without connecting a wallet.

The design goal is to make Web3 messaging feel like a carefully crafted everyday application—not a blockchain dashboard.

Product principle: users should be able to understand what the app is doing, what it is not doing, and whether a message was sent encrypted or unencrypted.

✨ Features

💬 Direct messages and group chats using DeSo Access Groups.

🔐 Client-side message encryption and decryption through the DeSo Identity SDK when the required messaging configuration is available.

🛑 Explicit handling of unencrypted delivery: the application must not silently send an unencrypted fallback. The default should be to stop and explain the limitation; if the fallback remains supported, it requires deliberate confirmation.

🪪 DeSo Identity integration for non-custodial authentication and supported derived-key operations.

🔎 User discovery using supported DeSo usernames and public keys, Ethereum addresses, and ENS names.

👥 Group management with member lists and owner-controlled membership operations, where supported by the implementation.

🧪 Offline Preview mode with local mock conversations and no blockchain interaction for demo messages.

🎨 Theme options including cyber-dark, synthwave-sunset, and matrix-neo, subject to the available implementation.

🔔 Conversation refresh/polling with different desktop and mobile intervals where configured.

📱 Responsive experience for desktop, tablet, and mobile.

🐳 Static deployment through Docker/Nginx or compatible static hosting.

Feature descriptions are not proof that a feature has been independently verified. Check the current source and test results before treating a feature as release-ready.

🎨 Design direction

Supmate's refreshed visual direction combines minimalism with subtle skeuomorphism. The objective is a distinctive, professional interface that feels tactile without becoming decorative or visually heavy.

Design principles

Minimalism first: remove visual clutter and keep primary actions obvious.

Intentional negative space: let conversations and meaningful content breathe.

Subtle skeuomorphism: use restrained surface depth, inset input treatments, tactile button states, and natural shadows where they communicate interaction.

Restrained glassmorphism: reserve translucent, frosted surfaces for layers that benefit from separation, such as selected navigation, floating panels, or dialogs.

Selective bento layouts: use modular grids for landing-page feature storytelling where useful; keep the actual messaging workspace focused on communication.

Typography with hierarchy: prioritize readable interface text, concise labels, and consistent spacing.

Disciplined color: use dark neutral surfaces with emerald or mint as the primary accent and cyan or blue only where they communicate a meaningful distinction.

Purposeful motion: keep transitions short, support reduced-motion preferences, and avoid animations that interrupt messaging.

Accessible controls: maintain visible focus states, readable contrast, keyboard navigation, and touch-friendly targets.

Surface and color direction

The intended visual system uses midnight and graphite backgrounds, layered neutral surfaces, subtle borders, selective elevation, and controlled accent colors. Glass effects and glow are accents—not default styling for every component. Message content must remain more prominent than decoration.

The new visual system should be applied consistently to the landing page, navigation, conversation list, chat workspace, message composer, account connection, group dialogs, menus, notifications, loading states, and error states.

Themes

cyber-dark — restrained dark neutral surfaces with emerald accents.

synthwave-sunset — an alternate theme with a warmer, synthwave-inspired palette.

matrix-neo — an alternate green, terminal-inspired palette.

The actual availability and behavior of each theme must match the source code. A theme label must not be documented as implemented unless it works in the current checkout.

🔐 Security and privacy model

<details>
<summary>🔎 Expand security model, expected behavior, and limitations</summary>

Security labels should communicate verified behavior rather than marketing aspirations.

Intended messaging behavior

🔎 Situation

✅ Expected behavior

🔐 Recipient has a compatible messaging Access Group

Use the supported client-side encryption flow before submitting the message.

⚠️ Recipient has not configured the required messaging group

Explain that encrypted delivery is unavailable and default to not sending.

🛑 An unencrypted fallback is still supported

Require explicit, informed confirmation before sending; clearly identify the resulting message as Not encrypted.

🚫 User declines unencrypted delivery

Do not send the fallback message.

❌ Encryption, decryption, or transaction operation fails

Show an accurate error state; do not present the operation as successful.

🧪 User explores Preview mode

Use local mock data; demo messages should not initiate blockchain transactions.

How the intended model works

Identity: authentication and key-management interactions use DeSo Identity.

Derived keys: the application requests authorization for supported operations and spending limits.

Access Groups: conversations use DeSo Access Groups to organize messaging access.

Client-side encryption: the application uses the supported SDK methods, such as identity.encryptMessage(...) and identity.decryptMessage(...), where the relevant flow is available.

Explicit consent: unencrypted delivery must never happen silently.

Important limitations

Encryption depends on the application's implementation, the recipient's messaging configuration, and the supported Access Group flow.

Unencrypted messages are not end-to-end encrypted. Anyone who can access their plaintext through the applicable storage or delivery path may be able to read them.

Blockchain activity and associated metadata may be visible even when message contents are encrypted. The precise exposure depends on the implementation and network behavior.

Using DeSo Identity does not mean Supmate independently operates or audits the Identity service.

Supmate does not claim quantum-safe cryptography or a zero-knowledge architecture.

This README is not evidence of an independent cryptographic review, penetration test, or formal verification.

Security implementation requirements

Before release, verify that the code:

Does not collect or store users' seed phrases directly.

Does not expose private keys, seed phrases, or other sensitive values in logs or error messages.

Handles account switching and logout without displaying stale conversation data as the active account's data.

Does not silently fall back to plaintext delivery.

Keeps encryption indicators aligned with the actual message payload and its metadata.

Does not show a successful-send state until the relevant operation has succeeded according to the application's transaction flow.

Handles untrusted message content safely.

Documents remaining limitations without overstating security guarantees.

These are requirements to validate against the source code—not claims that an audit has already been completed.

</details>

🧰 Technology stack

<table width="100%">
  <tr>
    <td align="center" valign="top" width="25%">
      <h3>⚛️ Frontend</h3>
      <img src="https://img.shields.io/badge/React-18.2-20232A?style=for-the-badge&amp;logo=react" alt="React 18.2" /><br /><br />
      <img src="https://img.shields.io/badge/TypeScript-4.9-3178C6?style=flat-square&amp;logo=typescript&amp;logoColor=white" alt="TypeScript 4.9" /><br />
      <sub>UI and application logic</sub>
    </td>
    <td align="center" valign="top" width="25%">
      <h3>🔗 Web3</h3>
      <img src="https://img.shields.io/badge/DeSo-Protocol-00C2A8?style=for-the-badge" alt="DeSo Protocol" /><br /><br />
      <img src="https://img.shields.io/badge/SDK-2.6.x-334155?style=flat-square" alt="DeSo SDK 2.6.x" /><br />
      <sub>Identity and Access Groups</sub>
    </td>
    <td align="center" valign="top" width="25%">
      <h3>🎨 UI</h3>
      <img src="https://img.shields.io/badge/Tailwind-3.2-06B6D4?style=for-the-badge&amp;logo=tailwindcss&amp;logoColor=white" alt="Tailwind CSS 3.2" /><br /><br />
      <img src="https://img.shields.io/badge/Headless%20UI-Components-111827?style=flat-square" alt="Headless UI components" /><br />
      <sub>Responsive component styling</sub>
    </td>
    <td align="center" valign="top" width="25%">
      <h3>🧪 Quality</h3>
      <img src="https://img.shields.io/badge/Jest-Tests-C21325?style=for-the-badge&amp;logo=jest&amp;logoColor=white" alt="Jest" /><br /><br />
      <img src="https://img.shields.io/badge/ESLint-Prettier-4B32C3?style=flat-square" alt="ESLint and Prettier" /><br />
      <sub>Checks and maintainability</sub>
    </td>
  </tr>
</table>

🧩 Stack reference

🧱 Layer

⚙️ Technology

🎯 Responsibility

⚛️ Frontend

React 18.2

UI and component rendering

🟦 Language

TypeScript 4.9

Typed application logic

🏗️ Build

Create React App / react-scripts 5

Development server and production build

🔗 Blockchain

deso-protocol 2.6.x

DeSo SDK, identity, Access Groups, and transactions

🎨 Styling

Tailwind CSS 3.2

Utility-based styling and responsive layouts

🧩 UI components

Material Tailwind, Headless UI

Reusable component primitives

🎭 Icons & feedback

React Icons, React Spinners, React Toastify

Icons, loading, and notifications

🔐 Crypto utilities

@noble/hashes and SDK-related dependencies

Only the crypto utilities actually used by the source

🧪 Testing

Jest and React Testing Library via CRA

Automated tests

🧹 Code quality

ESLint and Prettier

Linting and formatting

🐳 Deployment

Docker, Nginx, or static hosting

Frontend distribution

<sub>Dependency versions are based on the documented project stack. Check package.json before release; this table is not a live dependency audit.</sub>

🚀 Getting started

<details>
<summary>🧭 Expand prerequisites and local setup steps</summary>

Requirements

Node.js 16–18, matching the documented project runtime.

npm.

Git, if you want version control and collaboration.

Node 18 is used by the documented Docker build. Check dependency compatibility before changing Node versions.

1. Clone the repository

Replace the placeholders with the real repository URL and directory name:

git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>

2. Install dependencies

npm install

3. Start the development server

npm start

Open http://localhost:3000.

The documented development configuration targets the DeSo testnet. Confirm the selected network before interacting with accounts or transactions.

4. Explore the application

Explore Demo / Preview: open the local preview without connecting a wallet.

Connect DeSo: authenticate through DeSo Identity.

Start a conversation: search for a supported identity and open a direct conversation.

Create a group: use the group-creation flow and manage membership where supported.

Customize the workspace: switch themes and use available preferences.

The labels and available actions should match the actual application UI.

</details>

🧪 Development commands

<details>
<summary>🧰 Expand development commands and pre-commit checks</summary>

💻 Command

🎯 Purpose

npm start

Starts the local development server.

npm run build

Creates the production build in build/.

npm test

Starts the Jest test runner.

CI=true npm test -- --watchAll=false

Runs tests once without watch mode in a Unix-like shell.

npm run lint

Runs ESLint, if configured.

npm run lint:fix

Applies automatic ESLint fixes, if configured.

npx tsc --noEmit

Checks TypeScript without emitting files.

CI=true npm run build

Builds with CI warning enforcement in a Unix-like shell.

npm run format

Runs the configured Prettier command, if available.

Check package.json before using a command; available scripts can vary by checkout.

Windows PowerShell note

The CI=true command syntax is for Unix-like shells. In PowerShell, set the environment variable for the command and then remove it if needed:

$env:CI = "true"
npm test -- --watchAll=false
npm run build
Remove-Item Env:CI

Before committing

Run the checks supported by the repository:

npm run lint
npx tsc --noEmit
CI=true npm test -- --watchAll=false
CI=true npm run build

If a command fails, investigate and fix the cause before shipping. A clean local run is useful evidence, but does not replace testing the actual deployment or reviewing the security-sensitive flows.

</details>

🏗️ Architecture overview

<details>
<summary>🗺️ Expand architecture and runtime flow</summary>

Supmate is a React single-page application with two distinct operating modes: a DeSo-backed experience and a local Preview sandbox.

Browser
  |
  +-- src/index.tsx
  |     +-- React bootstrap
  |     +-- Mobile viewport-height handling
  |
  +-- src/App.tsx
        +-- DeSo SDK configuration
        +-- Identity event subscription
        +-- UserContext
        +-- DemoContext
        +-- RefreshContext
        |
        +-- MessagingApp
              |
              +-- Preview mode
              |     +-- Local mock conversations
              |
              +-- Real mode
                    +-- Conversation list
                    +-- Message composer
                    +-- Group management
                    +-- conversations.service.tsx
                          +-- Fetch conversation threads
                          +-- Decrypt supported messages
                          +-- Encrypt outgoing messages
                          +-- Submit DeSo transactions

Main application flow

Boot: React initializes and applies the mobile viewport-height handling.

Authenticate: DeSo Identity emits login or active-user events.

Provision messaging: the app checks for the user's messaging Access Group and creates it when required and authorized.

Load conversations: the service fetches relevant threads and attempts to decrypt supported messages.

Send messages: the service follows the encryption flow when the required recipient configuration is available; otherwise, the app follows the explicit, safe fallback policy described above.

Refresh: the app periodically checks for new messages according to its configured intervals.

</details>

🗂️ Project structure

<details>
<summary>📁 Expand source tree and key file responsibilities</summary>

The structure below reflects the documented layout. Confirm each path against the current repository before relying on it.

.
├── public/
│   └── assets/
│       └── logo-white.png
├── src/
│   ├── index.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── App.test.tsx
│   ├── components/
│   │   ├── messaging-app.tsx
│   │   ├── landing-page.tsx
│   │   ├── demo-chat.tsx
│   │   ├── conversation-details.tsx
│   │   ├── header.tsx
│   │   ├── search-users.tsx
│   │   ├── start-group-chat.tsx
│   │   ├── manage-members-dialog.tsx
│   │   ├── send-message-button-and-input.tsx
│   │   ├── send-funds-dialog.tsx
│   │   ├── shared/
│   │   ├── form/
│   │   └── ui/
│   ├── contexts/
│   │   ├── UserContext.ts
│   │   ├── DemoContext.tsx
│   │   └── RefreshContext.ts
│   ├── hooks/
│   │   ├── useMembers.ts
│   │   ├── useMobile.ts
│   │   ├── useKeyDown.ts
│   │   └── useInterval.ts
│   ├── services/
│   │   └── conversations.service.tsx
│   └── utils/
│       ├── constants.ts
│       ├── types.ts
│       ├── helpers.ts
│       ├── demoData.ts
│       └── soundEffects.ts
├── .env.development
├── .env.production
├── Dockerfile
├── nginx.conf
├── package.json
├── tailwind.config.js
└── tsconfig.json

Key files

📄 File

🎯 Responsibility

src/App.tsx

Root application, SDK setup, identity events, and context providers.

src/components/messaging-app.tsx

Main chat rendering and state for Preview and real modes.

src/services/conversations.service.tsx

Conversation I/O, encryption/decryption, and sending logic.

src/contexts/UserContext.ts

Authenticated user and Access Group state.

src/contexts/DemoContext.tsx

Preview mode, themes, transitions, sound, and shared UI state.

src/contexts/RefreshContext.ts

Coordinates refresh locking.

src/utils/constants.ts

Network settings, limits, group names, and polling intervals.

src/utils/demoData.ts

Mock users, conversations, and group members.

src/utils/helpers.ts

Identity detection and common display/messaging helpers.

src/utils/soundEffects.ts

Locally synthesized audio effects, if enabled.

</details>

💬 Messaging and encryption flow

<details>
<summary>🔐 Expand the outgoing-message flow</summary>

Outgoing messages are documented as passing through encryptAndSendNewMessage(...) in the conversation service. Verify the actual function and call sites in the current source.

User writes a message
        |
        v
Check sender/recipient messaging configuration
        |
        v
Recipient configuration supports encryption?
        |
        +-- Yes --> Encrypt using the supported SDK flow
        |             |
        |             v
        |          Submit transaction
        |
        +-- No  --> Explain that encrypted delivery is unavailable
                      |
                      v
                  Default: do not send
                      |
                      +-- User declines --> Do not send fallback
                      |
                      +-- User explicitly confirms, if fallback is supported
                                             |
                                             v
                                     Send tagged unencrypted payload
                                     and display "Not encrypted"

Where the legacy fallback is used, its documented metadata tag is:

ExtraData["unencrypted"] = "true";

Confirm that the source applies this marker accurately and that the UI interprets it consistently. Never imply that a tagged plaintext message is end-to-end encrypted.

Failed sends and requests awaiting plaintext confirmation must not leave misleading optimistic message bubbles in the conversation.

</details>

👥 Group chats and user discovery

<details>
<summary>👥 Expand group-management and identity-search notes</summary>

Group chats

The documented application supports the following group-management flows where implemented:

Create a named group.

Add eligible members.

View group membership.

Remove members through the owner-controlled management flow.

The related UI is documented in start-group-chat.tsx and manage-members-dialog.tsx, with shared membership logic in useMembers.ts.

Always verify permissions and transaction outcomes in the actual implementation; a disabled or hidden UI control is not a substitute for the necessary underlying authorization checks.

Find users 🔎

The documented search flow accepts supported identity formats such as:

DeSo usernames.

DeSo public keys.

Ethereum addresses beginning with 0x.

ENS names ending in .eth.

Search input is intended to be debounced, with profile lookup functions used to retrieve candidates. Confirm the supported formats and current behavior against the code.

</details>

🧩 Hooks and shared state

<details>
<summary>🧠 Expand hooks and context responsibilities</summary>

Hooks

🪝 Hook

🎯 Purpose

useMembers(...)

Loads group members and exposes membership-management operations.

useMobile()

Tracks the mobile breakpoint, documented as 768px.

useKeyDown(...)

Registers keyboard handlers, including Escape-to-close behavior where appropriate.

useInterval(...)

Runs the latest callback on a recurring interval.

Contexts

UserContext: authenticated user, Access Groups, and loading state.

DemoContext: Preview mode, themes, authentication modal, transitions, sound, and related UI state.

RefreshContext: coordinates refresh locking to avoid overlapping manual and automatic refresh operations.

The names and responsibilities above are based on the documented project structure; verify them against the actual source after refactors.

</details>

🧪 Preview mode: no wallet required

Preview mode uses mock users and conversations from src/utils/demoData.ts and is intended for exploration, demonstrations, and design reviews.

No wallet connection is required to view the preview.

Demo messages remain in local application state.

Demo messages must not initiate blockchain transactions.

The workspace should display a clear Preview indicator.

Preview behavior must not be confused with a real account session.

The real application must not silently display demo data as a substitute for failed blockchain operations.

⚙️ Environment configuration

<details>
<summary>🔧 Expand environment variables and security notes</summary>

The app uses Create React App environment variables prefixed with REACT_APP_.

⚙️ Variable

🧪 Development

🚀 Production

REACT_APP_NODE_URL

https://test.deso.org

https://node.deso.org

REACT_APP_API_URL

https://test.deso.org/api/v0

https://node.deso.org/api/v0

REACT_APP_PROFILE_URL

https://test.deso.org

https://diamondapp.com

REACT_APP_IDENTITY_URL

https://identity.deso.org

https://identity.deso.org

REACT_APP_IS_TESTNET

true

false

PUBLIC_URL

https://chat-test.deso.com

https://chat.deso.com

These values reflect the documented configuration. Verify the target network and deployment domain before building or releasing the application.

Important notes

REACT_APP_IS_TESTNET=true selects the documented testnet configuration.

The production configuration selects mainnet.

PUBLIC_URL controls the base path used for generated asset URLs.

Create React App environment variables are embedded into the frontend bundle at build time.

Never put private keys, seed phrases, API secrets, or other sensitive credentials in frontend environment variables.

</details>

🐳 Deployment

<details>
<summary>🚢 Expand Docker and static-hosting instructions</summary>

Supmate can be built as a static frontend and served through Nginx or a compatible static hosting provider.

Option 1: Docker

Build the image:

docker build -t supmate .

Run the container:

docker run --rm -p 8080:80 supmate

Open http://localhost:8080.

To build with a custom environment file supported by the Dockerfile:

docker build --build-arg environment=custom -t supmate .

Ensure the corresponding .env.custom file exists and is selected by the Dockerfile.

The documented build flow uses a Node.js build stage to generate build/ assets and an Nginx stage to serve them. nginx.conf should provide an appropriate single-page-application fallback so supported client-side routes resolve to index.html.

Option 2: Static hosting

Build the application:

npm run build

Deploy the generated build/ directory to a static host, such as Vercel, Netlify, S3-backed hosting, or a CDN. Configure fallback routing and PUBLIC_URL for the selected host.

</details>

🩺 Troubleshooting

<details>
<summary>🩹 Expand troubleshooting guidance</summary>

Tailwind shows Unknown at rule @tailwind

This can be an editor linting issue. Tailwind directives are processed during the build; they are not native browser CSS rules. Check editor CSS settings and the Tailwind CSS IntelliSense configuration.

The first message cannot be encrypted

The recipient may not have configured the required messaging Access Group. Explain the limitation and default to not sending an unencrypted fallback. For encrypted communication, the recipient may need to complete the required messaging setup.

The account needs funds

Some DeSo transactions require a funded account. Follow the application's verified funding guidance and check the selected network before proceeding.

Docker or static hosting loads a blank page

Check that:

The production build completed successfully.

PUBLIC_URL matches the intended asset path.

The host serves the correct build/ directory.

Nginx or the static host has appropriate SPA fallback routing.

Browser-console errors and failed network requests have been investigated.

npm reports dependency advisories

Review the affected packages and advisories before upgrading. Test SDK and build-tool upgrades carefully, because major-version changes can introduce compatibility issues.

Husky warns about a missing Git repository

If the project uses a Husky prepare script, Git hooks may not install until the project is initialized as a repository. This warning alone does not establish whether the application builds or tests successfully.

</details>

✅ Project health checks

<details>
<summary>🧪 Expand reproducible project checks</summary>

Earlier project documentation reported successful linting, TypeScript checks, a strict production build, and development-server compilation. Those are historical/reported results, not fresh verification of the current checkout.

To reproduce the checks locally, use the commands supported by the current package.json:

npm run lint
npx tsc --noEmit
CI=true npm test -- --watchAll=false
CI=true npm run build

Use the output from the current checkout as the source of truth before publishing a release.

</details>

🤝 Contributing

<details>
<summary>🤝 Expand contribution workflow and checklist</summary>

Contributions are welcome.

Create a branch for your changes.

Keep reusable logic in src/hooks/ and src/services/ where appropriate.

Put UI components in src/components/ and maintain the shared design system.

Keep shared configuration in src/utils/constants.ts where that file remains the relevant source.

Preserve the safe explicit-consent policy for any unencrypted delivery.

Document security-relevant behavior and changes to the messaging flow.

Run linting, TypeScript checks, tests, and the production build as supported by the project.

Contribution checklist

Code follows the current TypeScript conventions.

UI changes respect the design system and accessibility requirements.

Security behavior is described accurately.

Relevant tests pass, or outstanding failures are documented.

No secrets or sensitive credentials are committed.

Existing license and attribution requirements are respected.

</details>

🗺️ Potential future improvements

<details>
<summary>🗺️ Expand possible future work</summary>

The following are potential next steps, not claims that the features are already implemented:

🧪 More automated tests for messaging and encryption edge cases.

♿ Expanded accessibility testing.

📱 Further mobile usability improvements.

🔍 Better diagnostics for messaging setup and transaction failures.

📚 Clearer onboarding for first-time DeSo users.

🛡️ Independent security review of the application and its messaging flows.

</details>

📊 GitHub stats & streak cards

<p align="center"><sub>Personal stats cards use your GitHub username. Replace <code>GREYHATTER225</code> in the image URLs below before publishing. GitHub supports theme-aware images through the HTML <code>&lt;picture&gt;</code> element.</sub></p>

<!-- Replace GREYHATTER225 in the URLs below with the repository owner's GitHub username. -->

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github-readme-stats.vercel.app/api?username=GREYHATTER225&amp;show_icons=true&amp;hide_border=true&amp;theme=github_dark&amp;rank_icon=github" />
    <source media="(prefers-color-scheme: light)" srcset="https://github-readme-stats.vercel.app/api?username=GREYHATTER225&amp;show_icons=true&amp;hide_border=true&amp;theme=default&amp;rank_icon=github" />
    <img src="https://github-readme-stats.vercel.app/api?username=GREYHATTER225&amp;show_icons=true&amp;hide_border=true&amp;theme=github_dark&amp;rank_icon=github" alt="GitHub profile statistics for GREYHATTER225" height="165" />
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github-readme-stats.vercel.app/api/top-langs/?username=GREYHATTER225&amp;layout=compact&amp;hide_border=true&amp;theme=github_dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://github-readme-stats.vercel.app/api/top-langs/?username=GREYHATTER225&amp;layout=compact&amp;hide_border=true&amp;theme=default" />
    <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=GREYHATTER225&amp;layout=compact&amp;hide_border=true&amp;theme=github_dark" alt="Most-used languages for GREYHATTER225" height="165" />
  </picture>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://streak-stats.demolab.com?user=GREYHATTER225&amp;hide_border=true&amp;theme=github-dark-blue" />
    <source media="(prefers-color-scheme: light)" srcset="https://streak-stats.demolab.com?user=GREYHATTER225&amp;hide_border=true&amp;theme=default" />
    <img src="https://streak-stats.demolab.com?user=GREYHATTER225&amp;hide_border=true&amp;theme=github-dark-blue" alt="GitHub contribution streak for GREYHATTER225" width="700" />
  </picture>
</p>

<sub>These cards are provided by third-party services and may be rate-limited or unavailable. They reflect the configured GitHub profile, not proof of Supmate's build health, security, or product activity.</sub>

📜 Project details

<details>
<summary>📦 Expand package and project metadata</summary>

Project: Supmate

Package: deso-chat-protocol

Version: 0.1.0

Frontend: React + TypeScript

Blockchain: DeSo

Architecture: Client-side SPA with Preview and live modes

License: See the repository's license file, if present

Check the repository's license and third-party dependency notices before redistributing or publishing a derived version.

<p align="center">
  <strong>Built on DeSo. Messages are yours. Spaces are yours.</strong><br />
  ⚡ Less noise. More ownership. Better conversations. 🔐
</p>

</details># supmate-web3
