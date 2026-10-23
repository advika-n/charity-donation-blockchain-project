import { useWallet } from "../lib/useWallet";
import { TARGET_CHAIN_ID, chainName } from "../lib/constants";
import { shortenAddress } from "../lib/format";

export function ConnectWalletButton() {
  const { status, address, chainId, error, isWalletInstalled, connect, disconnect } = useWallet();

  if (!isWalletInstalled) {
    return <p role="alert">No wallet found — please install MetaMask</p>;
  }

  if (status === "connected" && address) {
    const wrongNetwork = chainId !== TARGET_CHAIN_ID;
    return (
      <div>
        <span>{shortenAddress(address)}</span>{" "}
        <button type="button" onClick={disconnect}>
          Disconnect
        </button>
        {wrongNetwork && (
          <p role="alert">Wrong network — please switch to {chainName(TARGET_CHAIN_ID)} in MetaMask</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => void connect()} disabled={status === "connecting"}>
        {status === "connecting" ? "Connecting…" : "Connect Wallet"}
      </button>
      {status === "error" && error && <p role="alert">{error}</p>}
    </div>
  );
}
