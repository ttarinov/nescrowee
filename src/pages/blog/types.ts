export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: "integration" | "technical" | "announcement";
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "hot-pay-integration",
    title: "Multi-Chain Payments with HOT Pay",
    description: "How Nescrowee enables escrow funding from 30+ chains through HOT Pay's seamless payment infrastructure",
    date: "2026-02-16",
    author: "Nescrowee Team",
    category: "integration",
    tags: ["HOT Pay", "Payments", "Multi-Chain", "NEAR"],
  },
  {
    slug: "nova-integration",
    title: "Encrypted Evidence Storage with NOVA",
    description: "Securing dispute evidence with client-side encryption and IPFS storage through NOVA SDK",
    date: "2026-02-16",
    author: "Nescrowee Team",
    category: "integration",
    tags: ["NOVA", "Encryption", "IPFS", "Privacy"],
  },
  {
    slug: "near-protocol",
    title: "Building on NEAR Protocol",
    description: "Why NEAR's architecture makes Nescrowee possible: Social DB, NEAR AI Cloud, and TEE verification",
    date: "2026-02-16",
    author: "Nescrowee Team",
    category: "technical",
    tags: ["NEAR", "Blockchain", "Smart Contracts", "TEE"],
  },
  {
    slug: "openclaw-integration",
    title: "AI Agents Can Now Sign Contracts",
    description: "How OpenClaw agents can autonomously create and manage escrow contracts through Nescrowee's API",
    date: "2026-02-16",
    author: "Nescrowee Team",
    category: "integration",
    tags: ["OpenClaw", "AI Agents", "Automation", "API"],
  },
  {
    slug: "rentahuman-integration",
    title: "rentahuman.ai Meets Escrow",
    description: "Enabling AI agents to hire humans securely through milestone-based escrow contracts",
    date: "2026-02-16",
    author: "Nescrowee Team",
    category: "integration",
    tags: ["rentahuman.ai", "AI Agents", "Gig Economy", "Escrow"],
  },
];
