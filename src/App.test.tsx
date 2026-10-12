import React from "react";
import { render, screen } from "@testing-library/react";

// The real deso-protocol package boots an Identity iframe and reaches for
// browser APIs that jsdom does not implement. We only need the small surface
// touched during a first paint, so provide an inert mock for those exports.
jest.mock("deso-protocol", () => ({
  configure: jest.fn(),
  DeSoNetwork: { mainnet: "mainnet", testnet: "testnet" },
  ChatType: { DM: "DM", GROUPCHAT: "GROUPCHAT" },
  NOTIFICATION_EVENTS: {
    SUBSCRIBE: "SUBSCRIBE",
    LOGIN_END: "LOGIN_END",
    CHANGE_ACTIVE_USER: "CHANGE_ACTIVE_USER",
    AUTHORIZE_DERIVED_KEY_START: "AUTHORIZE_DERIVED_KEY_START",
    LOGOUT_END: "LOGOUT_END",
  },
  identity: {
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn(),
    setActiveUser: jest.fn(),
    snapshot: jest.fn(() => ({ currentUser: null, alternateUsers: {} })),
    encryptMessage: jest.fn(),
    decryptMessage: jest.fn(),
    ethereumAddressToDesoAddress: jest.fn(),
    verifyPhoneNumber: jest.fn(),
  },
  createAccessGroup: jest.fn().mockResolvedValue({}),
  getAllAccessGroups: jest.fn().mockResolvedValue({
    AccessGroupsOwned: [],
    AccessGroupsMember: [],
  }),
  getUsersStateless: jest.fn().mockResolvedValue({ UserList: [] }),
  getProfiles: jest.fn().mockResolvedValue({ ProfilesFound: [] }),
  getSingleProfile: jest.fn().mockResolvedValue({}),
  getPaginatedDMThread: jest.fn().mockResolvedValue({ ThreadMessages: [] }),
  getPaginatedGroupChatThread: jest
    .fn()
    .mockResolvedValue({ GroupChatMessages: [] }),
  checkPartyAccessGroups: jest.fn().mockResolvedValue({}),
  sendDMMessage: jest.fn(),
  sendGroupChatMessage: jest.fn(),
  waitForTransactionFound: jest.fn(),
  addAccessGroupMembers: jest.fn(),
}));

import App from "./App";

describe("App", () => {
  beforeEach(() => {
    // Skip the timed splash animation so the shell renders immediately.
    sessionStorage.setItem("sm_splash_v3", "1");
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("renders the Supmate brand in the header", () => {
    render(<App />);
    expect(screen.getAllByText("SUPMATE").length).toBeGreaterThan(0);
  });

  it("offers a way to connect an account before authentication", () => {
    render(<App />);
    expect(screen.getAllByText(/connect/i).length).toBeGreaterThan(0);
  });
});