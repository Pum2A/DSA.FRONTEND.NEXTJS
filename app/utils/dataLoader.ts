// Najprostsze rozwiązanie - bezpośredni import pliku JSON
import dataJson from "../data/data.json";

// Interfejsy TypeScript
export interface Step {
  type:
    | "text"
    | "image"
    | "code"
    | "quiz"
    | "interactive"
    | "challenge"
    | "list";
  title: string;
  [key: string]: any;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  xpReward: number;
  steps: Step[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  iconColor: string;
  lessons: Lesson[];
}

export interface Curriculum {
  modules: Module[];
}

// Rzutowanie importowanych danych na typ Curriculum
const data = dataJson as Curriculum;

export function getCurriculum(): Curriculum {
  return data;
}

export function getModule(moduleId: string): Module | null {
  return data.modules.find((m) => m.id === moduleId) || null;
}

export function getLesson(lessonId: string): Lesson | null {
  for (const module of data.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

export function getUserProgress() {
  // To byłoby pobierane z bazy danych użytkownika
  // Na potrzeby demo, zwracamy statyczne dane
  return {
    completedLessons: ["lesson_intro"],
    currentLesson: "lesson_arrays",
    xp: 30,
    level: 1,
  };
}
