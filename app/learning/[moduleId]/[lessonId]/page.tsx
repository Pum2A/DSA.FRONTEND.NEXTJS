"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false); // Spinner for step submission
  const [isFinishing, setIsFinishing] = useState(false); // Spinner for lesson completion

  const { refresh: refreshUserStats } = useUserStats();
  const { refresh: refreshNotifications } = useNotifications();

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) return;

      try {
        setLoading(true);

        // Fetch lesson data
        const lessonData = (await apiService.lessons.getLesson(
          lessonId
        )) as Lesson;
        setLesson(lessonData);

        // Fetch steps
        const stepsData = await apiService.lessons.getLessonSteps(lessonId);
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

        const sortedSteps = [...processedSteps].sort(
          (a, b) => a.order - b.order
        );
        setSteps(sortedSteps);

        // Fetch progress
        const progressData = (await apiService.lessons.getLessonProgress(
          lessonId
        )) as UserProgress;
        setProgress(progressData);

        // Set the current step based on progress
        if (progressData && progressData.currentStepIndex > 0) {
          setCurrentStepIndex(progressData.currentStepIndex);
        }
      } catch (err) {
        console.error("Error fetching lesson data:", err);
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
      // Save progress for the current step
      await apiService.lessons.completeStep(
        lessonId as string,
        currentStepIndex
      );

      // If it's the last step, complete the lesson
      if (currentStepIndex >= steps.length - 1) {
        setIsSubmitting(false);
        setIsFinishing(true); // Show finishing spinner

        await completeLesson();
        return;
      }

      // Move to the next step
      setCurrentStepIndex(currentStepIndex + 1);
    } catch (err) {
      console.error("Error completing step:", err);
      alert("Wystąpił błąd przy zapisywaniu postępu. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeLesson = async () => {
    setIsFinishing(true); // Pokaż spinner

    try {
      await apiService.lessons.completeLesson(lessonId);

      // Odśwież dane użytkownika i powiadomienia
      await Promise.all([refreshUserStats(), refreshNotifications()]);

      // Emituj event `taskCompleted`
      const event = new CustomEvent("taskCompleted");
      window.dispatchEvent(event);

      // Przekieruj do modułu
      router.push(`/learning/${moduleId}?completed=${lessonId}`);
    } catch (error) {
      console.error("Błąd podczas kończenia lekcji:", error);
      alert("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setIsFinishing(false); // Ukryj spinner
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
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-2 w-full mb-8" />
        <Card className="mb-6">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-36" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
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
      {isFinishing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-lg flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            Trwa zapisywanie postępu...
          </div>
        </div>
      )}

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
