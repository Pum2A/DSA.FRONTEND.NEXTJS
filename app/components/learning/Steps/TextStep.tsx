import { Step } from "@/app/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Dodaj dla lepszej obsługi markdown (np. tabele)
import rehypeRaw from "rehype-raw"; // Dodaj dla obsługi HTML w markdown

// Propsy już nie zawierają onComplete ani isLoading
interface TextStepProps {
  step: Step;
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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]} // Uważaj na bezpieczeństwo, jeśli markdown pochodzi od użytkowników!
          // Możesz dodać komponenty do nadpisania stylów, np. dla linków, nagłówków
          // components={{
          //   a: ({node, ...props}) => <a className="text-indigo-600 dark:text-indigo-400 hover:underline" {...props} />,
          // }}
        >
          {step.content || ""}
        </ReactMarkdown>
      </div>

      {/* Przycisk "Kontynuuj" został usunięty - użytkownik użyje globalnego przycisku na LessonPage */}
    </div>
  );
}
