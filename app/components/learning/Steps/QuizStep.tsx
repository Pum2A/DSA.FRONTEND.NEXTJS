"use client";

import { QuizOption, Step } from "@/app/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingButton } from "../../ui/LoadingButton";

interface QuizStepProps {
  step: Step;
  onComplete: (data: {
    isCorrect: boolean;
    answer?: string;
    timeSpent: number;
    attempts: number;
  }) => void;
  isLoading?: boolean;
}

export default function QuizStep({
  step,
  onComplete,
  isLoading,
}: QuizStepProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);

  const quizData = {
    question: step.question || step.quizData?.question || "",
    options: step.options || step.quizData?.options || [],
    correctAnswer: step.correctAnswer || step.quizData?.correctAnswer || "",
    explanation: step.explanation || step.quizData?.explanation || "",
  };

  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setAttempts(0);
  }, [step]);

  const handleCheckAnswer = () => {
    if (!selectedOption || showResult) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const correct =
      selectedOption === String(quizData.correctAnswer) ||
      quizData.options.find(
        (opt: QuizOption) =>
          String(opt.id) === selectedOption && opt.isCorrect === true
      )?.isCorrect === true;

    setIsCorrect(correct);
    setShowResult(true);

    onComplete({
      isCorrect: correct,
      answer: selectedOption,
      timeSpent: Math.floor((Date.now() - startTime) / 1000),
      attempts: newAttempts,
    });
  };

  return (
    <div className="quiz-step space-y-6">
      {step.title && <h2 className="text-2xl font-semibold">{step.title}</h2>}
      <p className="text-lg">{quizData.question}</p>
      <RadioGroup
        value={selectedOption || ""}
        onValueChange={(value) => !showResult && setSelectedOption(value)}
        className="space-y-3"
        disabled={showResult}
      >
        {quizData.options.map((option: QuizOption) => (
          <Label
            key={option.id}
            htmlFor={`quiz-option-${option.id}`}
            className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer"
          >
            <RadioGroupItem
              value={String(option.id)}
              id={`quiz-option-${option.id}`}
              disabled={showResult}
            />
            <span className="flex-1 text-sm">{option.text}</span>
            {showResult &&
              (String(option.id) === String(quizData.correctAnswer) ||
              option.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : selectedOption === String(option.id) ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : null)}
          </Label>
        ))}
      </RadioGroup>
      {showResult && (
        <Alert variant={isCorrect ? "default" : "destructive"}>
          {isCorrect ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {isCorrect ? "Poprawna odpowiedź!" : "Niepoprawna odpowiedź."}
          </AlertTitle>
          <AlertDescription>{quizData.explanation}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-end pt-4">
        {!showResult && (
          <LoadingButton
            onClick={handleCheckAnswer}
            disabled={!selectedOption || isLoading}
            isLoading={isLoading}
            variant={selectedOption ? "default" : "secondary"}
            size="lg"
          >
            Sprawdź odpowiedź
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
