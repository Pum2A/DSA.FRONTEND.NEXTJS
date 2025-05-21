import { apiService } from "../lib/api";
import { Module, ModuleProgress } from "../types";

export const moduleService = {
  getAllModules: (): Promise<Module[]> => {
    return apiService.lessons.getAllModules();
  },

  getModuleById: (moduleId: string): Promise<Module> => {
    return apiService.lessons.getModule(moduleId);
  },

  getModuleProgress: (moduleId: string): Promise<ModuleProgress> => {
    return apiService.lessons.getModuleProgress(moduleId);
  },
};
