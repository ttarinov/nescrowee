import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon } from "@hugeicons/core-free-icons";

const Footer = () => (
  <footer className="border-t border-border py-12 mt-20">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Shield01Icon} size={16} className="text-primary" />
          <span className="font-bold text-sm">
            <span className="text-primary">Milestone</span>Trust
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Decentralized escrow & dispute resolution on NEAR Protocol with HOT Wallet
        </p>
        <p className="text-muted-foreground text-xs font-mono">
          Built for NEARCON Innovation Sandbox
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
