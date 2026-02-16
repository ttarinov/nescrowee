import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionSection({ value, onChange }: DescriptionSectionProps) {
  return (
    <div>
      <Label htmlFor="desc" className="text-base font-semibold">
        Description
      </Label>
      <Textarea
        id="desc"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Scope of work, deliverables, timeline, acceptance criteria..."
        className="mt-2 resize-none min-h-[120px]"
      />
    </div>
  );
}
