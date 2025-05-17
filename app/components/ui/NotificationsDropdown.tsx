"use client";

import { Bell, CheckCircle, Award } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationService } from "@/app/services/notificationService";
import { useNotifications } from "@/app/hooks";

export default function NotificationsDropdown() {
  const { notifications, isLoading, refresh } = useNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  // Oznacza wszystkie powiadomienia jako przeczytane
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      for (const notification of unreadNotifications) {
        await notificationService.markAsRead(notification.id);
      }
      refresh();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Oznacza jedno powiadomienie jako przeczytane
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      refresh();
    } catch (error) {
      console.error(
        `Error marking notification ${notificationId} as read`,
        error
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex items-center justify-center p-2 rounded-full hover:bg-blue-50 transition"
          aria-label="Powiadomienia"
        >
          <Bell className="h-6 w-6 text-blue-600" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto p-0 rounded-xl shadow-md border border-gray-100 bg-white"
      >
        <div className="p-3 border-b flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-blue-700">
            <Bell className="h-5 w-5" /> Powiadomienia
          </span>
          {unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Oznacz wszystkie jako przeczytane
            </button>
          )}
        </div>
        <div>
          {isLoading ? (
            <div className="p-4 text-gray-500">Ładowanie...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-gray-400">Brak powiadomień.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 border-b last:border-b-0 ${
                  n.isRead
                    ? "opacity-60"
                    : n.type === "achievement"
                    ? "bg-yellow-50"
                    : "bg-blue-50"
                }`}
              >
                {/* Dobierz ikonę zależnie od typu */}
                {n.type === "achievement" ? (
                  <Award className="text-yellow-500 h-5 w-5 mt-1" />
                ) : n.type === "level-up" ? (
                  <CheckCircle className="text-green-400 h-5 w-5 mt-1" />
                ) : (
                  <Bell className="text-blue-400 h-5 w-5 mt-1" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{n.message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Oznacz jako przeczytane
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
