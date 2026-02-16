import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Wallet01Icon } from "@hugeicons/core-free-icons";

interface ConnectWalletViewProps {
  onConnect: () => void;
}

export function ConnectWalletView({ onConnect }: ConnectWalletViewProps) {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto mt-20">
          <HugeiconsIcon icon={Wallet01Icon} size={48} className="text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Connect HOT Wallet to create a contract.</p>
          <Button variant="hero" size="lg" onClick={onConnect}>
            Connect Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
