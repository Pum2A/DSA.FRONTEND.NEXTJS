import { Module } from "@/app/types";
import { useApiResource } from "../useApiResource";
import { moduleService } from "@/app/services/moduleService";

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
