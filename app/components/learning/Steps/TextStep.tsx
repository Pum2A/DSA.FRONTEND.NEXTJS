import { Step } from "@/app/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface TextStepProps {
  step: Step;
  onComplete?: () => void;
}

export default function TextStep({ step, onComplete }: TextStepProps) {
  const [hasRead, setHasRead] = useState(false);

  // Po 20 sekundach zakładamy, że użytkownik przeczytał tekst
  useState(() => {
    const timeout = setTimeout(() => setHasRead(true), 20000);
    return () => clearTimeout(timeout);
  });

  return (
    <div className="space-y-4">
      {step.title && <h2 className="text-2xl font-semibold">{step.title}</h2>}
      <div className="prose prose-lg dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {step.content || ""}
        </ReactMarkdown>
      </div>

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
