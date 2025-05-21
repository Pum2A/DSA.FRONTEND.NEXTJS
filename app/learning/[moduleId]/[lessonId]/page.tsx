"use client";

import ProgressBar from "@/app/components/learning/ProgressBar";
import StepRenderer from "@/app/components/learning/StepRenderer";
import { LoadingButton } from "@/app/components/ui/LoadingButton";
import {
  demoCurrentStepIndex,
  demoModules,
  demoProgress,
} from "@/app/demo/demoData";
import { useNotifications, useUserStats } from "@/app/hooks";
import { apiService } from "@/app/lib/api";
import { useDemoStore } from "@/app/store/demoStore";
import { useLoadingStore } from "@/app/store/loadingStore";
import { Lesson, LessonProgress, Step, StepCompletionData } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCcw,
  Sparkles,
  Star,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function LessonPage() {
  const { moduleId, lessonId } = useParams<{
    moduleId: string;
    lessonId: string;
  }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { refresh: refreshUserStats } = useUserStats();
  const { refresh: refreshNotifications } = useNotifications();
  const { width, height } = useWindowSize();
  const setGlobalLoading = useLoadingStore((s) => s.setLoading);
  const isDemo = useDemoStore((s) => s.isDemo);

  const fetchLessonData = useCallback(async () => {
    let loaderTimeout: NodeJS.Timeout | null = null;
    loaderTimeout = setTimeout(() => setGlobalLoading(true), 200);
    console.log("🔍 Ładuję lekcję:", { moduleId, lessonId, isDemo });

    try {
      setLoading(true);
      setError(null);

      // Poprawione: Rozdziel demo vs. API na bloki if-else
      if (isDemo) {
        const module = demoModules.find(
          (m) => m.externalId === moduleId || String(m.id) === moduleId
        );
        console.log("📘 Znaleziony moduł w demo:", module);

        if (!module) throw new Error("Module not found");

        const lessonData = (module.lessons || []).find(
          (l) => l.externalId === lessonId || String(l.id) === lessonId
        );
        console.log("📝 Znaleziona lekcja w demo:", lessonData);
        console.log("📋 Kroki lekcji w demo:", lessonData?.steps);

        if (!lessonData) throw new Error("Lesson not found");

        // Ustaw lekcję
        setLesson(lessonData);

        // Upewnij się, że steps to tablica, posortuj po order
        const sortedSteps = Array.isArray(lessonData.steps)
          ? [...lessonData.steps].sort((a, b) => a.order - b.order)
          : [];
        console.log("📑 Posortowane kroki w demo:", sortedSteps);

        setSteps(sortedSteps);

        // Weź progress z demo
        const progressData =
          lessonData.externalId && demoProgress[lessonData.externalId]
            ? demoProgress[lessonData.externalId]
            : null;
        setProgress(progressData);

        // Ustaw currentStepIndex z demoCurrentStepIndex albo 0
        if (
          lessonData.externalId &&
          demoCurrentStepIndex &&
          typeof demoCurrentStepIndex[lessonData.externalId] === "number"
        ) {
          setCurrentStepIndex(demoCurrentStepIndex[lessonData.externalId]);
        } else {
          setCurrentStepIndex(0);
        }
      } else {
        // API mode
        console.log("🌐 Pobieranie danych z API dla:", lessonId);

        const [lessonData, stepsData, progressData] = await Promise.all([
          apiService.lessons.getLesson(lessonId),
          apiService.lessons.getLessonSteps(lessonId),
          apiService.lessons.getLessonProgress(lessonId).catch((err) => {
            if ((err as any)?.response?.status === 404) return null;
            throw err;
          }),
        ]);

        console.log("📦 Dane API:", {
          lessonData,
          stepsData: Array.isArray(stepsData)
            ? `Array[${stepsData.length}]`
            : stepsData,
          progressData,
        });

        if (!lessonData) throw new Error("Lesson not found");

        // Ustaw lekcję
        setLesson(lessonData as Lesson);

        // Upewnij się, że stepsData to tablica
        if (!stepsData || !Array.isArray(stepsData)) {
          console.error("⚠️ stepsData nie jest tablicą:", stepsData);
          throw new Error("Invalid steps data format");
        }

        // Posortuj kroki
        const sortedSteps = [...stepsData]
          .filter((step) => step !== null && typeof step === "object")
          .sort((a, b) => a.order - b.order);

        console.log(
          "📑 Posortowane kroki z API:",
          sortedSteps.length > 0
            ? { count: sortedSteps.length, first: sortedSteps[0] }
            : "Brak kroków"
        );

        setSteps(sortedSteps);

        // Ustaw progres, jeśli istnieje
        if (progressData) {
          setProgress(progressData as LessonProgress);
        }
      }
    } catch (err: any) {
      console.error("❌ Error fetching lesson data:", err);
      setError(
        err.message === "Lesson not found"
          ? "Nie znaleziono lekcji."
          : "Nie udało się pobrać danych lekcji. Spróbuj ponownie."
      );
    } finally {
      if (loaderTimeout) clearTimeout(loaderTimeout);
      setGlobalLoading(false);
      setLoading(false);
    }
  }, [lessonId, moduleId, setGlobalLoading, isDemo]);

  // Po aktualizacji stanów, sprawdź czy dane są poprawne
  useEffect(() => {
    console.log("👁️ Stan po aktualizacji:", {
      lessonTitle: lesson?.title,
      stepsCount: steps.length,
      currentStepIndex,
      hasProgress: !!progress,
      currentStep: steps[currentStepIndex],
    });
  }, [lesson, steps, currentStepIndex, progress]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  const handleStepAction = async (stepCompletionData?: StepCompletionData) => {
    if (!lesson || steps.length === 0 || isSubmitting || isFinishing) return;

    if (
      steps[currentStepIndex].type === "quiz" &&
      stepCompletionData?.isCorrect === false
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isDemo) {
        if (currentStepIndex >= steps.length - 1) {
          setIsSubmitting(false);
          await completeLesson();
        } else {
          setCurrentStepIndex(currentStepIndex + 1);
        }
        return;
      }

      await apiService.lessons.completeStep(
        lessonId,
        currentStepIndex,
        stepCompletionData || {
          isCorrect: true,
          timeSpent: 0,
          attempts: 1,
        }
      );

      if (currentStepIndex >= steps.length - 1) {
        setIsSubmitting(false);
        await completeLesson();
      } else {
        setCurrentStepIndex(currentStepIndex + 1);
        setProgress(
          (prev) =>
            ({
              ...prev,
              completedSteps: prev?.completedSteps
                ? prev.completedSteps + 1
                : 1,
              totalSteps: steps.length,
              isCompleted: false,
              completionPercentage: Math.round(
                (((prev?.completedSteps || 0) + 1) / steps.length) * 100
              ),
            } as LessonProgress)
        );
      }
    } catch (err) {
      console.error("Error completing step:", err);
      setError("Wystąpił błąd przy zapisywaniu postępu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeLesson = async () => {
    setIsFinishing(true);
    try {
      if (!isDemo) {
        const result = await apiService.lessons.completeLesson(lessonId);

        if (result && result.xpAwarded) {
          console.log(`Zdobyto ${result.xpAwarded} XP!`);
        }

        await Promise.all([refreshUserStats(), refreshNotifications()]);

        const event = new CustomEvent("taskCompleted");
        window.dispatchEvent(event);
      }

      setShowConfetti(true);

      setTimeout(() => {
        router.push(`/learning/${moduleId}?completed=${lessonId}`);
      }, 3000);
    } catch (error) {
      console.error("Błąd podczas kończenia lekcji:", error);
      setError("Wystąpił błąd podczas finalizowania lekcji.");
      setIsFinishing(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
        <Button variant="ghost" size="sm" className="mb-6 opacity-50">
          <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do modułu
        </Button>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <div className="flex justify-between mb-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full mb-8" />
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-1/2 mt-4" />
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-16 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-red-800 dark:text-red-200 mb-3">
          Błąd Lekcji
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-8 max-w-md">
          {error || "Nie znaleziono danych lekcji."}
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/learning/${moduleId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do modułu
          </Button>
          <Button onClick={fetchLessonData} variant="destructive">
            <RefreshCcw className="mr-2 h-4 w-4" /> Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  // Dodana ochrona przed brakiem kroków
  if (!steps || steps.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-16 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <AlertCircle className="h-16 w-16 text-amber-500 mb-6" />
        <h2 className="text-2xl font-semibold text-amber-800 dark:text-amber-200 mb-3">
          Brak kroków
        </h2>
        <p className="text-amber-600 dark:text-amber-300 mb-8 max-w-md">
          Ta lekcja nie zawiera żadnych kroków do wykonania.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push(`/learning/${moduleId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do modułu
        </Button>
      </div>
    );
  }

  // Bezpieczne pobieranie currentStep z tablicy
  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < steps.length
      ? steps[currentStepIndex]
      : null;

  const isLastStep = currentStepIndex === steps.length - 1;

  // Dodana ochrona przed brakiem currentStep
  if (!currentStep) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-16 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <AlertCircle className="h-16 w-16 text-amber-500 mb-6" />
        <h2 className="text-2xl font-semibold text-amber-800 dark:text-amber-200 mb-3">
          Błąd kroku
        </h2>
        <p className="text-amber-600 dark:text-amber-300 mb-8 max-w-md">
          Nie można załadować tego kroku (indeks: {currentStepIndex}, liczba
          kroków: {steps.length}).
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/learning/${moduleId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do modułu
          </Button>
          <Button onClick={() => setCurrentStepIndex(0)} variant="default">
            Przejdź do pierwszego kroku
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      {isFinishing && !showConfetti && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-400/80 to-emerald-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Sparkles className="h-16 w-16 mb-4 animate-pulse" />
          <p className="text-xl font-semibold mb-2">
            Gratulacje! Lekcja ukończona!
          </p>
          <p className="text-sm">Zapisywanie postępu...</p>
          <Loader2 className="h-6 w-6 animate-spin mt-4" />
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/learning/${moduleId}`)}
        className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do modułu
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          {lesson.title}
        </h1>
        <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500 dark:text-gray-400 mb-4 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {lesson.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" /> {lesson.xpReward} XP
            </span>
          </div>
          <span className="font-medium">
            Krok {currentStepIndex + 1} z {steps.length}
          </span>
        </div>

        {lesson.requiredSkills && lesson.requiredSkills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {lesson.requiredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <ProgressBar currentStep={currentStepIndex} totalSteps={steps.length} />
      </div>

      <Card className="mb-6 shadow-lg border dark:border-gray-700">
        <CardContent className="p-6 md:p-8">
          <StepRenderer
            step={currentStep}
            onComplete={(data) => {
              if (data) {
                handleStepAction({
                  ...data,
                  timeSpent:
                    typeof data.timeSpent === "number" ? data.timeSpent : 0,
                  attempts: data.attempts || 1,
                });
              } else {
                handleStepAction(undefined);
              }
            }}
            isLoading={isSubmitting}
            key={`step-${currentStep.id}-${currentStepIndex}`}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0 || isSubmitting || isFinishing}
          variant="outline"
          size="lg"
          className="shadow-sm"
        >
          <ChevronLeft className="mr-2 h-5 w-5" /> Poprzedni
        </Button>
        {currentStep &&
          currentStep.type !== "quiz" &&
          currentStep.type !== "interactive" &&
          currentStep.type !== "challenge" && (
            <LoadingButton
              onClick={() => handleStepAction()}
              isLoading={isSubmitting}
              disabled={isFinishing}
              size="lg"
              className="shadow-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
            >
              {isLastStep ? "Zakończ lekcję" : "Następny krok"}
              <ChevronRight className="ml-2 h-5 w-5" />
            </LoadingButton>
          )}
      </div>
    </div>
  );
}
