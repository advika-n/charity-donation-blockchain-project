/** Sepolia testnet chain ID (EIP-155) — the network this dApp targets. */
export const SEPOLIA_CHAIN_ID = 11155111;

/**
 * The deployed CampaignEscrow address on Sepolia — must match ESCROW_ADDRESS
 * in indexer/.env and api/.env (all three point at the same wired deployment;
 * see scripts/deploy.ts). Confirmed live at this address: campaignCount()/
 * getCampaign()/getMilestone() all return real data with this ABI.
 */
export const CAMPAIGN_ESCROW_ADDRESS = "0x94B57263330b13b2B7692786003654Aa11f33056";
