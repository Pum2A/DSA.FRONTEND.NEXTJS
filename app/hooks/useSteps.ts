import useSWR from "swr";
import { getLessonSteps } from "../services/lessonService";
import { Step } from "../types";

export function useLessonSteps(lessonId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Step[], Error>(
    lessonId ? `lesson-steps-${lessonId}` : null,
    async () => (lessonId ? await getLessonSteps(lessonId) : [])
  );

  return {
    steps: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
