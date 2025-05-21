import { apiService } from "../lib/api";
import { Notification } from "../types";

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const apiNotifications = await apiService.notifications.getAll();
    // Map or cast each notification to your local Notification type
    return apiNotifications.map(
      (n: any) =>
        ({
          id: n.id,
          type: n.type,
          message: n.message,
          createdAt: n.createdAt,
          // add other properties if needed
        } as Notification)
    );
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiService.notifications.markAsRead(notificationId);
  },
};
