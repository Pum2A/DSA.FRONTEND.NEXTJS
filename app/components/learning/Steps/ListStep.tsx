import { Step } from "@/app/types/lesson";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Shadcn Accordion
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

// Propsy już nie zawierają onComplete ani isLoading
interface ListStepProps {
  step: Step;
}

export default function ListStep({ step }: ListStepProps) {
  // Użyj pustej tablicy, jeśli items nie istnieje
  const items = step.items || [];

  return (
    <div className="list-step space-y-4">
      {/* Tytuł kroku, jeśli istnieje */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
        </h2>
      )}

      {/* Opcjonalna treść wstępna */}
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

      {/* Lista jako Accordion */}
      {items.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-3">
          {items.map((item, index) => (
            <AccordionItem
              value={`item-${item.id || index}`}
              key={item.id || index}
              className="border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 text-left hover:no-underline text-base font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {item.text}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {/* Użyj ReactMarkdown dla opisu, jeśli może zawierać formatowanie */}
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 pt-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {item.description || "Brak opisu."}
                  </ReactMarkdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 italic">
          Brak elementów listy do wyświetlenia.
        </p>
      )}

      {/* Przycisk "Rozumiem" został usunięty */}
    </div>
  );
}
