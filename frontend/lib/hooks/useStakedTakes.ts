"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import StakedTakes from "../contracts/StakedTakes";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type {
  Take,
  Credibility,
  Config,
  PostTakeParams,
  AppealTakeParams,
  Profile,
} from "../contracts/types";

/**
 * Returns the StakedTakes contract instance.
 * Recreated when the wallet address changes.
 * Read methods work without a wallet; write methods require one.
 */
export function useStakedTakesContract(): StakedTakes | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.",
        {
          label: "Setup Guide",
          onClick: () => window.open("/docs/setup", "_blank"),
        }
      );
      return null;
    }
    return new StakedTakes(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

export function useConfig() {
  const contract = useStakedTakesContract();
  return useQuery<Config, Error>({
    queryKey: ["stakedTakes", "config"],
    queryFn: () => {
      if (!contract) return Promise.reject(new Error("Contract not configured"));
      return contract.getConfig();
    },
    enabled: !!contract,
    staleTime: 30_000,
  });
}

export function useRecentTakes(offset = 0, limit = 20) {
  const contract = useStakedTakesContract();
  return useQuery<Take[], Error>({
    queryKey: ["stakedTakes", "recent", offset, limit],
    queryFn: () => {
      if (!contract) return Promise.resolve([]);
      return contract.getRecentTakes(offset, limit);
    },
    enabled: !!contract,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

export function useTakesByStatus(status: string, offset = 0, limit = 20) {
  const contract = useStakedTakesContract();
  return useQuery<Take[], Error>({
    queryKey: ["stakedTakes", "byStatus", status, offset, limit],
    queryFn: () => {
      if (!contract) return Promise.resolve([]);
      return contract.getTakesByStatus(status, offset, limit);
    },
    enabled: !!contract && !!status,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

export function useTake(takeId: string | undefined) {
  const contract = useStakedTakesContract();
  return useQuery<Take, Error>({
    queryKey: ["stakedTakes", "take", takeId],
    queryFn: () => {
      if (!contract || !takeId) return Promise.reject(new Error("Missing take id"));
      return contract.getTake(takeId);
    },
    enabled: !!contract && !!takeId,
    refetchOnWindowFocus: true,
    staleTime: 3_000,
  });
}

export function useProfile(wallet: string | undefined) {
  const contract = useStakedTakesContract();
  return useQuery<Profile, Error>({
    queryKey: ["profile", wallet],
    queryFn: () => {
      if (!contract || !wallet) return Promise.reject(new Error("Missing wallet"));
      return contract.getProfile(wallet);
    },
    enabled: !!contract && !!wallet,
    refetchOnWindowFocus: true,
    staleTime: 3_000,
  });
}

export function useUserTakes(wallet: string | null | undefined, offset = 0, limit = 20) {
  const contract = useStakedTakesContract();
  return useQuery<Take[], Error>({
    queryKey: ["stakedTakes", "userTakes", wallet, offset, limit],
    queryFn: () => {
      if (!contract || !wallet) return Promise.resolve([]);
      return contract.getUserTakes(wallet, offset, limit);
    },
    enabled: !!contract && !!wallet,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

export function useCredibility(wallet: string | null | undefined) {
  const contract = useStakedTakesContract();
  return useQuery<Credibility, Error>({
    queryKey: ["stakedTakes", "credibility", wallet],
    queryFn: () => {
      if (!contract || !wallet) return Promise.reject(new Error("Missing wallet"));
      return contract.getCredibility(wallet);
    },
    enabled: !!contract && !!wallet,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

export function useLeaderboard(limit = 20, minResolved = 1) {
  const contract = useStakedTakesContract();
  return useQuery<Credibility[], Error>({
    queryKey: ["stakedTakes", "leaderboard", limit, minResolved],
    queryFn: () => {
      if (!contract) return Promise.resolve([]);
      return contract.getLeaderboard(limit, minResolved);
    },
    enabled: !!contract,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useTotalTakes() {
  const contract = useStakedTakesContract();
  return useQuery<number, Error>({
    queryKey: ["stakedTakes", "total"],
    queryFn: () => {
      if (!contract) return Promise.resolve(0);
      return contract.getTotalTakes();
    },
    enabled: !!contract,
    staleTime: 10_000,
  });
}

// ──────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────

export function useSetHandle() {
  const contract = useStakedTakesContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (handle: string) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Wallet not connected");
      return contract.setHandle(handle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakedTakes", "credibility"] });
      success("Handle set", { description: "Your handle is now live." });
    },
    onError: (err: any) => {
      error("Failed to set handle", { description: err?.message || "Please try again." });
    },
  });
}

export function usePostTake() {
  const contract = useStakedTakesContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isPosting, setIsPosting] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      params,
      stakeGen,
    }: {
      params: PostTakeParams;
      stakeGen: string | number;
    }) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Wallet not connected");
      setIsPosting(true);
      return contract.postTake(params, stakeGen);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakedTakes"] });
      setIsPosting(false);
      success("Take posted", { description: "Your claim is now locked on-chain." });
    },
    onError: (err: any) => {
      setIsPosting(false);
      error("Failed to post take", { description: err?.message || "Please try again." });
    },
  });

  return {
    ...mutation,
    isPosting,
    postTake: mutation.mutate,
    postTakeAsync: mutation.mutateAsync,
  };
}

export function useRetractTake() {
  const contract = useStakedTakesContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (takeId: string) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Wallet not connected");
      return contract.retractTake(takeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakedTakes"] });
      success("Take retracted", { description: "Stake has been refunded." });
    },
    onError: (err: any) => {
      error("Failed to retract", { description: err?.message || "Please try again." });
    },
  });
}

export function useResolveTake() {
  const contract = useStakedTakesContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (takeId: string) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Wallet not connected");
      setResolvingId(takeId);
      return contract.resolveTake(takeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakedTakes"] });
      setResolvingId(null);
      success("Take resolved", { description: "Verdict recorded. Appeal window is now open." });
    },
    onError: (err: any) => {
      setResolvingId(null);
      error("Failed to resolve", { description: err?.message || "Please try again." });
    },
  });

  return {
    ...mutation,
    resolvingId,
    resolveTake: mutation.mutate,
    resolveTakeAsync: mutation.mutateAsync,
  };
}

export function useAppealTake() {
  const contract = useStakedTakesContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      params,
      bondGen,
    }: {
      params: AppealTakeParams;
      bondGen: string | number;
    }) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Wallet not connected");
      return contract.appealTake(params, bondGen);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakedTakes"] });
      success("Appeal submitted", { description: "Validators will re-review the take." });
    },
    onError: (err: any) => {
      error("Failed to appeal", { description: err?.message || "Please try again." });
    },
  });
}

export function useFinalizeTake() {
  const contract = useStakedTakesContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (takeId: string) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Wallet not connected");
      return contract.finalizeTake(takeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakedTakes"] });
      success("Take finalized", { description: "Stake settled and credibility updated." });
    },
    onError: (err: any) => {
      error("Failed to finalize", { description: err?.message || "Please try again." });
    },
  });
}