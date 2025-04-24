import api from "../lib/api";
import { Lesson, Step, UserProgress } from "../types";

export async function getLessonById(lessonId: string): Promise<Lesson> {
  try {
    const response = await api.get(`/api/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lesson ${lessonId}:`, error);
    throw error;
  }
}

export async function getLessonProgress(
  lessonId: string
): Promise<UserProgress> {
  try {
    const response = await api.get(`/api/lessons/${lessonId}/progress`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lesson progress for ${lessonId}:`, error);

    // W przypadku 404 (brak postępu), zwróć domyślny obiekt zamiast błędu
    // Check if the error object has response and status properties
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      error.response.status === 404
    ) {
      return {
        id: 0,
        userId: "",
        lessonId: Number(lessonId),
        isCompleted: false,
        startedAt: new Date().toISOString(),
        currentStepIndex: 0,
        xpEarned: 0,
      };
    }

    throw error;
  }
}

export async function completeStep(
  lessonId: string,
  stepIndex: number
): Promise<void> {
  try {
    await api.post(`/api/lessons/${lessonId}/step/${stepIndex}/complete`);
  } catch (error) {
    console.error(
      `Error completing step ${stepIndex} for lesson ${lessonId}:`,
      error
    );
    throw error;
  }
}

export async function completeLesson(lessonId: string): Promise<void> {
  try {
    await api.post(`/api/lessons/${lessonId}/complete`);
  } catch (error) {
    console.error(`Error completing lesson ${lessonId}:`, error);
    throw error;
  }
}

export async function getLessonSteps(lessonId: string): Promise<Step[]> {
  const response = await fetch(`/api/lessons/${lessonId}/steps`);

  if (!response.ok) {
    throw new Error(`Error fetching lesson steps: ${response.statusText}`);
  }

  const steps: Step[] = await response.json();
  console.log("Loaded steps data:", steps); // Dla debugowania

  // Przetwarzaj kroki typu quiz
  return steps.map((step) => {
    if (step.type === "quiz" && step.additionalData) {
      try {
        // Jeśli additionalData jest stringiem, sparsuj go
        const quizData =
          typeof step.additionalData === "string"
            ? JSON.parse(step.additionalData)
            : step.additionalData;

        // Połącz dane z additionalData z głównym obiektem
        return {
          ...step,
          question: quizData.question || step.question,
          options: quizData.options || step.options,
          correctAnswer: quizData.correctAnswer || step.correctAnswer,
          explanation: quizData.explanation || step.explanation,
        };
      } catch (error) {
        console.error(`Error parsing quiz data for step ${step.id}:`, error);
        return step;
      }
    }
    return step;
  });
}
