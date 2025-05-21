import { Step } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Clipboard } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface CodeStepProps {
  step: Step;
  onComplete?: () => void;
}

export default function CodeStep({ step, onComplete }: CodeStepProps) {
  const [copied, setCopied] = useState(false);
  const [hasRead, setHasRead] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasRead(true), 15000);
    return () => clearTimeout(timer);
  }, [step]);

  const copyCode = () => {
    if (navigator.clipboard && step.code) {
      navigator.clipboard
        .writeText(step.code)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {});
    }
  };

  return (
    <div className="code-step space-y-4">
      {step.title && <h2 className="text-2xl font-semibold">{step.title}</h2>}
      {step.content && (
        <div className="prose prose-lg dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {step.content}
          </ReactMarkdown>
        </div>
      )}

      {step.code ? (
        <div className="relative group my-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity"
            onClick={copyCode}
            aria-label="Kopiuj kod"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </Button>
          <SyntaxHighlighter
            language={step.language || "javascript"}
            style={oneDark}
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              padding: "1rem",
              fontSize: "0.9rem",
            }}
            wrapLongLines={true}
            showLineNumbers
          >
            {step.code.trim()}
          </SyntaxHighlighter>
        </div>
      ) : (
        <p className="text-gray-500 italic">Brak kodu do wyświetlenia.</p>
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
