import { useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileEditIcon,
  Wallet03Icon,
  LegalHammerIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  AiBrain01Icon,
  BalanceScaleIcon,
  ThumbsUpIcon,
  Clock01Icon,
  CoinsDollarIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

function FlowCard({
  icon,
  title,
  description,
  number,
  variant = "default",
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
  title: string;
  description: string;
  number?: number;
  variant?: "default" | "purple" | "success" | "dispute" | "ai" | "warning";
}) {
  const variantStyles = {
    default:
      "border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-black",
    purple:
      "border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] to-purple-900/[0.04]",
    success:
      "border-purple-400/20 bg-gradient-to-br from-purple-400/[0.06] to-emerald-500/[0.04]",
    dispute:
      "border-purple-500/25 bg-gradient-to-br from-purple-600/[0.1] to-rose-500/[0.04]",
    ai: "border-purple-400/25 bg-gradient-to-br from-purple-500/[0.1] to-violet-600/[0.06]",
    warning:
      "border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] to-amber-500/[0.03]",
  };

  const iconStyles = {
    default: "from-purple-500/20 to-purple-900/30 text-purple-300",
    purple: "from-purple-500/20 to-purple-700/15 text-purple-300",
    success: "from-purple-400/15 to-emerald-500/10 text-purple-300",
    dispute: "from-purple-500/20 to-rose-500/10 text-purple-300",
    ai: "from-purple-400/20 to-violet-500/15 text-purple-200",
    warning: "from-purple-500/15 to-amber-500/10 text-purple-300",
  };

  return (
    <div
      className={cn(
        "relative flex w-full max-w-[520px] flex-row items-start gap-5 rounded-2xl border px-7 py-6 text-left transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/30",
        variantStyles[variant]
      )}
    >
      {number !== undefined && (
        <div className="absolute -top-3 left-6 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-purple-800/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-purple-300">
          {number}
        </div>
      )}
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
          iconStyles[variant]
        )}
      >
        <HugeiconsIcon icon={icon} size={26} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="mb-2 text-base font-semibold text-[hsl(var(--foreground))]">
          {title}
        </h4>
        <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      </div>
    </div>
  );
}

function Arrow({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center py-1", className)}>
      <div className="h-5 w-px bg-gradient-to-b from-purple-500/30 to-purple-500/10" />
      {label && (
        <span className="my-1.5 whitespace-nowrap rounded-full border border-purple-500/20 bg-purple-500/[0.06] px-3 py-0.5 text-[10px] font-medium text-purple-300/80">
          {label}
        </span>
      )}
      <div className="h-5 w-px bg-gradient-to-b from-purple-500/10 to-purple-500/30" />
      <svg
        width="10"
        height="6"
        viewBox="0 0 10 6"
        className="text-purple-500/40"
      >
        <path d="M5 6L0 0H10L5 6Z" fill="currentColor" />
      </svg>
    </div>
  );
}

function SplitBranch({
  label,
  leftLabel,
  rightLabel,
  left,
  right,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="h-5 w-px bg-purple-500/30" />
      <span className="my-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-600/15 to-purple-800/15 px-4 py-1 text-xs font-semibold text-purple-300">
        {label}
      </span>
      <div className="h-3 w-px bg-purple-500/20" />
      <div className="relative w-full max-w-[1100px]">
        <div className="absolute left-1/4 right-1/4 top-0 h-px bg-purple-500/20" />
        <div className="absolute left-1/4 top-0 h-3 w-px bg-purple-500/20" />
        <div className="absolute right-1/4 top-0 h-3 w-px bg-purple-500/20" />
      </div>
      <div className="mt-3 grid w-full max-w-[1100px] grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <span className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-purple-300/70">
            {leftLabel}
          </span>
          {left}
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-purple-300/70">
            {rightLabel}
          </span>
          {right}
        </div>
      </div>
    </div>
  );
}

