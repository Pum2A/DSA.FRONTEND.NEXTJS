"use client";

import { Check, ClipboardCopy } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden">
      <div className="absolute right-2 top-2">
        <button
          onClick={handleCopy}
          className="bg-gray-800/30 hover:bg-gray-800/60 text-gray-300 hover:text-white p-2 rounded flex items-center transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
        </button>
      </div>
      <div className="bg-gray-900 text-gray-50 rounded-md p-4 overflow-x-auto">
        <pre className="text-sm">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}