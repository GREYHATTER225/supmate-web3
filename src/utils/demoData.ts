import { ChatType, DecryptedMessageEntryResponse, ProfileEntryResponse } from "deso-protocol";
import { ConversationMap } from "./types";

export interface DemoAccount {
  name: string;
  handle: string;
  /**
   * Local, vendored avatar path (see DEMO_AVATARS). These were previously hot-linked
   * from api.dicebear.com, which made the preview mode depend on a third-party
   * network request on every render — inconsistent with the project's
   * "assets ship with the bundle" policy.
   */
  avatar: string;
  publicKey: string;
  badge?: string;
  bio?: string;
}

/** Vendored demo avatar artwork, generated once and committed to /assets/demo. */
export const DEMO_AVATARS = {
  supmateExplorer: "/assets/demo/supmate-explorer.svg",
  alex: "/assets/demo/alex.svg",
  sarah: "/assets/demo/sarah.svg",
  alphaGuild: "/assets/demo/alpha-guild.svg",
  kaelen: "/assets/demo/kaelen.svg",
} as const;

export const DEMO_USER: DemoAccount = {
  name: "Cyber Explorer",
  handle: "cyberexplorer.eth",
  avatar: DEMO_AVATARS.supmateExplorer,
  publicKey: "BC1YLgDemoExplorerPublicKeyForSupmatePreviewMode000001",
  badge: "PREVIEW",
  bio: "Previewing Supmate — encrypted on-chain messaging for DeSo.",
};

export const DEMO_MEMBERS: Record<string, DemoAccount> = {
  alex: {
    name: "Alex Rivera",
    handle: "alex.deso",
    avatar: DEMO_AVATARS.alex,
    publicKey: "BC1YLgDemoAlexRiveraPublicKeyMockSupmate00000000000000002",
    badge: "VIP",
  },
  sarah: {
    name: "Sarah Chen",
    handle: "schen.eth",
    avatar: DEMO_AVATARS.sarah,
    publicKey: "BC1YLgDemoSarahChenPublicKeyMockSupmate00000000000000003",
    badge: "Core Dev",
  },
  neonSquad: {
    name: "⚡ Supmate Alpha Guild",
    handle: "alpha-guild",
    avatar: DEMO_AVATARS.alphaGuild,
    publicKey: "BC1YLgDemoAlphaGuildGroupChatMockKey0000000000000000004",
    badge: "Group (8)",
  },
  neoTrader: {
    name: "Kaelen Voss",
    handle: "kaelen.lens",
    avatar: DEMO_AVATARS.kaelen,
    publicKey: "BC1YLgDemoKaelenVossPublicKeyMockSupmate0000000000000005",
    badge: "OG",
  },
};

const now = Date.now();
const minute = 60 * 1000;
const hour = 60 * minute;

