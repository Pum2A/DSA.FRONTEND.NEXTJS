export enum QuestionType {
  SingleChoice = "SingleChoice",
  MultipleChoice = "MultipleChoice",
  TrueFalse = "TrueFalse",
  // Można dodać inne typy, np. TextInput, CodeInput
}

export interface QuizListItemDto {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  xpReward: number;
  timeLimit: number; // w sekundach
  questionCount: number;
  isCompleted?: boolean;
  bestScore?: number;
  bestPercentage?: number;
}

export interface QuizOptionDto {
  id: string;
  text: string;
}

export interface QuizQuestionDto {
  id: string;
  questionText: string;
  codeSnippet?: string;
  type: QuestionType;
  options: QuizOptionDto[]; // Dla TrueFalse mogą być tylko dwie opcje, np. {id: 'true', text: 'Prawda'}, {id: 'false', text: 'Fałsz'}
}

export interface QuizAttemptDto {
  id: string; // ID próby
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  xpEarned: number;
  grade: string; // np. "A", "B", "Niezaliczony"
  isPassing: boolean;
  startedAt: string; // string ISO Date
  completedAt: string; // string ISO Date
  duration: string; // np. "PT15M30S" (format ISO 8601 duration) lub w sekundach
}

export interface UserQuizResultsResponse {
  quizId: string;
  quizTitle: string;
  attemptCount: number;
  bestScore?: number;
  bestPercentage?: number;
  firstAttemptDate?: string; // string ISO Date
  lastAttemptDate?: string; // string ISO Date
  attempts: QuizAttemptDto[];
}

export interface QuizDetailsDto {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  xpReward: number;
  timeLimit: number; // w sekundach
  questions: QuizQuestionDto[];
  userResults?: UserQuizResultsResponse; // Historia prób użytkownika dla tego quizu
}

export interface QuizAnswerRequest {
  questionId: string;
  selectedOptionIds: string[]; // Nawet dla SingleChoice, backend może oczekiwać tablicy z jednym elementem
}

export interface SubmitQuizRequest {
  quizId: string;
  startedAt: string; // string ISO Date, kiedy użytkownik rozpoczął quiz
  answers: QuizAnswerRequest[];
}

export interface QuizAnswerResultDto {
  questionId: string;
  questionText: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  explanation?: string; // Wyjaśnienie, dlaczego odpowiedź jest (nie)poprawna
}

export interface QuizResultResponse {
  success: boolean;
  message: string;
  resultId: string; // ID wyniku tego konkretnego podejścia
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  xpEarned: number;
  grade: string;
  answerResults: QuizAnswerResultDto[];
  isPassing: boolean;
  isFirstAttempt: boolean;
  isPersonalBest: boolean;
  startedAt: string; // string ISO Date
  completedAt: string; // string ISO Date
}
