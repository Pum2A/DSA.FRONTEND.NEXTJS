"use client";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type LessonStepDto = {
  id: string;
  title: string;
  content: string;
  codeExample?: string | null;
  order: number;
  isCompleted: boolean;
  completedAt?: string | null;
};

type LessonStepsResponse = {
  lessonId: string;
  lessonTitle: string;
  steps: LessonStepDto[];
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
};

type LessonDetailDto = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  isActive: boolean;
  isCompleted: boolean;
};

export default function LessonPage() {
  const { lessonId } = useParams() as { lessonId: string };
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completingStep, setCompletingStep] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get lesson details
  const { data: lessonDetails } = useQuery<LessonDetailDto>({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/Lessons/${lessonId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch lesson details");
      return res.json();
    },
  });

  // Get lesson steps
  const {
    data: stepsResponse,
    isLoading: stepsLoading,
    refetch,
  } = useQuery<LessonStepsResponse>({
    queryKey: ["lesson-steps", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/Lessons/${lessonId}/steps`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch lesson steps");
      return res.json();
    },
  });

  // Find first incomplete step when steps load
  useEffect(() => {
    if (stepsResponse?.steps) {
      const firstIncompleteIndex = stepsResponse.steps.findIndex(
        (step) => !step.isCompleted
      );
      setCurrentStepIndex(
        firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0
      );
    }
  }, [stepsResponse]);

  // Complete current step and move to next
  async function completeCurrentStep() {
    if (!stepsResponse?.steps || currentStepIndex >= stepsResponse.steps.length)
      return;

    const currentStep = stepsResponse.steps[currentStepIndex];

    // If already completed, just move to next step
    if (currentStep.isCompleted) {
      moveToNextStep();
      return;
    }

    setCompletingStep(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/Lessons/${lessonId}/steps/${currentStep.id}/complete`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to complete step: ${errorData}`);
      }

      await refetch();
      moveToNextStep();

      toast({
        title: "Krok ukończony",
        description: "Pomyślnie ukończono krok lekcji",
      });
    } catch (error) {
      console.error("Error completing step:", error);
      setError(error instanceof Error ? error.message : "Nieznany błąd");

      toast({
        title: "Błąd",
        description: "Nie udało się ukończyć kroku lekcji",
        variant: "destructive",
      });
    } finally {
      setCompletingStep(false);
    }
  }

  // Move to the next step
  function moveToNextStep() {
    if (
      !stepsResponse?.steps ||
      currentStepIndex >= stepsResponse.steps.length - 1
    )
      return;
    setCurrentStepIndex((prevIndex) => prevIndex + 1);
  }

  // Complete the entire lesson - z zabezpieczeniem przed wielokrotnym kliknięciem
  async function completeLesson() {
    if (completingLesson) return; // Jeśli już jest w trakcie kończenia, nic nie rób

    setCompletingLesson(true);
    try {
      const res = await fetch(`/api/Lessons/${lessonId}/complete`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to complete lesson: ${errorData}`);
      }

      const result = await res.json();

      toast({
        title: "Lekcja ukończona!",
        description: `Zdobyłeś ${result.totalXpEarned} XP!`,
      });

      // Invalidate relevant queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["module", lessonDetails?.moduleId],
        }),
        queryClient.invalidateQueries({ queryKey: ["allModules"] }),
        queryClient.invalidateQueries({ queryKey: ["user-progress"] }),
      ]);

      // Redirect back to module page or next lesson if available
      setTimeout(() => {
        if (result.nextLessonId) {
          router.push(`/lessons/${result.nextLessonId}`);
        } else if (lessonDetails?.moduleId) {
          router.push(`/modules/${lessonDetails.moduleId}`);
        }
      }, 500); // Krótkie opóźnienie aby dać czas na odświeżenie danych
    } catch (error) {
      console.error("Error completing lesson:", error);
      setError(error instanceof Error ? error.message : "Nieznany błąd");

      toast({
        title: "Błąd",
        description: "Nie udało się ukończyć lekcji",
        variant: "destructive",
      });
      setCompletingLesson(false); // Reset stanu tylko w przypadku błędu
    }
  }

  if (stepsLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
            <span className="ml-2 text-xl">Ładowanie lekcji...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stepsResponse || !stepsResponse.steps.length) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium">
              Nie znaleziono kroków dla tej lekcji
            </h2>
            <p className="text-muted-foreground mt-2">
              Ta lekcja nie zawiera jeszcze żadnych kroków.
            </p>
            {lessonDetails?.moduleId && (
              <Button className="mt-4" asChild>
                <Link href={`/modules/${lessonDetails.moduleId}`}>
                  Wróć do modułu
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { steps, lessonTitle, progressPercentage, completedSteps, totalSteps } =
    stepsResponse;
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const allCompleted = completedSteps === totalSteps;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        {lessonDetails?.moduleId && (
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/modules/${lessonDetails.moduleId}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Powrót do modułu {lessonDetails?.moduleTitle}
            </Link>
          </Button>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{lessonTitle}</h1>
            <span className="text-sm font-medium">
              Krok {currentStepIndex + 1} z {steps.length}
            </span>
          </div>

          {lessonDetails && (
            <p className="text-muted-foreground mb-4">
              {lessonDetails.description}
            </p>
          )}

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Postęp lekcji</span>
              <span className="font-medium">
                {progressPercentage}% ({completedSteps}/{totalSteps})
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step navigator - dots for each step */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex space-x-2">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentStepIndex
                      ? "bg-brand-500 w-4" // Active step
                      : step.isCompleted
                      ? "bg-green-500" // Completed step
                      : "bg-gray-300 dark:bg-gray-700" // Incomplete step
                  } transition-all`}
                  aria-label={`Przejdź do kroku ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Current step content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="mr-2 h-5 w-5 text-brand-500" />
              <h2 className="font-semibold text-xl">{currentStep.title}</h2>
              {currentStep.isCompleted && (
                <span className="ml-2 flex items-center text-green-500 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Ukończony
                </span>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none mb-6">
              <div className="whitespace-pre-line">{currentStep.content}</div>
            </div>

            {currentStep.codeExample && (
              <div className="mb-6">
                <p className="font-medium text-sm mb-2 text-muted-foreground">
                  Przykład:
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 overflow-x-auto text-sm">
                  <code>{currentStep.codeExample}</code>
                </pre>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    Błąd
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={
              currentStepIndex === 0 || completingStep || completingLesson
            }
          >
            Poprzedni krok
          </Button>

          {isLastStep && allCompleted ? (
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 min-w-[200px]"
              onClick={completeLesson}
              disabled={completingLesson}
            >
              {completingLesson ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kończenie lekcji...
                </>
              ) : (
                `Zakończ lekcję i zdobądź ${lessonDetails?.xpReward || 0} XP`
              )}
            </Button>
          ) : (
            <Button
              onClick={completeCurrentStep}
              disabled={completingStep || completingLesson}
            >
              {completingStep ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : currentStep.isCompleted ? (
                <>
                  Dalej
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Ukończ i przejdź dalej
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
