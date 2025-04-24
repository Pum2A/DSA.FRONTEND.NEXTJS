import useSWR from "swr";
import {
  getLessonById,
  getLessonProgress,
  completeStep,
  completeLesson,
} from "../services/lessonService";
import { Lesson, UserProgress } from "../types";
import { useState } from "react";

export function useLesson(lessonId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Lesson, Error>(
    lessonId ? `lesson-${lessonId}` : null,
    async () => {
      if (!lessonId) throw new Error("Lesson ID is null");
      return await getLessonById(lessonId);
    }
  );

  return {
    lesson: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useLessonProgress(lessonId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<UserProgress, Error>(
    lessonId ? `lesson-progress-${lessonId}` : null,
    async () => {
      if (!lessonId) throw new Error("Lesson ID is null");
      return await getLessonProgress(lessonId);
    }
  );

  return {
    progress: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useLessonNavigation(lessonId: string | null) {
  const { lesson, isLoading: isLessonLoading } = useLesson(lessonId);
  const { progress, mutate: mutateProgress } = useLessonProgress(lessonId);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  // Ustaw aktualny krok na podstawie postępu, gdy dane się załadują
  if (
    progress &&
    !isLessonLoading &&
    currentStep === 0 &&
    progress.currentStepIndex > 0
  ) {
    setCurrentStep(progress.currentStepIndex);
  }

  const goToNextStep = async () => {
    if (!lessonId || !lesson) return;

    const nextStep = currentStep + 1;

    try {
      setIsCompleting(true);
      // Zapisz postęp na backendzie
      await completeStep(lessonId, currentStep);

      // Aktualizuj lokalny stan
      setCurrentStep(nextStep);

      // Aktualizuj dane SWR
      mutateProgress();

      return lesson?.steps ? nextStep >= lesson.steps.length : false;
    } catch (error) {
      console.error("Error moving to next step:", error);
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishLesson = async () => {
    if (!lessonId) return false;

    try {
      setIsCompleting(true);
      // Zapisz ukończenie lekcji na backendzie
      await completeLesson(lessonId);

      // Aktualizuj dane SWR
      mutateProgress();

      return true;
    } catch (error) {
      console.error("Error completing lesson:", error);
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    currentStep,
    isCompleting,
    isLastStep: lesson?.steps ? currentStep === lesson.steps.length - 1 : false,
    goToNextStep,
    goToPreviousStep,
    finishLesson,
  };
}
