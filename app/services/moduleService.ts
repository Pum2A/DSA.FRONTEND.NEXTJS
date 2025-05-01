import { apiService } from "../lib/api";
import { Module, ModuleProgress } from "../types";

export const moduleService = {
  getAllModules: (): Promise<Module[]> => {
    return apiService.get("/lessons/modules");
  },

  getModuleById: (moduleId: string): Promise<Module> => {
    return apiService.get(`/lessons/modules/${moduleId}`);
  },

  getModuleProgress: (moduleId: string): Promise<ModuleProgress> => {
    return apiService.get(`/lessons/modules/${moduleId}/progress`);
  },
};
