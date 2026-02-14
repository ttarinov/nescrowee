import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  LegalDocument01Icon,
  LockIcon,
  ZapIcon,
  ArrowRight01Icon,
  GlobeIcon,
  CpuIcon,
  Coins01Icon,
  ShieldKeyIcon,
  AiBrain01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const steps = [
  {
    icon: LegalDocument01Icon,
    title: "Create Contract",
    desc: "Connect your NEAR Wallet and define milestones, amounts, and terms on-chain.",
  },
  {
    icon: LockIcon,
    title: "Funds Escrowed",
    desc: "NEAR tokens are locked directly in smart contract. All on-chain, transparent.",
  },
  {
    icon: ZapIcon,
    title: "Instant Payments",
    desc: "Approve milestones and funds arrive in the freelancer's wallet instantly. No withdrawal step.",
  },
  {
    icon: AiBrain01Icon,
    title: "AI Resolves Disputes",
    desc: "Open-source AI prompts resolve disputes fairly. Accept or appeal for a thorough review. All transparent.",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Powered by</span>
              <img src="/near-logo.png" alt="NEAR Protocol" className="h-6 opacity-80 hover:opacity-100 transition-opacity" />
              <span className="text-muted-foreground/40">·</span>
              <img src="/hot-logo.svg" alt="HOT Wallet" className="h-5 opacity-80 hover:opacity-100 transition-opacity" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Trustless Escrow{" "}
              <span className="text-primary">& AI Disputes</span>
            </h1>
            <p className="text-2xl font-medium text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Escrow for freelancers and clients: lock payment in a smart contract, release when milestones are done. Disputes are working through TEE-verified AI investigates — every step signed on-chain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/create">
                <Button variant="hero" size="lg" className="text-base px-8 font-extrabold rounded-xl">
                  Create Contract
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
                </Button>
              </Link>
              <Link to="/disputes">
                <Button variant="hero-outline" size="lg" className="text-base px-8 border-none">
                  How Disputes Work
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-xs font-mono text-primary/60 mb-4">
                  0{i + 1}
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <HugeiconsIcon icon={step.icon} size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Instant payments.
              <br/> Fees under <span className="text-primary">$0.01</span>. <br/>
               Disputes with <span className="text-primary">TEE-verified AI.</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: ZapIcon,
                title: "Sub-Second Finality",
                desc: "Transactions confirm in ~1 second. Milestone payments are instant.",
              },
              {
                icon: Coins01Icon,
                title: "Fraction-of-a-Cent Fees",
                desc: "Gas costs under $0.01. Escrow operations are practically free.",
              },
              {
                icon: ShieldKeyIcon,
                title: "Human-Readable Accounts",
                desc: "Use alice.near instead of cryptic hashes. HOT Wallet makes onboarding seamless.",
              },
              {
                icon: CpuIcon,
                title: "AI-Native Infrastructure",
                desc: "NEAR AI Cloud provides confidential inference in TEE for dispute resolution.",
              },
              {
                icon: Shield01Icon,
                title: "Privacy by Design",
                desc: "Dispute data processed in TEE. Chat anonymized before AI analysis. No raw data exposed.",
              },
              {
                icon: GlobeIcon,
                title: "HOT Pay Payments",
                desc: "30M+ HOT Wallet users. One-tap escrow funding and instant milestone payouts.",
              },
              {
                icon: LockIcon,
                title: "Sharded & Scalable",
                desc: "Nightshade sharding handles millions of contracts in parallel.",
              },
              {
                icon: UserGroupIcon,
                title: "Open-Source Prompts",
                desc: "AI dispute prompts are fully open-source with on-chain hash verification. Full transparency.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
              >
                <HugeiconsIcon icon={item.icon} size={24} className="text-primary mb-3" />
                <h3 className="font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
