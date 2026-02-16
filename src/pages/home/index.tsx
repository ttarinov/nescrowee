import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  LockIcon,
  ZapIcon,
  ArrowRight01Icon,
  GlobeIcon,
  CpuIcon,
  Coins01Icon,
  ShieldKeyIcon,
  AiBrain01Icon,
  UserGroupIcon,
  Tick02Icon,
  User02Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { ExplainTerm } from "@/components/ExplainTerm";
import { HowItWorksFlow } from "@/components/HowItWorksFlow";
import ContractDemoCard from "./ContractDemoCard";
import IntegrationsSection from "./IntegrationsSection";
import SystemExplainer from "./SystemExplainer";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const whySecureItems: { id: string; content: React.ReactNode }[] = [
  { id: "1", content: <>Money sits in a <ExplainTerm term="smart contract">smart contract</ExplainTerm> — not in a company account.</> },
  { id: "2", content: <>Payments are instant when you approve a <ExplainTerm term="milestone">milestone</ExplainTerm>.</> },
  { id: "3", content: <>Disputes are resolved by AI running in secure hardware (<ExplainTerm term="TEE">TEE</ExplainTerm>).</> },
  { id: "4", content: <>Every step is recorded <ExplainTerm term="on-chain">on-chain</ExplainTerm> so anyone can verify.</> },
];

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex flex-col justify-center pb-20">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[250px] h-[250px] bg-purple-500/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="container mx-auto px-4 relative flex-1 flex flex-col justify-center">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <span className="text-xs text-white/50 font-mono uppercase tracking-widest">Powered by</span>
                <img src="/near-logo.png" alt="NEAR Protocol" className="h-5 opacity-80 hover:opacity-100 transition-opacity" />
                <span className="text-white/30">·</span>
                <img src="/hot-logo.svg" alt="HOT Wallet" className="h-4 opacity-80 hover:opacity-100 transition-opacity" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-foreground">
                <span className="bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent))_55%,hsl(262_50%_88%)_82%)] bg-clip-text text-transparent">Escrow</span> for freelancers and clients
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Pay in milestones, get paid when you deliver. If you disagree, AI investigates — fairly and transparently. Lock payment in a <ExplainTerm term="smart contract">smart contract</ExplainTerm>, release when <ExplainTerm term="milestone">milestones</ExplainTerm> are done; every step is signed and stored <ExplainTerm term="on-chain">on-chain</ExplainTerm>.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/create" className="inline-flex">
                  <span className="shiny-cta-hero group">
                    <span>
                      Create Contract
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </span>
                </Link>
                <Link to="/how-it-works">
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/[0.08] px-5 py-2.5 text-sm font-medium text-white/95 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-colors hover:border-white/35 hover:bg-white/[0.12]">
                    How it works
                  </span>
                </Link>
              </div>
            </motion.div>
            <div className="flex justify-center lg:justify-end">
              <ContractDemoCard />
            </div>
          </div>
        </div>
      </section>
      <HowItWorksFlow />

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-10 text-white" {...fadeUp}>
            Why it&apos;s secure
          </motion.h2>
          <ul className="max-w-2xl mx-auto space-y-3">
            {whySecureItems.map((item, i) => (
              <motion.li
                key={item.id}
                className="flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-white/5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <HugeiconsIcon icon={Tick02Icon} size={18} className="text-white/70 flex-shrink-0 mt-0.5" />
                <span className="text-white/90 text-sm">{item.content}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <HugeiconsIcon icon={User02Icon} size={24} className="text-white/90" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">For freelancers</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Get paid per <ExplainTerm term="milestone">milestone</ExplainTerm>. No chargebacks. If the client disputes, AI reviews the evidence and proposes a fair resolution. You can appeal for a deeper review.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <HugeiconsIcon icon={Wallet01Icon} size={24} className="text-white/90" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">For clients</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Lock funds once. Release only when you approve each <ExplainTerm term="milestone">milestone</ExplainTerm>. If you&apos;re not satisfied, raise a dispute — AI investigates with full access to evidence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <IntegrationsSection />

      <SystemExplainer />

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
              <span className="bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(262_50%_88%))] bg-clip-text text-transparent">Instant payments.</span> Fees under <span className="text-primary">$0.01</span>. Disputes with <span className="text-primary">TEE</span>-verified AI.
            </h2>
          </motion.div>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ZapIcon, title: "Sub-Second Finality", desc: "Transactions confirm in ~1 second. Milestone payments are instant." },
              { icon: Coins01Icon, title: "Fraction-of-a-Cent Fees", desc: "Gas costs under $0.01. Escrow operations are practically free." },
              { icon: ShieldKeyIcon, title: "Human-Readable Accounts", desc: "Use alice.near instead of cryptic hashes. HOT Wallet makes onboarding seamless." },
              { icon: CpuIcon, title: "AI-Native Infrastructure", desc: "NEAR AI Cloud provides confidential inference in TEE for dispute resolution." },
              { icon: Shield01Icon, title: "Privacy by Design", desc: "Dispute data processed in TEE. Chat anonymized before AI analysis. No raw data exposed." },
              { icon: GlobeIcon, title: "HOT Pay", desc: "Fund escrow from 30+ chains. One-tap funding and instant milestone payouts." },
              { icon: LockIcon, title: "Sharded & Scalable", desc: "Nightshade sharding handles millions of contracts in parallel." },
              { icon: UserGroupIcon, title: "Open-Source Prompts", desc: "AI dispute prompts are open-source with on-chain hash verification." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="p-5 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-2xl hover:bg-black/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <HugeiconsIcon icon={item.icon} size={24} className="text-white/90 mb-3" />
                <h3 className="font-semibold mb-1.5 text-white">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div className="text-center mt-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link to="/how-it-works">
              <span className="text-sm text-primary hover:underline">Tech for the curious →</span>
            </Link>
            <p className="text-xs text-white/50 mt-2 max-w-md mx-auto">
              NEAR contract, NEAR AI Cloud (TEE, Ed25519), HOT Wallet, HOT Pay, NOVA for encrypted evidence.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
