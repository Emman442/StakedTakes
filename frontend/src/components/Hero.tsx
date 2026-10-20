import React from 'react';
import { Link } from 'react-router-dom';
import { Take, UserProfile } from '../types';
import { formatGEN, shortenAddress } from '../utils/brier';
import { HeroVisualMesh } from './HeroVisualMesh';

interface HeroProps {
  onPostTake: () => void;
  onSelectTake: (take: Take) => void;
  recentTakes: Take[];
  topForecasters: UserProfile[];
}

export const Hero: React.FC<HeroProps> = ({
  onPostTake,
  onSelectTake,
  recentTakes,
  topForecasters,
}) => {
  return (
    <div className="relative w-full">
      {/* Hero Visual Area with High-Fidelity Animated Mesh & Scrim */}
      <div className="relative min-h-[600px] lg:min-h-[660px] flex flex-col justify-between border-b border-[#242428] overflow-hidden bg-[#0A0A0B]">
        {/* Animated Background Mesh with interactive validator node radar */}
        <HeroVisualMesh />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 w-full">
          <div className="max-w-3xl">
            {/* Direct, clean metadata indicator (no pill badge) */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA] mb-6">
              <span className="text-[#00E5A0] font-semibold flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-[#00E5A0] animate-pulse" />
                GENLAYER INTELLIGENT CONTRACTS
              </span>
              <span className="text-[#71717A]" aria-hidden="true">·</span>
              <span>VERIFIABLE CONSENSUS</span>
              <span className="text-[#71717A]" aria-hidden="true">·</span>
              <span>BRIER CALIBRATION</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#FAFAFA] tracking-tight leading-[1.08] mb-6 [text-wrap:balance]">
              Stake a claim. Get judged. Build a public record.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mb-8 font-normal">
              Post falsifiable claims, lock GEN behind them, and get judged TRUE, FALSE, or INVALID by GenLayer validators using your own primary sources. A Brier-based credibility index tracks long-term forecasting accuracy on-chain.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onPostTake}
                className="cursor-pointer px-6 py-3 font-mono text-sm font-semibold bg-[#00E5A0] text-[#0A0A0B] hover:bg-[#00E5A0]/90 transition-all hover:shadow-[0_0_20px_rgba(0,229,160,0.3)] whitespace-nowrap border border-[#00E5A0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5A0]"
              >
                Post a take
              </button>

              <Link
                to="/feed"
                className="cursor-pointer px-6 py-3 font-mono text-sm font-medium bg-[#17171A] text-[#FAFAFA] hover:bg-[#242428] transition-colors whitespace-nowrap border border-[#242428] hover:border-[#383840] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00E5A0]"
              >
                View open takes
              </Link>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#71717A] ml-2">
                <span>Escrow locked on-chain</span>
                <span aria-hidden="true">·</span>
                <span>No subjective moderation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Ticker / Recent Takes Strip */}
        <div className="relative z-10 w-full bg-[#111113] border-t border-[#242428] py-2.5 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#71717A] whitespace-nowrap shrink-0">
              <span className="text-[#00E5A0] uppercase font-semibold">Live Oracle Feed</span>
              <span aria-hidden="true">/</span>
            </div>

            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar text-xs font-mono py-1">
              {recentTakes.slice(0, 4).map((take) => (
                <button
                  key={take.id}
                  onClick={() => onSelectTake(take)}
                  className="flex items-center gap-2.5 text-left text-[#A1A1AA] hover:text-[#FAFAFA] whitespace-nowrap transition-colors cursor-pointer group"
                >
                  <span className="text-[#71717A] group-hover:text-[#A1A1AA]">{take.author.handle}:</span>
                  <span className="max-w-[280px] sm:max-w-sm truncate text-[#FAFAFA]">
                    {take.claim}
                  </span>
                  <span className="text-[#00E5A0] tabular-nums font-medium">
                    {formatGEN(take.stakeAmount)}
                  </span>
                  <span className="text-[#71717A] tabular-nums">
                    ({take.confidence}%)
                  </span>
                  <span className="text-[#242428]" aria-hidden="true">|</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <section aria-label="Protocol Statistics" className="border-b border-[#242428] bg-[#111113]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-1">
                Total Takes Staked
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#FAFAFA] tabular-nums">
                1,428
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1 font-mono">
                +14 in the last 24h
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-1">
                Total GEN Locked
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#00E5A0] tabular-nums">
                482,900
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1 font-mono">
                Non-custodial smart escrow
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-1">
                Resolution Rate
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#FAFAFA] tabular-nums">
                94.2%
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1 font-mono">
                5.8% challenged / appeal
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-1">
                Median Brier Score
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#FAFAFA] tabular-nums">
                0.142
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1 font-mono">
                vs 0.250 random baseline
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Leaderboard Preview Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#FAFAFA] tracking-tight">
              Top Forecasters by Credibility Index
            </h2>
            <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">
              Calibrated strictly on Brier performance across resolved stakes
            </p>
          </div>
          <Link
            to="/credibility-index"
            className="text-xs font-mono text-[#00E5A0] hover:underline cursor-pointer"
          >
            View full rankings →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topForecasters.slice(0, 4).map((user, idx) => (
            <Link
              to={`/profile/${user.handle}`}
              key={user.address}
              className="bg-[#17171A] border border-[#242428] hover:border-[#383840] p-4 flex flex-col justify-between transition-colors group block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-[#71717A]">
                  #{idx + 1}
                </span>
                <span className="font-mono text-xs font-bold text-[#00E5A0] tabular-nums">
                  CI {user.credibilityIndex.toLocaleString()}
                </span>
              </div>
              <div className="font-medium text-sm text-[#FAFAFA] group-hover:text-[#00E5A0] transition-colors mb-1">
                {user.handle}
              </div>
              <div className="text-xs font-mono text-[#71717A] mb-3">
                {shortenAddress(user.address)}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#242428] text-xs font-mono text-[#A1A1AA]">
                <span>{user.hitRate}% hit rate</span>
                <span className="text-[#71717A]">{user.takesResolved} resolved</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
