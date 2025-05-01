import useSWR from "swr";
import { moduleService } from "../services/moduleService";
import { Module, ModuleProgress } from "../types";

export const useModules = () => {
  const { data, error, isLoading, mutate } = useSWR<Module[]>(
    "modules",
    moduleService.getAllModules
  );

  return {
    modules: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
};

export const useModule = (moduleId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<Module>(
    moduleId ? `module-${moduleId}` : null,
    () => moduleService.getModuleById(moduleId!)
  );

  return {
    module: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
};

export const useModuleProgress = (moduleId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<ModuleProgress>(
    moduleId ? `module-progress-${moduleId}` : null,
    () => moduleService.getModuleProgress(moduleId!)
  );

  return {
    progress: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
};
