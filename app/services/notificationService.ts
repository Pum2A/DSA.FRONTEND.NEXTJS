import { apiService } from "../lib/api";

export type Notification = {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: "achievement" | "level-up" | "general";
};

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    return await apiService.get("/notification");
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiService.post(`/notification/${notificationId}/mark-as-read`);
  },
};
