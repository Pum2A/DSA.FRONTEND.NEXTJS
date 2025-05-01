import { lessonService } from "@/app/services/lessonService";
import { Lesson, Step, UserProgress } from "@/app/types";
import useSWR from "swr";

export const useLesson = (lessonId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<Lesson>(
    lessonId ? `lesson-${lessonId}` : null,
    () => lessonService.getLesson(lessonId!)
  );

  return {
    lesson: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
};

export const useLessonProgress = (lessonId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<UserProgress>(
    lessonId ? `lesson-progress-${lessonId}` : null,
    () => lessonService.getLessonProgress(lessonId!)
  );

  return {
    progress: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
};

export const useLessonSteps = (lessonId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<Step[]>(
    lessonId ? `lesson-steps-${lessonId}` : null,
    () => lessonService.getLessonSteps(lessonId!)
  );

  return {
    steps: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
};
