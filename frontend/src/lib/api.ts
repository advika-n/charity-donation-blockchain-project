import type { CampaignListResponse } from "../types/campaign";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /campaigns from the Express API — see api/src/routes/campaigns.ts.
 * Response shape confirmed against that route's actual `mapCampaign()` output,
 * not assumed: `{ count, sort, limit, campaigns: Campaign[] }`.
 *
 * Throws a descriptive Error on a network failure (API not running) or a
 * non-2xx response, so callers can show a real failure state instead of
 * quietly rendering nothing.
 */
export async function fetchCampaigns(): Promise<CampaignListResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/campaigns`);
  } catch {
    throw new Error(
      `Could not reach the API at ${API_BASE_URL} — is it running? (npm start in /api)`,
    );
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`API returned ${response.status} ${response.statusText}${body ? `: ${body}` : ""}`);
  }
  return (await response.json()) as CampaignListResponse;
}
