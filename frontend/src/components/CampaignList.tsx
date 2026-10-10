import { useEffect, useState } from "react";
import { formatEther } from "ethers";
import { fetchCampaigns } from "../lib/api";
import { shortenAddress } from "../lib/format";
import type { Campaign } from "../types/campaign";

type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; campaigns: Campaign[] };

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

/**
 * Fetches GET /campaigns from the Express API on mount (cached indexer data,
 * not a live chain read — see CampaignDetail for the direct-chain pattern).
 */
export function CampaignList({ selectedId, onSelect }: Props) {
  const [state, setState] = useState<ListState>({ status: "loading" });

  useEffect(() => {
    // Runs once on mount ([] deps) — initial state above is already "loading",
    // so no reset is needed here before the fetch starts.
    let cancelled = false;
    fetchCampaigns()
      .then((res) => {
        if (cancelled) return;
        setState({ status: "loaded", campaigns: res.campaigns });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to load campaigns",
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p>Loading campaigns…</p>;
  if (state.status === "error") return <p role="alert">{state.message}</p>;
  if (state.campaigns.length === 0) return <p>No campaigns yet.</p>;

  return (
    <ul>
      {state.campaigns.map((c) => (
        <li key={c.id}>
          <button type="button" onClick={() => onSelect(c.id)} aria-pressed={selectedId === c.id}>
            <strong>Campaign #{c.id}</strong> — beneficiary {shortenAddress(c.beneficiary)}
            <br />
            Balance: {formatEther(c.balance)} ETH · Reserved: {formatEther(c.reserved)} ETH ·{" "}
            Available: {formatEther(c.available)} ETH · Milestones: {c.milestoneCount}
          </button>
        </li>
      ))}
    </ul>
  );
}
