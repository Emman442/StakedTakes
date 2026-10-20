import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Take, Profile as UserProfile } from "@/lib/contracts/types";
import { TakeCard } from "./TakeCard";
import getAddress from "viem"
import { formatGEN, shortenAddress } from "../utils/brier";

interface ProfileViewProps {
  user: UserProfile;
  userTakes: Take[];
  onSelectTake?: (take: Take) => void;
  onPostTake: () => void;
  onResetToMe?: () => void;
  isCurrentUser: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  userTakes,
  onSelectTake,
  onPostTake,
  onResetToMe,
  isCurrentUser,
}) => {
  const [filter, setFilter] = useState<"all" | "open" | "finalized">("all");

  const filteredTakes = userTakes.filter((take) => {
    if (filter === "open") {
      return take.status === "open" || take.status === "pending_appeal" || take.status === "appeal_resolved";
    }
    if (filter === "finalized") return take.status === "finalized";
    return true;
  });

  // Credibility index is already in bps (0–10000)
  const ci = user.brier_weighted_sum && user.total_weight
    ? Math.round((user.brier_weighted_sum / user.total_weight) * -1 + 10000) // approximate if needed
    : 0;
  const ciPercentage = Math.min(100, Math.max(0, (ci / 10000) * 100));

  const resolved = user.resolved_true + user.resolved_false;
  const hitRate = resolved > 0 ? ((user.resolved_true / resolved) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner & User Meta */}
      <div className="border border-[#242428] bg-[#17171A] p-6 sm:p-8 mb-8">
        {!isCurrentUser && (
          <Link
            to="/profile"
            onClick={onResetToMe}
            className="mb-4 inline-flex items-center text-xs font-mono text-[#00E5A0] hover:underline gap-1 cursor-pointer"
          >
            ← Return to my profile
          </Link>
        )}

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] tracking-tight font-mono">
                {user.handle || shortenAddress(user.wallet)}
              </h1>
              {isCurrentUser && (
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 border border-[#00E5A0]/40 text-[#00E5A0] bg-[#00E5A0]/10">
                  CURRENT USER
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#71717A]">
              <span className="text-[#A1A1AA]">{shortenAddress(user.wallet)}</span>
              <span aria-hidden="true">·</span>
              <span>Joined {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : "—"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isCurrentUser && (
              <button
                type="button"
                onClick={onPostTake}
                className="cursor-pointer px-4 py-2 text-xs font-mono font-semibold bg-[#00E5A0] text-[#0A0A0B] hover:bg-[#00E5A0]/90 transition-colors whitespace-nowrap border border-[#00E5A0]"
              >
                + Post a New Take
              </button>
            )}
          </div>
        </div>

        {/* Credibility Index Visualization Bar */}
        <div className="mt-8 pt-6 border-t border-[#242428]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3">
            <div>
              <div className="text-xs font-mono text-[#71717A] uppercase tracking-wider">
                Public Credibility Index
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#00E5A0] tabular-nums mt-0.5">
                {ci.toLocaleString()}
                <span className="text-sm font-normal text-[#71717A] ml-2">/ 10,000</span>
              </div>
            </div>

            <div className="text-xs font-mono text-[#A1A1AA] sm:text-right">
              <div>Calculated across {resolved} resolved stakes</div>
            </div>
          </div>

          <div className="w-full bg-[#111113] border border-[#242428] h-3 relative overflow-hidden">
            <div
              className="bg-[#00E5A0] h-full transition-all duration-500 ease-out"
              style={{ width: `${ciPercentage}%` }}
              role="progressbar"
              aria-valuenow={ci}
              aria-valuemin={0}
              aria-valuemax={10000}
              aria-label="Credibility Index gauge"
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-[#71717A] mt-2">
            <span>0 (Completely uncalibrated)</span>
            <span>5,000 (Random baseline)</span>
            <span>10,000 (Flawless prediction)</span>
          </div>
        </div>

        {/* Key Quantitative Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#242428]">
          <div>
            <div className="text-[11px] font-mono text-[#71717A] uppercase mb-1">
              Historical Hit Rate
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#FAFAFA] tabular-nums">
              {hitRate}%
            </div>
            <div className="text-[11px] font-mono text-[#71717A] mt-0.5">
              {user.resolved_true} won · {user.resolved_false} lost
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-[#71717A] uppercase mb-1">
              Mean Brier Score
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#FAFAFA] tabular-nums">
              {user.total_weight > 0
                ? (user.brier_weighted_sum / user.total_weight / 10000).toFixed(3)
                : "—"}
            </div>
            <div className="text-[11px] font-mono text-[#71717A] mt-0.5">
              Lower is better
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-[#71717A] uppercase mb-1">
              Active Stake Locked
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#00E5A0] tabular-nums">
              {formatGEN(user.active_stake)}
            </div>
            <div className="text-[11px] font-mono text-[#71717A] mt-0.5">
              Across active takes
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-[#71717A] uppercase mb-1">
              Total GEN Staked
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#FAFAFA] tabular-nums">
              {formatGEN(user.staked_resolved)}
            </div>
            <div className="text-[11px] font-mono text-[#71717A] mt-0.5">
              Lifetime volume
            </div>
          </div>
        </div>
      </div>

      {/* User's Takes Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242428] pb-4">
          <h2 className="text-xl font-bold text-[#FAFAFA] tracking-tight">
            Takes by {user.handle || shortenAddress(user.wallet)} ({filteredTakes.length})
          </h2>

          <div className="flex items-center gap-1 border border-[#242428] p-1 bg-[#111113] text-xs font-mono">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 transition-colors cursor-pointer ${
                filter === "all" ? "bg-[#242428] text-[#FAFAFA] font-medium" : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              All ({userTakes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("open")}
              className={`px-3 py-1 transition-colors cursor-pointer ${
                filter === "open" ? "bg-[#242428] text-[#FAFAFA] font-medium" : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              Open / In Flight
            </button>
            <button
              type="button"
              onClick={() => setFilter("finalized")}
              className={`px-3 py-1 transition-colors cursor-pointer ${
                filter === "finalized" ? "bg-[#242428] text-[#FAFAFA] font-medium" : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              Resolved & Settled
            </button>
          </div>
        </div>

        {filteredTakes.length === 0 ? (
          <div className="border border-[#242428] bg-[#17171A] p-12 text-center text-xs font-mono text-[#71717A]">
            No takes found in this status category.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTakes.map((take) => (
              <TakeCard
                key={take.take_id}
                take={take}
                onSelect={onSelectTake}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};