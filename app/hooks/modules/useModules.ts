import { moduleService } from "@/app/services/moduleService";
import { Module } from "@/app/types/module";
import { useApiResource } from "../useApiResource";

export const useModules = () => {
  const { data, isLoading, isError, error, mutate } = useApiResource<Module[]>(
    "modules",
    () => moduleService.getAllModules()
  );
  return {
    modules: data || [],
    isLoading,
    isError,
    error,
    mutate,
  };
};
