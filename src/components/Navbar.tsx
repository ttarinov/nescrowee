import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon, Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/contracts", label: "Contracts" },
  { to: "/disputes", label: "How Disputes Work" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { accountId, isConnected, connect, disconnect } = useWallet();

  const truncatedAccount = accountId
    ? accountId.length > 20
      ? `${accountId.slice(0, 8)}...${accountId.slice(-6)}`
      : accountId
    : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <HugeiconsIcon icon={Shield01Icon} size={16} className="text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-primary">Milestone</span>
            <span className="text-foreground">Trust</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "secondary" : "ghost"}
                size="sm"
                className="text-sm"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-primary">{truncatedAccount}</span>
              <Button variant="ghost" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button variant="hero" size="sm" onClick={connect}>
              Connect Wallet
            </Button>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <HugeiconsIcon icon={Cancel01Icon} size={20} /> : <HugeiconsIcon icon={Menu01Icon} size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                  <Button
                    variant={location.pathname === link.to ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              {isConnected ? (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-sm font-mono text-primary px-3">{truncatedAccount}</span>
                  <Button variant="ghost" onClick={disconnect}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button variant="hero" className="mt-2" onClick={connect}>
                  Connect Wallet
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
