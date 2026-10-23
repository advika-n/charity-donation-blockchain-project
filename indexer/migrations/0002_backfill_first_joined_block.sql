-- Backfill verifiers.first_joined_block for rows indexed before the
-- VerifierJoined handler fix. stake() emits ReputationChanged before
-- VerifierJoined, so the row already existed and the old ON CONFLICT branch
-- never wrote first_joined_block. event_log has every VerifierJoined, so the
-- earliest one per address is the true join block.
--
-- Idempotent: only touches rows that are still NULL, so re-running
-- `npm run db:migrate` is harmless.

BEGIN;

UPDATE verifiers v
   SET first_joined_block = j.first_block
  FROM (
    SELECT deployment_id,
           lower(args->>'verifier') AS address,
           MIN(block_number)        AS first_block
      FROM event_log
     WHERE event_name = 'VerifierJoined'
     GROUP BY deployment_id, lower(args->>'verifier')
  ) j
 WHERE v.first_joined_block IS NULL
   AND v.deployment_id = j.deployment_id
   AND v.address       = j.address;

COMMIT;
