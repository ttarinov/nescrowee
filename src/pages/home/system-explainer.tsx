import { useState } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  LockIcon,
  LegalDocument01Icon,
  Coins01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import { ExplainTerm } from "@/components/explain-term";
import type { Icon } from "@hugeicons/core-free-icons";
import {
  AIDemo,
  MoneyDemo,
  DisagreeDemo,
  PayDisputesDemo,
  SignPayDemo,
} from "./system-explainer-demos";

const tabs: { id: string; label: string; icon: Icon }[] = [
  { id: "ai", label: "How does AI judging work", icon: AiBrain01Icon },
  { id: "money", label: "Where is the money held", icon: LockIcon },
  { id: "disagree", label: "What if we disagree", icon: LegalDocument01Icon },
  { id: "pay-disputes", label: "Who pays for disputes", icon: Coins01Icon },
  { id: "sign-pay", label: "How do we sign and pay", icon: ZapIcon },
];

const content: Record<string, { title: string; body: React.ReactNode; icon: Icon }> = {
  ai: {
    title: "How does AI judging work",
    icon: AiBrain01Icon,
    body: (
      <>
        <p className="text-base text-white/80 leading-relaxed mb-4">
          If you raise a dispute, we send the chat and any evidence you provide to an AI that runs in a <ExplainTerm term="TEE">TEE</ExplainTerm> — secure hardware that no one can tamper with. The AI reads your agreement and the work done, then proposes a fair split or outcome.
        </p>
        <p className="text-base text-white/80 leading-relaxed">
          Every answer is signed by that hardware and stored <ExplainTerm term="on-chain">on-chain</ExplainTerm>, so you can verify it. You can accept the result or ask for a deeper appeal (a second, more thorough AI review).
        </p>
      </>
    ),
  },
  money: {
    title: "Where is the money held",
    icon: LockIcon,
    body: (
      <>
        <p className="text-base text-white/80 leading-relaxed mb-4">
          The client’s payment is locked in a <ExplainTerm term="smart contract">smart contract</ExplainTerm> on <ExplainTerm term="NEAR">NEAR</ExplainTerm>. No company or person holds it — only the program you both agreed to. When the client approves a <ExplainTerm term="milestone">milestone</ExplainTerm>, the contract automatically sends that part of the payment to the freelancer.
        </p>
        <p className="text-base text-white/80 leading-relaxed">
          A small percentage of each milestone (the <ExplainTerm term="dispute fund">dispute fund</ExplainTerm>) is reserved in case of a dispute. If you never dispute, the rest goes to the freelancer.
        </p>
      </>
    ),
  },
  disagree: {
    title: "What if we disagree",
    icon: LegalDocument01Icon,
    body: (
      <>
        <p className="text-base text-white/80 leading-relaxed mb-4">
          Either side can raise a dispute on a milestone. You give a reason and any evidence (e.g. chat, files). An AI then reviews everything and proposes a resolution — for example “full payment to freelancer”, “full refund to client”, or a split.
        </p>
        <p className="text-base text-white/80 leading-relaxed">
          You can accept that result or request an appeal for a deeper review. The final decision is stored <ExplainTerm term="on-chain">on-chain</ExplainTerm> and the contract releases funds accordingly.
        </p>
      </>
    ),
  },
  "pay-disputes": {
    title: "Who pays for disputes",
    icon: Coins01Icon,
    body: (
      <>
        <p className="text-base text-white/80 leading-relaxed mb-4">
          When you create a contract, you choose a <ExplainTerm term="dispute fund">dispute fund</ExplainTerm> percentage (e.g. 5–15%) of each milestone. That amount is locked with the rest of the escrow. If a dispute happens, the cost of running the AI is paid from this fund.
        </p>
        <p className="text-base text-white/80 leading-relaxed">
          If you never dispute, the leftover in the dispute fund goes to the freelancer. So the freelancer is not charged for disputes; the reserved amount covers it.
        </p>
      </>
    ),
  },
  "sign-pay": {
    title: "How do we sign and pay",
    icon: ZapIcon,
    body: (
      <>
        <p className="text-base text-white/80 leading-relaxed mb-4">
          You connect with a wallet (we use HOT Wallet). Creating a contract and funding milestones are actions you sign in that wallet; the contract and payments live <ExplainTerm term="on-chain">on-chain</ExplainTerm> in <ExplainTerm term="NEAR tokens">NEAR tokens</ExplainTerm>.
        </p>
        <p className="text-base text-white/80 leading-relaxed">
          The client pays from their wallet into the <ExplainTerm term="escrow">escrow</ExplainTerm>. When they approve a milestone, the contract sends the corresponding amount to the freelancer’s wallet. No manual transfer step — it’s automatic once approved.
        </p>
      </>
    ),
  },
};

const DEMOS: Record<string, React.ReactNode> = {
  ai: <AIDemo />,
  money: <MoneyDemo />,
  disagree: <DisagreeDemo />,
  "pay-disputes": <PayDisputesDemo />,
  "sign-pay": <SignPayDemo />,
};

const SystemExplainer = () => {
  const [activeId, setActiveId] = useState(tabs[0].id);
  const activeContent = content[activeId];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute left-1/2 top-1/4 w-[400px] h-[400px] -translate-x-1/2 rounded-full bg-purple-600/[0.06] blur-[100px] pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <motion.h2
          className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-4 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          How the system works
        </motion.h2>
        <p className="text-center text-white/60 max-w-xl mx-auto mb-14 text-base">
          One-by-one breakdown of each part.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-10 min-h-[420px]"
        >
          <div className="flex lg:flex-col gap-2 shrink-0 lg:w-72 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-left font-medium whitespace-nowrap transition-all border ${
                  activeId === tab.id
                    ? "border-purple-500/25 bg-gradient-to-br from-purple-500/15 to-black text-white"
                    : "border-white/10 text-white/60 hover:border-purple-500/15 hover:bg-purple-500/5 hover:text-white/80"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeId === tab.id
                    ? "bg-gradient-to-br from-purple-500/25 to-purple-800/20 text-purple-300"
                    : "bg-white/10 text-white/70"
                }`}>
                  <HugeiconsIcon icon={tab.icon} size={20} />
                </div>
                <span className="text-sm lg:text-base">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 min-w-0">
              {activeContent && (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-6">{activeContent.title}</h3>
                  {activeContent.body}
                </>
              )}
            </div>
            <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0">
              {DEMOS[activeId]}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SystemExplainer;
