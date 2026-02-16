import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Database01Icon,
  BubbleChatIcon,
  GlobeIcon,
  CpuIcon,
  ToggleOffIcon,
  ToggleOnIcon,
} from "@hugeicons/core-free-icons";

const TechRow = ({
  icon: Icon,
  title,
  simpleDesc,
  techDesc,
  isTechnical,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  simpleDesc: string;
  techDesc: string;
  isTechnical: boolean;
}) => (
  <div className="group relative overflow-hidden rounded-xl bg-surface border border-white/5 hover:border-primary/30 transition-all duration-300">
    <div className="p-6 flex items-start space-x-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
        <HugeiconsIcon icon={Icon} size={24} className="text-primary" />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <div className="relative">
          <p
            className={`text-gray-400 leading-relaxed transition-all duration-500 ${isTechnical ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
          >
            {simpleDesc}
          </p>
          <div
            className={`transition-all duration-500 ${isTechnical ? "opacity-100" : "opacity-0 h-0 overflow-hidden translate-y-4"}`}
          >
            <p className="text-gray-400 font-mono text-sm leading-relaxed text-primary/80">
              <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">
                Technical Spec
              </span>
              {techDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TechStackSection = () => {
  const [isTechnical, setIsTechnical] = useState(false);
  return (
    <div className="w-full">
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={() => setIsTechnical(!isTechnical)}
          className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>
            {isTechnical ? "Switch to Simple View" : "Show Technical Details"}
          </span>
          {isTechnical ? (
            <HugeiconsIcon icon={ToggleOnIcon} size={24} className="text-primary" />
          ) : (
            <HugeiconsIcon icon={ToggleOffIcon} size={24} className="text-gray-600" />
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechRow
          icon={Database01Icon}
          title="The Money (Escrow)"
          simpleDesc="The money is held safely in a digital vault. We don't touch it, and you don't touch it until the work is approved."
          techDesc="Funds are held in the Rust smart contract state on the NEAR blockchain. No middleware. Logic controls release."
          isTechnical={isTechnical}
        />
        <TechRow
          icon={CpuIcon}
          title="The Judge (AI)"
          simpleDesc="An unbiased AI reviews the evidence if there is a problem. It works inside a secure 'black box' so no one can tamper with it."
          techDesc="Inference runs in a TEE (Trusted Execution Environment) on NEAR AI Cloud. Responses are Ed25519 signed and verified on-chain."
          isTechnical={isTechnical}
        />
        <TechRow
          icon={BubbleChatIcon}
          title="The Chat"
          simpleDesc="Messages are stored on the open web, not on our private servers. We just organize them for the AI to read."
          techDesc="Chat history is fetched from NEAR Social (SocialDB contract). Frontend aggregates this for the context window."
          isTechnical={isTechnical}
        />
        <TechRow
          icon={GlobeIcon}
          title="The App"
          simpleDesc="The website you see is just a remote control. It talks directly to the blockchain from your computer."
          techDesc="Client-side React app. No backend database. Direct RPC calls to smart contracts and NEAR AI endpoints."
          isTechnical={isTechnical}
        />
      </div>
    </div>
  );
};

export default TechStackSection;
