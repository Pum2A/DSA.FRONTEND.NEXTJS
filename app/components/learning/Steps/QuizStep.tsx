"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label"; // Shadcn Label
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Shadcn RadioGroup
import { cn } from "@/lib/utils"; // Utility do łączenia klas
import { AlertCircle, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingButton } from "../../ui/LoadingButton";
import {
  StepDto,
  StepCompletionResult,
  StepCompletionData,
} from "@/app/types/lesson";

// Typ danych quizu (bez zmian)
interface QuizData {
  question: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
}

// Zaktualizowane propsy - teraz obsługujemy StepCompletionResult
interface QuizStepProps {
  step: StepDto;
  onComplete: (result: StepCompletionResult) => void; // Zaktualizowane do nowego typu
  isLoading?: boolean;
}

export default function QuizStep({
  step,
  onComplete,
  isLoading = false,
}: QuizStepProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);

  // Timer dla śledzenia czasu spędzonego na kroku
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    };
  }, []);

  // Logika parsowania danych
  useEffect(() => {
    let data: QuizData | null = null;

    // Spróbuj użyć nowej struktury z quizData
    if (step.quizData) {
      data = step.quizData;
    }
    // Fallback do starszych pól
    else if (step.question && step.options) {
      data = {
        question: step.question,
        options: step.options,
        correctAnswer: step.correctAnswer || "",
        explanation: step.explanation || "",
      };
    }
    // Ostatni fallback do additionalData
    else if (step.additionalData) {
      try {
        data =
          typeof step.additionalData === "string"
            ? JSON.parse(step.additionalData)
            : (step.additionalData as QuizData);
      } catch (error) {
        console.error("Error parsing quiz data:", error, step.additionalData);
      }
    }

    if (data && data.question && Array.isArray(data.options)) {
      setQuizData(data);
    } else {
      console.error("Invalid or missing quiz data for step:", step);
      setQuizData(null);
    }

    // Resetuj stan przy zmianie kroku
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setProcessing(false);
  }, [step]);

  // Obsługa sprawdzenia odpowiedzi
  const handleCheckAnswer = () => {
    if (!selectedOption || !quizData || showResult) return;

    setProcessing(true);
    setAttempts((prev) => prev + 1);

    const correct = selectedOption === quizData.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    setProcessing(false);

    // Tworzymy dane o ukończeniu kroku zgodne z typem StepCompletionData
    const completionData: StepCompletionData = {
      answer: selectedOption,
      isCorrect: correct,
      timeSpent,
      attempts,
      completionStatus: correct,
    };

    // Tworzymy wynik ukończenia kroku zgodny z typem StepCompletionResult
    const completionResult: StepCompletionResult = {
      success: correct,
      error: correct ? "" : "Nieprawidłowa odpowiedź",
      xpEarned: correct ? Math.max(10, 20 - (attempts - 1) * 5) : 0, // Większa nagroda za pierwszą próbę
      nextStepIndex: undefined,
      isLessonCompleted: false,
    };

    // Wywołaj onComplete z wynikiem
    onComplete(completionResult);
  };

  // Lepszy stan ładowania/błędu danych quizu
  if (!quizData && !step.title) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Ładowanie pytania...
      </div>
    );
  }
  if (!quizData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Błąd Danych Quizu</AlertTitle>
        <AlertDescription>
          Nie można załadować pytania dla tego kroku.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="quiz-step space-y-6">
      {/* Tytuł kroku, jeśli istnieje */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
        </h2>
      )}

      {/* Pytanie */}
      <p className="text-lg text-gray-800 dark:text-gray-200">
        {quizData.question}
      </p>

      {/* Opcje odpowiedzi (RadioGroup) */}
      <RadioGroup
        value={selectedOption || ""}
        onValueChange={(value) => !showResult && setSelectedOption(value)} // Zablokuj zmianę po odpowiedzi
        className="space-y-3"
        disabled={showResult} // Zablokuj całą grupę po odpowiedzi
      >
        {quizData.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrectAnswer = option.id === quizData.correctAnswer;

          return (
            <Label
              key={option.id}
              htmlFor={`quiz-option-${option.id}`}
              className={cn(
                "flex items-center space-x-3 rounded-md border p-4 transition-all cursor-pointer",
                showResult && isCorrectAnswer
                  ? "border-green-400 bg-green-50 dark:bg-green-900/30 dark:border-green-700"
                  : showResult && isSelected && !isCorrectAnswer
                  ? "border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-700"
                  : isSelected
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                showResult ? "cursor-default" : "cursor-pointer"
              )}
            >
              <RadioGroupItem
                value={option.id}
                id={`quiz-option-${option.id}`}
                disabled={showResult}
              />
              <span
                className={cn(
                  "flex-1 text-sm",
                  showResult && isCorrectAnswer
                    ? "text-green-800 dark:text-green-200 font-medium"
                    : showResult && isSelected && !isCorrectAnswer
                    ? "text-red-800 dark:text-red-200"
                    : "text-gray-800 dark:text-gray-200"
                )}
              >
                {option.text}
              </span>
              {/* Ikony feedbacku po odpowiedzi */}
              {showResult && isCorrectAnswer && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {showResult && isSelected && !isCorrectAnswer && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </Label>
          );
        })}
      </RadioGroup>

      {/* Wynik i Wyjaśnienie */}
      {showResult && (
        <Alert
          variant={isCorrect ? "default" : "destructive"}
          className={cn(
            isCorrect
              ? "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800"
          )}
        >
          {isCorrect ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle
            className={cn(
              isCorrect
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            )}
          >
            {isCorrect ? "Poprawna odpowiedź!" : "Niepoprawna odpowiedź."}
          </AlertTitle>
          <AlertDescription
            className={cn(
              "mt-1 text-sm",
              isCorrect
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            )}
          >
            {quizData.explanation}
          </AlertDescription>
        </Alert>
      )}

      {/* Przycisk Akcji */}
      <div className="flex justify-end pt-4">
        {!showResult && (
          <LoadingButton
            onClick={handleCheckAnswer}
            disabled={!selectedOption || processing}
            isLoading={processing || isLoading}
            variant={selectedOption ? "default" : "secondary"}
            size="lg"
          >
            Sprawdź odpowiedź
          </LoadingButton>
        )}

        {/* Możliwość ponownej próby, jeśli odpowiedź jest niepoprawna */}
        {showResult && !isCorrect && (
          <LoadingButton
            onClick={() => {
              setShowResult(false);
              setSelectedOption(null);
            }}
            variant="secondary"
            size="lg"
          >
            Spróbuj ponownie
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
