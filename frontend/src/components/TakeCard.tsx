import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Take } from "@/lib/contracts/types";
import { StatusBadge } from "./StatusBadge";
import { formatGEN, formatTimeRemaining, shortenAddress } from "../utils/brier";

interface TakeCardProps {
  take: Take;
  onSelect?: (take: Take) => void;
  onAuthorClick?: (wallet: string) => void;
}

export const TakeCard: React.FC<TakeCardProps> = ({ take, onSelect, onAuthorClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    onSelect?.(take);
    navigate(`/take/${take.take_id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View take by ${shortenAddress(take.author)}: ${take.claim}`}
      className="group text-left block w-full bg-[#17171A] hover:bg-[#1C1C20] border border-[#242428] hover:border-[#383840] transition-colors p-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00E5A0] cursor-pointer"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-[#A1A1AA] font-mono">
          <Link
            to={`/profile/${take.author}`}
            onClick={(e) => {
              e.stopPropagation();
              onAuthorClick?.(take.author);
            }}
            className="text-[#FAFAFA] hover:text-[#00E5A0] font-medium transition-colors"
          >
            {shortenAddress(take.author)}
          </Link>
          <span className="text-[#71717A]" aria-hidden="true">·</span>
          <span className="text-[#71717A]">{take.category}</span>
        </div>

        <StatusBadge status={take.status} verdict={take.verdict} />
      </div>

      {/* Claim */}
      <h3 className="text-base sm:text-lg font-medium text-[#FAFAFA] leading-snug tracking-tight mb-3 line-clamp-2 group-hover:text-[#FAFAFA]">
        {take.claim}
      </h3>

      {/* Criteria */}
      <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-4 line-clamp-2">
        {take.criteria}
      </p>

      {/* Footer */}
      <div className="pt-3 border-t border-[#242428] flex flex-wrap items-center justify-between gap-y-2 text-xs">
        <div className="flex items-center gap-4 text-[#A1A1AA] font-mono">
          <div>
            <span className="text-[#71717A] mr-1.5 uppercase text-[10px] tracking-wide">Stake</span>
            <span className="text-[#FAFAFA] font-medium tabular-nums">{formatGEN(take.stake)}</span>
          </div>
          <span className="text-[#242428]" aria-hidden="true">|</span>
          <div>
            <span className="text-[#71717A] mr-1.5 uppercase text-[10px] tracking-wide">Confidence</span>
            <span className="text-[#00E5A0] font-medium tabular-nums">{take.confidence}%</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#71717A]">
          <span className="tabular-nums text-[#A1A1AA]">
            {take.status === "finalized"
              ? "Resolved"
              : take.resolve_at
              ? formatTimeRemaining(take.resolve_at)
              : "—"}
          </span>
        </div>
      </div>
    </article>
  );
};