export function HowItWorksFlow() {
  const [showDispute, setShowDispute] = useState(true);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-purple-800/[0.04] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
            How it works
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            From handshake to payment, fully protected
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            Every step lives on the NEAR blockchain. Your money is held by a
            smart contract &mdash; not a company. If something goes wrong, AI
            resolves disputes in minutes, not weeks.
          </p>
          <Link
            to="/how-it-works"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 transition-colors hover:text-purple-300"
          >
            Read the full breakdown
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Link>
        </div>

        <div className="mb-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setShowDispute(false)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200",
              !showDispute
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/20"
                : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            Happy path
          </button>
          <button
            onClick={() => setShowDispute(true)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200",
              showDispute
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/20"
                : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            With dispute
          </button>
        </div>

        <div className="flex flex-col items-center">
          <FlowCard
            number={1}
            icon={FileEditIcon}
            title="Create a contract"
            description="Client describes the job, breaks it into milestones with clear deliverables and amounts in NEAR."
            variant="purple"
          />

          <Arrow label="contract saved on-chain" />

          <FlowCard
            number={2}
            icon={Wallet03Icon}
            title="Client funds the escrow"
            description="Client sends NEAR to the smart contract. The money is locked &mdash; nobody can touch it until the milestone is approved."
            variant="purple"
          />

          <Arrow label="money locked in smart contract" />

          <FlowCard
            number={3}
            icon={LegalHammerIcon}
            title="Freelancer does the work"
            description="Freelancer picks up the milestone, does the work, and submits it for review. Chat happens on NEAR Social &mdash; also on-chain."
            variant="default"
          />

          <Arrow label="work submitted for review" />

          <FlowCard
            number={4}
            icon={CheckmarkCircle02Icon}
            title="Client reviews the work"
            description="Client looks at the delivered work. If everything looks good, they approve. If not, they can raise a dispute."
            variant="default"
          />

          <SplitBranch
            label="Is the client happy?"
            leftLabel="Yes &mdash; approved"
            rightLabel="No &mdash; dispute"
            left={
              <div className="flex flex-col items-center">
                <FlowCard
                  icon={CoinsDollarIcon}
                  title="Money released, job complete"
                  description="Smart contract instantly sends the milestone payment to the freelancer. No middleman, no delay. Done."
                  variant="success"
                />
              </div>
            }
            right={
              showDispute ? (
                <div className="flex flex-col items-center">
                  <FlowCard
                    icon={AlertCircleIcon}
                    title="Dispute raised"
                    description="Either party explains the problem. The reason is saved on-chain. Milestone is frozen."
                    variant="dispute"
                  />
                  <Arrow label="smart contract calls AI" />
                  <FlowCard
                    icon={AiBrain01Icon}
                    title="AI investigates"
                    description="The smart contract triggers NEAR AI. The AI reads the contract, milestones, and chat, then runs 2-3 rounds of analysis &mdash; all signed by secure hardware (TEE)."
                    variant="ai"
                  />
                  <Arrow label="each round verified on-chain" />
                  <FlowCard
                    icon={BalanceScaleIcon}
                    title="Resolution"
                    description="AI decides: pay freelancer, refund client, or split. Each party can accept or appeal for a deeper investigation."
                    variant="warning"
                  />
                  <Arrow />
                  <div className="flex w-full max-w-[520px] flex-col gap-2">
                    <div className="flex rounded-xl border border-purple-400/15 bg-gradient-to-r from-purple-500/[0.05] to-emerald-500/[0.03] px-4 py-3 text-center">
                      <div className="flex flex-1 flex-col items-center">
                        <HugeiconsIcon
                          icon={ThumbsUpIcon}
                          size={16}
                          className="mb-1 text-purple-300"
                        />
                        <span className="text-[11px] font-medium text-purple-300">
                          Both accept
                        </span>
                        <span className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                          Funds released
                        </span>
                      </div>
                      <div className="mx-3 w-px bg-purple-500/15" />
                      <div className="flex flex-1 flex-col items-center">
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          size={16}
                          className="mb-1 text-purple-300"
                        />
                        <span className="text-[11px] font-medium text-purple-300">
                          48h auto-execute
                        </span>
                        <span className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                          No response needed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex w-full max-w-[520px] flex-row items-start gap-5 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-black px-7 py-6 text-left">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-900/30 text-purple-300">
                      <HugeiconsIcon icon={AiBrain01Icon} size={26} />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h4 className="mb-2 text-base font-semibold text-[hsl(var(--foreground))]">
                        Disputes are rare
                      </h4>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        When milestones are clear. But if one happens, AI
                        resolves it in minutes.
                      </p>
                      <button
                        onClick={() => setShowDispute(true)}
                        className="mt-3 text-sm font-medium text-purple-400 hover:text-purple-300"
                      >
                        See the dispute flow
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
          />
        </div>
      </div>
    </section>
  );
}
