import api from "../lib/api";
import { Quiz, QuizAttempt, UserAnswer } from "../types";

export async function getQuizById(quizId: string): Promise<Quiz> {
  try {
    const response = await api.get(`/api/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching quiz ${quizId}:`, error);
    throw error;
  }
}

export async function startQuizAttempt(quizId: string): Promise<number> {
  try {
    const response = await api.post(`/api/quizzes/${quizId}/start`);
    return response.data.attemptId;
  } catch (error) {
    console.error(`Error starting quiz attempt for ${quizId}:`, error);
    throw error;
  }
}

export async function submitQuizAnswer(
  attemptId: number,
  answer: UserAnswer
): Promise<boolean> {
  try {
    const response = await api.post(
      `/api/quizzes/attempts/${attemptId}/answer`,
      answer
    );
    return response.data.isCorrect;
  } catch (error) {
    console.error(`Error submitting answer for attempt ${attemptId}:`, error);
    throw error;
  }
}

export async function completeQuizAttempt(
  attemptId: number
): Promise<QuizAttempt> {
  try {
    const response = await api.post(
      `/api/quizzes/attempts/${attemptId}/complete`
    );
    return response.data;
  } catch (error) {
    console.error(`Error completing quiz attempt ${attemptId}:`, error);
    throw error;
  }
}
