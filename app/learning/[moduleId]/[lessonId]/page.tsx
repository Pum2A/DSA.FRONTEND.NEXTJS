"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Lesson, Step, UserProgress } from "@/app/types";
import { apiService } from "@/app/lib/api";
import StepRenderer from "@/app/components/learning/StepRenderer";
import ProgressBar from "@/app/components/learning/ProgressBar";
import { LoadingButton } from "@/app/components/ui/LoadingButton";
import { useUserStats } from "@/app/hooks/useUser";
import { useNotifications } from "@/app/hooks/useNotifications";

export default function LessonPage() {
  const { moduleId, lessonId } = useParams<{
    moduleId: string;
    lessonId: string;
  }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: mutateUserStats } = useUserStats();
  const { mutate: mutateNotifications } = useNotifications();

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) return;

      try {
        setLoading(true);

        // Pobierz dane lekcji
        const lessonData = (await apiService.lessons.getLesson(
          lessonId as string
        )) as Lesson;
        setLesson(lessonData);

        // Osobne pobieranie kroków lekcji
        try {
          const stepsData = await apiService.lessons.getLessonSteps(
            lessonId as string
          );
          // Przetwarzanie kroków quizu
          const processedSteps = (stepsData as Step[]).map((step) => {
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

          // Sortuj kroki według kolejności
          const sortedSteps = [...processedSteps].sort(
            (a, b) => a.order - b.order
          );
          setSteps(sortedSteps);
        } catch (err) {
          console.error("Error fetching steps:", err);

          // Fallback - użyj kroków z lekcji, jeśli nowy endpoint nie działa
          if (lessonData.steps) {
            const sortedSteps = [...lessonData.steps].sort(
              (a, b) => a.order - b.order
            );
            setSteps(sortedSteps);
          }
        }

        // Pobierz postęp użytkownika
        try {
          const progressData = (await apiService.lessons.getLessonProgress(
            lessonId as string
          )) as UserProgress;
          setProgress(progressData);

          // Ustaw aktualny krok na podstawie postępu
          if (progressData && progressData.currentStepIndex > 0) {
            setCurrentStepIndex(progressData.currentStepIndex);
          }
        } catch (err) {
          console.error("Error fetching progress:", err);
          // Brak postępu nie jest krytycznym błędem
        }
      } catch (err) {
        console.error("Error fetching lesson:", err);
        setError(
          "Nie udało się pobrać danych lekcji. Spróbuj odświeżyć stronę."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId]);

  const handleNextStep = async () => {
    if (!lesson || steps.length === 0) return;

    setIsSubmitting(true);

    try {
      // Zapisz ukończenie aktualnego kroku
      await apiService.lessons.completeStep(
        lessonId as string,
        currentStepIndex
      );

      // Jeśli to ostatni krok, ukończ lekcję
      if (currentStepIndex >= steps.length - 1) {
        await apiService.lessons.completeLesson(lessonId as string);

        // --- KLUCZOWE: Odśwież dane użytkownika i powiadomień ---
        if (typeof mutateUserStats === "function") mutateUserStats();
        if (typeof mutateNotifications === "function")
          mutateNotifications(undefined, { revalidate: true });

        // Przekieruj do strony modułu
        router.push(`/learning/${moduleId}?completed=${lessonId}`);
        return;
      }

      // Przejdź do następnego kroku
      setCurrentStepIndex(currentStepIndex + 1);
    } catch (err) {
      console.error("Error handling step completion:", err);
      alert("Wystąpił błąd przy zapisywaniu postępu. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>

        <Skeleton className="h-2 w-full mb-8" />

        <Card className="mb-6">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Błąd</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>
            {error || "Nie znaleziono lekcji"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Odśwież stronę
        </Button>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>Szacowany czas: {lesson.estimatedTime}</span>
          <span>XP: {lesson.xpReward}</span>
        </div>

        <ProgressBar currentStep={currentStepIndex} totalSteps={steps.length} />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {currentStep ? (
            <StepRenderer
              step={currentStep}
              onComplete={handleNextStep}
              isLoading={isSubmitting}
            />
          ) : (
            <div className="text-center p-4">
              <p>Nie znaleziono kroków dla tej lekcji.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Poprzedni krok
        </Button>

        <LoadingButton onClick={handleNextStep} isLoading={isSubmitting}>
          {isLastStep ? "Zakończ lekcję" : "Następny krok"}{" "}
          <ChevronRight className="ml-2 h-4 w-4" />
        </LoadingButton>
      </div>
    </div>
  );
}
