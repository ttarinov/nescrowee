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
    budgetType: "milestones",
    milestones: [
      { id: "m1", title: "UI/UX Design & Wireframes", description: "Complete design mockups", amount: 1000, status: "completed" },
      { id: "m2", title: "Frontend Development", description: "Implement React components", amount: 2000, status: "in_progress" },
      { id: "m3", title: "Smart Contract Integration", description: "Connect to NEAR contracts", amount: 1500, status: "funded" },
      { id: "m4", title: "Testing & Deployment", description: "QA and mainnet deploy", amount: 500, status: "not_funded" },
    ],
    status: "active",
    createdAt: "2025-01-28T10:00:00Z",
    chatMessages: [
      { id: "msg1", sender: "system", content: "Contract created", timestamp: "2025-01-28T10:00:00Z", type: "action" },
      { id: "msg2", sender: "system", content: "Milestone \"UI/UX Design & Wireframes\" funded with 1,000 NEAR", timestamp: "2025-01-28T10:05:00Z", type: "action" },
      { id: "msg3", sender: "freelancer", content: "Hey! I've started working on the wireframes. Will share first drafts in 2 days.", timestamp: "2025-01-28T12:00:00Z", type: "message" },
      { id: "msg4", sender: "client", content: "Sounds good! Looking forward to seeing them.", timestamp: "2025-01-28T13:00:00Z", type: "message" },
      { id: "msg5", sender: "freelancer", content: "wireframes-v1.fig", timestamp: "2025-01-30T09:00:00Z", type: "file", fileName: "wireframes-v1.fig" },
      { id: "msg6", sender: "system", content: "Milestone \"UI/UX Design & Wireframes\" confirmed & paid — 1,000 NEAR released", timestamp: "2025-01-31T14:00:00Z", type: "action" },
      { id: "msg7", sender: "system", content: "Milestone \"Frontend Development\" funded with 2,000 NEAR", timestamp: "2025-02-01T10:00:00Z", type: "action" },
      { id: "msg8", sender: "freelancer", content: "Starting frontend development now. Using React + TailwindCSS as discussed.", timestamp: "2025-02-01T11:00:00Z", type: "message" },
    ],
  },
  {
    id: "c2",
    title: "NFT Marketplace Smart Contracts",
    description: "Develop and audit smart contracts for an NFT marketplace with auction and royalty support.",
    clientAddress: "carol.near",
    freelancerAddress: "dave.near",
    totalAmount: 8000,
    securityDeposit: 800,
    budgetType: "milestones",
    milestones: [
      { id: "m5", title: "Contract Architecture", description: "Design contract structure", amount: 1500, status: "completed" },
      { id: "m6", title: "Core Marketplace Logic", description: "Implement buy/sell/auction", amount: 3500, status: "disputed" },
      { id: "m7", title: "Royalty System", description: "Implement creator royalties", amount: 2000, status: "not_funded" },
      { id: "m8", title: "Security Audit", description: "Third-party audit", amount: 1000, status: "not_funded" },
    ],
    status: "disputed",
    createdAt: "2025-01-20T14:00:00Z",
    chatMessages: [
      { id: "msg9", sender: "system", content: "Contract created", timestamp: "2025-01-20T14:00:00Z", type: "action" },
      { id: "msg10", sender: "system", content: "Dispute raised on milestone \"Core Marketplace Logic\"", timestamp: "2025-02-05T16:00:00Z", type: "action" },
      { id: "msg11", sender: "system", content: "Judge assigned to dispute", timestamp: "2025-02-05T16:30:00Z", type: "action" },
    ],
  },
  {
    id: "c3",
    title: "Token Vesting Portal",
    description: "Create a web portal for managing token vesting schedules with cliff and linear unlock.",
    clientAddress: "eve.near",
    freelancerAddress: "frank.near",
    totalAmount: 3000,
    securityDeposit: 300,
    budgetType: "total",
    milestones: [
      { id: "m9", title: "Vesting Contract", description: "NEAR smart contract for vesting", amount: 1500, status: "completed" },
      { id: "m10", title: "Web Interface", description: "Dashboard for managing vesting", amount: 1500, status: "completed" },
    ],
    status: "completed",
    createdAt: "2025-01-10T09:00:00Z",
    chatMessages: [
      { id: "msg12", sender: "system", content: "Contract created", timestamp: "2025-01-10T09:00:00Z", type: "action" },
      { id: "msg13", sender: "system", content: "All milestones completed — contract closed", timestamp: "2025-02-08T17:00:00Z", type: "action" },
    ],
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
