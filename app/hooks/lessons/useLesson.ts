import { lessonService } from "@/app/services/lessonService";
import { Lesson } from "@/app/types/lesson";
import { useApiResource } from "../useApiResource";

export const useLesson = (lessonId: string | null) => {
  const { data, isLoading, isError, error, mutate } = useApiResource<Lesson>(
    lessonId ? `lesson-${lessonId}` : null,
    () => lessonService.getLesson(lessonId!)
  );
  return { lesson: data, isLoading, isError, error, mutate };
};
