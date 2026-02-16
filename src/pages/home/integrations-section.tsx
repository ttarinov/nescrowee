import { motion } from "framer-motion";

const integrations = [
  {
    name: "NEAR",
    why: "Holds the escrow and contract rules. Transparent and unstoppable.",
    logo: "/near-logo.png",
    big: true,
  },
  {
    name: "HOT Wallet",
    why: "Easy sign-in and payments. No seed phrases to manage.",
    logo: "/hot-logo.svg",
    big: false,
  },
  {
    name: "NEAR AI Cloud",
    why: "Runs the dispute AI in secure hardware (TEE). Every answer is signed and verifiable.",
    logo: null,
    big: false,
  },
  {
    name: "HOT Pay",
    why: "Fund escrow from 30+ chains. Pay with USDC, ETH, and more.",
    logo: null,
    big: false,
  },
  {
    name: "NOVA",
    why: "Encrypted storage for evidence files. AI can read them without exposing them.",
    logo: null,
    big: false,
  },
];

const IntegrationsSection = () => (
  <section className="py-16 md:py-20">
    <div className="container mx-auto px-4">
      <motion.h2
        className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4 text-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Integrations
      </motion.h2>
      <p className="text-center text-white/60 max-w-xl mx-auto mb-10 text-sm">
        What we build with and why.
      </p>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 md:grid-rows-2 md:auto-rows-fr">
        {integrations.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`relative overflow-hidden rounded-[24px] bg-black/40 backdrop-blur-2xl p-6 md:p-8 shadow-xl hover:bg-black/50 transition-colors ${
              item.big ? "md:row-span-2 md:min-h-[320px] flex flex-col justify-center" : "min-h-[140px] flex flex-col justify-center"
            }`}
          >
            {item.big && (
              <>
                <div className="absolute top-[-80px] right-[-80px] w-[200px] h-[200px] bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-60px] left-[-60px] w-[160px] h-[160px] bg-purple-500/15 rounded-full blur-[60px] pointer-events-none" />
              </>
            )}
            <div className="relative z-10">
              {item.logo ? (
                <img src={item.logo} alt="" className={`object-contain opacity-90 ${item.big ? "h-12 md:h-14 mb-4" : "h-8 w-auto mb-3"}`} />
              ) : (
                <div className={`rounded-xl bg-white/10 shrink-0 ${item.big ? "w-12 h-12 md:w-14 md:h-14 mb-4" : "w-8 h-8 mb-3"}`} />
              )}
              <div className={`font-bold text-white ${item.big ? "text-xl md:text-2xl mb-2" : "text-base mb-1"}`}>{item.name}</div>
              <div className={`text-white/60 ${item.big ? "text-sm md:text-base leading-relaxed" : "text-xs"}`}>{item.why}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default IntegrationsSection;
