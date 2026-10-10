import { Contract, type ContractRunner } from "ethers";
import campaignEscrowAbi from "../abi/CampaignEscrow.json";
import { CAMPAIGN_ESCROW_ADDRESS } from "./constants";

/**
 * Establishes the pattern every future contract (VerifierRegistry,
 * MilestoneVoting, ProofRegistry) will follow: ABI copied verbatim from the
 * matching Hardhat artifact into src/abi/, address in constants.ts, one
 * factory function here.
 *
 * `ContractRunner` is ethers v6's shared supertype for both a read-only
 * Provider and a Signer — pass a `BrowserProvider` (from useWallet) for reads,
 * or a `Signer` once write operations are implemented in a later phase.
 */
export function getCampaignEscrowContract(runner: ContractRunner): Contract {
  return new Contract(CAMPAIGN_ESCROW_ADDRESS, campaignEscrowAbi, runner);
}
