import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onPostTake: () => void;
  onOpenShortcuts: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onPostTake,
  onOpenShortcuts,
}) => {
  return (
    <footer className="border-t border-[#242428] bg-[#0A0A0B] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#242428]">
          <div>
            <Link to="/" className="text-sm font-bold font-mono text-[#FAFAFA] tracking-tight hover:text-[#00E5A0] transition-colors">
              STAKEDTAKES
            </Link>
            <p className="text-xs text-[#71717A] font-mono mt-1 max-w-sm">
              Public staked-claims platform on GenLayer. Powered by decentralized AI validator consensus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-[#A1A1AA]">
            <Link
              to="/"
              className="hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              Overview
            </Link>
            <Link
              to="/feed"
              className="hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              Feed
            </Link>
            <Link
              to="/how-it-works"
              className="hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              Protocol
            </Link>
            <Link
              to="/credibility-index"
              className="hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              Credibility
            </Link>
            <button
              onClick={onPostTake}
              className="text-[#00E5A0] hover:underline cursor-pointer font-medium"
            >
              Post a Take
            </button>
            <button
              onClick={onOpenShortcuts}
              className="hover:text-[#FAFAFA] transition-colors cursor-pointer text-[#71717A]"
            >
              Shortcuts (?)
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#71717A]">
          <div>
            © 2026 StakedTakes. Built on GenLayer Intelligent Contracts.
          </div>
          <div className="flex items-center gap-4">
            <span>Non-custodial smart escrow</span>
            <span aria-hidden="true">·</span>
            <span>Brier Calibration Index</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
