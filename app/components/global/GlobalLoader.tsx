"use client";
import { useLoadingStore } from "@/app/store/loadingStore";
import { RefreshCw } from "lucide-react";

export default function GlobalLoader() {
  const loading = useLoadingStore((s) => s.loading);
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-white transition-colors">
      <div className="flex flex-col items-center shadow-lg rounded-2xl p-8 bg-white">
        <span className="relative flex h-20 w-20 mb-6">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-300 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-20 w-20 bg-lime-400 items-center justify-center shadow-md">
            <RefreshCw className="h-10 w-10 text-white animate-spin" />
          </span>
        </span>
        <span className="text-2xl font-extrabold text-lime-800 mb-1">
          Ładowanie...
        </span>
        <span className="text-base text-gray-500">Proszę chwilę zaczekać</span>
      </div>
    </div>
  );
}
