import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DisputeFormProps {
  reason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function DisputeForm({
  reason,
  onReasonChange,
  onSubmit,
  onCancel,
  isPending,
}: DisputeFormProps) {
  return (
    <div className="pt-4 border-t border-white/12 space-y-3">
      <h3 className="text-sm font-bold text-red-300">Raise Dispute</h3>
      <Textarea
        placeholder="Explain the reason for this dispute..."
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        className="min-h-[80px] resize-none bg-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:bg-white/10 border-0"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={onSubmit}
          disabled={isPending || !reason.trim()}
        >
          Submit Dispute
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-white/80 hover:bg-white/10"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
