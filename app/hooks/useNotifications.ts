import useSWR from "swr";
import { notificationService } from "../services/notificationService";

export const useNotifications = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "notifications",
    notificationService.getAll,
    {
      revalidateOnFocus: true, // Re-fetch data when the window regains focus
      revalidateOnReconnect: true, // Re-fetch data when the network reconnects
      refreshInterval: 60000, // Optional: Poll every 60 seconds
    }
  );

  return {
    notifications: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate, // Use mutate to manually refresh the data
  };
};
