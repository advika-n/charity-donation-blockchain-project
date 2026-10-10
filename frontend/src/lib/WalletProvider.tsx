import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  getAuthorizedAccount,
  getChainId,
  getInjectedProvider,
  hasInjectedWallet,
  requestConnection,
} from "./wallet";
import {
  WalletContext,
  initialWalletState,
  type WalletContextValue,
  type WalletState,
} from "./walletContextValue";

function messageFor(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    ((err as { code?: unknown }).code === 4001 ||
      (err as { code?: unknown }).code === "ACTION_REJECTED")
  ) {
    return "Connection request rejected";
  }
  if (err instanceof Error) return err.message;
  return "Failed to connect wallet";
}

export function WalletProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: hasInjectedWallet() is a synchronous, side-effect-free
  // read of window.ethereum, so it's resolved once at render time rather than
  // via a setState-in-effect on mount (which would trigger an extra render).
  const [state, setState] = useState<WalletState>(() => ({
    ...initialWalletState,
    isWalletInstalled: hasInjectedWallet(),
  }));
  // Guards setState calls that might resolve after this provider unmounts.
  const mountedRef = useRef(true);

  const connect = useCallback(async () => {
    if (!hasInjectedWallet()) {
      setState((s) => ({
        ...s,
        status: "error",
        error: "No wallet found — please install MetaMask",
        isWalletInstalled: false,
        provider: null,
      }));
      return;
    }
    setState((s) => ({ ...s, status: "connecting", error: null }));
    try {
      const { provider, address } = await requestConnection();
      const chainId = await getChainId(provider);
      if (!mountedRef.current) return;
      setState({ status: "connected", address, chainId, error: null, isWalletInstalled: true, provider });
    } catch (err) {
      if (!mountedRef.current) return;
      setState((s) => ({ ...s, status: "error", error: messageFor(err) }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState((s) => ({
      ...s,
      status: "disconnected",
      address: null,
      chainId: null,
      error: null,
      provider: null,
    }));
  }, []);

  // Runs once: detect wallet presence, silently restore an already-authorized
  // connection (no popup), and subscribe to MetaMask's account/chain events so
  // state stays correct if the user switches accounts or networks directly in
  // the extension, with no page reload.
  useEffect(() => {
    mountedRef.current = true;
    if (!hasInjectedWallet()) return;

    getAuthorizedAccount()
      .then(async (existing) => {
        if (!mountedRef.current || !existing) return;
        const chainId = await getChainId(existing.provider).catch(() => null);
        if (!mountedRef.current) return;
        setState({
          status: "connected",
          address: existing.address,
          chainId,
          error: null,
          isWalletInstalled: true,
          provider: existing.provider,
        });
      })
      .catch(() => {
        /* no pre-existing authorization — stay disconnected, not an error */
      });

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = (args[0] as string[] | undefined) ?? [];
      if (accounts.length === 0) {
        // User disconnected all accounts (or revoked access) from MetaMask's side.
        setState((s) => ({ ...s, status: "disconnected", address: null, error: null, provider: null }));
        return;
      }
      // A provider may not exist yet if this fired before our own connect()
      // ran (e.g. the user approved via the MetaMask UI directly) — create one.
      setState((s) => ({
        ...s,
        status: "connected",
        address: accounts[0],
        error: null,
        provider: s.provider ?? getInjectedProvider(),
      }));
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainIdHex = args[0] as string;
      setState((s) => ({ ...s, chainId: parseInt(chainIdHex, 16) }));
    };

    window.ethereum?.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum?.on?.("chainChanged", handleChainChanged);

    return () => {
      mountedRef.current = false;
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const value: WalletContextValue = { ...state, connect, disconnect };
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
