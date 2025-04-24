import { Step } from "@/app/types";
import { useState, useEffect } from "react";
import { LoadingButton } from "../../ui/LoadingButton";

interface InteractiveStepProps {
  step: Step;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function InteractiveStep({
  step,
  onComplete,
  isLoading = false,
}: InteractiveStepProps) {
  const [userCode, setUserCode] = useState(step.initialCode || "");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Resetuj kod użytkownika, jeśli zmienia się krok
  useEffect(() => {
    setUserCode(step.initialCode || "");
    setResult(null);
  }, [step]);

  const runCode = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      // Symulacja wykonania kodu
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Podstawowa weryfikacja (prosta)
      const expectedOutput = step.expectedOutput || "";
      const success = userCode.includes(expectedOutput);

      setResult({
        success,
        message: success
          ? "Gratulacje! Twój kod działa poprawnie."
          : "Twój kod nie spełnia oczekiwanych wymagań. Spróbuj ponownie.",
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Wystąpił błąd podczas uruchamiania kodu.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="interactive-step">
      <h2 className="text-xl font-semibold mb-4">{step.title}</h2>

      {step.content && (
        <div className="prose max-w-none mb-6">
          <p>{step.content}</p>
        </div>
      )}

      <div className="mb-6">
        <textarea
          rows={10}
          className="w-full p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          placeholder="Wpisz swój kod tutaj..."
        />
      </div>

      {step.hint && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Wskazówka:</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>{step.hint}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div
          className={`p-4 rounded-md mb-6 ${
            result.success ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <p className={result.success ? "text-green-800" : "text-red-800"}>
            {result.message}
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <LoadingButton
          onClick={runCode}
          isLoading={isRunning}
          disabled={userCode.trim() === ""}
          variant="secondary"
        >
          Uruchom kod
        </LoadingButton>

        <LoadingButton
          onClick={onComplete}
          disabled={!result?.success}
          isLoading={isLoading}
          variant={result?.success ? "default" : "secondary"}
        >
          Kontynuuj
        </LoadingButton>
      </div>

      {step.solution && (
        <div className="mt-6">
          <details>
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              Pokaż rozwiązanie
            </summary>
            <div className="mt-2 p-4 bg-gray-100 rounded-md font-mono text-sm whitespace-pre-wrap">
              {step.solution}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
