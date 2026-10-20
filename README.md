# StakedTakes

Public staked claims on GenLayer.  
An author posts a falsifiable claim with explicit criteria and one or two source URLs, locks GEN, and sets a resolve time.  
Validators fetch those exact sources and return TRUE, FALSE, or INVALID.  
The author’s credibility is updated using a stake-weighted Brier score.

## Architecture

- **Claim lifecycle**  
  `open` → `pending_appeal` → `appeal_resolved` → `finalized`  
  (or `retracted` before the resolve window)

- **Resolution**  
  Anyone can call `resolve_take` after `resolve_at`.  
  The contract fetches the author-supplied URLs and runs a non-deterministic judgment.  
  Validators must agree on the verdict.  
  One appeal is allowed during the appeal window (requires a bond).

- **Payouts**  
  - TRUE → author receives stake + possible bonus from the reward pool  
  - FALSE → stake is slashed; a portion goes to the protocol and the reward pool  
  - INVALID → full refund  
  - Retracted → full refund (only before resolve window)

- **Credibility (Brier)**  
  On finalize of a TRUE or FALSE verdict the author’s profile is updated:  
  - Brier score = (confidence − outcome)² where outcome is 1 or 0  
  - Weighted by √stake  
  - Credibility index (0–10,000) is derived from the weighted mean Brier  
  - Hit rate is resolved_true / (resolved_true + resolved_false)  
  - Leaderboard ranks by index, then by total staked on resolved takes

- **Handles**  
  Optional unique handle per wallet.  
  Profiles are created on first take or explicit registration.

## Contract

`contracts/stakedtakes.py`

| Method | Notes |
|--------|-------|
| `post_take(...)` | Payable. Confidence 51–99. Source URLs frozen. |
| `resolve_take(take_id)` | After deadline. Sets verdict + reasoning. |
| `appeal_take(take_id, context)` | Payable bond. One appeal. |
| `finalize_take(take_id)` | Pays out and updates Brier. |
| `retract_take(take_id)` | Only before resolve window. |
| `set_handle(handle)` | Unique, 3–20 chars. |

Views: `get_take`, `get_recent_takes`, `get_user_takes`, `get_profile`, `get_credibility`, `get_leaderboard`, `get_config`

## Frontend

- Client: `src/lib/contracts/StakedTakes.ts`  
- Hooks: `src/lib/hooks/useStakedTakes.ts`  
- Types: `src/lib/contracts/types.ts`

## Constraints

- Minimum stake and appeal bond are set at deployment  
- Protocol fee and reward share come from FALSE stakes only  
- No source URL changes after posting  
- INVALID never updates credibility

## Local

```bash
pytest tests/direct/test_stakedtakes.py -v
npm install && npm run dev