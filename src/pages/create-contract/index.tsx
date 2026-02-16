import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  ZapIcon,
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

              <div className="w-full max-w-lg mx-auto flex flex-col font-sans text-white relative overflow-hidden rounded-[40px] shadow-2xl border border-white/20 bg-black/40 backdrop-blur-2xl">
                <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="p-8 pb-4 relative z-10 flex justify-between items-end">
                  <div>
                    <div className="text-sm font-medium text-white/50 mb-1 tracking-wide">Nescrowee</div>
                    <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">New Contract</h2>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 relative z-10">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60 ml-2">I am the</label>
                    <div className="bg-white/10 p-1 rounded-full flex relative backdrop-blur-md border border-white/10">
                      <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/20 rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${userRole === "freelancer" ? "left-[calc(50%+2px)]" : "left-1"}`}
                      />
                      <button
                        type="button"
                        onClick={() => setUserRole("client")}
                        className={`flex-1 py-3 text-sm font-medium relative z-10 transition-colors ${userRole === "client" ? "text-white" : "text-white/40"}`}
                      >
                        Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserRole("freelancer")}
                        className={`flex-1 py-3 text-sm font-medium relative z-10 transition-colors ${userRole === "freelancer" ? "text-white" : "text-white/40"}`}
                      >
                        Freelancer
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60 ml-2">Freelancer wallet (optional)</label>
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                      <input
                        type="text"
                        value={counterpartyAddress}
                        onChange={(e) => {
                          setCounterpartyAddress(e.target.value);
                          checkCounterparty(e.target.value);
                        }}
                        placeholder="alice.near or leave empty → invite link"
                        className={`relative w-full bg-white/5 border rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)] font-mono text-sm ${
                          counterpartyStatus === "valid" ? "border-green-500/50" : counterpartyStatus === "invalid" || counterpartyStatus === "bad-format" ? "border-red-500/50" : "border-white/10"
                        }`}
                      />
                    </div>
                    {counterpartyStatus === "bad-format" && (
                      <p className="text-xs text-red-400 ml-2">Use format: alice.near / alice.testnet</p>
                    )}
                    {counterpartyStatus === "invalid" && (
                      <p className="text-xs text-red-400 ml-2">Account not found on {import.meta.env.VITE_NEAR_NETWORK || "testnet"}</p>
                    )}
                    {counterpartyStatus === "valid" && (
                      <p className="text-xs text-green-400 ml-2">Account verified on-chain ✓</p>
                    )}
                    {counterpartyStatus === "idle" && (
                      <p className="text-xs text-white/40 ml-2 flex items-center gap-1">
                        <HugeiconsIcon icon={InformationCircleIcon} size={12} /> Leave empty to generate an invite link instead
                      </p>
                    )}
                  </div>
                  <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 backdrop-blur-md">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Dispute Fund</h3>
                        <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-[200px]">
                          Reserved from each funded milestone. Pays for TEE-verified AI investigation.
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-light text-white">{disputeFundPct}%</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {[5, 10, 15].map((pctVal) => (
                        <button
                          key={pctVal}
                          type="button"
                          onClick={() => setDisputeFundPct(String(pctVal))}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${disputeFundPct === String(pctVal) ? "bg-white text-black shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                        >
                          {pctVal}%
                        </button>
                      ))}
                    </div>
                    {!disputeFundValid && disputeFundPct && (
                      <p className="text-[10px] text-red-400 text-center">Minimum {DISPUTE_FUND_MIN}%, maximum {DISPUTE_FUND_MAX}%</p>
                    )}
                    <p className="text-[10px] text-white/30 text-center">Leftover always goes to the freelancer.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="ml-2">
                      <h3 className="text-lg font-bold text-white">AI Dispute Model</h3>
                      <p className="text-xs text-white/50 mt-1">Standard disputes run 2 rounds. Appeals escalate to DeepSeek V3.1.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {AI_MODELS.map((model) => {
                        const isSelected = selectedModel === model.id;
                        return (
                          <div
                            key={model.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedModel(model.id)}
                            onKeyDown={(e) => e.key === "Enter" && setSelectedModel(model.id)}
                            className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? "bg-white/10 border-white/40 shadow-lg" : "bg-transparent border-white/5 hover:bg-white/5"}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-white">{model.name}</span>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />}
                            </div>
                            <div className="text-xs text-white/40">{MODEL_COST_LABEL[model.id] ?? "—"}</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-white/30 ml-2 flex items-center gap-1">
                      <HugeiconsIcon icon={Shield01Icon} size={10} /> All models run in TEE — signatures verified on-chain.
                    </p>
                  </div>
                  {promptHash && (
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                          <HugeiconsIcon icon={InformationCircleIcon} size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-mono text-white/40">{promptHash.slice(0, 16)}...</div>
                          <a href="/how-it-works" className="text-xs text-white font-medium mt-0.5 hover:underline">How it works →</a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/10 z-20">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div>
                      <div className="text-white/40 mb-1">Total Value</div>
                      <div className="text-lg font-bold text-white">{totalNear.toFixed(2)} NEAR <span className="text-white/30 text-sm font-normal">≈${totalUsd != null ? totalUsd.toFixed(0) : "0"}</span></div>
                    </div>
                    <div>
                      <div className="text-white/40 mb-1">Dispute Fund</div>
                      <div className="text-white">{pct}% · {disputeFundNear.toFixed(3)} NEAR</div>
                    </div>
                    <div>
                      <div className="text-white/40 mb-1">AI Model</div>
                      <div className="text-white">{selectedModelData?.name}</div>
                    </div>
                    <div>
                      <div className="text-white/40 mb-1">Milestones</div>
                      <div className="text-white">{milestones.length}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30 mb-4 bg-black/20 p-2 rounded-lg">
                    <HugeiconsIcon icon={ZapIcon} size={10} className="text-yellow-400" />
                    Gas ~$0.001/action, paid by your wallet automatically.
                  </div>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !disputeFundValid}
                    className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {createMutation.isPending ? "Creating on-chain…" : counterpartyAddress ? "Deploy Contract" : "Create Invite"}
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateContractPage;
