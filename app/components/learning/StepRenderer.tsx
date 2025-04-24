import { Step } from "@/app/types";
import TextStep from "./Steps/TextStep";
import CodeStep from "./Steps/CodeStep";
import ImageStep from "./Steps/ImageStep";
import QuizStep from "./Steps/QuizStep";
import ListStep from "./Steps/ListStep";
import InteractiveStep from "./Steps/InteractiveStep";
import ChallengeStep from "./Steps/ChallengeStep";

interface StepRendererProps {
  step: Step;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function StepRenderer({
  step,
  onComplete,
  isLoading = false,
}: StepRendererProps) {
  const renderStep = () => {
    switch (step.type) {
      case "text":
        return (
          <TextStep step={step} onComplete={onComplete} isLoading={isLoading} />
        );
      case "code":
        return <CodeStep step={step} onComplete={onComplete} />;
      case "image":
        return (
          <ImageStep
            step={step}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );
      case "quiz":
        return (
          <QuizStep step={step} onComplete={onComplete} isLoading={isLoading} />
        );
      case "list":
        return (
          <ListStep step={step} onComplete={onComplete} isLoading={isLoading} />
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
      default:
        return (
          <div className="p-4 text-center">
            <p className="text-gray-500">Nieznany typ kroku: {step.type}</p>
            <button
              onClick={onComplete}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Przejdź dalej
            </button>
          </div>
        );
    }
  };

  return <div className="step-renderer">{renderStep()}</div>;
}
