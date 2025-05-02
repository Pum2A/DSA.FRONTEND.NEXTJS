import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// Wybierz styl, np. oneDark lub inny pasujący do Twojego designu
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Step } from "@/app/types";
import { Button } from "@/components/ui/button"; // Użyj przycisku Shadcn
import { Check, Clipboard, Lightbulb } from "lucide-react"; // Ikony dla kopiowania
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Propsy już nie zawierają onComplete ani isLoading
interface CodeStepProps {
  step: Step;
}

export default function CodeStep({ step }: CodeStepProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (navigator.clipboard && step.code) {
      navigator.clipboard
        .writeText(step.code)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Nie udało się skopiować kodu:", err);
          // Można dodać feedback dla użytkownika
        });
    }
  };

  return (
    <div className="code-step space-y-4">
      {/* Tytuł kroku, jeśli istnieje */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
        </h2>
      )}

      {/* Opcjonalna treść/opis */}
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

      {/* Blok kodu */}
      {step.code ? (
        <div className="relative group my-4">
          {/* Przycisk kopiowania - użyj Button z Shadcn */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity bg-gray-700/50 hover:bg-gray-600/70 text-gray-200 hover:text-white"
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
            style={oneDark} // Użyj wybranego stylu
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              padding: "1rem",
              fontSize: "0.9rem",
            }} // Dostosuj style
            wrapLongLines={true} // Opcjonalnie zawijaj długie linie
            showLineNumbers // Opcjonalnie pokaż numery linii
          >
            {step.code.trim()} {/* Usuń białe znaki z początku/końca */}
          </SyntaxHighlighter>
        </div>
      ) : (
        <p className="text-gray-500 italic">Brak kodu do wyświetlenia.</p>
      )}

      {/* Wyjaśnienie */}
      {step.explanation && (
        <Alert
          variant="default"
          className="bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"
        >
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="font-semibold text-gray-800 dark:text-gray-100">
            Wyjaśnienie
          </AlertTitle>
          <AlertDescription className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {step.explanation}
            </ReactMarkdown>
          </AlertDescription>
        </Alert>
      )}

      {/* Przycisk "Rozumiem" został usunięty */}
    </div>
  );
}
