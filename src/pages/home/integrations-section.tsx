import { motion } from "framer-motion";

const integrations = [
  {
    name: "NEAR Protocol",
    track: "Only on NEAR",
    why: "Smart contract escrow, on-chain dispute resolution, and NEAR Social DB for decentralized chat. Everything verifiable, nothing hidden.",
    logo: "/near-logo.png",
    big: true,
  },
  {
    name: "HOT Kit",
    track: "HOT Ecosystem",
    why: "Multi-wallet connector supporting HOT Wallet, MyNearWallet, Meteor, and more. One integration, every NEAR wallet.",
    logo: "/hot-logo.svg",
    big: false,
  },
  {
    name: "NEAR AI Cloud",
    track: "AI That Works For You",
    why: "Dispute AI runs inside TEE hardware. Every response is Ed25519-signed and verified on-chain. Unbribable judge.",
    logo: null,
    big: false,
  },
  {
    name: "HOT Pay",
    track: "HOT Pay",
    why: "Pay from any chain, settled on NEAR. Fund escrow with USDC, ETH, BNB, and 30+ tokens via OmniBridge.",
    logo: null,
    big: false,
  },
  {
    name: "NOVA",
    track: "Private Web",
    why: "Encrypted evidence vaults. Files are encrypted client-side, stored on NOVA, and only decryptable by contract parties and AI.",
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
              <div className="flex items-center gap-2 mb-2">
                {item.logo ? (
                  <img src={item.logo} alt="" className={`object-contain opacity-90 ${item.big ? "h-12 md:h-14" : "h-8 w-auto"}`} />
                ) : (
                  <div className={`rounded-xl bg-white/10 shrink-0 ${item.big ? "w-12 h-12 md:w-14 md:h-14" : "w-8 h-8"}`} />
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                  {item.track}
                </span>
              </div>
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
