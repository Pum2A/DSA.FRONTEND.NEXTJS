"use client";

import ProgressBar from "@/app/components/learning/ProgressBar";
import StepRenderer from "@/app/components/learning/StepRenderer";
import { LoadingButton } from "@/app/components/ui/LoadingButton";
import { useNotifications, useUserStats } from "@/app/hooks";
import { apiService } from "@/app/lib/api";
import { useLoadingStore } from "@/app/store/loadingStore";
import { LessonDto, StepDto, StepCompletionResult } from "@/app/types/lesson";
import { UserProgressDto } from "@/app/types/progress";

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

  const [lesson, setLesson] = useState<LessonDto | null>(null); // Updated to LessonDto
  const [steps, setSteps] = useState<StepDto[]>([]); // Updated to StepDto
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<UserProgressDto | null>(null); // Updated to UserProgressDto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { refresh: refreshUserStats } = useUserStats();
  const { refresh: refreshNotifications } = useNotifications();
  const { width, height } = useWindowSize();

  // GLOBALNY LOADER
  const setGlobalLoading = useLoadingStore((s) => s.setLoading);

  // Funkcja pobierania danych
  const fetchLessonData = useCallback(async () => {
    if (!lessonId) return;
    let loaderTimeout: NodeJS.Timeout | null = null;
    loaderTimeout = setTimeout(() => setGlobalLoading(true), 200);

    try {
      setLoading(true);
      setError(null);

      const [lessonData, stepsData, progressData] = await Promise.all([
        apiService.lessons.getLesson(lessonId),
        apiService.lessons.getLessonSteps(lessonId),
        apiService.lessons.getLessonProgress(lessonId).catch((err) => {
          if ((err as any)?.response?.status === 404) return null;
          throw err;
        }),
      ]);

      if (!lessonData) throw new Error("Lesson not found");
      setLesson(lessonData as LessonDto); // Updated to LessonDto

      const processedSteps = (stepsData as StepDto[]).map((step) => {
        // Updated to StepDto
        if (step.type === "quiz" && step.additionalData) {
          try {
            const quizData =
              typeof step.additionalData === "string"
                ? JSON.parse(step.additionalData)
                : step.additionalData;
            return {
              ...step,
              question: quizData.question || step.question,
              options: quizData.options || step.options,
              correctAnswer: quizData.correctAnswer || step.correctAnswer,
              explanation: quizData.explanation || step.explanation,
            };
          } catch (error) {
            console.error(
              `Error parsing quiz data for step ${step.id}:`,
              error
            );
            return step;
          }
        }
        return step;
      });
      const sortedSteps = [...processedSteps].sort((a, b) => a.order - b.order);
      setSteps(sortedSteps);

      setProgress(progressData as UserProgressDto | null); // Updated to UserProgressDto
      if (
        progressData &&
        typeof (progressData as UserProgressDto).currentStepIndex ===
          "number" &&
        (progressData as UserProgressDto).currentStepIndex > 0
      ) {
        setCurrentStepIndex((progressData as UserProgressDto).currentStepIndex);
      }
    } catch (err: any) {
      console.error("Error fetching lesson data:", err);
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
  }, [lessonId, setGlobalLoading]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  // Obsługa kroku - AKTUALIZACJA DO NOWEGO StepCompletionResult
  const handleStepAction = async (result?: StepCompletionResult) => {
    if (!lesson || steps.length === 0 || isSubmitting || isFinishing) return;

    // Sprawdź czy sukces - dla zachowania kompatybilności
    const isSuccess = result ? result.success : true;

    // W przypadku quizu, jeśli nie udało się, nie przechodź dalej
    if (steps[currentStepIndex].type === "quiz" && !isSuccess) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Możesz wysłać dane ukończenia kroku na backend
      await apiService.lessons.completeStep(lessonId, currentStepIndex);

      if (currentStepIndex >= steps.length - 1) {
        setIsSubmitting(false);
        await completeLesson();
      } else {
        setCurrentStepIndex(currentStepIndex + 1);
        setProgress(
          (prev) =>
            ({
              ...prev,
              currentStepIndex: currentStepIndex + 1,
              isCompleted: false,
              // Jeśli backend zwrócił xpEarned, możesz go zaktualizować tutaj
              xpEarned: prev?.xpEarned
                ? prev.xpEarned + (result?.xpEarned || 0)
                : result?.xpEarned || 0,
            } as UserProgressDto)
        );
      }
    } catch (err) {
      console.error("Error completing step:", err);
      setError("Wystąpił błąd przy zapisywaniu postępu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kończenie lekcji
  const completeLesson = async () => {
    setIsFinishing(true);
    try {
      await apiService.lessons.completeLesson(lessonId);
      await Promise.all([refreshUserStats(), refreshNotifications()]);
      const event = new CustomEvent("taskCompleted");
      window.dispatchEvent(event);

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

  // === ULEPSZONY STAN ŁADOWANIA ===
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

  // === ULEPSZONY STAN BŁĘDU ===
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

  // Przygotowanie danych kroku
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Confetti na sukces! */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={300}
        />
      )}
      {/* Nakładka podczas finalizacji */}
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
      {/* Przycisk powrotu */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/learning/${moduleId}`)}
        className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do modułu
      </Button>
      {/* Nagłówek lekcji i postęp */}
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
        <ProgressBar currentStep={currentStepIndex} totalSteps={steps.length} />
      </div>
      {/* Karta z treścią kroku */}
      <Card className="mb-6 shadow-lg border dark:border-gray-700">
        {currentStep ? (
          <CardContent className="p-6 md:p-8">
            {currentStep.title && (
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">
                {currentStep.title}
              </h2>
            )}
            <StepRenderer
              step={currentStep}
              onComplete={handleStepAction}
              isLoading={isSubmitting}
              currentStepIndex={currentStepIndex}
              totalSteps={steps.length}
              key={currentStep.id}
            />
          </CardContent>
        ) : (
          <CardContent className="p-10 text-center text-gray-500">
            <p>Nie można załadować tego kroku.</p>
          </CardContent>
        )}
      </Card>
      {/* Nawigacja */}
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
        {currentStep && (
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
