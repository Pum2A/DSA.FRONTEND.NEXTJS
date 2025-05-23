import { Notification } from "@/app/types/dashboard"; // ✅ Importuj typ
import { apiService } from "../lib/api";

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    return await apiService.get("/notification");
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiService.post(`/notification/${notificationId}/mark-as-read`);
  },
};
