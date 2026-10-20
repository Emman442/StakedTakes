import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Take } from "@/lib/contracts/types";
import { TakeCard } from "./TakeCard";
import { StatusBadge } from "./StatusBadge";
import { formatGEN, formatTimeRemaining, shortenAddress } from "../utils/brier";

interface TakesFeedProps {
  takes: Take[];
  onSelectTake?: (take: Take) => void;
  onPostTake: () => void;
  onAuthorClick?: (wallet: string) => void;
}

type StatusFilter = "all" | "open" | "pending" | "finalized";
type SortOption = "newest" | "stake_high" | "confidence_high" | "closing_soon";
type ViewMode = "cards" | "table";

export const TakesFeed: React.FC<TakesFeedProps> = ({
  takes,
  onSelectTake,
  onPostTake,
  onAuthorClick,
}) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const categories = ["All", ...Array.from(new Set(takes.map((t) => t.category).filter(Boolean)))];

  const filteredTakes = useMemo(() => {
    return takes
      .filter((take) => {
        // Status filter
        if (statusFilter === "open" && take.status !== "open") return false;
        if (statusFilter === "pending" && !["pending_appeal", "appeal_resolved"].includes(take.status)) return false;
        if (statusFilter === "finalized" && take.status !== "finalized") return false;

        // Category filter
        if (categoryFilter !== "All" && take.category !== categoryFilter) return false;

        // Search
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchClaim = take.claim.toLowerCase().includes(q);
          const matchCriteria = take.criteria.toLowerCase().includes(q);
          const matchAuthor = take.author.toLowerCase().includes(q);
          if (!matchClaim && !matchCriteria && !matchAuthor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return (b.created_ms || 0) - (a.created_ms || 0);
        }
        if (sortBy === "stake_high") {
          return b.stake - a.stake;
        }
        if (sortBy === "confidence_high") {
          return b.confidence - a.confidence;
        }
        if (sortBy === "closing_soon") {
          return (a.resolve_at || 0) - (b.resolve_at || 0);
        }
        return 0;
      });
  }, [takes, statusFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242428] mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] tracking-tight">
            Takes Feed
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] font-mono mt-1">
            Browse public claims with active or finalized GEN escrow on GenLayer
          </p>
        </div>

        <button
          type="button"
          onClick={onPostTake}
          className="cursor-pointer px-4 py-2 text-xs font-mono font-semibold bg-[#00E5A0] text-[#0A0A0B] hover:bg-[#00E5A0]/90 transition-colors whitespace-nowrap border border-[#00E5A0] self-start sm:self-auto"
        >
          + Post a take
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, criteria, or author address..."
              aria-label="Search takes"
              className="w-full bg-[#111113] border border-[#242428] focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0] text-[#FAFAFA] placeholder-[#71717A] text-xs font-mono px-3.5 py-2.5 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#71717A] hover:text-[#FAFAFA]"
              >
                CLEAR
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort takes by"
              className="bg-[#111113] border border-[#242428] text-xs font-mono text-[#FAFAFA] px-3 py-2.5 outline-none focus:border-[#00E5A0] cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="stake_high">Sort: Highest Stake</option>
              <option value="confidence_high">Sort: Highest Confidence</option>
              <option value="closing_soon">Sort: Closing Soonest</option>
            </select>

            <div className="hidden sm:flex items-center border border-[#242428] p-0.5 bg-[#111113]">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                  viewMode === "cards" ? "bg-[#242428] text-[#FAFAFA]" : "text-[#71717A] hover:text-[#FAFAFA]"
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                  viewMode === "table" ? "bg-[#242428] text-[#FAFAFA]" : "text-[#71717A] hover:text-[#FAFAFA]"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1 border border-[#242428] p-1 bg-[#111113]">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                statusFilter === "all" ? "bg-[#242428] text-[#FAFAFA] font-medium" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
              }`}
            >
              All Takes ({takes.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("open")}
              className={`px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                statusFilter === "open" ? "bg-[#242428] text-[#FAFAFA] font-medium" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
              }`}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                statusFilter === "pending" ? "bg-[#242428] text-[#FAFAFA] font-medium" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
              }`}
            >
              Resolving / Appeal
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("finalized")}
              className={`px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                statusFilter === "finalized" ? "bg-[#242428] text-[#FAFAFA] font-medium" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
              }`}
            >
              Finalized
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-[#71717A] mr-1 hidden sm:inline">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 border transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? "border-[#00E5A0] text-[#00E5A0] bg-[#00E5A0]/5 font-medium"
                    : "border-[#242428] text-[#A1A1AA] hover:border-[#383840] hover:text-[#FAFAFA]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredTakes.length === 0 ? (
        <div className="border border-[#242428] bg-[#17171A] p-12 text-center my-8">
          <div className="text-sm font-mono text-[#FAFAFA] mb-2 font-medium">
            No takes match the current filter
          </div>
          <p className="text-xs text-[#A1A1AA] font-mono mb-6 max-w-md mx-auto">
            Try resetting your search query or switching categories.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setCategoryFilter("All");
                setSearchQuery("");
              }}
              className="px-3.5 py-1.5 text-xs font-mono text-[#FAFAFA] border border-[#242428] hover:border-[#383840] cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onPostTake}
              className="px-3.5 py-1.5 text-xs font-mono font-medium bg-[#00E5A0] text-[#0A0A0B] cursor-pointer"
            >
              Post a Take
            </button>
          </div>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredTakes.map((take) => (
            <TakeCard
              key={take.take_id}
              take={take}
              onSelect={onSelectTake}
              onAuthorClick={onAuthorClick}
            />
          ))}
        </div>
      ) : (
        <div className="border border-[#242428] overflow-x-auto bg-[#17171A]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#242428] bg-[#111113] text-[#71717A] uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 font-normal">Author</th>
                <th className="py-3 px-4 font-normal">Claim</th>
                <th className="py-3 px-4 font-normal text-right">Stake</th>
                <th className="py-3 px-4 font-normal text-right">Conf</th>
                <th className="py-3 px-4 font-normal">Category</th>
                <th className="py-3 px-4 font-normal">Resolves</th>
                <th className="py-3 px-4 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242428]">
              {filteredTakes.map((take) => (
                <tr
                  key={take.take_id}
                  onClick={() => {
                    onSelectTake?.(take);
                    navigate(`/take/${take.take_id}`);
                  }}
                  className="hover:bg-[#1C1C20] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 text-[#A1A1AA] whitespace-nowrap">
                    <span className="text-[#FAFAFA] font-medium group-hover:text-[#00E5A0] transition-colors">
                      {shortenAddress(take.author)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#FAFAFA] max-w-md truncate">{take.claim}</td>
                  <td className="py-3 px-4 text-[#FAFAFA] text-right font-medium tabular-nums whitespace-nowrap">
                    {formatGEN(take.stake)}
                  </td>
                  <td className="py-3 px-4 text-[#00E5A0] text-right font-medium tabular-nums">
                    {take.confidence}%
                  </td>
                  <td className="py-3 px-4 text-[#71717A] whitespace-nowrap">{take.category}</td>
                  <td className="py-3 px-4 text-[#A1A1AA] tabular-nums whitespace-nowrap">
                    {take.status === "finalized"
                      ? "Resolved"
                      : take.resolve_at
                      ? formatTimeRemaining(take.resolve_at)
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <StatusBadge status={take.status} verdict={take.verdict} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};