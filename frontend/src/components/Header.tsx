import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Profile } from '@/lib/contracts/types';
import { shortenAddress } from '../utils/brier';
import { getClient } from "@/lib/genlayer/client";
import { useWallet } from '@/lib/genlayer/wallet';
import { useQuery } from '@tanstack/react-query';


interface HeaderProps {
  user: Profile;
  isWalletConnected: boolean;
  onToggleWallet: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onToggleWallet,
  onOpenShortcuts,
}) => {
  const { address, isConnected, connectWallet } = useWallet()
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors whitespace-nowrap shrink-0 ${isActive
      ? 'text-[#FAFAFA] font-semibold underline underline-offset-8 decoration-[#00E5A0]'
      : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `py-1 px-2 ${isActive ? 'text-[#00E5A0] font-semibold' : 'text-[#A1A1AA]'}`

  const { data: userBalance = 0 } = useQuery({
    queryKey: ["genBalance", address],
    queryFn: async () => {
      const client = await getClient();
      if (!client || !address) return 0;
      const wei = await client.getBalance({ address: address as `0x${string}` });
      return Number(wei) / 1e18;
    },
    enabled: !!address,
    staleTime: 5000,
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0B]/95 backdrop-blur-md border-b border-[#242428]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="text-left cursor-pointer group flex items-center gap-2"
        >
          <span className="text-base font-bold tracking-tight text-[#FAFAFA] font-mono group-hover:text-[#00E5A0] transition-colors whitespace-nowrap shrink-0">
            STAKEDTAKES
          </span>
        </Link>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Main Navigation">
          <NavLink to="/" end className={navLinkClass}>
            Overview
          </NavLink>
          <NavLink to="/feed" className={navLinkClass}>
            Takes Feed
          </NavLink>
          <NavLink to="/how-it-works" className={navLinkClass}>
            How It Works
          </NavLink>
          <NavLink to="/credibility-index" className={navLinkClass}>
            Credibility Index
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            My Profile
          </NavLink>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts (Press ?)"
            aria-label="Keyboard shortcuts"
            className="hidden lg:flex items-center justify-center w-8 h-8 text-[#71717A] hover:text-[#FAFAFA] border border-[#242428] hover:border-[#383840] font-mono text-xs transition-colors cursor-pointer"
          >
            ?
          </button>

          <button
            onClick={connectWallet}
            className={`cursor-pointer px-3.5 py-1.5 font-mono text-xs font-medium border transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${isConnected
                ? 'bg-[#17171A] border-[#242428] text-[#FAFAFA] hover:border-[#00E5A0]/50'
                : 'bg-[#00E5A0] border-[#00E5A0] text-[#0A0A0B] hover:bg-[#00E5A0]/90 font-semibold'
              }`}
          >
            {isConnected ? (
              <>
                <span className="w-1.5 h-1.5 bg-[#00E5A0]" aria-hidden="true" />
                <span>{shortenAddress(address!)}</span>
                <span className="text-[#71717A]" aria-hidden="true">·</span>
                <span className="tabular-nums font-semibold text-[#00E5A0]">{userBalance.toFixed()}</span>
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="md:hidden flex items-center justify-around border-t border-[#242428] px-2 py-2 bg-[#111113] text-xs font-mono">
        <NavLink to="/" end className={mobileNavLinkClass}>
          Home
        </NavLink>
        <NavLink to="/feed" className={mobileNavLinkClass}>
          Feed
        </NavLink>
        <NavLink to="/credibility-index" className={mobileNavLinkClass}>
          Rankings
        </NavLink>
        <NavLink to="/profile" className={mobileNavLinkClass}>
          Profile
        </NavLink>
      </div>
    </header>
  );
};

