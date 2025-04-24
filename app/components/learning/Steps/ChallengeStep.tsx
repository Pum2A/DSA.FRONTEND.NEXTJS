import { useState } from "react";
import { LoadingButton } from "../../ui/LoadingButton";
import { Step } from "@/app/types";

interface ChallengeStepProps {
  step: Step;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function ChallengeStep({
  step,
  onComplete,
  isLoading = false,
}: ChallengeStepProps) {
  const [userCode, setUserCode] = useState(step.initialCode || "");
  const [testResults, setTestResults] = useState<{
    [key: string]: boolean | null;
  }>({});
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);

  // Jeśli nie mamy przypadków testowych, używamy pustej tablicy
  const testCases = step.testCases || [];

  const runTests = async () => {
    setIsRunning(true);
    setTestResults({});
    setAllTestsPassed(false);

    try {
      // Symulacja wykonania testów
      const results: { [key: string]: boolean } = {};
      let allPassed = true;

      for (const test of testCases) {
        // Symulacja pojedynczego testu
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Prosty algorytm symulujący wynik testu (w rzeczywistości potrzeba prawdziwej walidacji)
        const passed = Math.random() > 0.3;
        results[test.id] = passed;

        if (!passed) allPassed = false;

        // Aktualizacja wyników na bieżąco
        setTestResults((prev) => ({ ...prev, [test.id]: passed }));
      }

      setAllTestsPassed(allPassed);
    } catch (error) {
      console.error("Error running tests:", error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="challenge-step">
      <h2 className="text-xl font-semibold mb-4">{step.title}</h2>

      <div className="prose max-w-none mb-6">
        <p>{step.content}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <label
            htmlFor="code-editor"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Twoje rozwiązanie:
          </label>
          <textarea
            id="code-editor"
            rows={15}
            className="w-full p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            placeholder="Wpisz swoje rozwiązanie tutaj..."
          />
        </div>

        <div>
          <h3 className="block mb-2 text-sm font-medium text-gray-700">
            Przypadki testowe:
          </h3>
          <div className="space-y-3">
            {testCases.map((test) => (
              <div key={test.id} className="border rounded-md overflow-hidden">
                <div className="p-3 bg-gray-50 flex justify-between items-center">
                  <span className="text-sm font-medium">Test {test.id}</span>
                  {testResults[test.id] !== undefined && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        testResults[test.id]
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {testResults[test.id] ? "Zaliczony" : "Niezaliczony"}
                    </span>
                  )}
                </div>
                <div className="p-3 border-t text-sm">
                  <p>
                    <strong>Wejście:</strong> {test.input}
                  </p>
                  <p>
                    <strong>Oczekiwane wyjście:</strong> {test.expectedOutput}
                  </p>
                  {test.description && (
                    <p>
                      <strong>Opis:</strong> {test.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {allTestsPassed && (
        <div className="p-4 rounded-md mb-6 bg-green-100 text-green-800">
          <p className="font-medium">Gratulacje! Wszystkie testy zaliczone.</p>
          <p>Możesz przejść do następnego kroku.</p>
        </div>
      )}

      <div className="flex justify-between mb-6">
        <LoadingButton
          onClick={runTests}
          isLoading={isRunning}
          disabled={userCode.trim() === ""}
          variant="secondary"
        >
          Uruchom testy
        </LoadingButton>

        <LoadingButton
          onClick={onComplete}
          disabled={!allTestsPassed}
          isLoading={isLoading}
          variant={allTestsPassed ? "default" : "secondary"}
        >
          Kontynuuj
        </LoadingButton>
      </div>

      {step.solution && (
        <div className="mt-6">
          <LoadingButton
            onClick={() => setShowSolution(!showSolution)}
            variant="secondary"
            size="sm"
          >
            {showSolution ? "Ukryj rozwiązanie" : "Pokaż rozwiązanie"}
          </LoadingButton>

          {showSolution && (
            <div className="mt-2 p-4 bg-gray-100 rounded-md font-mono text-sm whitespace-pre-wrap">
              {step.solution}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
