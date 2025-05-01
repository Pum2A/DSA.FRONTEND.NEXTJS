"use client";

import { useNotifications } from "@/app/hooks/useNotifications";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function NotificationsBadge({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const { notifications } = useNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  if (mobile) {
    return (
      <Link href="/profile#notifications" className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-blue-600" />
        <span className="text-sm font-semibold text-blue-700">
          Powiadomienia
        </span>
        {unread > 0 && (
          <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link href="/profile#notifications" className="relative group">
      <Bell className="h-6 w-6 text-blue-600 group-hover:text-blue-800 transition" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unread}
        </span>
      )}
    </Link>
  );
}
