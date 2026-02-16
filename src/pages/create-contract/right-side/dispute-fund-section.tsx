import { DISPUTE_FUND_MIN, DISPUTE_FUND_MAX } from "../utils";

interface DisputeFundSectionProps {
  value: string;
  isValid: boolean;
  onChange: (value: string) => void;
}

export function DisputeFundSection({ value, isValid, onChange }: DisputeFundSectionProps) {
  return (
    <div className="bg-white/5 rounded-[32px] p-6 backdrop-blur-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Dispute Fund</h3>
          <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-[200px]">
            Reserved from each funded milestone. Pays for TEE-verified AI investigation.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-light text-white">{value}%</div>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {[5, 10, 15].map((pctVal) => (
          <button
            key={pctVal}
            type="button"
            onClick={() => onChange(String(pctVal))}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${value === String(pctVal) ? "bg-white text-black shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
          >
            {pctVal}%
          </button>
        ))}
      </div>
      {!isValid && value && (
        <p className="text-[10px] text-red-400 text-center">
          Minimum {DISPUTE_FUND_MIN}%, maximum {DISPUTE_FUND_MAX}%
        </p>
      )}
      <p className="text-[10px] text-white/30 text-center">Leftover always goes to the freelancer.</p>
    </div>
  );
}
