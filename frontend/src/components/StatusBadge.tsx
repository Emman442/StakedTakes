import React from "react";
import type { TakeStatus, Verdict as TakeVerdict } from "@/lib/contracts/types";

interface StatusBadgeProps {
  status: TakeStatus;
  verdict?: TakeVerdict | "" | null;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  verdict,
  className = "",
}) => {
  // Finalized takes show the verdict
  if (status === "finalized") {
    if (verdict === "TRUE") {
      return (
        <span className={`inline-flex items-center font-mono text-xs tracking-wider uppercase px-2 py-0.5 border border-[#00E5A0]/40 text-[#00E5A0] bg-[#00E5A0]/10 ${className}`}>
          TRUE
        </span>
      );
    }
    if (verdict === "FALSE") {
      return (
        <span className={`inline-flex items-center font-mono text-xs tracking-wider uppercase px-2 py-0.5 border border-[#D2554D]/40 text-[#D2554D] bg-[#D2554D]/10 ${className}`}>
          FALSE
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center font-mono text-xs tracking-wider uppercase px-2 py-0.5 border border-[#71717A]/40 text-[#A1A1AA] bg-[#71717A]/10 ${className}`}>
        INVALID
      </span>
    );
  }

  if (status === "pending_appeal") {
    return (
      <span className={`inline-flex items-center font-mono text-xs tracking-wider uppercase px-2 py-0.5 border border-[#C9932B]/40 text-[#C9932B] bg-[#C9932B]/10 ${className}`}>
        APPEAL WINDOW
      </span>
    );
  }

  if (status === "appeal_resolved") {
    return (
      <span className={`inline-flex items-center font-mono text-xs tracking-wider uppercase px-2 py-0.5 border border-[#C9932B]/40 text-[#C9932B] bg-[#C9932B]/10 ${className}`}>
        APPEAL RESOLVED
      </span>
    );
  }

  if (status === "retracted") {
    return (
      <span className={`inline-flex items-center font-mono text-xs tracking-wider uppercase px-2 py-0.5 border border-[#71717A]/40 text-[#71717A] bg-[#71717A]/10 ${className}`}>
        RETRACTED
      </span>
    );
  }

  // status === "open" (or anything unexpected)
  return (
    <span className={`inline-flex items-center font-mono text-xs tracking-wider uppercase px-2 py-0.5 border border-[#242428] text-[#A1A1AA] bg-[#17171A] ${className}`}>
      OPEN
    </span>
  );
};