import api from "../lib/api";
import { Module, ModuleProgress } from "../types";

export async function getAllModules(): Promise<Module[]> {
  try {
    const response = await api.get("/api/lessons/modules");
    return response.data;
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
}

export async function getModuleById(moduleId: string): Promise<Module> {
  try {
    const response = await api.get(`/api/lessons/modules/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching module ${moduleId}:`, error);
    throw error;
  }
}

export async function getModuleProgress(
  moduleId: string
): Promise<ModuleProgress> {
  try {
    const response = await api.get(`/api/lessons/modules/${moduleId}/progress`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching module progress for ${moduleId}:`, error);
    throw error;
  }
}
