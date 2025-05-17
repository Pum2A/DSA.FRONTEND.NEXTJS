import { Lesson } from "@/app/types";
import { useApiResource } from "../useApiResource";
import { lessonService } from "@/app/services/lessonService";

export const useLesson = (lessonId: string | null) => {
  const { data, isLoading, isError, error, mutate } = useApiResource<Lesson>(
    lessonId ? `lesson-${lessonId}` : null,
    () => lessonService.getLesson(lessonId!)
  );
  return { lesson: data, isLoading, isError, error, mutate };
};