export const DEMO_CONVERSATIONS: ConversationMap = {
  [DEMO_MEMBERS.neonSquad.publicKey]: {
    firstMessagePublicKey: DEMO_MEMBERS.neonSquad.publicKey,
    ChatType: ChatType.GROUPCHAT,
    messages: [
      {
        DecryptedMessage:
          "Walked through the encryption model today — messages are encrypted on-device with access-group keys and only decrypt on the recipient's device. 🚀✨",
        IsSender: false,
        SenderInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.sarah.publicKey,
          AccessGroupKeyName: "default-key",
        },
        RecipientInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.neonSquad.publicKey,
          AccessGroupKeyName: "⚡ Supmate Alpha Guild",
        },
        MessageInfo: {
          TimestampNanos: (now - 2 * minute) * 1e6,
          TimestampNanosString: `${(now - 2 * minute) * 1e6}`,
        },
      } as DecryptedMessageEntryResponse,
      {
        DecryptedMessage:
          "Demo mode keeps everything local, so reviewing the UI is fast — no wallet, no signing, no chain calls needed.",
        IsSender: false,
        SenderInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.alex.publicKey,
          AccessGroupKeyName: "default-key",
        },
        RecipientInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.neonSquad.publicKey,
          AccessGroupKeyName: "⚡ Supmate Alpha Guild",
        },
        MessageInfo: {
          TimestampNanos: (now - 8 * minute) * 1e6,
          TimestampNanosString: `${(now - 8 * minute) * 1e6}`,
        },
      } as DecryptedMessageEntryResponse,
      {
        DecryptedMessage:
          "Welcome to the Supmate preview! Send a mock message, switch conversations, or try a theme.",
        IsSender: true,
        SenderInfo: {
          OwnerPublicKeyBase58Check: DEMO_USER.publicKey,
          AccessGroupKeyName: "default-key",
        },
        RecipientInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.neonSquad.publicKey,
          AccessGroupKeyName: "⚡ Supmate Alpha Guild",
        },
        MessageInfo: {
          TimestampNanos: (now - 25 * minute) * 1e6,
          TimestampNanosString: `${(now - 25 * minute) * 1e6}`,
        },
      } as DecryptedMessageEntryResponse,
      {
        DecryptedMessage:
          "The dark surfaces with the emerald accents feel really calm in this lighting 🤌",
        IsSender: false,
        SenderInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.neoTrader.publicKey,
          AccessGroupKeyName: "default-key",
        },
        RecipientInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.neonSquad.publicKey,
          AccessGroupKeyName: "⚡ Supmate Alpha Guild",
        },
        MessageInfo: {
          TimestampNanos: (now - 45 * minute) * 1e6,
          TimestampNanosString: `${(now - 45 * minute) * 1e6}`,
        },
      } as DecryptedMessageEntryResponse,
    ],
  },
  [DEMO_MEMBERS.alex.publicKey]: {
    firstMessagePublicKey: DEMO_MEMBERS.alex.publicKey,
    ChatType: ChatType.DM,
    messages: [
      {
        DecryptedMessage:
          "Is it true messages are end-to-end encrypted once both accounts have messaging set up?",
        IsSender: false,
        SenderInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.alex.publicKey,
          AccessGroupKeyName: "default-key",
        },
        RecipientInfo: {
          OwnerPublicKeyBase58Check: DEMO_USER.publicKey,
          AccessGroupKeyName: "default-key",
        },
        MessageInfo: {
          TimestampNanos: (now - 12 * minute) * 1e6,
          TimestampNanosString: `${(now - 12 * minute) * 1e6}`,
        },
      } as DecryptedMessageEntryResponse,
      {
        DecryptedMessage:
          "Yes — encrypted on-device with access-group keys and decrypted locally. If a recipient hasn't set up messaging, Supmate asks for an explicit opt-in before anything plaintext would leave your device.",
        IsSender: true,
        SenderInfo: {
          OwnerPublicKeyBase58Check: DEMO_USER.publicKey,
          AccessGroupKeyName: "default-key",
        },
        RecipientInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.alex.publicKey,
          AccessGroupKeyName: "default-key",
        },
        MessageInfo: {
          TimestampNanos: (now - 30 * minute) * 1e6,
          TimestampNanosString: `${(now - 30 * minute) * 1e6}`,
        },
      } as DecryptedMessageEntryResponse,
    ],
  },
  [DEMO_MEMBERS.sarah.publicKey]: {
    firstMessagePublicKey: DEMO_MEMBERS.sarah.publicKey,
    ChatType: ChatType.DM,
    messages: [
      {
        DecryptedMessage:
          "The preview UI feels a lot calmer now — restrained glass, cleaner spacing.",
        IsSender: false,
        SenderInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.sarah.publicKey,
          AccessGroupKeyName: "default-key",
        },
        RecipientInfo: {
          OwnerPublicKeyBase58Check: DEMO_USER.publicKey,
          AccessGroupKeyName: "default-key",
        },
        MessageInfo: {
          TimestampNanos: (now - 3 * hour) * 1e6,
          TimestampNanosString: `${(now - 3 * hour) * 1e6}`,
        },
      } as DecryptedMessageEntryResponse,
    ],
  },
  [DEMO_MEMBERS.neoTrader.publicKey]: {
    firstMessagePublicKey: DEMO_MEMBERS.neoTrader.publicKey,
    ChatType: ChatType.DM,
    messages: [
      {
        DecryptedMessage:
          "Testing Supmate's cross-identity resolution from the search bar — DeSo keys and 0x addresses. Clean.",
        IsSender: false,
        SenderInfo: {
          OwnerPublicKeyBase58Check: DEMO_MEMBERS.neoTrader.publicKey,
          AccessGroupKeyName: "default-key",
        },
        RecipientInfo: {
          OwnerPublicKeyBase58Check: DEMO_USER.publicKey,
          AccessGroupKeyName: "default-key",
        },
        MessageInfo: {
          TimestampNanos: (now - 5 * hour) * 1e6,
          TimestampNanosString: `${(now - 5 * hour) * 1e6}`,
        },
      } as DecryptedMessageEntryResponse,
    ],
  },
};

export const DEMO_USERNAME_MAP: Record<string, string> = {
  [DEMO_USER.publicKey]: DEMO_USER.name,
  [DEMO_MEMBERS.alex.publicKey]: DEMO_MEMBERS.alex.name,
  [DEMO_MEMBERS.sarah.publicKey]: DEMO_MEMBERS.sarah.name,
  [DEMO_MEMBERS.neonSquad.publicKey]: DEMO_MEMBERS.neonSquad.name,
  [DEMO_MEMBERS.neoTrader.publicKey]: DEMO_MEMBERS.neoTrader.name,
};

export const DEMO_GROUP_MEMBERS_MAP: Record<
  string,
  Record<string, ProfileEntryResponse | null>
> = {
  "⚡ Supmate Alpha Guild": {
    [DEMO_USER.publicKey]: {
      Username: DEMO_USER.handle,
      Description: DEMO_USER.bio,
      PublicKeyBase58Check: DEMO_USER.publicKey,
    } as any,
    [DEMO_MEMBERS.alex.publicKey]: {
      Username: DEMO_MEMBERS.alex.handle,
      PublicKeyBase58Check: DEMO_MEMBERS.alex.publicKey,
    } as any,
    [DEMO_MEMBERS.sarah.publicKey]: {
      Username: DEMO_MEMBERS.sarah.handle,
      PublicKeyBase58Check: DEMO_MEMBERS.sarah.publicKey,
    } as any,
    [DEMO_MEMBERS.neoTrader.publicKey]: {
      Username: DEMO_MEMBERS.neoTrader.handle,
      PublicKeyBase58Check: DEMO_MEMBERS.neoTrader.publicKey,
    } as any,
  },
};
