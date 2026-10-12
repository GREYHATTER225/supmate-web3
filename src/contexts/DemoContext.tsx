import { createContext } from "react";

export type ThemeMode = "cyber-dark" | "synthwave-sunset" | "matrix-neo";

export interface DemoContextType {
  isDemoMode: boolean;
  theme: ThemeMode;
  setIsDemoMode: (val: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
  isTransitioning: boolean;
  transitionMessage: string;
  triggerWarpTransition: (targetDemoState: boolean, onFinished?: () => void) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  isIntelOpen: boolean;
  setIsIntelOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  theme: "cyber-dark",
  setIsDemoMode: () => {
    return;
  },
  setTheme: () => {
    return;
  },
  isAuthModalOpen: false,
  setIsAuthModalOpen: () => {
    return;
  },
  isTransitioning: false,
  transitionMessage: "",
  triggerWarpTransition: () => {
    return;
  },
  soundEnabled: true,
  setSoundEnabled: () => {
    return;
  },
  isIntelOpen: false,
  setIsIntelOpen: () => {
    return;
  },
});
