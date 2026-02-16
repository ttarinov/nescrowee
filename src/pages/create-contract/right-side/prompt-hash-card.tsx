import { Link } from "react-router-dom";

interface PromptHashCardProps {
  promptHash: string;
}

export function PromptHashCard({ promptHash }: PromptHashCardProps) {
  if (!promptHash) return null;
  return (
    <div className="rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs font-mono text-white/40">{promptHash.slice(0, 44)}...</div>
          <Link to="/how-it-works" className="text-xs text-white font-medium mt-0.5 hover:underline">
            How it works →
          </Link>
        </div>
      </div>
    </div>
  );
}
