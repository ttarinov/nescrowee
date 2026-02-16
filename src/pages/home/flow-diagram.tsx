import { motion } from "framer-motion";

const mainSteps = [
  { id: "sign", label: "Sign contract", sub: "Milestones and terms" },
  { id: "fund", label: "Client funds escrow", sub: "Money is locked" },
  { id: "work", label: "Work and deliver", sub: "Freelancer completes work" },
  { id: "decide", label: "Approve or dispute", sub: "Client decides" },
];

const FlowDiagram = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="relative overflow-hidden rounded-[40px] border border-white/20 bg-black/40 backdrop-blur-2xl shadow-2xl p-8 md:p-10"
  >
    <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
    <div className="relative z-10">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {mainSteps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center min-w-[110px] md:min-w-[130px]">
              <div className="text-xs font-mono text-white/50 mb-0.5">Step {i + 1}</div>
              <div className="text-sm font-bold text-white">{step.label}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{step.sub}</div>
            </div>
            {i < mainSteps.length - 1 && (
              <div className="hidden md:block w-3 h-0.5 bg-white/20 flex-shrink-0 mx-0.5" aria-hidden />
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col md:flex-row justify-center gap-6 md:gap-8">
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-mono text-green-400/90 mb-1">All good</div>
          <div className="text-sm font-bold text-white mb-0.5">Client approves</div>
          <div className="text-[10px] text-white/40">Money released to freelancer</div>
        </div>
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="text-xs font-mono text-amber-400/90 mb-1">Dispute</div>
          <div className="text-sm font-bold text-white">Client disputes</div>
          <ul className="space-y-1.5 text-[11px] text-white/60">
            <li><span className="text-white/80">Where AI gets info:</span> Chat and evidence you provide</li>
            <li><span className="text-white/80">Where the AI runs:</span> In secure cloud (TEE)</li>
            <li><span className="text-white/80">How it’s paid:</span> From the dispute fund — a small % of each milestone, already locked</li>
            <li><span className="text-white/80">Where the result lives:</span> Decision stored on the same public ledger so everyone can verify</li>
          </ul>
        </div>
      </div>
    </div>
  </motion.div>
);

export default FlowDiagram;
