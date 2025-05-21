"use client";

import LessonCard, {
  LessonCardSkeleton,
} from "@/app/components/learning/LessonCard";
import { demoModules, demoProgress } from "@/app/demo/demoData";
import { apiService } from "@/app/lib/api";
import { useDemoStore } from "@/app/store/demoStore";
import { useLoadingStore } from "@/app/store/loadingStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  PackageX,
  RefreshCcw,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LessonProgress, Module } from "../../types";

function getModuleIcon(module: Module | null) {
  if (!module || !module.icon) return null;
  switch (module.icon) {
    case "package":
      return <PackageX className="h-8 w-8 text-white" />;
    case "book":
      return <BookOpen className="h-8 w-8 text-white" />;
    default:
      return <PackageX className="h-8 w-8 text-white" />;
  }
}

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [lessonProgress, setLessonProgress] = useState<
    Record<string, LessonProgress>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setGlobalLoading = useLoadingStore((s) => s.setLoading);
  const isDemo = useDemoStore((s) => s.isDemo);

  const fetchModuleData = useCallback(async () => {
    let loaderTimeout: NodeJS.Timeout | null = null;
    loaderTimeout = setTimeout(() => setGlobalLoading(true), 200);

    try {
      setLoading(true);
      setError(null);

      if (isDemo) {
        const moduleData = demoModules.find(
          (m) => m.externalId === moduleId || String(m.id) === moduleId
        );
        if (!moduleData) throw new Error("Module not found");
        setModule(moduleData);

        const progressMap: Record<string, any> = {};
        (moduleData.lessons || []).forEach((lesson) => {
          if (lesson.externalId && demoProgress[lesson.externalId]) {
            progressMap[lesson.externalId] = demoProgress[lesson.externalId];
          }
        });
        setLessonProgress(progressMap);
        return;
      }

      const moduleData = await apiService.lessons.getModule(moduleId);
      if (!moduleData) throw new Error("Module not found");
      if (!moduleData.lessons) moduleData.lessons = [];

      setModule(moduleData);

      if (moduleData.lessons.length > 0) {
        const progressPromises = moduleData.lessons.map(async (lesson) => {
          if (!lesson.externalId)
            return { lessonExternalId: null, progress: null };
          try {
            const progress = await apiService.lessons.getLessonProgress(
              lesson.externalId
            );
            return {
              lessonExternalId: lesson.externalId,
              progress,
            };
          } catch (err) {
            if ((err as any)?.response?.status !== 404) {
              console.error(
                `Error fetching progress for lesson ${lesson.externalId}:`,
                err
              );
            }
            return { lessonExternalId: lesson.externalId, progress: null };
          }
        });

        const progressResults = await Promise.all(progressPromises);
        const progressMap: Record<string, LessonProgress> = {};
        progressResults.forEach((result) => {
          if (result.progress && result.lessonExternalId) {
            progressMap[result.lessonExternalId] =
              result.progress as LessonProgress;
          }
        });
        setLessonProgress(progressMap);
      } else {
        setLessonProgress({});
      }
    } catch (err: any) {
      console.error("Error fetching module:", err);
      setError(
        err.message === "Module not found"
          ? "Nie znaleziono modułu."
          : "Nie udało się pobrać danych modułu. Spróbuj ponownie."
      );
    } finally {
      if (loaderTimeout) clearTimeout(loaderTimeout);
      setGlobalLoading(false);
      setLoading(false);
    }
  }, [moduleId, setGlobalLoading, isDemo]);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-16 animate-pulse">
        <Button variant="ghost" size="sm" className="mb-6 opacity-50">
          <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do modułów
        </Button>
        <div className="flex items-center mb-6">
          <Skeleton className="w-16 h-16 rounded-lg mr-5" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 sm:w-72" />
            <Skeleton className="h-4 w-64 sm:w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <LessonCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-16 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-red-800 dark:text-red-200 mb-3">
          Błąd
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-8 max-w-md">
          {error || "Nie znaleziono modułu."}
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/learning")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do modułów
          </Button>
          <Button onClick={fetchModuleData} variant="destructive">
            <RefreshCcw className="mr-2 h-4 w-4" /> Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  const moduleIconElement = getModuleIcon(module);
  const accentColor = module.iconColor || "#6366F1";
  const sortedLessons = [...(module.lessons || [])].sort((a, b) => {
    if (typeof a.id === "number" && typeof b.id === "number") {
      return a.id - b.id;
    }
    if (typeof a.id === "string" && typeof b.id === "string") {
      return (a.id as string).localeCompare(b.id as string);
    }
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-10 sm:py-16">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/learning")}
        className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do listy modułów
      </Button>

      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/30 border dark:border-gray-700">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg flex items-center justify-center shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          {moduleIconElement && (
            <div className="transform scale-150">{moduleIconElement}</div>
          )}
        </div>
        <div>
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1 block">
            Moduł
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {module.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            {module.description}
          </p>

          {/* Wyświetlanie listy wymagań wstępnych modułu */}
          {module.prerequisites && module.prerequisites.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Wymagania wstępne:
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {module.prerequisites.map((prereq, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Lekcje w tym module
      </h2>
      {sortedLessons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLessons.map((lesson, index) => {
            const progress = lesson.externalId
              ? lessonProgress[lesson.externalId]
              : undefined;

            const isCompleted = progress?.isCompleted || false;
            const isInProgress = progress && !isCompleted;
            const isLocked =
              !isCompleted &&
              !isInProgress &&
              index > 0 &&
              !(
                sortedLessons[index - 1] &&
                typeof sortedLessons[index - 1].externalId !== "undefined" &&
                sortedLessons[index - 1].externalId &&
                lessonProgress[sortedLessons[index - 1].externalId as string]
                  ?.isCompleted
              );

            return (
              <LessonCard
                key={lesson.externalId || lesson.id}
                lesson={lesson}
                moduleExternalId={module.externalId ?? ""}
                completed={isCompleted}
                inProgress={isInProgress}
                isLocked={isLocked}
                index={index}
              />
            );
          })}
        </div>
      ) : (
        <Card className="mt-8 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-none">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Brak lekcji w tym module.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Zawartość zostanie dodana wkrótce.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
