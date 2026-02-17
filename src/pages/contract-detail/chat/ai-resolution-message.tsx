import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain01Icon, LockIcon, ArrowRight01Icon, SecurityBlockIcon } from "@hugeicons/core-free-icons";
import type { SocialMessage, AiResolutionData } from "@/near/social";

interface AiResolutionMessageProps {
  message: SocialMessage;
  data: AiResolutionData;
  onClick?: () => void;
}

export function AiResolutionMessage({
  message,
  data,
  onClick,
}: AiResolutionMessageProps) {
  return (
    <div className="flex justify-center w-full py-2">
      <button
        type="button"
        onClick={onClick}
        className="group relative w-full max-w-md text-left transition-all duration-300 hover:scale-[1.02]"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-30 blur group-hover:opacity-60 transition duration-500" />

        <div className="relative bg-[#0a051e] border border-white/10 rounded-xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />

          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-300">
                <HugeiconsIcon icon={AiBrain01Icon} size={16} />
              </div>
              <span className="text-sm font-medium text-purple-100 tracking-wide">AI Resolution</span>
            </div>
            {data.tee_verified && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <HugeiconsIcon icon={SecurityBlockIcon} size={12} className="text-green-400" />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Verified</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1">
              {data.resolution} Wins
            </h3>
            {data.explanation && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {data.explanation}
              </p>
            )}
          </div>

          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              <span>Confidence</span>
              <span className="text-purple-300">{data.confidence}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                style={{ width: `${data.confidence}%` }}
              />
            </div>
          </div>

          {data.context_for_freelancer && (
            <div className="p-2 rounded-lg bg-warning/10 border border-warning/20 mb-4">
              <p className="text-[10px] font-mono text-warning mb-0.5">What to fix</p>
              <p className="text-sm text-muted-foreground">{data.context_for_freelancer}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-[10px] text-gray-500 font-mono">{data.model_id}</span>
            <span className="text-[10px] text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Details <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
