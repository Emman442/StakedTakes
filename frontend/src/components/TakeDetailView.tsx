import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Take, Profile as UserProfile } from "@/lib/contracts/types";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatGEN, formatTimeRemaining, shortenAddress } from "../utils/brier";
import { useAppealTake, useConfig, useFinalizeTake, useResolveTake } from "@/lib/hooks/useStakedTakes";
import { toast } from "sonner";

interface TakeDetailViewProps {
  take: Take;
  currentUser?: UserProfile;
  onClose?: () => void;
  onViewAuthorProfile?: (wallet: string) => void;
}

export const TakeDetailView: React.FC<TakeDetailViewProps> = ({
  take,
  onClose,
  onViewAuthorProfile,
}) => {
  const navigate = useNavigate();
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [appealSuccessMsg, setAppealSuccessMsg] = useState("");
  const { isPending: isSubmittingAppeal, mutate: submitAppeal } = useAppealTake()
  const { isPending: isFinalizing, mutate: finalize } = useFinalizeTake()
  const { isPending: isFetchingConfig, data: config_data } = useConfig()
  const { isPending: isResolving, mutate: resolve } = useResolveTake();

  const canResolve =
    take.status === "open" &&
    take.resolve_at &&
    Date.now() >= take.resolve_at;

  const handleResolveClick = () => {
    resolve(take.take_id, {
      onSuccess: () => toast.success("Take resolved"),
      onError: () => toast.error("Failed to resolve take"),
    });
  };


  const handleClose = () => {
    if (onClose) onClose();
    else navigate("/feed");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  console.log(take)

  const canAppeal = take.status === "pending_appeal";
  const canFinalize = take.status === "pending_appeal" || take.status === "appeal_resolved";

  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim()) return;

    submitAppeal({
      params: {
        take_id: take.take_id,
        appeal_context: appealReason
      },
      bondGen: config_data?.appeal_bond ?? 0,
    }, {
      onSuccess: () => {
        toast.success("Appeal submitted. Bond locked.")
        setShowAppealForm(false);
      },
      onError: () => {
        toast.error("Failed to submit Appeal!")
      }
    })

  };

  const handleFinalizeClick = () => {
    finalize(take.take_id, {
      onSuccess: () => {
        toast.success("Take finalized successfully!")
      },
      onError: () => {
        toast.error("failed to finalize take")
      }
    })
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="take-detail-heading"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-[#17171A] border border-[#242428] w-full max-w-4xl my-6 text-left shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[#242428] px-6 py-4 bg-[#111113] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#71717A] uppercase">
              Claim ID: <span className="text-[#FAFAFA]">{take.take_id}</span>
            </span>
            <span className="text-[#242428]" aria-hidden="true">|</span>
            <span className="text-xs font-mono text-[#71717A]">{take.category}</span>
          </div>

          <div className="flex items-center gap-4">
            <StatusBadge status={take.status} verdict={take.verdict} />
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close modal"
              className="text-[#71717A] hover:text-[#FAFAFA] font-mono text-sm px-2 py-1 transition-colors cursor-pointer"
            >
              [ESC] ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {appealSuccessMsg && (
            <div className="bg-[#00E5A0]/10 border border-[#00E5A0]/30 text-[#00E5A0] text-xs font-mono p-3">
              {appealSuccessMsg}
            </div>
          )}

          <div className="space-y-3">
            <h1 id="take-detail-heading" className="text-xl sm:text-2xl font-bold text-[#FAFAFA] leading-snug tracking-tight">
              {take.claim}
            </h1>
            <div className="bg-[#111113] border border-[#242428] p-4">
              <div className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-1.5">
                Author Resolution Criteria
              </div>
              <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed font-sans">
                {take.criteria}
              </p>
            </div>
          </div>

          {/* Key Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#111113] border border-[#242428] p-4 text-xs font-mono">
            <div>
              <div className="text-[#71717A] uppercase text-[10px] mb-1">Locked Stake</div>
              <div className="text-base font-bold text-[#FAFAFA] tabular-nums">
                {formatGEN(take.stake)}
              </div>
            </div>
            <div>
              <div className="text-[#71717A] uppercase text-[10px] mb-1">Confidence</div>
              <div className="text-base font-bold text-[#00E5A0] tabular-nums">
                {take.confidence}%
              </div>
            </div>
            <div>
              <div className="text-[#71717A] uppercase text-[10px] mb-1">Resolve Deadline</div>
              <div className="text-xs text-[#FAFAFA] font-medium mt-1">
                {take.resolve_at ? formatDate(new Date(take.resolve_at).toISOString()) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[#71717A] uppercase text-[10px] mb-1">
                {take.status === "finalized" ? "Payout" : "Time Remaining"}
              </div>
              <div className="text-xs font-medium text-[#FAFAFA] tabular-nums mt-1">
                {take.status === "finalized"
                  ? formatGEN(take.payout)
                  : take.resolve_at
                    ? formatTimeRemaining(take.resolve_at)
                    : "—"}
              </div>
            </div>
          </div>

          {/* Evidence Sources */}
          <div className="border border-[#242428] bg-[#111113] p-4 space-y-3">
            <div className="text-xs font-mono text-[#FAFAFA] uppercase font-semibold tracking-wider">
              Author Evidence Sources
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-[#17171A] border border-[#242428]">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[#00E5A0] font-bold text-[11px]">PRIMARY</span>
                  <a
                    href={take.source_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[#FAFAFA] hover:text-[#00E5A0] hover:underline truncate"
                  >
                    {take.source_url}
                  </a>
                </div>
                <a
                  href={take.source_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[#71717A] hover:text-[#FAFAFA] text-[11px] shrink-0"
                >
                  Open ↗
                </a>
              </div>

              {take.source_url_fallback && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-[#17171A] border border-[#242428]">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[#71717A] font-bold text-[11px]">FALLBACK</span>
                    <a
                      href={take.source_url_fallback}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[#A1A1AA] hover:text-[#00E5A0] hover:underline truncate"
                    >
                      {take.source_url_fallback}
                    </a>
                  </div>
                  <a
                    href={take.source_url_fallback}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[#71717A] hover:text-[#FAFAFA] text-[11px] shrink-0"
                  >
                    Open ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Verdict */}
          {take.verdict && (
            <div className="border border-[#242428] bg-[#111113] p-5 space-y-3">
              <div className="text-xs font-mono text-[#00E5A0] font-semibold uppercase tracking-wider">
                Validator Consensus
              </div>
              <div className="text-sm font-mono text-[#FAFAFA]">
                Verdict: <span className="font-bold">{take.verdict}</span>
              </div>
              {take.reasoning && (
                <p className="text-xs sm:text-sm text-[#A1A1AA] font-sans leading-relaxed">
                  {take.reasoning}
                </p>
              )}
              {take.resolved_at && (
                <div className="text-[11px] font-mono text-[#71717A]">
                  Resolved {formatDate(take.resolved_at)}
                </div>
              )}
            </div>
          )}

          {/* Appeal */}
          {canAppeal && (
            <div className="border border-[#242428] bg-[#111113] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-mono text-[#FAFAFA] uppercase font-semibold tracking-wider">
                    Appeal Window
                  </h3>
                  <div className="text-[11px] font-mono text-[#71717A] mt-0.5">
                    One appeal allowed before the window closes.
                  </div>
                </div>
                {!showAppealForm && (
                  <button
                    type="button"
                    onClick={() => setShowAppealForm(true)}
                    className="px-3.5 py-1.5 text-xs font-mono font-medium text-[#C9932B] border border-[#C9932B] hover:bg-[#C9932B]/10 cursor-pointer self-start sm:self-auto"
                  >
                    Challenge Verdict
                  </button>
                )}
              </div>

              {showAppealForm && (
                <form onSubmit={handleAppealSubmit} className="p-4 bg-[#17171A] border border-[#242428] space-y-3">
                  <div className="text-xs font-mono text-[#FAFAFA] font-medium">
                    File Appeal
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-[#71717A] mb-1">
                      Appeal Context *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                      placeholder="Explain why the verdict should be reconsidered..."
                      className="w-full bg-[#111113] border border-[#242428] text-xs font-sans text-[#FAFAFA] p-2.5 focus:outline-none focus:border-[#C9932B]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAppealForm(false)}
                      className="px-3 py-1.5 text-xs font-mono text-[#71717A] hover:text-[#FAFAFA]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAppeal}
                      className="px-4 py-1.5 text-xs font-mono font-medium bg-[#C9932B] text-[#0A0A0B] hover:bg-[#C9932B]/90 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingAppeal ? "Submitting..." : "Submit Appeal"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Author */}
          <div className="border border-[#242428] bg-[#111113] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#17171A] border border-[#242428] flex items-center justify-center font-mono text-sm font-bold text-[#00E5A0]">
                {shortenAddress(take.author).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <Link
                  to={`/profile/${take.author}`}
                  onClick={() => onViewAuthorProfile?.(take.author)}
                  className="text-sm font-bold text-[#FAFAFA] hover:text-[#00E5A0] transition-colors cursor-pointer"
                >
                  {shortenAddress(take.author)}
                </Link>
                <div className="text-xs font-mono text-[#71717A] mt-0.5">
                  Author
                </div>
              </div>
            </div>
            <Link
              to={`/profile/${take.author}`}
              onClick={() => onViewAuthorProfile?.(take.author)}
              className="text-xs font-mono text-[#FAFAFA] hover:text-[#00E5A0] border border-[#242428] hover:border-[#383840] px-3 py-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              View Profile →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#242428] px-6 py-4 bg-[#111113] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono text-[#71717A]">
            Posted {take.created_at ? formatDate(take.created_at) : "—"}
          </div>

          <div className="flex items-center gap-3">
            {canResolve && (
              <button
                type="button"
                onClick={handleResolveClick}
                disabled={isResolving}
                className="cursor-pointer px-4 py-2 text-xs font-mono font-semibold bg-[#00E5A0] text-[#0A0A0B] hover:bg-[#00E5A0]/90 transition-colors border border-[#00E5A0] disabled:opacity-50"
              >
                {isResolving ? "Resolving…" : "Resolve"}
              </button>
            )}

            {canFinalize && (
              <button
                type="button"
                onClick={handleFinalizeClick}
                disabled={isFinalizing}
                className="cursor-pointer px-4 py-2 text-xs font-mono font-semibold bg-[#00E5A0] text-[#0A0A0B] hover:bg-[#00E5A0]/90 transition-colors border border-[#00E5A0] disabled:opacity-50"
              >
                {isFinalizing ? "Finalizing…" : "Finalize"}
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-mono text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#242428] hover:border-[#383840] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};