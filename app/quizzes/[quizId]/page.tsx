"use client";

import Navbar from "@/app/components/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"; // Poprawny import
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type QuizOption = {
  id: string;
  text: string;
};

type QuizQuestion = {
  id: string;
  questionText: string;
  codeSnippet?: string | null;
  questionType: "SingleChoice" | "MultipleChoice" | "TrueFalse";
  options: QuizOption[];
};

type QuizDetailDto = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  timeLimit: number; // in seconds
  xpReward: number;
  isActive: boolean;
  isCompleted: boolean;
  questions: QuizQuestion[];
};

type QuizAnswer = {
  questionId: string;
  selectedOptionIds: string[];
};

type QuizSubmitRequest = {
  answers: QuizAnswer[];
  startedAt: string; // ISO date string
};

type QuizAnswerResult = {
  questionId: string;
  questionText: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  explanation?: string | null;
};

type QuizResultResponse = {
  success: boolean;
  message: string;
  resultId?: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  scorePercentage?: number;
  xpEarned?: number;
  grade?: string;
  answerResults?: QuizAnswerResult[];
  isPassing?: boolean;
  isFirstAttempt?: boolean;
  isPersonalBest?: boolean;
  startedAt?: string;
  completedAt?: string;
};

export default function QuizPage() {
  const { quizId } = useParams() as { quizId: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Stan quizu
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [startTime] = useState<Date>(new Date());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResultResponse | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);

  // Pobierz szczegóły quizu
  const { data: quiz, isLoading } = useQuery<QuizDetailDto>({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const res = await fetch(`/api/Quiz/${quizId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch quiz");
      return res.json();
    },
  });

  // Timer quizu
  useEffect(() => {
    if (!quiz) return;

    // Oblicz czas w milisekundach - sprawdź jednostkę z API
    // Jeśli timeLimit to minuty, pomnóż przez 60 * 1000
    // Jeśli to sekundy, pomnóż przez 1000
    const timeLimit = quiz.timeLimit * 60 * 1000; // zakładam, że timeLimit to minuty

    const endTime = new Date(startTime.getTime() + timeLimit);

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = endTime.getTime() - now.getTime();

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setTimeExpired(true);
        toast({
          title: "Czas minął!",
          description: "Twój czas na rozwiązanie quizu upłynął.",
          variant: "destructive",
        });
        // Auto-submit after 3 seconds
        setTimeout(() => {
          submitQuiz();
        }, 3000);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz, startTime, toast]);

  // Wybierz odpowiedź
  const selectAnswer = (
    questionId: string,
    optionId: string,
    isMultipleChoice: boolean
  ) => {
    if (submitting || quizResult || timeExpired) return;

    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      const currentSelected = newAnswers.get(questionId) || [];

      if (isMultipleChoice) {
        // Multiple choice - toggle selection
        if (currentSelected.includes(optionId)) {
          newAnswers.set(
            questionId,
            currentSelected.filter((id) => id !== optionId)
          );
        } else {
          newAnswers.set(questionId, [...currentSelected, optionId]);
        }
      } else {
        // Single choice - replace selection
        newAnswers.set(questionId, [optionId]);
      }

      return newAnswers;
    });
  };

  // Przejdź do poprzedniego pytania
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Przejdź do następnego pytania
  const nextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Sprawdź czy wszystkie pytania mają odpowiedzi
  const allQuestionsAnswered = () => {
    if (!quiz) return false;
    return quiz.questions.every((q) => (answers.get(q.id) || []).length > 0);
  };

  // Wyślij odpowiedzi quizu
  const submitQuiz = async () => {
    if (!quiz || submitting) return;

    // Verify all questions are answered unless time expired
    if (!timeExpired) {
      const unansweredQuestions = quiz.questions.filter(
        (q) => !(answers.get(q.id) || []).length
      );
      if (unansweredQuestions.length > 0) {
        toast({
          title: "Nie wszystkie pytania zostały wypełnione",
          description: `Pozostało ${unansweredQuestions.length} pytań bez odpowiedzi.`,
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);

    try {
      // Tworzenie payloadu dokładnie zgodnego z dokumentacją Swagger
      const payload = {
        startedAt: startTime.toISOString(), // Format ISO string
        answers: quiz.questions.map((q) => ({
          questionId: q.id, // GUID pytania
          selectedOptionIds: answers.get(q.id) || [], // Tablica wybranych GUIDów opcji
        })),
      };

      console.log("Wysyłany payload:", payload);

      const res = await fetch(`/api/Quiz/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      // Obsługa błędów i odpowiedzi
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Odpowiedź serwera (błąd):", errorText);
        throw new Error(`Błąd serwera: ${res.status} ${errorText}`);
      }

      // Parsowanie odpowiedzi
      const result = await res.json();
      console.log("Odpowiedź serwera (sukces):", result);
      setQuizResult(result);

      // Odświeżenie danych w aplikacji
      await queryClient.invalidateQueries({
        queryKey: ["module", quiz.moduleId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["moduleQuizzes", quiz.moduleId],
      });
      await queryClient.invalidateQueries({ queryKey: ["allModules"] });

      toast({
        title: "Quiz ukończony!",
        description: `Twój wynik: ${result.scorePercentage}%. Zdobyłeś ${result.xpEarned} XP!`,
      });
    } catch (error) {
      console.error("Błąd podczas przesyłania quizu:", error);
      toast({
        title: "Błąd",
        description:
          error instanceof Error
            ? error.message
            : "Nie udało się przesłać odpowiedzi",
        variant: "destructive",
      });

      // Opcjonalnie - dodaj obsługę sytuacji awaryjnej
      if (
        error instanceof Error &&
        error.message.includes("Błąd serwera: 400")
      ) {
        toast({
          title: "Błąd walidacji",
          description:
            "Serwer odrzucił przesłane odpowiedzi. Sprawdź czy wszystkie pytania mają odpowiedzi.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };
  // Wyświetl loader podczas ładowania
  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
            <span className="ml-2 text-xl">Ładowanie quizu...</span>
          </div>
        </div>
      </div>
    );
  }

  // Wyświetl błąd, jeśli nie znaleziono quizu
  if (!quiz) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4 text-center">
          <h2 className="text-2xl font-medium">Quiz nie został znaleziony</h2>
          <Button className="mt-4" asChild>
            <Link href="/quizzes">Wróć do quizów</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Format czasu pozostałego
  const formatTime = (ms: number | null) => {
    if (ms === null) return "--:--";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Jeśli wyświetlamy wyniki
  if (quizResult) {
    const isPassing = quizResult.isPassing ?? false;
    const scorePercentage = quizResult.scorePercentage ?? 0;
    const score = quizResult.score ?? 0;
    const totalQuestions = quizResult.totalQuestions ?? 0;
    const answerResults = quizResult.answerResults || [];

    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/quizzes">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Wróć do quizów
            </Link>
          </Button>

          <Card className="mb-8">
            <CardHeader
              className={`${
                isPassing
                  ? "bg-green-50 dark:bg-green-900/10"
                  : "bg-red-50 dark:bg-red-900/10"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{quiz.title} - Wyniki</CardTitle>
                  <CardDescription>
                    Quiz ukończony{" "}
                    {new Date(
                      quizResult.completedAt || Date.now()
                    ).toLocaleString()}
                  </CardDescription>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isPassing
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {scorePercentage}%
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6">
                <Progress
                  value={scorePercentage}
                  className={`h-3 ${isPassing ? "bg-green-100" : "bg-red-100"}`}
                />
                <div className="flex justify-between mt-2">
                  <span>
                    Poprawne odpowiedzi: {score}/{totalQuestions}
                  </span>
                  <span>Ocena: {quizResult.grade}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-muted rounded-md">
                  <span>Zdobyte XP:</span>
                  <span className="font-semibold">
                    {quizResult.xpEarned} XP
                  </span>
                </div>

                {quizResult.isFirstAttempt && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-200 rounded-md">
                    To było Twoje pierwsze podejście do tego quizu!
                  </div>
                )}

                {quizResult.isPersonalBest && !quizResult.isFirstAttempt && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-200 rounded-md">
                    Gratulacje! To jest Twój najlepszy wynik!
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/results">Zobacz wszystkie wyniki</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href={`/modules/${quiz.moduleId}`}>Wróć do modułu</Link>
              </Button>
            </CardFooter>
          </Card>

          <h2 className="text-xl font-semibold mb-4">Szczegóły odpowiedzi</h2>
          <div className="space-y-4">
            {answerResults.map((result, idx) => (
              <Card
                key={result.questionId}
                className={`${
                  result.isCorrect ? "border-green-300" : "border-red-300"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {result.isCorrect ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <CardTitle className="text-base">
                      Pytanie {idx + 1}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-3">{result.questionText}</p>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-semibold">Twoja odpowiedź:</span>{" "}
                      {quiz.questions
                        .find((q) => q.id === result.questionId)
                        ?.options.filter((o) =>
                          result.selectedOptionIds.includes(o.id)
                        )
                        .map((o) => o.text)
                        .join(", ") || "Brak odpowiedzi"}
                    </p>
                    <p>
                      <span className="font-semibold">Poprawna odpowiedź:</span>{" "}
                      {quiz.questions
                        .find((q) => q.id === result.questionId)
                        ?.options.filter((o) =>
                          result.correctOptionIds.includes(o.id)
                        )
                        .map((o) => o.text)
                        .join(", ")}
                    </p>
                  </div>
                  {result.explanation && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <p className="font-medium">Wyjaśnienie:</p>
                      <p>{result.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pobranie aktualnego pytania
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const questionProgress =
    ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const currentAnswers = answers.get(currentQuestion.id) || [];
  const isMultipleChoice = currentQuestion.questionType === "MultipleChoice";

  // Renderowanie strony z pytaniem
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div
            className={`flex items-center px-3 py-1 rounded ${
              timeLeft && timeLeft < 60000
                ? "bg-red-100 text-red-800"
                : "bg-muted"
            }`}
          >
            <Clock className="h-4 w-4 mr-2" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {timeExpired && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Czas minął!</AlertTitle>
            <AlertDescription>
              Twój czas na rozwiązanie tego quizu upłynął. Twoje odpowiedzi
              zostaną przesłane automatycznie.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>
              Pytanie {currentQuestionIndex + 1} z {quiz.questions.length}
            </span>
            <span>{Math.round(questionProgress)}%</span>
          </div>
          <Progress value={questionProgress} className="h-2" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{currentQuestion.questionText}</CardTitle>
            {currentQuestion.questionType === "MultipleChoice" && (
              <CardDescription>
                Wybierz wszystkie poprawne odpowiedzi
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {currentQuestion.codeSnippet && (
              <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md mb-4 overflow-x-auto text-sm">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            )}

            {/* Opcje odpowiedzi */}
            {currentQuestion.questionType === "MultipleChoice" ? (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={currentAnswers.includes(option.id)}
                      onCheckedChange={() =>
                        selectAnswer(currentQuestion.id, option.id, true)
                      }
                      disabled={submitting || timeExpired}
                    />
                    <Label htmlFor={option.id}>{option.text}</Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={currentAnswers[0] || ""}
                onValueChange={(value) =>
                  selectAnswer(currentQuestion.id, value, false)
                }
                className="space-y-2"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      disabled={submitting || timeExpired}
                    />
                    <Label htmlFor={option.id}>{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0 || submitting || timeExpired}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Poprzednie
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={submitQuiz}
              disabled={submitting || timeExpired}
              className="min-w-[120px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                "Zakończ quiz"
              )}
            </Button>
          ) : (
            <Button onClick={nextQuestion} disabled={submitting || timeExpired}>
              Następne <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>

        {isLastQuestion && !submitting && !timeExpired && (
          <div className="mt-4 p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 rounded-md text-sm">
            <p>
              Upewnij się, że odpowiedziałeś na wszystkie pytania przed
              zakończeniem quizu.
            </p>
            <p className="mt-1">
              <span className="font-semibold">Wskazówka:</span> Możesz wracać do
              poprzednich pytań aby sprawdzić lub zmienić odpowiedzi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
