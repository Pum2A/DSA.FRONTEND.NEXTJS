import useSWR from "swr";
import { getUserStats, getLeaderboard } from "../services/userService";
import { UserStats } from "../types";

export function useUserStats() {
  const { data, error, isLoading, mutate } = useSWR<UserStats, Error>(
    "user-stats",
    getUserStats
  );

  return {
    stats: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useLeaderboard(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<any[], Error>(
    `leaderboard-${limit}`,
    () => getLeaderboard(limit)
  );

  return {
    leaderboard: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
