import { ModuleProgressDto } from "./moduleTypes"; // Importujemy z moduleTypes

// Ten plik może zawierać typy związane z ogólnym postępem użytkownika,
// jeśli nie pasują one bezpośrednio do UserDto, ModuleDto, LessonDto, QuizDto.

// UserProgressResponse jest już zdefiniowany w Twoich typach,
// i logicznie pasuje tutaj, jeśli odnosi się do ogólnego postępu.
// W Twoim oryginalnym listingu, UserProgressResponse i ModuleProgressDto
// były podane razem. Umieszczam UserProgressResponse tutaj,
// a ModuleProgressDto w moduleTypes.ts, ponieważ jest bliżej związany z modułem.

export interface UserProgressResponse {
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  overallProgressPercentage: number; // (0-100)
  moduleProgresses: ModuleProgressDto[]; // Lista postępów dla poszczególnych modułów
}
