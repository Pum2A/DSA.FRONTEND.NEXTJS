import { notificationService } from "@/app/services/notificationService";
import { Notification } from "@/app/types/dashboard";
import { useApiResource } from "../useApiResource";

export const useNotifications = () => {
  const { data, isLoading, isError, error, mutate } = useApiResource<
    Notification[]
  >("notifications", () => notificationService.getAll(), {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 60000,
  });

  return {
    notifications: data || [],
    isLoading,
    isError,
    error,
    refresh: mutate,
  };
};
