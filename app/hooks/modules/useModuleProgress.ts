import { moduleService } from "@/app/services/moduleService";
import { useApiResource } from "../useApiResource";
import { ModuleProgress } from "@/app/types/module";

export const useModuleProgress = (moduleId: string | null) => {
  const { data, isLoading, isError, error, mutate } =
    useApiResource<ModuleProgress>(
      moduleId ? `module-progress-${moduleId}` : null,
      () => moduleService.getModuleProgress(moduleId!)
    );
  return {
    progress: data,
    isLoading,
    isError,
    error,
    mutate,
  };
};
