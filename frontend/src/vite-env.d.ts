/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Express API in /api (see .env.example). */
  readonly VITE_API_BASE_URL: string;
  /** 31337 (local Hardhat) or 11155111 (Sepolia). Defaults to 31337. */
  readonly VITE_CHAIN_ID?: string;
  /** Deployed contract addresses; default to the local Hardhat deploy. */
  readonly VITE_ESCROW_ADDRESS?: string;
  readonly VITE_REGISTRY_ADDRESS?: string;
  readonly VITE_VOTING_ADDRESS?: string;
  readonly VITE_PROOFS_ADDRESS?: string;
  /** IPFS gateway host for proof links. Defaults to gateway.pinata.cloud. */
  readonly VITE_PINATA_GATEWAY?: string;
}
