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
  EyeIcon,
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
    desc: "Connect your HOT Wallet and define milestones, amounts, and terms on-chain.",
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

const features = [
  {
    icon: AiBrain01Icon,
    title: "AI-Powered Resolution",
    desc: "Open-source AI prompts with on-chain hash verification. Two tiers: fast standard review and thorough appeal. No human bias.",
  },
  {
    icon: Shield01Icon,
    title: "TEE-Secured Privacy",
    desc: "Dispute data processed in Trusted Execution Environments via NEAR AI Cloud. Chat anonymized as Party A / Party B.",
  },
  {
    icon: EyeIcon,
    title: "Fully On-Chain",
    desc: "Every payment, milestone, and AI decision tracked on NEAR blockchain with complete transparency and audit trail.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(174_72%_52%/0.08),transparent_60%)]" />
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
              <span className="gradient-text">& AI Disputes</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Create milestone-based contracts with built-in escrow on NEAR. Fund with HOT Wallet,
              get paid instantly on milestone approval, and let open-source AI resolve disputes — transparently and fairly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/create">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Create Contract
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
                </Button>
              </Link>
              <Link to="/disputes">
                <Button variant="hero-outline" size="lg" className="text-base px-8">
                  How Disputes Work
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From contract to payment in four simple steps.
            </p>
          </motion.div>
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

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="p-6 rounded-xl gradient-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              >
                <HugeiconsIcon icon={f.icon} size={32} className="text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why NEAR */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="gradient-text">NEAR Protocol</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built on NEAR for speed, privacy, and true decentralization.
            </p>
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

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center p-12 rounded-2xl border border-primary/20 bg-primary/5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to build trust?
            </h2>
            <p className="text-muted-foreground mb-8">
              Connect your HOT Wallet and start your first escrow contract on NEAR. Instant payments, AI-powered disputes, fully on-chain.
            </p>
            <Link to="/create">
              <Button variant="hero" size="lg" className="text-base px-10">
                Get Started
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
