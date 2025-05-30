export interface QuizListItemDto {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  xpReward: number;
  timeLimit: number;
  questionCount: number;
  isCompleted?: boolean;
  bestScore?: number;
  bestPercentage?: number;
}

export interface QuizDetailsDto {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  xpReward: number;
  timeLimit: number;
  questions: QuizQuestionDto[];
  userResults?: UserQuizResultsResponse;
}

export interface QuizQuestionDto {
  id: string;
  questionText: string;
  codeSnippet?: string;
  type: QuestionType;
  options: QuizOptionDto[];
}

export enum QuestionType {
  SingleChoice = 'SingleChoice',
  MultipleChoice = 'MultipleChoice',
  TrueFalse = 'TrueFalse'
}

export interface QuizOptionDto {
  id: string;
  text: string;
}

export interface QuizAnswerRequest {
  questionId: string;
  selectedOptionIds: string[];
}

export interface SubmitQuizRequest {
  quizId: string;
  startedAt: string;
  answers: QuizAnswerRequest[];
}

export interface QuizAnswerResultDto {
  questionId: string;
  questionText: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizResultResponse {
  success: boolean;
  message: string;
  resultId: string;
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
  startedAt: string;
  completedAt: string;
}

export interface QuizAttemptDto {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  xpEarned: number;
  grade: string;
  isPassing: boolean;
  startedAt: string;
  completedAt: string;
  duration: string;
}

export interface UserQuizResultsResponse {
  quizId: string;
  quizTitle: string;
  attemptCount: number;
  bestScore?: number;
  bestPercentage?: number;
  firstAttemptDate?: string;
  lastAttemptDate?: string;
  attempts: QuizAttemptDto[];
}