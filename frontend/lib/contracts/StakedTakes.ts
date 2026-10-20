import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { parseEther } from "viem";
import type {
  Take,
  Credibility,
  Config,
  TransactionReceipt,
  PostTakeParams,
  AppealTakeParams,
  Profile,
} from "./types";
import { getAddress } from "viem"



const DEFAULT_PAGE_SIZE = 50;

function asRecord(value: unknown): Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, any>;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toStringValue(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function normalizeTake(raw: unknown): Take {
  const data = asRecord(raw);
  return {
    take_id: toStringValue(data.take_id),
    author: toStringValue(data.author),
    category: toStringValue(data.category),
    claim: toStringValue(data.claim),
    criteria: toStringValue(data.criteria),
    source_url: toStringValue(data.source_url),
    source_url_fallback: toStringValue(data.source_url_fallback),
    confidence: toNumber(data.confidence),
    stake: toNumber(data.stake),
    created_at: toStringValue(data.created_at),
    created_ms: toNumber(data.created_ms),
    resolve_at: toNumber(data.resolve_at),
    status: toStringValue(data.status) as Take["status"],
    verdict: toStringValue(data.verdict) as Take["verdict"],
    original_verdict: toStringValue(data.original_verdict),
    reasoning: toStringValue(data.reasoning),
    resolved_at: toStringValue(data.resolved_at),
    appeal_deadline: toNumber(data.appeal_deadline),
    appellant: toStringValue(data.appellant),
    appeal_bond: toNumber(data.appeal_bond),
    payout: toNumber(data.payout),
  };
}

function normalizeCredibility(raw: unknown): Credibility {
  const data = asRecord(raw);
  return {
    wallet: toStringValue(data.wallet),
    handle: toStringValue(data.handle),
    rated: Boolean(data.rated),
    index_bps: toNumber(data.index_bps),
    hit_rate_bps: toNumber(data.hit_rate_bps),
    avg_brier_bps: toNumber(data.avg_brier_bps),
    resolved_true: toNumber(data.resolved_true),
    resolved_false: toNumber(data.resolved_false),
    resolved_invalid: toNumber(data.resolved_invalid),
    takes_posted: toNumber(data.takes_posted),
    staked_resolved: toNumber(data.staked_resolved),
    active_stake: toNumber(data.active_stake),
  };
}

function normalizeProfile(raw: unknown): Profile {
  const data = asRecord(raw);
  return {
    wallet: toStringValue(data.wallet),
    handle: toStringValue(data.handle),
    joined_at: toStringValue(data.joined_at),
    takes_posted: toNumber(data.takes_posted),
    resolved_true: toNumber(data.resolved_true),
    resolved_false: toNumber(data.resolved_false),
    resolved_invalid: toNumber(data.resolved_invalid),
    active_stake: toNumber(data.active_stake),
    staked_resolved: toNumber(data.staked_resolved),
    brier_weighted_sum: toNumber(data.brier_weighted_sum),
    total_weight: toNumber(data.total_weight),
    take_ids: Array.isArray(data.take_ids) ? data.take_ids.map(String) : [],
  };
}

function normalizeConfig(raw: unknown): Config {
  const data = asRecord(raw);
  return {
    admin: toStringValue(data.admin),
    treasury: toStringValue(data.treasury),
    protocol_fee_bps: toNumber(data.protocol_fee_bps),
    reward_bps: toNumber(data.reward_bps),
    appeal_window_ms: toNumber(data.appeal_window_ms),
    appeal_bond: toNumber(data.appeal_bond),
    min_stake: toNumber(data.min_stake),
    retract_window_ms: toNumber(data.retract_window_ms),
    reward_pool: toNumber(data.reward_pool),
  };
}

class StakedTakes {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(contractAddress: string, address?: string | null, studioUrl?: string) {
    this.contractAddress = contractAddress as `0x${string}`;
    const config: any = { chain: studionet };
    if (address) config.account = address as `0x${string}`;
    if (studioUrl) config.endpoint = studioUrl;
    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    this.client = createClient({
      chain: studionet,
      account: address as `0x${string}`,
    });
  }

  private async read<T>(functionName: string, args: any[] = []): Promise<T> {
    return this.client.readContract({
      address: this.contractAddress,
      functionName,
      args,
    }) as Promise<T>;
  }

  private async write(
    functionName: string,
    args: any[],
    value: bigint = 0n
  ): Promise<TransactionReceipt> {
    await this.client.connect("studionet");
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName,
      args,
      value,
    });
    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.ACCEPTED,
      retries: 48,
      interval: 5000,
    });
    return receipt as TransactionReceipt;
  }

  // ──────────────────────────────────────────────
  // Views
  // ──────────────────────────────────────────────

  async getConfig(): Promise<Config> {
    return normalizeConfig(await this.read("get_config"));
  }

  async getTake(takeId: string): Promise<Take> {
    return normalizeTake(await this.read("get_take", [takeId]));
  }


  async getProfile(wallet: string){
    return normalizeProfile(await this.read("get_profile", [getAddress(wallet)]))
  }

  async getRecentTakes(offset = 0, limit = DEFAULT_PAGE_SIZE): Promise<Take[]> {
    const rows = await this.read<unknown>("get_recent_takes", [offset, limit]);
    return Array.isArray(rows) ? rows.map(normalizeTake) : [];
  }

  async getTakesByStatus(
    status: string,
    offset = 0,
    limit = DEFAULT_PAGE_SIZE
  ): Promise<Take[]> {
    const rows = await this.read<unknown>("get_takes_by_status", [status, offset, limit]);
    return Array.isArray(rows) ? rows.map(normalizeTake) : [];
  }

  async getUserTakes(
    wallet: string,
    offset = 0,
    limit = DEFAULT_PAGE_SIZE
  ): Promise<Take[]> {
    const rows = await this.read<unknown>("get_user_takes", [wallet, offset, limit]);
    return Array.isArray(rows) ? rows.map(normalizeTake) : [];
  }

  async getCredibility(wallet: string): Promise<Credibility> {
    return normalizeCredibility(await this.read("get_credibility", [wallet]));
  }

  async getWalletByHandle(handle: string): Promise<string> {
    return toStringValue(await this.read("get_wallet_by_handle", [handle]));
  }

  async getLeaderboard(limit = 20, minResolved = 1): Promise<Credibility[]> {
    const rows = await this.read<unknown>("get_leaderboard", [limit, minResolved]);
    return Array.isArray(rows) ? rows.map(normalizeCredibility) : [];
  }

  async getTotalTakes(): Promise<number> {
    return toNumber(await this.read("get_total_takes"));
  }

  async hasProfile(wallet: string): Promise<boolean> {
    return Boolean(await this.read("has_profile", [wallet]));
  }

  // ──────────────────────────────────────────────
  // Writes
  // ──────────────────────────────────────────────

  async setHandle(handle: string): Promise<TransactionReceipt> {
    return this.write("set_handle", [handle]);
  }

  async postTake(params: PostTakeParams, stakeGen: string | number): Promise<TransactionReceipt> {
    const value = parseEther(String(stakeGen));
    return this.write(
      "post_take",
      [
        params.claim,
        params.criteria,
        params.category,
        params.source_url,
        params.source_url_fallback ?? "",
        params.confidence,
        params.resolve_after_minutes,
      ],
      value
    );
  }

  async retractTake(takeId: string): Promise<TransactionReceipt> {
    return this.write("retract_take", [takeId]);
  }

  async resolveTake(takeId: string): Promise<TransactionReceipt> {
    return this.write("resolve_take", [takeId]);
  }

  async appealTake(params: AppealTakeParams, bondGen: string | number): Promise<TransactionReceipt> {
    const value = parseEther(String(bondGen));
    return this.write("appeal_take", [params.take_id, params.appeal_context], value);
  }

  async finalizeTake(takeId: string): Promise<TransactionReceipt> {
    return this.write("finalize_take", [takeId]);
  }
}

export default StakedTakes;