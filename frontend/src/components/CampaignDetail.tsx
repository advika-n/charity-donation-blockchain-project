import { useEffect, useState } from "react";
import { formatEther } from "ethers";
import { useWallet } from "../lib/useWallet";
import { getCampaignEscrowContract } from "../lib/contracts";

// Solidity: enum State { Pending, Timelocked, Released, Disputed, Rejected }
// (contracts/interfaces/ICampaignEscrow.sol) — index matches the uint8 the
// contract returns.
const MILESTONE_STATE_LABELS = ["Pending", "Timelocked", "Released", "Disputed", "Rejected"];

interface OnChainMilestone {
  description: string;
  amount: string;
  state: number;
  releaseAfter: number;
}
interface OnChainCampaign {
  creator: string;
  beneficiary: string;
  balance: string;
  reserved: string;
  milestones: OnChainMilestone[];
}

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; data: OnChainCampaign };

interface Props {
  campaignId: number;
}

/**
 * Reads ONE campaign's current state directly from CampaignEscrow via ethers —
 * not the API's cache. Read-only (getCampaign/getMilestone are `view`), so it
 * only needs a Provider, never a Signer — but a Provider still requires a
 * connected wallet in this app (see lib/wallet.ts), hence the guard below.
 *
 * The parent renders this with `key={campaignId}` (see App.tsx), so switching
 * to a different campaign remounts the component instead of this effect
 * needing to manually reset state back to "loading" mid-lifetime. If `provider`
 * alone changes (e.g. the user switches accounts) while `campaignId` stays the
 * same, the previous campaign's data is intentionally left on screen until the
 * re-read resolves, rather than flashing back to a loading state.
 */
export function CampaignDetail({ campaignId }: Props) {
  const { provider } = useWallet();
  const [state, setState] = useState<DetailState>({ status: "loading" });

  useEffect(() => {
    if (!provider) return;
    let cancelled = false;

    (async () => {
      const contract = getCampaignEscrowContract(provider);

      const [creator, beneficiary, balance, reserved, milestoneCount]: [
        string,
        string,
        bigint,
        bigint,
        bigint,
      ] = await contract.getCampaign(campaignId);

      const milestones: OnChainMilestone[] = [];
      for (let i = 0n; i < milestoneCount; i++) {
        const [description, amount, mState, releaseAfter]: [string, bigint, bigint, bigint] =
          await contract.getMilestone(campaignId, i);
        milestones.push({
          description,
          amount: amount.toString(),
          state: Number(mState),
          releaseAfter: Number(releaseAfter),
        });
      }

      if (cancelled) return;
      setState({
        status: "loaded",
        data: {
          creator,
          beneficiary,
          balance: balance.toString(),
          reserved: reserved.toString(),
          milestones,
        },
      });
    })().catch((err: unknown) => {
      if (cancelled) return;
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to read campaign from the contract",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [provider, campaignId]);

  if (!provider) {
    return <p>Connect your wallet to view this campaign's live on-chain state.</p>;
  }
  if (state.status === "loading") return <p>Reading campaign #{campaignId} from the contract…</p>;
  if (state.status === "error") return <p role="alert">{state.message}</p>;

  const { data } = state;
  return (
    <section>
      <h3>Campaign #{campaignId} — live on-chain state</h3>
      <p>Creator: {data.creator}</p>
      <p>Beneficiary: {data.beneficiary}</p>
      <p>Balance: {formatEther(data.balance)} ETH</p>
      <p>Reserved: {formatEther(data.reserved)} ETH</p>
      <h4>Milestones</h4>
      <ol>
        {data.milestones.map((m, i) => (
          <li key={i}>
            {m.description} — {formatEther(m.amount)} ETH —{" "}
            {MILESTONE_STATE_LABELS[m.state] ?? `state ${m.state}`}
            {m.state === 1 && m.releaseAfter > 0 && (
              <> — releasable after {new Date(m.releaseAfter * 1000).toLocaleString()}</>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
