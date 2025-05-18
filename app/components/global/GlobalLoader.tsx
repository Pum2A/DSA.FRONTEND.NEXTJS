"use client";
import { useLoadingStore } from "@/app/store/loadingStore";
import { RefreshCw } from "lucide-react";

export default function GlobalLoader() {
  const loading = useLoadingStore((s) => s.loading);

  return (
    <div
      className={`fixed inset-0 z-[1050] flex items-center justify-center transition-opacity duration-300 ${
        loading
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } bg-gradient-to-br from-lime-300/70 to-lime-600/40 dark:from-lime-900/80 dark:to-gray-900/90 backdrop-blur-lg`}
      aria-hidden={!loading}
    >
      <div className="flex flex-col items-center justify-center p-10 rounded-3xl shadow-2xl bg-white/90 dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-800">
        <span className="relative flex h-28 w-28 mb-8">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 dark:bg-lime-700 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-28 w-28 bg-lime-500 dark:bg-lime-400 items-center justify-center shadow-md">
            <RefreshCw className="h-14 w-14 text-white dark:text-neutral-900 animate-spin" />
          </span>
        </span>
        <span className="text-3xl font-extrabold text-lime-800 dark:text-lime-200 mb-2 drop-shadow">
          Ładowanie...
        </span>
        <span className="text-lg text-gray-600 dark:text-gray-300 font-medium">
          Czekaj chwilę, pobieramy najnowsze dane 🌱
        </span>
      </div>
    </div>
  );
}
