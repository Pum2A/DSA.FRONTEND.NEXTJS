"use client";
import { useErrorStore } from "@/app/store/errorStore";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export function GlobalErrorToast() {
  const { error, clearError } = useErrorStore();

  // Automatyczne zamykanie po 5 sekundach
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100]">
      <div className="flex items-center gap-3 bg-white border border-lime-400 rounded-xl px-6 py-4 shadow-xl">
        <AlertCircle className="h-6 w-6 text-lime-500" />
        <span className="text-lime-800 font-semibold">{error}</span>
        <button
          onClick={clearError}
          className="ml-4 px-2 py-1 text-lime-600 hover:text-lime-800"
        >
          Zamknij
        </button>
      </div>
    </div>
  );
}
