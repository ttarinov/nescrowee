import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Wallet01Icon, Menu01Icon, Cancel01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/contracts", label: "Contracts" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/blog", label: "Blog" },
  { to: "/docs", label: "Docs" },
];

const WalletPopoverContent = ({
  address,
  onCopy,
  onDisconnect,
}: {
  address: string;
  onCopy: () => void;
  onDisconnect: () => void;
}) => (
  <>
    <button
      type="button"
      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-slate-800 text-slate-300 text-left transition-colors"
      onClick={onCopy}
    >
      Copy address
    </button>
    <button
      type="button"
      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-slate-800 text-red-400 hover:text-red-300 text-left transition-colors"
      onClick={onDisconnect}
    >
      <HugeiconsIcon icon={Logout01Icon} size={16} />
      Disconnect
    </button>
  </>
);

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { accountId, isConnected, connect, disconnect } = useWallet();

  const truncatedAccount = accountId
    ? accountId.length > 20
      ? `${accountId.slice(0, 8)}...${accountId.slice(-6)}`
      : accountId
    : "";

  return (
    <div className="fixed top-0 left-0 right-0 w-full py-4 flex justify-center z-50 pointer-events-none [&>*]:pointer-events-auto">
      <header className="w-[95%] max-w-5xl bg-slate-900/80 backdrop-blur-xl rounded-full border border-slate-800 p-2 pl-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-gradient-to-b from-purple-400 to-indigo-600 rounded-full" />
            <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">Nescrowee</span>
          </Link>
          <nav className="hidden md:flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? "bg-slate-800 text-purple-300"
                    : "text-slate-400 hover:bg-slate-800 hover:text-purple-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block relative">
            {!isConnected ? (
              <button
                type="button"
                onClick={() => connect()}
                className="bg-slate-800 hover:bg-slate-700 text-white pl-4 pr-1 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-3 border border-slate-700"
              >
                <span>Connect Wallet</span>
                <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <HugeiconsIcon icon={Wallet01Icon} className="w-4 h-4 text-white" />
                </span>
              </button>
            ) : (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="bg-slate-950 text-slate-300 hover:text-white hover:border-slate-600 pl-4 pr-1 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-3 border border-slate-800"
                  >
                    <span>{truncatedAccount}</span>
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${accountId}`}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-slate-800"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-800 p-2">
                  <WalletPopoverContent
                    address={accountId ?? ""}
                    onCopy={() => {
                      if (accountId) {
                        navigator.clipboard.writeText(accountId);
                        toast.success("Address copied");
                        setIsPopoverOpen(false);
                      }
                    }}
                    onDisconnect={() => {
                      disconnect();
                      setIsPopoverOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <button
            type="button"
            className="md:hidden text-slate-400 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <HugeiconsIcon icon={Cancel01Icon} size={20} /> : <HugeiconsIcon icon={Menu01Icon} size={20} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-[95%] max-w-5xl mx-auto mt-2 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? "bg-slate-800 text-purple-300"
                      : "text-slate-400 hover:bg-slate-800 hover:text-purple-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isConnected ? (
                <>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left text-slate-300 hover:bg-slate-800 border-t border-slate-800 mt-2 pt-4"
                    onClick={() => {
                      if (accountId) {
                        navigator.clipboard.writeText(accountId);
                        toast.success("Address copied");
                      }
                    }}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${accountId}`}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-slate-800"
                    />
                    <span className="font-mono text-xs">{truncatedAccount}</span>
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-slate-800 text-left"
                    onClick={() => {
                      disconnect();
                      setMobileOpen(false);
                    }}
                  >
                    <HugeiconsIcon icon={Logout01Icon} size={16} />
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 mt-2"
                  onClick={() => {
                    connect();
                    setMobileOpen(false);
                  }}
                >
                  <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={Wallet01Icon} className="w-4 h-4 text-white" />
                  </span>
                  Connect Wallet
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
