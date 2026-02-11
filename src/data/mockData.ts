import { Contract, Dispute } from "@/types/contract";

export const mockContracts: Contract[] = [
  {
    id: "c1",
    title: "DeFi Dashboard Development",
    description: "Build a comprehensive DeFi analytics dashboard with portfolio tracking, yield farming stats, and real-time price feeds.",
    clientAddress: "alice.near",
    freelancerAddress: "bob.near",
    totalAmount: 5000,
    securityDeposit: 500,
    milestones: [
      { id: "m1", title: "UI/UX Design & Wireframes", description: "Complete design mockups", amount: 1000, status: "completed" },
      { id: "m2", title: "Frontend Development", description: "Implement React components", amount: 2000, status: "in_progress" },
      { id: "m3", title: "Smart Contract Integration", description: "Connect to NEAR contracts", amount: 1500, status: "pending" },
      { id: "m4", title: "Testing & Deployment", description: "QA and mainnet deploy", amount: 500, status: "pending" },
    ],
    status: "active",
    createdAt: "2025-01-28T10:00:00Z",
  },
  {
    id: "c2",
    title: "NFT Marketplace Smart Contracts",
    description: "Develop and audit smart contracts for an NFT marketplace with auction and royalty support.",
    clientAddress: "carol.near",
    freelancerAddress: "dave.near",
    totalAmount: 8000,
    securityDeposit: 800,
    milestones: [
      { id: "m5", title: "Contract Architecture", description: "Design contract structure", amount: 1500, status: "completed" },
      { id: "m6", title: "Core Marketplace Logic", description: "Implement buy/sell/auction", amount: 3500, status: "disputed" },
      { id: "m7", title: "Royalty System", description: "Implement creator royalties", amount: 2000, status: "pending" },
      { id: "m8", title: "Security Audit", description: "Third-party audit", amount: 1000, status: "pending" },
    ],
    status: "disputed",
    createdAt: "2025-01-20T14:00:00Z",
  },
  {
    id: "c3",
    title: "Token Vesting Portal",
    description: "Create a web portal for managing token vesting schedules with cliff and linear unlock.",
    clientAddress: "eve.near",
    freelancerAddress: "frank.near",
    totalAmount: 3000,
    securityDeposit: 300,
    milestones: [
      { id: "m9", title: "Vesting Contract", description: "NEAR smart contract for vesting", amount: 1500, status: "completed" },
      { id: "m10", title: "Web Interface", description: "Dashboard for managing vesting", amount: 1500, status: "completed" },
    ],
    status: "completed",
    createdAt: "2025-01-10T09:00:00Z",
  },
];

export const mockDisputes: Dispute[] = [
  {
    id: "d1",
    contractId: "c2",
    milestoneId: "m6",
    raisedBy: "carol.near",
    reason: "Delivered code does not match the specification. Auction mechanism has critical bugs that were not addressed after multiple review rounds.",
    status: "pending",
    aiSummary: "Client claims auction logic has bugs. Freelancer claims specs changed mid-project. Evidence suggests partial completion with deviation from original requirements.",
  },
];
