import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GLOSSARY } from "@/constants/glossary";

interface ExplainTermProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
}

export function ExplainTerm({ term, children, className = "" }: ExplainTermProps) {
  const explanation = GLOSSARY[term];
  const label = children ?? term;

  if (!explanation) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          data-cursor-help
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLElement).click()}
          className={`border-b border-dashed border-current opacity-90 hover:opacity-100 ${className}`}
        >
          {label}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        className="max-w-xs rounded-xl border-white/20 bg-black/90 backdrop-blur-xl p-4 text-sm text-white/95"
      >
        {explanation}
      </PopoverContent>
    </Popover>
  );
}
