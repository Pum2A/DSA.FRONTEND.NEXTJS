import { apiService } from "../lib/api";
import { UserStats } from "../types";

export const userService = {
  // Fetch user stats
  getStats: (): Promise<UserStats> => {
    return apiService.get("/user/stats");
  },

  // Fetch user progress
  getProgress: (): Promise<any> => {
    return apiService.get("/user/progress");
  },

  // Fetch user streak
  getStreak: (): Promise<any> => {
    return apiService.get("/userActivity/streak");
  },

  // Fetch user activity history
  getActivityHistory: (): Promise<any[]> => {
    return apiService.get("/userActivity/history");
  },
};
