import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Delete01Icon,
  ArrowRight01Icon,
  Copy01Icon,
  Link01Icon,
  UserCheck01Icon,
  UserGroupIcon,
  Wallet01Icon,
  Shield01Icon,
  AiBrain01Icon,
  InformationCircleIcon,
  StarIcon,
  LockIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";
import { useCreateContract } from "@/hooks/useContract";
import { getStandardPromptHash } from "@/utils/promptHash";
import { isValidNearAccountFormat, nearAccountExists } from "@/utils/nearAccount";
import { AI_MODELS } from "@/types/ai";

type ModelId = typeof AI_MODELS[number]["id"];

interface MilestoneForm {
  title: string;
  description: string;
  amount: string;
  deadline: string;
}

type UserRole = "client" | "freelancer";

const DISPUTE_FUND_MIN = 5;
const DISPUTE_FUND_MAX = 30;

const nearToYocto = (near: number) => {
  return (BigInt(Math.round(near * 1e6)) * BigInt(1e18)).toString();
};

function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <HugeiconsIcon
          key={i}
          icon={StarIcon}
          size={10}
          className={i < stars ? "text-warning" : "text-muted-foreground/25"}
        />
      ))}
    </div>
  );
}

async function fetchNearPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd",
      { signal: AbortSignal.timeout(3000) }
    );
    const data = await res.json();
    return data?.near?.usd ?? null;
  } catch {
    return null;
  }
}

