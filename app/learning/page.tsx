"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookHeart, PackageX, RefreshCcw } from "lucide-react";
import { Module } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "../lib/api";
import ModuleCard, {
  ModuleCardSkeleton,
} from "../components/learning/ModuleCard";
import { useLoadingStore } from "@/app/store/loadingStore";

export default function LearningPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const setGlobalLoading = useLoadingStore((s) => s.setLoading);

  const fetchModules = useCallback(async () => {
    // Delayed loader to avoid flickering on fast API
    let loaderTimeout: NodeJS.Timeout | null = null;
    loaderTimeout = setTimeout(() => setGlobalLoading(true), 200);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.lessons.getAllModules(); // Add { signal: controller.signal } if possible
      const sortedData = [...(data as Module[])].sort(
        (a, b) => a.order - b.order
      );
      setModules(sortedData);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError("Nie udało się pobrać modułów. Spróbuj ponownie.");
    } finally {
      if (loaderTimeout) clearTimeout(loaderTimeout);
      setGlobalLoading(false);
      setLoading(false);
    }
  }, [setGlobalLoading]);

  useEffect(() => {
    fetchModules();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchModules]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="mb-12 text-center">
          <Skeleton className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4" />
          <Skeleton className="h-8 w-3/5 mx-auto mb-3" />
          <Skeleton className="h-5 w-4/5 sm:w-1/2 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ModuleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-16 flex flex-col items-center justify-center text-center min-h-[70vh] bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-red-800 dark:text-red-200 mb-3">
          Oops! Coś poszło nie tak.
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-8 max-w-md">{error}</p>
        <Button onClick={fetchModules} variant="destructive" size="lg">
          <RefreshCcw className="mr-2 h-4 w-4" /> Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:py-16">
      <div className="mb-12 text-center relative overflow-hidden pb-4">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-50 dark:from-indigo-900/30 to-transparent -z-10"></div>
        <BookHeart className="mx-auto h-14 w-14 text-indigo-600 dark:text-indigo-400 mb-4 drop-shadow-lg" />
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-gray-900 dark:text-gray-100 tracking-tight">
          Twoja Ścieżka Rozwoju
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Przeglądaj dostępne moduły, pogłębiaj wiedzę i zdobywaj nowe
          umiejętności w świecie algorytmów.
        </p>
      </div>

      {modules.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.externalId || module.id}
              module={module}
              index={index}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-12 border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent shadow-none">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <PackageX className="h-20 w-20 text-gray-400 dark:text-gray-500 mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Wygląda na to, że nic tu nie ma...
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Obecnie nie ma dostępnych żadnych modułów nauki. Wróć później!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
