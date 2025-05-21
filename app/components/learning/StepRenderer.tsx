import { Step, StepCompletionData } from "@/app/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import ChallengeStep from "./Steps/ChallengeStep";
import CodeStep from "./Steps/CodeStep";
import ImageStep from "./Steps/ImageStep";
import InteractiveStep from "./Steps/InteractiveStep";
import ListStep from "./Steps/ListStep";
import QuizStep from "./Steps/QuizStep";
import TextStep from "./Steps/TextStep";
import VideoStep from "./Steps/VideoStep";

interface StepRendererProps {
  step: Step;
  onComplete: (stepCompletionData?: StepCompletionData) => void;
  isLoading?: boolean;
}

export default function StepRenderer({
  step,
  onComplete,
  isLoading,
}: StepRendererProps) {
  const handlePassiveStepComplete = () => {
    onComplete({
      isCorrect: true,
      timeSpent: 0,
      attempts: 1,
    });
  };

  switch (step.type) {
    case "text":
      return <TextStep step={step} onComplete={handlePassiveStepComplete} />;

    case "image":
      return <ImageStep step={step} onComplete={handlePassiveStepComplete} />;

    case "code":
      return <CodeStep step={step} onComplete={handlePassiveStepComplete} />;

    case "quiz":
      return (
        <QuizStep
          step={step}
          onComplete={(data) =>
            onComplete({
              isCorrect: data?.isCorrect,
              answer: data?.answer,
              timeSpent: data?.timeSpent ?? 0,
              attempts: data?.attempts ?? 1,
            })
          }
          isLoading={isLoading}
        />
      );

    case "list":
      return <ListStep step={step} onComplete={handlePassiveStepComplete} />;

    case "interactive":
      return (
        <InteractiveStep
          step={step}
          onComplete={(data) =>
            onComplete({
              isCorrect: data?.isCorrect,
              answer: data?.answer,
              timeSpent: data?.timeSpent ?? 0,
              attempts: data?.attempts ?? 1,
            })
          }
          isLoading={isLoading}
        />
      );

    case "challenge":
      return (
        <ChallengeStep
          step={step}
          onComplete={(data) =>
            onComplete({
              isCorrect: data?.isCorrect,
              answer: data?.answer,
              timeSpent: data?.timeSpent ?? 0,
              attempts: data?.attempts ?? 1,
              testsPassed: data?.testsPassed,
              totalTests: data?.totalTests,
            })
          }
          isLoading={isLoading}
        />
      );

    case "video":
      return (
        <VideoStep
          step={step}
          onComplete={(data) =>
            onComplete({
              isCorrect: true,
              timeSpent: data?.timeSpent ?? 0,
              completionStatus: data?.completionStatus,
              attempts: 1,
            })
          }
        />
      );

    default:
      return (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
          <Terminal className="h-4 w-4" />
          <AlertTitle className="text-yellow-800">
            Nieznany typ kroku
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            Nie można wyświetlić kroku typu: <code>{step.type}</code>
          </AlertDescription>
        </Alert>
      );
  }
}
