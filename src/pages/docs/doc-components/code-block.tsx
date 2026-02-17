import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = "typescript", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '0.5rem',
      padding: '1rem',
      margin: 0,
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '0.875rem',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },
  };

  return (
    <div className="relative">
      {title && (
        <div className="text-xs text-gray-400 mb-2 px-1">{title}</div>
      )}
      <div className="relative group">
        <SyntaxHighlighter
          language={language}
          style={customStyle}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
          }}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          title="Copy code"
        >
          <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={16} />
        </button>
      </div>
    </div>
  );
}
