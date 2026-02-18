import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  LockIcon,
  ZapIcon,
  GlobeIcon,
  CpuIcon,
  Coins01Icon,
  ShieldKeyIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

const features = [
  { icon: ZapIcon, title: "Sub-Second Finality", desc: "Transactions confirm in ~1 second. Milestone payments are instant." },
  { icon: Coins01Icon, title: "Fraction-of-a-Cent Fees", desc: "Gas costs under 0.01 USDC. Escrow operations are practically free." },
  { icon: ShieldKeyIcon, title: "Human-Readable Accounts", desc: "Use alice.near instead of cryptic hashes. HOT Wallet makes onboarding seamless." },
  { icon: CpuIcon, title: "AI-Native Infrastructure", desc: "NEAR AI Cloud provides confidential inference in TEE for dispute resolution." },
  { icon: Shield01Icon, title: "Privacy by Design", desc: "Dispute data processed in TEE. Chat anonymized before AI analysis. No raw data exposed." },
  { icon: GlobeIcon, title: "HOT Pay", desc: "Fund escrow from 30+ chains. One-tap funding and instant milestone payouts." },
  { icon: LockIcon, title: "Sharded & Scalable", desc: "Nightshade sharding handles millions of contracts in parallel." },
  { icon: UserGroupIcon, title: "Open-Source Prompts", desc: "AI dispute prompts are open-source with on-chain hash verification." },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const TechFeaturesSection = () => {
  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      <div className="absolute top-1/3 left-[-100px] w-[400px] h-[400px] bg-purple-600/[0.08] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-80px] w-[300px] h-[300px] bg-blue-600/[0.06] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <motion.div className="text-center mb-12" {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            <span className="bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(262_50%_88%))] bg-clip-text text-transparent">Instant payments.<br/>
            Fees under <span className="text-primary">0.01 USDC</span>.
            <br/>Disputes with <span className="text-primary">TEE</span>-verified AI.</span>
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((item, i) => (
            <motion.div
              key={item.title}
              className="group relative rounded-2xl p-[1px] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/30 via-transparent to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-[1px] rounded-[15px] bg-[#0a051e]" />

              <div className="relative rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-2xl p-5 overflow-hidden group-hover:border-purple-500/20 transition-colors duration-500">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center mb-3">
                  <HugeiconsIcon icon={item.icon} size={20} className="text-purple-300" />
                </div>
                <h3 className="font-semibold mb-1.5 text-white">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
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
  );
};

export default TechFeaturesSection;
