import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

interface InviteLinkViewProps {
  inviteLink: string;
  onEdit: () => void;
}

export function InviteLinkView({ inviteLink, onEdit }: InviteLinkViewProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center"
        >
          <HugeiconsIcon icon={Link01Icon} size={48} className="text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Contract Created On-Chain</h2>
          <p className="text-muted-foreground mb-6">
            Share this invite link. The counterparty connects their HOT Wallet to join.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border max-w-md mx-auto mb-6">
            <code className="text-sm text-primary font-mono flex-1 truncate">{inviteLink}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                toast.success("Copied!");
              }}
            >
              <HugeiconsIcon icon={Copy01Icon} size={16} />
            </Button>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="hero" onClick={() => navigate("/contracts")}>
              Go to Contracts
            </Button>
            <Button variant="ghost" onClick={onEdit}>
              Edit
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
