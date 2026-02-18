import { lazy, Suspense } from "react";

const DescriptionEditor = lazy(() => import("./description-editor"));

interface DescriptionSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionSection({ value, onChange }: DescriptionSectionProps) {
  return (
    <div className="mt-2 pt-4">
      <div className="py-10 pr-5 rounded-[var(--radius)] bg-black/40">
        <Suspense fallback={<div className="h-40 animate-pulse bg-slate-800/50 rounded-lg" />}>
          <DescriptionEditor value={value} onChange={onChange} />
        </Suspense>
      </div>
    </div>
  );
}
