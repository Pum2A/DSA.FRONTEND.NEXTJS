import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Importuj zaktualizowane komponenty kroków
import { StepCompletionResult, StepDto } from "@/app/types/lesson";
import ChallengeStep from "./Steps/ChallengeStep";
import CodeStep from "./Steps/CodeStep";
import ImageStep from "./Steps/ImageStep";
import InteractiveStep from "./Steps/InteractiveStep";
import ListStep from "./Steps/ListStep";
import QuizStep from "./Steps/QuizStep";
import TextStep from "./Steps/TextStep";
import TheoryStep from "./Steps/TheoryStep";
import VideoStep from "./Steps/VideoStep";
import VisualizationStep from "./Steps/VisualizationStep";

// ZAKTUALIZOWANE TYPY - importujemy z centralnego miejsca

// Zaktualizowany interfejs propsów
interface StepRendererProps {
  step: StepDto;
  onComplete: (result?: StepCompletionResult) => void;
  isLoading?: boolean;
  currentStepIndex?: number;
  totalSteps?: number;
}

export default function StepRenderer({
  step,
  onComplete,
  isLoading = false,
  currentStepIndex,
  totalSteps,
}: StepRendererProps) {
  // Helper function dla onComplete z boolean (backwards compatibility)
  const handleLegacyComplete = (
    isCorrectOrResult: boolean | StepCompletionResult
  ) => {
    // Jeśli już dostaliśmy StepCompletionResult, po prostu przekaż go dalej
    if (typeof isCorrectOrResult !== "boolean") {
      onComplete(isCorrectOrResult);
      return;
    }

    // W przeciwnym razie konwertuj boolean na StepCompletionResult
    const isCorrect = isCorrectOrResult;
    const result: StepCompletionResult = {
      success: isCorrect,
      error: isCorrect ? "" : "Nieprawidłowa odpowiedź",
      xpEarned: isCorrect
        ? Math.max(10, step.xpReward || (step.lessonId || 1) * 10)
        : 0,
      nextStepIndex:
        currentStepIndex !== undefined ? currentStepIndex + 1 : undefined,
      isLessonCompleted:
        currentStepIndex !== undefined && totalSteps !== undefined
          ? currentStepIndex >= totalSteps - 1
          : false,
    };
    onComplete(result);
  };

  // Renderowanie konkretnego typu kroku
  const renderStep = () => {
    // Upewnij się, że step.type istnieje
    const stepType = step.type?.toLowerCase() || "";

    switch (stepType) {
      // ===== NOWE TYPY KROKÓW =====
      case "theory":
        return <TheoryStep step={step} />;

      case "visualization":
        return (
          <VisualizationStep
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      case "video":
        return (
          <VideoStep
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      // ===== ISTNIEJĄCE TYPY - ZAKTUALIZOWANE =====
      case "text":
        return <TextStep step={step} />;

      case "image":
        return <ImageStep step={step} />;

      case "list":
        return <ListStep step={step} />;

      // ===== INTERAKTYWNE TYPY =====
      case "code":
      case "coding":
        // CodeStep może nie potrzebować onComplete, sprawdź jego implementację
        return <CodeStep step={step} />;

      case "quiz":
        return (
          <QuizStep step={step} onComplete={onComplete} isLoading={isLoading} />
        );

      case "interactive":
        return (
          <InteractiveStep
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      case "challenge":
        return (
          <ChallengeStep
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      // ===== PRZYPADEK DOMYŚLNY =====
      default:
        return (
          <Alert
            variant="default"
            className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800"
          >
            <Terminal className="h-4 w-4" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">
              Nieznany typ kroku
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Nie można wyświetlić kroku typu:{" "}
              <code className="font-mono bg-yellow-100 dark:bg-yellow-800 px-1 py-0.5 rounded text-xs">
                {step.type || "nieokreślony"}
              </code>
              <br />
              <small className="text-xs opacity-75 mt-2 block">
                Obsługiwane typy: theory, visualization, video, text, image,
                list, code/coding, quiz, interactive, challenge
              </small>
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="step-renderer my-4">
      {/* Debug info w development */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-400 mb-2">
          Step {currentStepIndex}/{totalSteps} - Type: {step.type || "unknown"}{" "}
          - ID: {step.id}
        </div>
      )}
      {renderStep()}
    </div>
  );
}
