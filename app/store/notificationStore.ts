import { create } from "zustand";

type NotificationType = "success" | "error" | "info" | "warning";

type Notification = {
  message: string;
  type: NotificationType;
};

type NotificationStore = {
  notification: Notification | null;
  setNotification: (notification: Notification) => void;
  clearNotification: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notification: null,
  setNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),
}));
