import { Module } from "@/app/types";
import { useApiResource } from "../useApiResource";
import { moduleService } from "@/app/services/moduleService";

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
