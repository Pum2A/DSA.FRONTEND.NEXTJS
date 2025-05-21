import { apiService } from "../lib/api";
import { RecentActivity, UserLearningStats } from "../types";

export const userService = {
  // Fetch user stats
  getStats: (): Promise<UserLearningStats> => {
    return apiService.user.getStats();
  },

  // Fetch user progress
  getProgress: (): Promise<any> => {
    return apiService.user.getProgress();
  },

  // Fetch user streak
  getStreak: (): Promise<any> => {
    return apiService.user.getStreak();
  },

  // Fetch user activity history
  getActivityHistory: (): Promise<RecentActivity[]> => {
    return apiService.user.getActivityHistory() as Promise<RecentActivity[]>;
  },
};
