import { UserProgress } from "@/app/types";
import { useApiResource } from "../useApiResource";
import { lessonService } from "@/app/services/lessonService";

export const useLessonProgress = (lessonId: string | null) => {
  const { data, isLoading, isError, error, mutate } =
    useApiResource<UserProgress>(
      lessonId ? `lesson-progress-${lessonId}` : null,
      () => lessonService.getLessonProgress(lessonId!)
    );
  return { progress: data, isLoading, isError, error, mutate };
};