const MODEL_COST_LABEL: Record<string, string> = {
  "Qwen/Qwen3-30B-A3B": "~$0.003 / dispute · ~$0.01 / appeal",
  "openai/gpt-oss-120b": "~$0.005 / dispute · ~$0.015 / appeal",
  "deepseek-ai/DeepSeek-V3.1": "~$0.02 / dispute · ~$0.08 / appeal",
  "THUDM/GLM-4.1V-9B-Thinking": "~$0.003 / dispute · ~$0.01 / appeal",
};

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
    { title: "", description: "", amount: "", deadline: "" },
  ]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [promptHash, setPromptHash] = useState<string>("");
  const [nearPrice, setNearPrice] = useState<number | null>(null);
  const [counterpartyStatus, setCounterpartyStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "bad-format">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkCounterparty = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value) { setCounterpartyStatus("idle"); return; }
    if (!isValidNearAccountFormat(value)) { setCounterpartyStatus("bad-format"); return; }
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
  const disputeFundNear = totalNear * (pct / 100);
  const totalUsd = nearPrice ? totalNear * nearPrice : null;
  const selectedModelData = AI_MODELS.find((m) => m.id === selectedModel);

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", amount: "", deadline: "" }]);
  };

  const removeMilestone = (i: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, idx) => idx !== i));
  };

  const updateMilestone = (i: number, field: keyof MilestoneForm, value: string) => {
    const updated = [...milestones];
    updated[i] = { ...updated[i], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Please provide a contract title");
    if (!disputeFundValid) return toast.error(`Dispute fund must be ${DISPUTE_FUND_MIN}–${DISPUTE_FUND_MAX}%`);
    if (milestones.some((m) => !m.title || !m.amount)) return toast.error("All milestones need a title and amount");

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

      if (!counterpartyAddress) {
        const token = Math.random().toString(36).substring(2, 10);
        setInviteLink(`${window.location.origin}/invite/${token}`);
        toast.success("Contract created! Share the invite link.");
      } else {
        toast.success("Contract created on-chain!");
        navigate("/contracts");
      }
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto mt-20">
            <HugeiconsIcon icon={Wallet01Icon} size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">Connect HOT Wallet to create a contract.</p>
            <Button variant="hero" size="lg" onClick={connect}>Connect Wallet</Button>
          </div>
        </div>
      </div>
    );
  }

  if (inviteLink) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center"
          >
            <HugeiconsIcon icon={Link01Icon} size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Contract Created On-Chain</h2>
            <p className="text-muted-foreground mb-6">
              Share this invite link. The counterparty connects their HOT Wallet to join.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border max-w-md mx-auto mb-6">
              <code className="text-sm text-primary font-mono flex-1 truncate">{inviteLink}</code>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success("Copied!"); }}>
                <HugeiconsIcon icon={Copy01Icon} size={16} />
              </Button>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="hero" onClick={() => navigate("/contracts")}>Go to Contracts</Button>
              <Button variant="ghost" onClick={() => setInviteLink(null)}>Edit</Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-8">Create Contract</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6 items-start">
              {/* Left: title + description + milestones */}
              <div className="space-y-5">
                <div>
                  <Label htmlFor="title" className="text-base font-semibold">Contract Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Website Redesign"
                    className="mt-2 text-lg h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="desc" className="text-base font-semibold">Description</Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Scope of work, deliverables, timeline, acceptance criteria..."
                    className="mt-2 resize-none min-h-[120px]"
                  />
                </div>

                {/* Milestones */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Milestones *</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={addMilestone}>
                      <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-1" /> Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Each milestone is funded and released independently. Client funds → freelancer works → client approves or disputes.
                  </p>

                  {milestones.map((m, i) => (
                    <motion.div
                      key={i}
                      className="p-4 rounded-xl bg-card border border-border space-y-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Top row: label + date + delete */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide flex-1">
                          Milestone {i + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-muted-foreground" />
                          <Input
                            type="date"
                            value={m.deadline}
                            onChange={(e) => updateMilestone(i, "deadline", e.target.value)}
                            className="text-xs h-7 w-36 px-2"
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        {milestones.length > 1 && (
                          <button type="button" onClick={() => removeMilestone(i)} className="text-muted-foreground hover:text-destructive transition-colors ml-0.5">
                            <HugeiconsIcon icon={Delete01Icon} size={14} />
                          </button>
                        )}
                      </div>

                      {/* Title + Amount */}
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          className="col-span-2"
                          placeholder="Title *"
                          value={m.title}
                          onChange={(e) => updateMilestone(i, "title", e.target.value)}
                        />
                        <Input
                          placeholder="NEAR *"
                          type="number"
                          step="0.01"
                          min="0"
                          value={m.amount}
                          onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                          className="font-mono"
                        />
                      </div>

                      {/* Description: 2 rows */}
                      <Textarea
                        placeholder="Description / acceptance criteria"
                        value={m.description}
                        onChange={(e) => updateMilestone(i, "description", e.target.value)}
                        rows={2}
                        className="resize-none text-sm"
                      />

                      {m.amount && parseFloat(m.amount) > 0 && (
                        <div className="text-[10px] font-mono text-muted-foreground flex flex-wrap gap-3">
                          <span className="text-foreground font-semibold">{parseFloat(m.amount).toFixed(2)} NEAR</span>
                          <span>· {(parseFloat(m.amount) * pct / 100).toFixed(3)} NEAR dispute fund</span>
                          {nearPrice && <span>· ≈${(parseFloat(m.amount) * nearPrice).toFixed(0)} USD</span>}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: settings */}
              <div className="space-y-5 p-6 rounded-2xl bg-card border border-border">
                {/* Role */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">I am the</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={userRole === "client" ? "hero" : "outline"} size="sm" className="flex-1" onClick={() => setUserRole("client")}>
                      <HugeiconsIcon icon={UserCheck01Icon} size={14} className="mr-1" /> Client
                    </Button>
                    <Button type="button" variant={userRole === "freelancer" ? "hero" : "outline"} size="sm" className="flex-1" onClick={() => setUserRole("freelancer")}>
                      <HugeiconsIcon icon={UserGroupIcon} size={14} className="mr-1" /> Freelancer
                    </Button>
                  </div>
                </div>

                {/* Counterparty */}
                <div>
                  <Label className="text-sm font-medium">
                    {userRole === "client" ? "Freelancer" : "Client"} wallet
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      value={counterpartyAddress}
                      onChange={(e) => {
                        setCounterpartyAddress(e.target.value);
                        checkCounterparty(e.target.value);
                      }}
                      placeholder="alice.near or leave empty → invite link"
                      className={`font-mono text-sm pr-8 ${
                        counterpartyStatus === "valid" ? "border-success" :
                        counterpartyStatus === "invalid" || counterpartyStatus === "bad-format" ? "border-destructive" : ""
                      }`}
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs">
                      {counterpartyStatus === "checking" && (
                        <span className="text-muted-foreground animate-pulse">…</span>
                      )}
                      {counterpartyStatus === "valid" && (
                        <span className="text-success font-mono">✓</span>
                      )}
                      {(counterpartyStatus === "invalid" || counterpartyStatus === "bad-format") && (
                        <span className="text-destructive font-mono">✗</span>
                      )}
                    </div>
                  </div>
                  {counterpartyStatus === "bad-format" && (
                    <p className="text-[10px] text-destructive mt-1">
                      Use format: alice.near / alice.testnet / 64-char hex
                    </p>
                  )}
                  {counterpartyStatus === "invalid" && (
                    <p className="text-[10px] text-destructive mt-1">
                      Account not found on {import.meta.env.VITE_NEAR_NETWORK || "testnet"}
                    </p>
                  )}
                  {counterpartyStatus === "valid" && (
                    <p className="text-[10px] text-success mt-1">Account verified on-chain ✓</p>
                  )}
                  {counterpartyStatus === "idle" && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Leave empty to generate an invite link instead
                    </p>
                  )}
                </div>

                {/* Dispute Fund */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Shield01Icon} size={14} className="text-primary" />
                    <Label className="text-sm font-medium">Dispute Fund</Label>
                    <HugeiconsIcon icon={InformationCircleIcon} size={13} className="text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Reserved from each funded milestone. Pays for TEE-verified AI investigation.
                    Leftover always goes to the freelancer.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        value={disputeFundPct}
                        onChange={(e) => setDisputeFundPct(e.target.value)}
                        min={DISPUTE_FUND_MIN}
                        max={DISPUTE_FUND_MAX}
                        className={`font-mono pr-6 ${!disputeFundValid && disputeFundPct ? "border-destructive" : ""}`}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                    <div className="flex gap-1">
                      {["5", "10", "15"].map((v) => (
                        <button key={v} type="button" onClick={() => setDisputeFundPct(v)}
                          className={`px-2 py-1 text-xs rounded font-mono transition-all ${disputeFundPct === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                          {v}%
                        </button>
                      ))}
                    </div>
                  </div>
                  {!disputeFundValid && disputeFundPct && (
                    <p className="text-[11px] text-destructive">Minimum {DISPUTE_FUND_MIN}%, maximum {DISPUTE_FUND_MAX}%</p>
                  )}
                  {disputeFundValid && totalNear > 0 && (
                    <p className="text-[11px] font-mono text-primary">
                      {disputeFundNear.toFixed(3)} NEAR reserved · covers ~{Math.floor(disputeFundNear / 0.001).toLocaleString()} standard disputes
                    </p>
                  )}
                </div>

                {/* AI Dispute Model */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={AiBrain01Icon} size={14} className="text-primary" />
                    <Label className="text-sm font-medium">AI Dispute Model</Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Standard disputes run 2 rounds. Appeals escalate to DeepSeek V3.1 (deeper agentic logic, more steps).
                    All models run in TEE — signatures are verified on-chain.
                  </p>
                  <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as ModelId)}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {selectedModelData && (
                          <div className="flex items-center gap-2">
                            <span>{selectedModelData.name}</span>
                            <StarRating stars={selectedModelData.stars} />
                            <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                              {MODEL_COST_LABEL[selectedModel]}
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col gap-0.5 py-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{model.name}</span>
                              <StarRating stars={model.stars} />
                            </div>
                            <div className="flex gap-2 text-[10px] text-muted-foreground font-mono flex-wrap">
                              <span>{model.use_case}</span>
                              <span>·</span>
                              <span>{MODEL_COST_LABEL[model.id]}</span>
                              <span>·</span>
                              <span>{model.speed}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {promptHash && (
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-[10px] font-mono text-muted-foreground truncate">{promptHash.slice(0, 32)}…</code>
                      <a href="/disputes" className="text-[10px] text-primary hover:underline whitespace-nowrap">How disputes work →</a>
                    </div>
                  )}
                </div>

                {/* Feature badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-success bg-success/8 border border-success/15 px-2.5 py-1.5 rounded-lg">
                    <HugeiconsIcon icon={LockIcon} size={12} />
                    Private AI — identity scrubbed
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-orange-400 bg-orange-500/8 border border-orange-500/15 px-2.5 py-1.5 rounded-lg">
                    <span className="font-bold text-[10px]">H</span>
                    HOT Pay — fund with any token
                  </span>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <div className="text-right">
                      <span className="font-mono font-bold">{totalNear.toFixed(2)} NEAR</span>
                      {totalUsd !== null && (
                        <span className="text-xs text-muted-foreground ml-1.5">≈${totalUsd.toFixed(0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dispute fund</span>
                    <span className="font-mono text-xs">{pct}% · {disputeFundNear.toFixed(3)} NEAR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">AI model</span>
                    <span className="font-mono text-xs">{selectedModelData?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Milestones</span>
                    <span className="font-mono">{milestones.length}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                    Gas ~$0.001/action, paid by your wallet automatically.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={createMutation.isPending || !disputeFundValid}
                >
                  {createMutation.isPending
                    ? "Creating on-chain…"
                    : counterpartyAddress
                    ? "Create Contract"
                    : "Create & Get Invite Link"}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateContractPage;
