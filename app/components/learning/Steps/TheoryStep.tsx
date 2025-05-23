import { StepDto } from "@/app/types/lesson";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface TheoryStepProps {
  step: StepDto;
}

export default function TheoryStep({ step }: TheoryStepProps) {
  return (
    <div className="theory-step space-y-6">
      {/* Tytuł kroku, jeśli istnieje */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
        </h2>
      )}

      {/* Główna treść teoretyczna */}
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

      {/* Dodatkowe przykłady lub wyjaśnienia */}
      {step.additionalData && typeof step.additionalData === "string" && (
        <div className="mt-4 prose prose-md dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {step.additionalData}
          </ReactMarkdown>
        </div>
      )}

      {/* Najważniejsze informacje - wyróżnione */}
      {step.explanation && (
        <Alert
          variant="default"
          className="bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 mt-6"
        >
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <AlertTitle className="font-semibold text-amber-800 dark:text-amber-300">
            Kluczowe informacje
          </AlertTitle>
          <AlertDescription className="prose prose-sm dark:prose-invert max-w-none text-amber-700 dark:text-amber-200">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {step.explanation}
            </ReactMarkdown>
          </AlertDescription>
        </Alert>
      )}

      {/* Opcjonalne dodatkowe sekcje teoretyczne */}
      {step.items && step.items.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
            Dodatkowe informacje
          </h3>
          {step.items.map((item, index) => (
            <div
              key={item.id || index}
              className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <h4 className="font-medium text-lg mb-2 text-gray-800 dark:text-gray-200">
                {item.text}
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {item.description || ""}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
