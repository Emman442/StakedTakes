"use client";

import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/lib/genlayer/WalletProvider";
import { useWallet } from "@/lib/genlayer/wallet";
import {
  useProfile,
  useRecentTakes,
  useLeaderboard,
} from "@/lib/hooks/useStakedTakes";
import type { Take, Profile as UserProfile } from "@/lib/contracts/types";

import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { TakesFeed } from "./components/TakesFeed";
import { TakeDetailView } from "./components/TakeDetailView";
import { PostTakeModal } from "./components/PostTakeModal";
import { LeaderboardView } from "./components/LeaderboardView";
import { ProfileView } from "./components/ProfileView";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { Footer } from "./components/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </WalletProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = useWallet();


  const { data: currentUser, isPending, error } = useProfile(
    address && typeof address === "string" ? address : undefined
  );
  console.log(currentUser, isPending, error)

  const { data: takes = [] } = useRecentTakes(0, 50);
  const { data: leaderboard = [] } = useLeaderboard(20, 1);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const openPost = () => setIsPostModalOpen(true);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#FAFAFA] flex flex-col font-sans selection:bg-[#00E5A0]/20 selection:text-[#00E5A0]">
      <AppShortcutsListener
        onOpenPost={openPost}
        onToggleShortcuts={() => setIsShortcutsOpen((p) => !p)}
      />

      <Header
        user={currentUser}
        isWalletConnected={!!address}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <Hero
                  onPostTake={openPost}
                  onSelectTake={(take) => navigate(`/take/${take.take_id}`)}
                  recentTakes={takes}
                  topForecasters={leaderboard}
                />

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242428] mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
                        Featured High-Conviction Stakes
                      </h2>
                      <p className="text-xs font-mono text-[#A1A1AA] mt-0.5">
                        Claims with highest locked GEN collateral awaiting validator consensus
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/feed")}
                      className="text-xs font-mono text-[#00E5A0] hover:underline cursor-pointer"
                    >
                      View all takes in feed ({takes.length}) →
                    </button>
                  </div>

                  <TakesFeed
                    takes={takes.slice(0, 5)}
                    onSelectTake={(take) => navigate(`/take/${take.take_id}`)}
                    onPostTake={openPost}
                    onAuthorClick={(wallet) => navigate(`/profile/${wallet}`)}
                  />
                </section>

                <HowItWorks />
              </div>
            }
          />

          <Route path="/overview" element={<Navigate to="/" replace />} />

          <Route
            path="/feed"
            element={
              <TakesFeed
                takes={takes}
                onSelectTake={(take) => navigate(`/take/${take.take_id}`)}
                onPostTake={openPost}
                onAuthorClick={(wallet) => navigate(`/profile/${wallet}`)}
              />
            }
          />
          <Route path="/feed/overview" element={<Navigate to="/feed" replace />} />

          <Route
            path="/credibility-index"
            element={
              <LeaderboardView
                users={leaderboard}
                onSelectUser={(wallet) => navigate(`/profile/${wallet}`)}
                onPostTake={openPost}
              />
            }
          />

          <Route
            path="/take/:id"
            element={
              <TakeDetailRoute
                takes={takes}
                currentUser={currentUser}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <ProfileRoute
                takes={takes}
                currentUser={currentUser}
                onPostTake={openPost}
              />
            }
          />

          <Route
            path="/profile/:wallet"
            element={
              <ProfileRoute
                takes={takes}
                currentUser={currentUser}
                onPostTake={openPost}
              />
            }
          />

          <Route
            path="/how-it-works"
            element={
              <div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
                  <h1 className="text-3xl font-bold text-[#FAFAFA] tracking-tight">
                    GenLayer Consensus & Brier Calibration Protocol
                  </h1>
                  <p className="text-sm font-mono text-[#A1A1AA] mt-1 max-w-2xl">
                    Technical overview of subjective-to-objective oracle translation, validator quorum rules, and calibration mathematics.
                  </p>
                </div>
                <HowItWorks />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                  <div className="border border-[#242428] bg-[#17171A] p-6 sm:p-8 space-y-6">
                    <h3 className="text-lg font-bold text-[#FAFAFA] font-mono">
                      Brier Score Credibility Formula
                    </h3>
                    <div className="bg-[#111113] border border-[#242428] p-4 font-mono text-xs text-[#00E5A0] leading-relaxed overflow-x-auto">
                      BS = (confidence - outcome)²<br />
                      where confidence ∈ [0.51, 0.99] and outcome ∈ {"{0, 1}"}
                      <br /><br />
                      Credibility Index (CI) = round(10,000 × max(0, 1 - 2 × mean(BS))) × VolumeFactor
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer onPostTake={openPost} onOpenShortcuts={() => setIsShortcutsOpen(true)} />

      <PostTakeModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        user={currentUser}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

function TakeDetailRoute({
  takes,
  currentUser,
}: {
  takes: Take[];
  currentUser?: UserProfile;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const take = takes.find((t) => t.take_id === id);

  if (!take) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono text-xs">
        <div className="bg-[#17171A] border border-[#242428] p-12">
          <div className="text-[#D2554D] font-bold text-base mb-2">Claim Not Found</div>
          <p className="text-[#A1A1AA] mb-6">
            The requested claim ID ({id}) could not be located.
          </p>
          <button
            type="button"
            onClick={() => navigate("/feed")}
            className="px-4 py-2 bg-[#00E5A0] text-[#0A0A0B] font-semibold cursor-pointer"
          >
            Return to Takes Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <TakeDetailView
      take={take}
      currentUser={currentUser}
      onClose={() => navigate(-1)}
      onViewAuthorProfile={(wallet) => navigate(`/profile/${wallet}`)}
    />
  );
}

function ProfileRoute({
  takes,
  currentUser,
  onPostTake,
}: {
  takes: Take[];
  currentUser?: UserProfile;
  onPostTake: () => void;
}) {
  const { wallet } = useParams<{ wallet?: string }>();
  const navigate = useNavigate();
  const { data: profile } = useProfile(wallet ?? currentUser?.wallet);

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-[#A1A1AA]">
        Loading profile…
      </div>
    );
  }

  const userTakes = takes.filter((t) => t.author === profile.wallet);
  const isCurrentUser = profile.wallet === currentUser?.wallet;

  return (
    <ProfileView
      user={profile}
      userTakes={userTakes}
      onSelectTake={(take) => navigate(`/take/${take.take_id}`)}
      onPostTake={onPostTake}
      onResetToMe={() => navigate("/profile")}
      isCurrentUser={isCurrentUser}
    />
  );
}

function AppShortcutsListener({
  onOpenPost,
  onToggleShortcuts,
}: {
  onOpenPost: () => void;
  onToggleShortcuts: () => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        onOpenPost();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        navigate("/feed");
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        navigate("/credibility-index");
      } else if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        navigate("/");
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        navigate("/profile");
      } else if (e.key === "?") {
        e.preventDefault();
        onToggleShortcuts();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onOpenPost, onToggleShortcuts]);

  return null;
}