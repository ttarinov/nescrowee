import { DescriptionEditor } from "./description-editor";

interface DescriptionSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionSection({ value, onChange }: DescriptionSectionProps) {
  return (
    <div className="mt-2 pt-4">
      <div className="py-10 pr-5 rounded-[var(--radius)] bg-black/40">
        <DescriptionEditor value={value} onChange={onChange} />
      </div>
    </div>
  );
}
