import { useState, useEffect } from "react";
import { LoadingButton } from "../../ui/LoadingButton";
import { Step } from "@/app/types";

interface QuizData {
  question: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
}

interface QuizStepProps {
  step: Step;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function QuizStep({
  step,
  onComplete,
  isLoading = false,
}: QuizStepProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // Parse additionalData when component mounts
  useEffect(() => {
    console.log("Step data:", step);

    // Najpierw sprawdzamy czy dane są bezpośrednio w obiekcie step
    if (step.question && step.options) {
      setQuizData({
        question: step.question,
        options: step.options,
        correctAnswer: step.correctAnswer || "",
        explanation: step.explanation || "",
      });
    }
    // Jeśli nie, próbujemy je wydobyć z additionalData
    else if (step.additionalData) {
      try {
        // Jeśli additionalData jest stringiem, spróbuj sparsować
        if (typeof step.additionalData === "string") {
          const parsedData = JSON.parse(step.additionalData);
          setQuizData(parsedData);
        } else {
          // Jeśli już jest obiektem, użyj bezpośrednio
          setQuizData(step.additionalData as unknown as QuizData);
        }
      } catch (error) {
        console.error("Error parsing quiz data:", error, step.additionalData);
      }
    }
    // Jeśli nie ma danych quizu, ustawmy tymczasowe dane testowe
    else {
      console.warn("No quiz data found - using test data");
      setQuizData({
        question:
          "Jaka jest złożoność czasowa dostępu do elementu tablicy po indeksie?",
        options: [
          { id: "1", text: "O(1) - stały czas" },
          { id: "2", text: "O(log n) - logarytmiczny czas" },
          { id: "3", text: "O(n) - liniowy czas" },
        ],
        correctAnswer: "1",
        explanation:
          "Dostęp do elementu tablicy po indeksie ma złożoność O(1), ponieważ adres elementu można obliczyć bezpośrednio na podstawie adresu bazowego i indeksu.",
      });
    }
  }, [step]);

  const handleAnswer = () => {
    if (!selectedOption || !quizData) return;

    const correctAnswer = quizData.correctAnswer || "";
    const correct = selectedOption === correctAnswer;

    setIsCorrect(correct);
    setAnswered(true);
  };

  const continueAfterAnswer = () => {
    onComplete();
  };

  // Pokaż ładowanie, jeśli dane quizu nie są jeszcze dostępne
  if (!quizData) {
    return <div>Ładowanie pytania...</div>;
  }

  return (
    <div className="quiz-step">
      <h2 className="text-xl font-semibold mb-4">{step.title}</h2>

      <div className="prose max-w-none mb-6">
        <p>{quizData.question}</p>
      </div>

      <div className="space-y-3 mb-6">
        {quizData.options?.map((option) => (
          <div
            key={option.id}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedOption === option.id && !answered
                ? "border-blue-500 bg-blue-50"
                : answered && option.id === quizData.correctAnswer
                ? "border-green-500 bg-green-50"
                : answered &&
                  selectedOption === option.id &&
                  option.id !== quizData.correctAnswer
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => !answered && setSelectedOption(option.id)}
          >
            {option.text}
          </div>
        ))}
      </div>

      {answered && (
        <div
          className={`p-4 mb-6 rounded-md ${
            isCorrect ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <p className="font-medium">
            {isCorrect ? "Poprawna odpowiedź!" : "Niepoprawna odpowiedź."}
          </p>
          <p className="mt-2">{quizData.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        {!answered ? (
          <LoadingButton
            onClick={handleAnswer}
            disabled={!selectedOption}
            isLoading={isLoading}
            variant={selectedOption ? "default" : "secondary"}
          >
            Sprawdź odpowiedź
          </LoadingButton>
        ) : (
          <LoadingButton onClick={continueAfterAnswer} isLoading={isLoading}>
            Kontynuuj
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
