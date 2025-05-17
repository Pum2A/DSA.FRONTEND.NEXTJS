import { Notification } from "@/app/types/Notification";
import { useApiResource } from "../useApiResource";
import { notificationService } from "@/app/services/notificationService";

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
