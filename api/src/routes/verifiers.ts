import { Router } from "express";
import { query } from "../db.js";
import { depId } from "../deployment.js";
import { wrap } from "../errors.js";
import { limitParam } from "../params.js";

export const verifiers = Router();

interface VerifierRow {
  address: string;
  staked_amount: string;
  reputation: number;
  is_verifier: boolean;
  against_strikes: number;
  first_joined_block: string | null;
}

// ── GET /verifiers/leaderboard ────────────────────────────────────────────
// reputation desc, with stakedAmount + isVerifier. ?limit= (default 100).
verifiers.get(
  "/leaderboard",
  wrap(async (req, res) => {
    const limit = limitParam(req.query.limit, 100, 500);
    const rows = await query<VerifierRow>(
      `SELECT address, staked_amount, reputation, is_verifier,
              against_strikes, first_joined_block
         FROM verifiers
        WHERE deployment_id = $1
        ORDER BY reputation DESC, staked_amount DESC, address ASC
        LIMIT $2`,
      [depId(), limit],
    );
    res.json({
      count: rows.length,
      limit,
      leaderboard: rows.map((r, i) => ({
        rank: i + 1,
        address: r.address,
        reputation: r.reputation,
        stakedAmount: r.staked_amount,
        isVerifier: r.is_verifier,
        againstStrikes: r.against_strikes,
        firstJoinedBlock:
          r.first_joined_block === null ? null : Number(r.first_joined_block),
      })),
    });
  }),
);
