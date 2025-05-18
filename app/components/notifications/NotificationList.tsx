"use client";

import { useNotifications } from "@/app/hooks";
import { Bell, CheckCircle } from "lucide-react";

export default function NotificationsList() {
  const { notifications, isLoading } = useNotifications();

  if (isLoading) {
    return <div className="p-4 text-gray-500">Ładowanie powiadomień...</div>;
  }

  if (!notifications.length) {
    return <div className="p-4 text-gray-400">Brak powiadomień.</div>;
  }

  return (
    <div className="divide-y rounded-xl border bg-white shadow p-4 max-w-md mx-auto">
      <h2 className="flex items-center gap-2 text-lg font-bold mb-3 text-blue-600">
        <Bell size={20} /> Powiadomienia
      </h2>
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`py-3 flex items-start gap-3 ${
            n.isRead ? "opacity-60" : "bg-blue-50"
          }`}
        >
          <div>
            {n.isRead ? (
              <CheckCircle className="text-green-400 h-5 w-5 mt-1" />
            ) : (
              <Bell className="text-blue-400 h-5 w-5 mt-1 animate-bounce" />
            )}
          </div>
          <div>
            <div className="font-medium">{n.message}</div>
            <div className="text-xs text-gray-500">
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
