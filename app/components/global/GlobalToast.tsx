"use client";
import { useNotificationStore } from "@/app/store/notificationStore";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Kolorowe pastelowe ramki i ikony (award-winning style)
const palette = {
  success: {
    border: "border-green-200",
    icon: <CheckCircle className="h-5 w-5 text-green-400" />,
    bar: "bg-green-300",
    ring: "ring-green-100",
  },
  error: {
    border: "border-rose-200",
    icon: <AlertCircle className="h-5 w-5 text-rose-400" />,
    bar: "bg-rose-300",
    ring: "ring-rose-100",
  },
  info: {
    border: "border-blue-200",
    icon: <Info className="h-5 w-5 text-blue-400" />,
    bar: "bg-blue-300",
    ring: "ring-blue-100",
  },
  warning: {
    border: "border-amber-200",
    icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    bar: "bg-amber-300",
    ring: "ring-amber-100",
  },
};

const TOAST_DURATION = 3800; // ms

export function GlobalToast() {
  const { notification, clearNotification } = useNotificationStore();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      setProgress(100);

      // Animate progress bar
      const start = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        setProgress(Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100));
        if (elapsed >= TOAST_DURATION) {
          setVisible(false);
          clearNotification();
        }
      }, 20);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      setVisible(false);
      setProgress(100);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  const paletteEntry = palette[notification.type];

  return (
    <div
      className={`
        fixed bottom-8 left-1/2 z-[1100] w-full max-w-xs sm:max-w-md 
        flex justify-center pointer-events-none select-none
      `}
      style={{ transform: "translateX(-50%)" }}
    >
      <div
        className={`
          relative
          min-w-[260px] max-w-md
          flex items-center gap-3 px-6 py-4
          rounded-2xl border ${paletteEntry.border}
          shadow-xl ring-1 ${paletteEntry.ring}
          bg-white/80 dark:bg-neutral-900/80
          backdrop-blur-[14px]
          transition-all duration-300
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          group
          pointer-events-auto
          hover:scale-[1.025]
          cursor-pointer
        `}
        onClick={() => {
          setVisible(false);
          clearNotification();
        }}
        role="alert"
        aria-live="polite"
      >
        <span className="shrink-0">{paletteEntry.icon}</span>
        <span className="font-medium text-[15px] text-neutral-900 dark:text-neutral-100 flex-1 leading-tight">
          {notification.message}
        </span>
        {/* X button shows only on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
            clearNotification();
          }}
          aria-label="Zamknij"
          className="opacity-0 group-hover:opacity-60 group-active:opacity-100 ml-3 p-1 rounded transition hover:bg-neutral-200 dark:hover:bg-neutral-800 pointer-events-auto"
          tabIndex={0}
        >
          <X className="w-4 h-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200" />
        </button>
        {/* Progress Bar: */}
        <span
          className={`
            absolute left-4 right-4 bottom-2 h-1.5 rounded-full overflow-hidden pointer-events-none
            bg-neutral-100 dark:bg-neutral-800
          `}
        >
          <span
            className={`
              block h-full rounded-full transition-all
              ${paletteEntry.bar}
            `}
            style={{
              width: `${progress}%`,
              transition: "width 90ms linear",
            }}
          />
        </span>
      </div>
    </div>
  );
}
