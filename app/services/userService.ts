import api from "../lib/api";
import { UserStats } from "../types";

export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await api.get("/api/user/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
}

export async function getLeaderboard(limit: number = 10): Promise<any[]> {
  try {
    const response = await api.get(`/api/leaderboard?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
}
