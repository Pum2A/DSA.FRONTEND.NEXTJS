import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { LoadingButton } from "../../ui/LoadingButton";
import { Step } from "@/app/types";

interface CodeStepProps {
  step: Step;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function CodeStep({
  step,
  onComplete,
  isLoading = false,
}: CodeStepProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (navigator.clipboard && step.code) {
      navigator.clipboard.writeText(step.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="code-step">
      <h2 className="text-xl font-semibold mb-4">{step.title}</h2>

      {step.content && (
        <div className="prose max-w-none mb-6">
          <p>{step.content}</p>
        </div>
      )}

      <div className="relative mb-6">
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={copyCode}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            {copied ? "Skopiowano!" : "Kopiuj"}
          </button>
        </div>

        <SyntaxHighlighter
          language={step.language || "javascript"}
          style={vscDarkPlus}
          className="rounded-md"
        >
          {step.code || ""}
        </SyntaxHighlighter>
      </div>

      {step.explanation && (
        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-2">Wyjaśnienie</h3>
          <p>{step.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        <LoadingButton onClick={onComplete} isLoading={isLoading}>
          Rozumiem
        </LoadingButton>
      </div>
    </div>
  );
}
