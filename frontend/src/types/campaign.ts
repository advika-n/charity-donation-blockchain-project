/**
 * One item of GET /campaigns's `campaigns` array — see
 * api/src/routes/campaigns.ts's `mapCampaign()`. Wei amounts are decimal
 * strings (uint256 doesn't fit in a JS number) — format with
 * ethers.formatEther() before display.
 */
export interface Campaign {
  id: number;
  beneficiary: string;
  creator: string;
  /** Current campaign balance, wei, decimal string. */
  balance: string;
  /** Portion of `balance` committed to a Timelocked/Disputed milestone, wei. */
  reserved: string;
  /** `balance - reserved`, wei. */
  available: string;
  milestoneCount: number;
  /** ISO 8601 timestamp of the CampaignCreated block. */
  createdAt: string;
  createdBlock: number;
  createdTx: string;
}

/** GET /campaigns's full response shape. */
export interface CampaignListResponse {
  count: number;
  sort: string | null;
  limit: number;
  campaigns: Campaign[];
}
