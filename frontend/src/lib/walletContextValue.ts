import { createContext } from "react";
import type { BrowserProvider } from "ethers";

export type WalletStatus = "disconnected" | "connecting" | "connected" | "error";

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  chainId: number | null;
  error: string | null;
  /** Whether an injected wallet (MetaMask or otherwise) was found at all. */
  isWalletInstalled: boolean;
  /**
   * The ethers provider wrapping window.ethereum, set whenever `status ===
   * "connected"` (null otherwise). Read-only contract calls (no signer
   * required) go through this — see lib/contracts.ts.
   */
  provider: BrowserProvider | null;
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  /**
   * Clears this dApp's local connection state. MetaMask has no reliable
   * programmatic "revoke" API for a dApp to call, so this does NOT actually
   * disconnect the site in MetaMask — the user stays authorized there until
   * they remove the connection themselves (Settings -> Connected sites).
   */
  disconnect: () => void;
}

export const initialWalletState: WalletState = {
  status: "disconnected",
  address: null,
  chainId: null,
  error: null,
  isWalletInstalled: false,
  provider: null,
};

export const WalletContext = createContext<WalletContextValue | null>(null);
