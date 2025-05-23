import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { Terminal } from "lucide-react"; // Ikona dla alertu

// Importuj swoje komponenty kroków
import ChallengeStep from "./Steps/ChallengeStep";
import CodeStep from "./Steps/CodeStep";
import ImageStep from "./Steps/ImageStep";
import InteractiveStep from "./Steps/InteractiveStep";
import ListStep from "./Steps/ListStep";
import QuizStep from "./Steps/QuizStep";
import TextStep from "./Steps/TextStep";
import { Step } from "@/app/types/lesson";

// Zaktualizowany interfejs propsów
interface StepRendererProps {
  step: Step;
  // onComplete teraz akceptuje opcjonalny boolean
  onComplete: (isCorrect?: boolean) => void;
  isLoading?: boolean; // Nadal może być przydatne dla kroków z własnym submit
}

export default function StepRenderer({
  step,
  onComplete,
  isLoading = false,
}: StepRendererProps) {
  // Renderowanie konkretnego typu kroku
  const renderStep = () => {
    switch (step.type) {
      // Kroki bez wewnętrznej akcji "Dalej" - nie przekazujemy onComplete/isLoading
      // Użytkownik użyje globalnego przycisku "Następny krok"
      case "text":
        return <TextStep step={step} />;
      case "image":
        return <ImageStep step={step} />;
      case "list":
        return <ListStep step={step} />;

      // Kroki z wewnętrzną logiką/akcją - przekazujemy onComplete/isLoading
      case "code":
        // CodeStep prawdopodobnie ma przycisk "Uruchom" lub "Sprawdź"
        // Musi wywołać onComplete(true) po sukcesie
        return <CodeStep step={step} />;
      case "quiz":
        // QuizStep ma logikę wyboru odpowiedzi i przycisk "Sprawdź"
        // Musi wywołać onComplete(true) lub onComplete(false)
        return (
          <QuizStep step={step} onComplete={onComplete} isLoading={isLoading} />
        );
      case "interactive":
        // InteractiveStep może mieć różne akcje
        // Musi wywołać onComplete(true) po sukcesie
        return (
          <InteractiveStep
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );
      case "challenge":
        // ChallengeStep może wymagać np. napisania kodu
        // Musi wywołać onComplete(true) po sukcesie
        return (
          <ChallengeStep
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );

      // Przypadek domyślny dla nieznanych typów
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
                {step.type}
              </code>
              .{/* Możemy usunąć przycisk, jeśli globalny "Dalej" ma działać */}
              {/* Jeśli jednak chcemy pozwolić na przejście: */}
              {/* <Button onClick={() => onComplete()} size="sm" variant="outline" className="mt-3">Przejdź dalej mimo to</Button> */}
            </AlertDescription>
          </Alert>
        );
    }
  };

  // Dodajemy trochę pionowego marginesu dla lepszego oddzielenia
  return <div className="step-renderer my-4">{renderStep()}</div>;
}
