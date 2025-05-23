import { lessonService } from "@/app/services/lessonService";
import { useApiResource } from "../useApiResource";
import { Step } from "@/app/types/lesson";

export const useLessonSteps = (lessonId: string | null) => {
  const { data, isLoading, isError, error, mutate } = useApiResource<Step[]>(
    lessonId ? `lesson-steps-${lessonId}` : null,
    () => lessonService.getLessonSteps(lessonId!)
  );
  return { steps: data || [], isLoading, isError, error, mutate };
};
