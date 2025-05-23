"use client";

import { StepCompletionResult, StepDto } from "@/app/types/lesson";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, MousePointer, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface VisualizationStepProps {
  step: StepDto;
  onComplete?: (result: StepCompletionResult) => void;
  isLoading?: boolean;
}

export default function VisualizationStep({
  step,
  onComplete,
  isLoading = false,
}: VisualizationStepProps) {
  const [isInteracted, setIsInteracted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Parsuj dodatkowe dane wizualizacji, jeśli są dostępne
  const vizData = (() => {
    try {
      if (step.additionalData) {
        return typeof step.additionalData === "string"
          ? JSON.parse(step.additionalData)
          : step.additionalData;
      }
      return null;
    } catch (err) {
      console.error("Błąd parsowania danych wizualizacji:", err);
      return null;
    }
  })();

  // Typ wizualizacji - domyślnie 'custom', ale może być nadpisany
  const vizType = vizData?.type || "custom";

  useEffect(() => {
    // Symulacja inicjalizacji wizualizacji
    let mounted = true;

    const initVisualization = async () => {
      try {
        // W rzeczywistej implementacji tutaj zainicjowalibyśmy
        // bibliotekę wizualizacji (np. D3.js, Three.js, itp.)
        await new Promise((resolve) => setTimeout(resolve, 500)); // Symulacja ładowania

        if (mounted) {
          setIsReady(true);
        }

        // Tutaj dodałbyś faktyczny kod inicjalizacji dla canvasRef.current
      } catch (err) {
        if (mounted) {
          setError("Nie udało się zainicjować wizualizacji.");
          console.error("Błąd inicjalizacji wizualizacji:", err);
        }
      }
    };

    initVisualization();

    return () => {
      mounted = false;
      // Tutaj dodałbyś kod czyszczący dla wizualizacji
    };
  }, [step.id]);

  // Obsługa interakcji z wizualizacją
  const handleInteraction = () => {
    setIsInteracted(true);
  };

  // Obsługa resetu wizualizacji
  const handleReset = () => {
    // W prawdziwej implementacji, tutaj zresetowałbyś stan wizualizacji
    setIsInteracted(false);
    // Reset wizualizacji...
  };

  // Obsługa ukończenia kroku
  const handleComplete = () => {
    if (!onComplete) return;

    onComplete({
      success: true,
      error: "",
      xpEarned: 10, // Stała wartość XP za obejrzenie wizualizacji
      nextStepIndex: undefined,
      isLessonCompleted: false,
    });
  };

  return (
    <div className="visualization-step space-y-6">
      {/* Tytuł kroku */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
        </h2>
      )}

      {/* Opcjonalny opis */}
      {step.content && (
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {step.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Obszar wizualizacji */}
      <div className="border rounded-lg dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-md">
        {/* Pasek narzędziowy */}
        <div className="bg-gray-100 dark:bg-gray-700 p-2 flex items-center justify-between border-b dark:border-gray-600">
          <div className="font-medium text-gray-700 dark:text-gray-200 flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            {vizData?.title || "Wizualizacja"}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!isReady}
              className="h-8"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInteraction}
              disabled={!isReady}
              className="h-8"
            >
              <MousePointer className="h-3.5 w-3.5 mr-1" /> Interakcja
            </Button>
          </div>
        </div>

        {/* Obszar wizualizacji */}
        {error ? (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Błąd wizualizacji</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !isReady ? (
          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Ładowanie wizualizacji...
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={canvasRef}
            className="visualization-canvas h-64 w-full relative overflow-hidden flex items-center justify-center"
            onClick={handleInteraction}
          >
            {/* W rzeczywistej implementacji tutaj byłaby faktyczna wizualizacja */}
            {/* Tutaj jest tylko wizualizacja zastępcza */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div
                  className={`w-16 h-16 rounded-full transition-all duration-500 ${
                    isInteracted
                      ? "bg-green-500 scale-125"
                      : "bg-blue-500 animate-pulse"
                  }`}
                ></div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {isInteracted
                  ? "Zarejestrowano interakcję!"
                  : "Kliknij, aby wejść w interakcję z wizualizacją"}
              </p>
            </div>
          </div>
        )}

        {/* Opis wizualizacji */}
        {vizData?.description && (
          <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {vizData.description}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Informacja o instrukcji */}
      {vizData?.instructions && (
        <Alert
          variant="default"
          className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
        >
          <AlertTitle className="text-blue-800 dark:text-blue-300">
            Instrukcja
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            {vizData.instructions}
          </AlertDescription>
        </Alert>
      )}

      {/* Przycisk ukończenia */}
      {onComplete && (
        <div className="flex justify-end mt-6 pt-3 border-t dark:border-gray-700">
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className={`${
              isInteracted ? "bg-green-600 hover:bg-green-700" : ""
            }`}
          >
            Kontynuuj
          </Button>
        </div>
      )}
    </div>
  );
}
