import { DescriptionEditor } from "./description-editor";

interface DescriptionSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionSection({ value, onChange }: DescriptionSectionProps) {
  return (
    <div className="mt-2 pt-4">
      <div className="py-5 rounded-[var(--radius)] bg-black/40 backdrop-blur-2xl">
        <DescriptionEditor value={value} onChange={onChange} />
      </div>
    </div>
  );
}
