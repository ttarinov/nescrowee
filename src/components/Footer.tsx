import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-12 mt-20">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm">
            <span className="text-primary">NEAR</span>cord
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Decentralized escrow & dispute resolution on NEAR Protocol
        </p>
        <p className="text-muted-foreground text-xs font-mono">
          Built for NEARCON Innovation Sandbox
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
