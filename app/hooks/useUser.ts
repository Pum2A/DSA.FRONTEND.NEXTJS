import useSWR from "swr";
import { userService } from "../services/userService";
import { UserStats } from "../types";

export const useUserStats = () => {
  const { data, error, isLoading, mutate } = useSWR<UserStats>(
    "user-stats",
    userService.getStats
  );

  return {
    stats: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
};
