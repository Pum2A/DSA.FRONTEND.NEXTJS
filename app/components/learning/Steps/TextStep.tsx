import { StepDto } from "@/app/types/lesson";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

// Zaktualizowane propsy używające StepDto
interface TextStepProps {
  step: StepDto;
}

export default function TextStep({ step }: TextStepProps) {
  return (
    <div className="text-step space-y-4">
      {/* Tytuł kroku, jeśli istnieje */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
        </h2>
      )}

      {/* Treść markdown */}
      <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {step.content || ""}
        </ReactMarkdown>
      </div>
    </div>
  );
}
