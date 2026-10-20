/**
 * TypeScript types for GenLayer StakedTakes contract
 */

export type TakeStatus =
  | "open"
  | "pending_appeal"
  | "appeal_resolved"
  | "finalized"
  | "retracted";

export type Verdict = "" | "TRUE" | "FALSE" | "INVALID";

export interface Take {
  take_id: string;
  author: string;
  category: string;
  claim: string;
  criteria: string;
  source_url: string;
  source_url_fallback: string;
  confidence: number;
  stake: number;
  created_at: string;
  created_ms: number;
  resolve_at: number;
  status: TakeStatus;
  verdict: Verdict;
  original_verdict: string;
  reasoning: string;
  resolved_at: string;
  appeal_deadline: number;
  appellant: string;
  appeal_bond: number;
  payout: number;
}

export interface Profile {
  wallet: string;
  handle: string;
  joined_at: string;
  takes_posted: number;
  resolved_true: number;
  resolved_false: number;
  resolved_invalid: number;
  active_stake: number;
  staked_resolved: number;
  brier_weighted_sum: number;
  total_weight: number;
  take_ids: string[];
}

export interface Credibility {
  wallet: string;
  handle: string;
  rated: boolean;
  index_bps: number;
  hit_rate_bps: number;
  avg_brier_bps: number;
  resolved_true: number;
  resolved_false: number;
  resolved_invalid: number;
  takes_posted: number;
  staked_resolved: number;
  active_stake: number;
}

export interface Config {
  admin: string;
  treasury: string;
  protocol_fee_bps: number;
  reward_bps: number;
  appeal_window_ms: number;
  appeal_bond: number;
  min_stake: number;
  retract_window_ms: number;
  reward_pool: number;
}

export interface PostTakeParams {
  claim: string;
  criteria: string;
  category: string;
  source_url: string;
  source_url_fallback?: string;
  confidence: number;
  resolve_after_minutes: number;
}

export interface AppealTakeParams {
  take_id: string;
  appeal_context: string;
}

export interface TakeFilters {
  status?: TakeStatus;
  category?: string;
  author?: string;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: unknown;
}

/**
 * Parsed return types for contract view methods.
 */
export type GetTakeResult = Take;
export type GetRecentTakesResult = Take[];
export type GetTakesByStatusResult = Take[];
export type GetUserTakesResult = Take[];
export type GetCredibilityResult = Credibility;
export type GetConfigResult = Config;
export type GetWalletByHandleResult = string;
export type GetLeaderboardResult = Credibility[];