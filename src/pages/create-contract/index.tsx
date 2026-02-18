import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatWalletError } from "@/utils/format-wallet-error";
import { useWallet } from "@/hooks/useWallet";
import { useCreateContract } from "@/hooks/useContract";
import { getStandardPromptHash } from "@/utils/promptHash";
import { isValidNearAccountFormat, nearAccountExists } from "@/utils/nearAccount";
import { AI_MODELS } from "@/types/ai";
import { DISPUTE_FUND_MIN, DISPUTE_FUND_MAX, nearToYocto, fetchNearPrice } from "./utils";
import type { MilestoneForm, UserRole, ModelId } from "./types";
import { PageHeader } from "./left-side/page-header";
import { LeftSide } from "./left-side";
import { RightSide } from "./right-side";
import { ConnectWalletView } from "./connect-wallet-view";

const CreateContractPage = () => {
  const navigate = useNavigate();
  const { isConnected, connect } = useWallet();
  const createMutation = useCreateContract();
  const [userRole, setUserRole] = useState<UserRole>("client");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [counterpartyAddress, setCounterpartyAddress] = useState("");
  const [disputeFundPct, setDisputeFundPct] = useState("10");
  const [selectedModel, setSelectedModel] = useState<ModelId>(AI_MODELS[0].id);
  const [milestones, setMilestones] = useState<MilestoneForm[]>([
    { id: Date.now().toString(), title: "", description: "", amount: "", timelineDays: "" },
  ]);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [promptHash, setPromptHash] = useState<string>("");
  const [aiModelPopoverOpen, setAiModelPopoverOpen] = useState(false);
  const [nearPrice, setNearPrice] = useState<number | null>(null);
  const [counterpartyStatus, setCounterpartyStatus] = useState<
    "idle" | "checking" | "valid" | "invalid" | "bad-format"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkCounterparty = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value) {
      setCounterpartyStatus("idle");
      return;
    }
    if (!isValidNearAccountFormat(value)) {
      setCounterpartyStatus("bad-format");
      return;
    }
    setCounterpartyStatus("checking");
    debounceRef.current = setTimeout(async () => {
      const exists = await nearAccountExists(value);
      setCounterpartyStatus(exists ? "valid" : "invalid");
    }, 600);
  }, []);

  useEffect(() => {
    getStandardPromptHash().then(setPromptHash);
    fetchNearPrice().then(setNearPrice);
  }, []);

  const pct = parseInt(disputeFundPct) || 0;
  const disputeFundValid = pct >= DISPUTE_FUND_MIN && pct <= DISPUTE_FUND_MAX;
  const totalNear = milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
  const selectedModelData = AI_MODELS.find((m) => m.id === selectedModel);

  const addMilestone = () => {
    const id = Date.now().toString();
    setMilestones([...milestones, { id, title: "", description: "", amount: "", timelineDays: "" }]);
    setActiveMilestoneId(id);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((m) => m.id !== id));
    if (activeMilestoneId === id) setActiveMilestoneId(null);
  };

  const updateMilestone = (id: string, field: keyof MilestoneForm, value: string) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Please provide a contract title");
    if (!disputeFundValid)
      return toast.error(`Dispute fund must be ${DISPUTE_FUND_MIN}–${DISPUTE_FUND_MAX}%`);
    if (milestones.some((m) => !m.title || !m.amount))
      return toast.error("All milestones need a title and amount");

    try {
      await createMutation.mutateAsync({
        title,
        description,
        milestones: milestones.map((m) => ({
          title: m.title,
          description: m.description,
          amount: nearToYocto(parseFloat(m.amount)),
        })),
        freelancer: counterpartyAddress || undefined,
        security_deposit_pct: pct,
        prompt_hash: promptHash,
        model_id: selectedModel,
      });

      toast.success("Contract created on-chain!");
      navigate("/contracts");
    } catch (err) {
      toast.error(formatWalletError(err));
    }
  };

  if (!isConnected) {
    return <ConnectWalletView onConnect={connect} />;
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit}>
            <PageHeader title={title} onTitleChange={setTitle} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <LeftSide
                description={description}
                onDescriptionChange={setDescription}
                milestones={milestones}
                activeMilestoneId={activeMilestoneId}
                onActiveMilestoneIdChange={setActiveMilestoneId}
                disputeFundPct={pct}
                nearPrice={nearPrice}
                onAddMilestone={addMilestone}
                onRemoveMilestone={removeMilestone}
                onUpdateMilestone={updateMilestone}
              />
              <RightSide
                userRole={userRole}
                onUserRoleChange={setUserRole}
                counterpartyAddress={counterpartyAddress}
                counterpartyStatus={counterpartyStatus}
                onCounterpartyChange={(v) => {
                  setCounterpartyAddress(v);
                  checkCounterparty(v);
                }}
                disputeFundPct={disputeFundPct}
                disputeFundValid={disputeFundValid}
                onDisputeFundChange={setDisputeFundPct}
                selectedModel={selectedModel}
                selectedModelName={selectedModelData?.name ?? ""}
                aiModelPopoverOpen={aiModelPopoverOpen}
                onAiModelPopoverOpenChange={setAiModelPopoverOpen}
                onSelectModel={setSelectedModel}
                promptHash={promptHash}
                totalNear={totalNear}
                createPending={createMutation.isPending}
                submitDisabled={createMutation.isPending || !disputeFundValid}
              />
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateContractPage;
