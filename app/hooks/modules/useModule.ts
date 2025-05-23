import { moduleService } from "@/app/services/moduleService";
import { useApiResource } from "../useApiResource";
import Module from "module";

export const useModule = (moduleId: string | null) => {
  const { data, isLoading, isError, error, mutate } = useApiResource<Module>(
    moduleId ? `module-${moduleId}` : null,
    () => moduleService.getModuleById(moduleId!)
  );
  return {
    module: data,
    isLoading,
    isError,
    error,
    mutate,
  };
};
