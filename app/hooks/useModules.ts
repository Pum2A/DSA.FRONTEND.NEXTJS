import useSWR from "swr";

import { getAllModules, getModuleProgress } from "../services/moduleService";
import { Module, ModuleProgress } from "../types";

export function useAllModules() {
  const { data, error, isLoading, mutate } = useSWR<Module[], Error>(
    "modules",
    getAllModules
  );

  return {
    modules: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useModule(moduleId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Module, Error>(
    moduleId ? `module-${moduleId}` : null,
    moduleId ? async () => await getModuleById(moduleId) : null
  );

  return {
    module: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useModuleProgress(moduleId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ModuleProgress, Error>(
    moduleId ? `module-progress-${moduleId}` : null,
    async () => {
      if (!moduleId) throw new Error("Module ID is required");
      return await getModuleProgress(moduleId);
    }
  );

  return {
    progress: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
import { getModuleById as fetchModuleById } from "../services/moduleService";

function getModuleById(moduleId: string): Promise<Module> {
  return fetchModuleById(moduleId);
}
