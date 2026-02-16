import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  CpuIcon,
} from "@hugeicons/core-free-icons";
import {
  getStandardPromptHash,
  standardPrompt,
} from "@/utils/promptHash";
import OnThisPageSidebar from "./on-this-page-sidebar";
import ArchitectureDiagram from "./architecture-diagram";
import TechStackSection from "./tech-stack-section";
import WhatWhereWhyTable from "./what-where-why-table";
import DisputeFlowDiagramSection from "./dispute-flow-diagram-section";
import AIModelsSection from "./ai-models-section";
import SecuritySection from "./security-section";
import VerifySection from "./verify-section";
import PromptDialog from "./prompt-dialog";

type HugeIcon = React.ComponentProps<typeof HugeiconsIcon>["icon"];

const SectionHeading = ({
  icon: Icon,
  children,
}: {
  icon?: HugeIcon;
  children?: React.ReactNode;
}) => (
  <h2 className="text-3xl font-bold text-white mb-6 flex items-center tracking-tight">
    {Icon && (
      <HugeiconsIcon icon={Icon} size={32} className="mr-3 text-purple-400" />
    )}
    {children}
  </h2>
);

const promptMeta = [
  { key: "standard", title: "Dispute Resolution Prompt", content: standardPrompt },
];

const HowItWorksPage = () => {
  const [promptDialog, setPromptDialog] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    void getStandardPromptHash().then((hash) => {
      setHashes({ standard: hash });
    });
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <OnThisPageSidebar />
      <div className="max-w-7xl mx-auto px-4 py-16 pt-32 space-y-24 lg:pl-56 xl:pl-64">
        <section id="where-everything-lives" className="scroll-mt-28 rounded-3xl">
          <SectionHeading>Where Everything Lives</SectionHeading>
          <p className="text-gray-400 mb-10 max-w-3xl">
            We don&apos;t use a traditional database like typical web apps. Instead, we use a decentralized architecture to ensure no one can manipulate the data or the money.
          </p>
          <div className="mb-10">
            <ArchitectureDiagram />
          </div>
          <TechStackSection />
          <WhatWhereWhyTable />
        </section>

        <section id="disagreement" className="scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <SectionHeading icon={Shield01Icon}>
                What happens when there&apos;s a disagreement
              </SectionHeading>
              <p className="text-gray-400 max-w-2xl">
                The client can raise a dispute on any milestone submitted for review. The AI analyzes the situation in a single comprehensive pass, and the smart contract verifies the decision cryptographically. No waiting for support tickets.
              </p>
            </div>
            <div className="mt-4 md:mt-0 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300 text-sm font-medium">
              Powered by NEAR AI
            </div>
          </div>
          <DisputeFlowDiagramSection />
          <div className="mt-6 rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.04] to-transparent px-5 py-4">
            <h4 className="mb-1.5 text-sm font-semibold text-white">Privacy: what the AI sees</h4>
            <p className="text-xs leading-relaxed text-gray-400">
              Before anything is sent to the AI, all personal information is removed. Your NEAR account becomes &quot;Party A&quot; or &quot;Party B&quot;. Emails, phone numbers, URLs, and any identifying info are replaced with placeholders. The AI judges the situation without knowing who you are.
            </p>
          </div>
        </section>

        <section id="which-ai" className="scroll-mt-28">
          <SectionHeading icon={CpuIcon}>Which AI handles your dispute</SectionHeading>
          <p className="text-gray-400 mb-10">
            Contract creators choose the dispute resolution model when creating the contract. All models run inside TEE hardware — every response is Ed25519-signed and verified on-chain.
          </p>
          <AIModelsSection />
        </section>

        <section id="trust-the-system" className="scroll-mt-28">
          <SectionHeading icon={Shield01Icon}>Why you can trust the system</SectionHeading>
          <p className="text-gray-400 mb-10">
            You don&apos;t have to trust us. The smart contract holds the money, the TEE signs the AI responses, and everything is on-chain. Here&apos;s how each piece is secured.
          </p>
          <SecuritySection />
        </section>

        <section id="verify" className="scroll-mt-28">
          <SectionHeading>Don&apos;t trust — verify</SectionHeading>
          <p className="text-gray-400 mb-10">
            Everything in Nescrowee is designed to be independently verifiable. Here&apos;s how you can check for yourself.
          </p>
          <VerifySection
            promptMeta={promptMeta}
            hashes={hashes}
            onViewPrompt={(title, content) => setPromptDialog({ title, content })}
          />
        </section>
      </div>

      <PromptDialog
        open={!!promptDialog}
        onOpenChange={(open) => !open && setPromptDialog(null)}
        title={promptDialog?.title ?? ""}
        content={promptDialog?.content ?? ""}
      />
    </div>
  );
};

export default HowItWorksPage;
