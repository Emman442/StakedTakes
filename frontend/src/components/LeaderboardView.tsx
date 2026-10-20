import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Credibility } from "@/lib/contracts/types";
import { formatGEN, shortenAddress } from "../utils/brier";

interface LeaderboardViewProps {
  users: Credibility[];
  onSelectUser?: (wallet: string) => void;
  onPostTake: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  users,
  onSelectUser,
  onPostTake,
}) => {
  const navigate = useNavigate();
  const [minResolved, setMinResolved] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"index_bps" | "hit_rate_bps" | "staked_resolved">("index_bps");

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const resolved = user.resolved_true + user.resolved_false;
        if (resolved < minResolved) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchHandle = user.handle.toLowerCase().includes(q);
          const matchWallet = user.wallet.toLowerCase().includes(q);
          if (!matchHandle && !matchWallet) return false;
        }
        return true;
      })
      .sort((a, b) => b[sortField] - a[sortField]);
  }, [users, minResolved, searchQuery, sortField]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242428] mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] tracking-tight">
            Credibility Index Rankings
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] font-mono mt-1">
            Global leaderboard ranked by quadratic Brier calibration score (0–10,000)
          </p>
        </div>

        <button
          type="button"
          onClick={onPostTake}
          className="cursor-pointer px-4 py-2 text-xs font-mono font-semibold bg-[#00E5A0] text-[#0A0A0B] hover:bg-[#00E5A0]/90 transition-colors whitespace-nowrap border border-[#00E5A0] self-start sm:self-auto"
        >
          Stake to Qualify
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by handle or 0x address..."
            className="w-full bg-[#111113] border border-[#242428] focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0] text-xs font-mono text-[#FAFAFA] placeholder-[#71717A] px-3.5 py-2.5 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#71717A]">Min Resolved:</span>
          {[0, 1, 5, 10].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setMinResolved(count)}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                minResolved === count
                  ? "bg-[#242428] text-[#FAFAFA] border-[#242428] font-medium"
                  : "bg-[#111113] text-[#71717A] border-[#242428] hover:text-[#FAFAFA]"
              }`}
            >
              {count === 0 ? "All" : `${count}+`}
            </button>
          ))}

          <span className="text-[#242428] mx-1" aria-hidden="true">|</span>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as typeof sortField)}
            className="bg-[#111113] border border-[#242428] text-xs font-mono text-[#FAFAFA] px-2.5 py-1 outline-none focus:border-[#00E5A0] cursor-pointer"
          >
            <option value="index_bps">Sort: Credibility Index</option>
            <option value="hit_rate_bps">Sort: Hit Rate</option>
            <option value="staked_resolved">Sort: Total Staked</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="border border-[#242428] overflow-x-auto bg-[#17171A]">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[#242428] bg-[#111113] text-[#71717A] uppercase text-[11px] tracking-wider">
              <th className="py-3.5 px-4 font-normal w-16">Rank</th>
              <th className="py-3.5 px-4 font-normal">Forecaster</th>
              <th className="py-3.5 px-4 font-normal text-right">Credibility Index</th>
              <th className="py-3.5 px-4 font-normal text-right">Hit Rate</th>
              <th className="py-3.5 px-4 font-normal text-right">Avg Brier</th>
              <th className="py-3.5 px-4 font-normal text-right">Resolved / Won</th>
              <th className="py-3.5 px-4 font-normal text-right">Total Staked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242428]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#71717A]">
                  No forecasters match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => {
                const resolved = user.resolved_true + user.resolved_false;
                const hitRate = (user.hit_rate_bps / 100).toFixed(1);
                const avgBrier = (user.avg_brier_bps / 10000).toFixed(3);

                return (
                  <tr
                    key={user.wallet}
                    onClick={() => {
                      onSelectUser?.(user.wallet);
                      navigate(`/profile/${user.wallet}`);
                    }}
                    className="hover:bg-[#1C1C20] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-[#71717A] font-medium tabular-nums">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#FAFAFA] group-hover:text-[#00E5A0] transition-colors">
                        {user.handle || shortenAddress(user.wallet)}
                      </div>
                      <div className="text-[#71717A] text-[11px]">
                        {shortenAddress(user.wallet)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-sm font-bold text-[#00E5A0] tabular-nums">
                        {user.index_bps.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#71717A] block">/ 10,000</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#FAFAFA] tabular-nums">
                      {hitRate}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#A1A1AA] tabular-nums">
                      {avgBrier}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-[#A1A1AA]">
                      <span className="text-[#FAFAFA]">{user.resolved_true}</span> / {resolved}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#FAFAFA] tabular-nums">
                      {formatGEN(user.staked_resolved)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footnote */}
      <div className="mt-6 border border-[#242428] bg-[#111113] p-4 text-xs font-mono text-[#71717A] space-y-1">
        <div className="text-[#A1A1AA] font-semibold uppercase text-[11px]">
          About the Credibility Index (CI)
        </div>
        <p>
          The Credibility Index is derived from the author’s mean Brier score (weighted by √stake). 
          A perfect forecaster scores 10,000. A coin-flip forecaster at 50% scores 5,000. 
          Confident misses push the index toward 0.
        </p>
      </div>
    </div>
  );
};