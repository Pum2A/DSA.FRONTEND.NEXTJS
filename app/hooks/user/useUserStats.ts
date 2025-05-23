import { userService } from "@/app/services/userService";
import { useApiResource } from "../useApiResource";
import { UserStats } from "@/app/types/progress";

export const useUserStats = () => {
  const { data, error, isLoading, isError, mutate } = useApiResource<UserStats>(
    "user-stats",
    userService.getStats
  );

  return {
    stats: data,
    isLoading,
    isError,
    error,
    refresh: mutate,
  };
};
