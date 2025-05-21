import { ListItem, Step } from "@/app/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface ListStepProps {
  step: Step;
  onComplete?: () => void;
}

export default function ListStep({ step, onComplete }: ListStepProps) {
  const [hasRead, setHasRead] = useState(false);

  // Pobierz elementy z step.items lub step.interactiveData?.items
  const listData = step.interactiveData || {};
  const items: ListItem[] = step.items || listData.items || [];

  useEffect(() => {
    const timer = setTimeout(() => setHasRead(true), 10000);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="list-step space-y-4">
      {step.title && <h2 className="text-2xl font-semibold">{step.title}</h2>}
      {step.content && (
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {step.content}
          </ReactMarkdown>
        </div>
      )}
      {items.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-3">
          {items.map((item, index) => (
            <AccordionItem
              value={`item-${item.id || index}`}
              key={item.id || index}
              className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 text-left hover:no-underline text-base font-medium">
                {item.text}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0 border-t bg-gray-50 dark:bg-gray-700/50">
                <div className="prose prose-sm max-w-none pt-3 dark:prose-invert">
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
        <p className="text-gray-500 italic">
          Brak elementów listy do wyświetlenia.
        </p>
      )}

      {onComplete && (
        <div className="flex justify-end pt-4">
          <Button onClick={onComplete} className="mt-4" disabled={!hasRead}>
            Kontynuuj <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
