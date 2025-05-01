"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Module, Lesson, UserProgress } from "@/app/types";
import { apiService } from "@/app/lib/api";
import LessonCard from "@/app/components/learning/LessonCard";

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [lessonProgress, setLessonProgress] = useState<
    Record<number, UserProgress>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      if (!moduleId) return;

      try {
        setLoading(true);
        // Pobierz dane modułu
        const moduleData = (await apiService.lessons.getModule(
          moduleId as string
        )) as Module;

        // Upewnij się, że moduleData zawiera tablicę lekcji
        if (!moduleData.lessons) {
          moduleData.lessons = [];
        }

        setModule(moduleData);

        // Pobierz postęp dla każdej lekcji
        const progressPromises = moduleData.lessons.map(async (lesson) => {
          try {
            const progress = await apiService.lessons.getLessonProgress(
              lesson.externalId
            );
            return { lessonId: lesson.id, progress };
          } catch (err) {
            console.error(
              `Error fetching progress for lesson ${lesson.id}:`,
              err
            );
            return { lessonId: lesson.id, progress: null };
          }
        });

        const progressResults = await Promise.all(progressPromises);
        const progressMap: Record<number, UserProgress> = {};

        progressResults.forEach((result) => {
          if (result.progress) {
            progressMap[result.lessonId] = result.progress as UserProgress;
          }
        });

        setLessonProgress(progressMap);
      } catch (err) {
        console.error("Error fetching module:", err);
        setError(
          "Nie udało się pobrać danych modułu. Spróbuj odświeżyć stronę."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Skeleton className="w-12 h-12 rounded-full mr-4" />
          <Skeleton className="h-9 w-64" />
        </div>
        <Skeleton className="h-5 w-full max-w-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Błąd</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>
            {error || "Nie znaleziono modułu"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Odśwież stronę
        </Button>
      </div>
    );
  }

  // Sortuj lekcje według kolejności
  const sortedLessons = [...(module.lessons || [])].sort((a, b) => a.id - b.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-white"
            style={{ backgroundColor: module.iconColor }}
          >
            <span className="text-2xl">{module.icon}</span>
          </div>
          <h1 className="text-3xl font-bold">{module.title}</h1>
        </div>
        <p className="text-gray-600">{module.description}</p>
      </div>

      {sortedLessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLessons.map((lesson) => {
            const progress = lessonProgress[lesson.id];
            const isCompleted = progress?.isCompleted || false;
            const isInProgress = progress && !isCompleted;

            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                moduleExternalId={module.externalId}
                completed={isCompleted}
                inProgress={isInProgress}
              />
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p>Brak dostępnych lekcji w tym module.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
