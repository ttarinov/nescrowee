import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface PageHeaderProps {
  title: string;
  onTitleChange: (value: string) => void;
}

export function PageHeader({ title, onTitleChange }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="p-8 pb-4 relative z-10 flex items-start gap-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-white/80 hover:text-white hover:bg-white/10"
        onClick={() => navigate("/contracts")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
      </Button>
      <div className="flex-1 min-w-0">
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="New Contract"
          className="!text-5xl font-bold tracking-tight text-white drop-shadow-lg h-auto py-2 bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:!text-5xl placeholder:text-white/60"
        />
      </div>
    </div>
  );
}
