import React, { useState, useId } from "react";
import type { Profile as UserProfile } from "@/lib/contracts/types";
import { formatGEN } from "../utils/brier";
import { useWallet } from "@/lib/genlayer/wallet";
import { usePostTake } from "@/lib/hooks/useStakedTakes";
import { toast } from "sonner";

interface PostTakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
}

export const PostTakeModal: React.FC<PostTakeModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const claimId = useId();
  const criteriaId = useId();
  const categoryId = useId();
  const sourceId = useId();
  const fallbackSourceId = useId();
  const confidenceId = useId();
  const stakeId = useId();
  const deadlineId = useId();

  const { isConnected, connectWallet } = useWallet();
  const { isPending: isSubmitting, mutate: postTake } = usePostTake();

  const [claim, setClaim] = useState("");
  const [criteria, setCriteria] = useState("");
  const [category, setCategory] = useState("AI & Tech");
  const [primarySourceUrl, setPrimarySourceUrl] = useState("");
  const [fallbackSourceUrl, setFallbackSourceUrl] = useState("");
  const [confidence, setConfidence] = useState<number>(80);
  const [stakeAmount, setStakeAmount] = useState<number>(50);
  const [resolveAfterMinutes, setResolveAfterMinutes] = useState<number>(60 * 24); // 1 day default

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!claim.trim() || claim.trim().length < 20) {
      newErrors.claim = "Claim must be at least 20 characters.";
    }
    if (!criteria.trim() || criteria.trim().length < 20) {
      newErrors.criteria = "Criteria must be at least 20 characters.";
    }
    if (!primarySourceUrl.trim() || !primarySourceUrl.startsWith("http")) {
      newErrors.primarySourceUrl = "A valid HTTP/HTTPS primary source URL is required.";
    }
    if (confidence < 51 || confidence > 99) {
      newErrors.confidence = "Confidence must be between 51 and 99.";
    }
    if (!stakeAmount || stakeAmount < 10) {
      newErrors.stakeAmount = "Minimum stake is 10 GEN.";
    }
    if (resolveAfterMinutes < 5) {
      newErrors.deadline = "Resolve time must be at least 5 minutes.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!isConnected) {
      connectWallet();
      return;
    }

    postTake(
      {
        params: {
          claim: claim.trim(),
          criteria: criteria.trim(),
          category,
          source_url: primarySourceUrl.trim(),
          source_url_fallback: fallbackSourceUrl.trim() || "",
          confidence,
          resolve_after_minutes: resolveAfterMinutes,
        },
        stakeGen: stakeAmount,
      },
      {
        onSuccess: () => {
          toast.success("Take posted", { description: "Your claim is locked on-chain." });
          onClose();
        },
        onError: (err: any) => {
          toast.error("Failed to post take", { description: err?.message || "Please try again." });
        },
      }
    );
  };

  const applyPresetMinutes = (minutes: number) => {
    setResolveAfterMinutes(minutes);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-take-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-[#17171A] border border-[#242428] w-full max-w-2xl my-8 text-left shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242428] px-6 py-4 bg-[#111113]">
          <div>
            <h2 id="post-take-title" className="text-base sm:text-lg font-bold text-[#FAFAFA] font-mono tracking-tight">
              Post a Staked Take
            </h2>
            <div className="text-xs text-[#71717A] font-mono mt-0.5">
              Escrow locked on GenLayer · Judged against your sources
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#71717A] hover:text-[#FAFAFA] text-lg font-mono px-2 py-1 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Claim */}
          <div>
            <label htmlFor={claimId} className="block text-xs font-mono text-[#FAFAFA] font-medium uppercase tracking-wide mb-1">
              Falsifiable Claim *
            </label>
            <textarea
              id={claimId}
              rows={2}
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="e.g. ETH will close above $4,000 on Friday."
              className={`w-full bg-[#111113] border ${errors.claim ? "border-[#D2554D]" : "border-[#242428]"} text-xs sm:text-sm font-sans text-[#FAFAFA] placeholder-[#71717A] p-3 focus:outline-none focus:border-[#00E5A0]`}
            />
            {errors.claim && <p className="text-xs font-mono text-[#D2554D] mt-1">{errors.claim}</p>}
          </div>

          {/* Criteria */}
          <div>
            <label htmlFor={criteriaId} className="block text-xs font-mono text-[#FAFAFA] font-medium uppercase tracking-wide mb-1">
              Resolution Criteria *
            </label>
            <textarea
              id={criteriaId}
              rows={2}
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="TRUE if the daily close on the named source is above 4000."
              className={`w-full bg-[#111113] border ${errors.criteria ? "border-[#D2554D]" : "border-[#242428]"} text-xs sm:text-sm font-sans text-[#FAFAFA] placeholder-[#71717A] p-3 focus:outline-none focus:border-[#00E5A0]`}
            />
            {errors.criteria && <p className="text-xs font-mono text-[#D2554D] mt-1">{errors.criteria}</p>}
          </div>

          {/* Category + Resolve Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={categoryId} className="block text-xs font-mono text-[#FAFAFA] font-medium uppercase tracking-wide mb-1">
                Category
              </label>
              <input
                id={categoryId}
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="crypto"
                className="w-full bg-[#111113] border border-[#242428] text-xs font-mono text-[#FAFAFA] p-2.5 outline-none focus:border-[#00E5A0]"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-xs font-mono text-[#FAFAFA] font-medium uppercase tracking-wide">
                  Resolve After
                </label>
               
              </div>
              <input
                type="number"
                min={5}
                value={resolveAfterMinutes}
                onChange={(e) => setResolveAfterMinutes(Number(e.target.value))}
                className="w-full bg-[#111113] border border-[#242428] text-xs font-mono text-[#FAFAFA] p-2.5 outline-none focus:border-[#00E5A0]"
              />
              <div className="text-[10px] font-mono text-[#71717A] mt-1">minutes</div>
            </div>
          </div>

          {/* Sources */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={sourceId} className="block text-xs font-mono text-[#FAFAFA] font-medium uppercase tracking-wide mb-1">
                Primary Source URL *
              </label>
              <input
                id={sourceId}
                type="url"
                value={primarySourceUrl}
                onChange={(e) => setPrimarySourceUrl(e.target.value)}
                placeholder="https://..."
                className={`w-full bg-[#111113] border ${errors.primarySourceUrl ? "border-[#D2554D]" : "border-[#242428]"} text-xs font-mono text-[#FAFAFA] placeholder-[#71717A] p-2.5 outline-none focus:border-[#00E5A0]`}
              />
              {errors.primarySourceUrl && (
                <p className="text-xs font-mono text-[#D2554D] mt-1">{errors.primarySourceUrl}</p>
              )}
            </div>
            <div>
              <label htmlFor={fallbackSourceId} className="block text-xs font-mono text-[#FAFAFA] font-medium uppercase tracking-wide mb-1">
                Fallback Source URL (Optional)
              </label>
              <input
                id={fallbackSourceId}
                type="url"
                value={fallbackSourceUrl}
                onChange={(e) => setFallbackSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#111113] border border-[#242428] text-xs font-mono text-[#FAFAFA] placeholder-[#71717A] p-2.5 outline-none focus:border-[#00E5A0]"
              />
            </div>
          </div>

          {/* Confidence + Stake */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#242428]">
            <div>
              <label htmlFor={confidenceId} className="block text-xs font-mono text-[#FAFAFA] font-medium uppercase tracking-wide mb-1">
                Confidence: <span className="text-[#00E5A0] font-bold">{confidence}%</span>
              </label>
              <input
                id={confidenceId}
                type="range"
                min={51}
                max={99}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-[#00E5A0] cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor={stakeId} className="block text-xs font-mono text-[#FAFAFA] font-medium uppercase tracking-wide mb-1">
                Stake (GEN)
              </label>
              <input
                id={stakeId}
                type="number"
                min={10}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                className={`w-full bg-[#111113] border ${errors.stakeAmount ? "border-[#D2554D]" : "border-[#242428]"} text-xs font-mono text-[#FAFAFA] p-2.5 outline-none focus:border-[#00E5A0]`}
              />
              {errors.stakeAmount && (
                <p className="text-xs font-mono text-[#D2554D] mt-1">{errors.stakeAmount}</p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#111113] border border-[#242428] p-4 text-xs font-mono space-y-1">
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Stake to lock:</span>
              <span className="text-[#FAFAFA] tabular-nums">{formatGEN(stakeAmount)}</span>
            </div>
            <div className="flex justify-between text-[#71717A]">
              <span>Resolve after:</span>
              <span>{resolveAfterMinutes} minutes</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs font-mono text-[#71717A] flex items-center gap-2">
              <span className={`w-2 h-2 inline-block ${isConnected ? "bg-[#00E5A0]" : "bg-[#D2554D]"}`} />
              <span>{isConnected ? "Wallet connected" : "Wallet disconnected"}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-mono text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#242428] hover:border-[#383840] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer px-6 py-2.5 text-xs font-mono font-semibold bg-[#00E5A0] text-[#0A0A0B] hover:bg-[#00E5A0]/90 transition-colors border border-[#00E5A0] disabled:opacity-50"
              >
                {isSubmitting
                  ? "Submitting..."
                  : !isConnected
                  ? "Connect & Post"
                  : "Post Take"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}