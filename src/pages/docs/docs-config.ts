export interface DocItem {
  id: string;
  title: string;
  path: string;
  category?: string;
  description?: string;
}

export const docs: DocItem[] = [
  {
    id: "api-reference",
    title: "API Reference",
    path: "api-reference",
    category: "Reference",
    description: "Complete reference for all smart contract methods",
  },
  {
    id: "mcp-specification",
    title: "MCP Specification",
    path: "mcp-specification",
    category: "Reference",
    description: "Model Context Protocol specification for bot integrations",
  },
  {
    id: "quick-start",
    title: "Quick Start",
    path: "/docs/QUICK_START.md",
    category: "Getting Started",
    description: "Get up and running with Nescrowee quickly",
  },
  {
    id: "trust-and-verification",
    title: "Trust & Verification",
    path: "/docs/trust-and-verification.md",
    category: "Security",
    description: "How every component can be independently verified",
  },
  {
    id: "future-kit-contribution",
    title: "Future HOT Kit Contribution",
    path: "/docs/future-kit-contribution.md",
    category: "Development",
    description: "Post-hackathon HOT Kit contribution ideas",
  },
  {
    id: "hot-pay-integration",
    title: "HOT Pay Integration",
    path: "/docs/hot-pay-integration.md",
    category: "Integrations",
    description: "Multi-token funding via HOT Pay checkout",
  },
];

export const getDocById = (id: string): DocItem | undefined => {
  return docs.find((doc) => doc.id === id);
};

const CATEGORY_ORDER = ["Reference", "Getting Started", "Security", "Development", "Integrations"];

export const getDocsByCategory = (): Record<string, DocItem[]> => {
  const categorized: Record<string, DocItem[]> = {};
  docs.forEach((doc) => {
    const category = doc.category || "Other";
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(doc);
  });
  return categorized;
};

export const getDocsByCategoryOrdered = (): [string, DocItem[]][] => {
  const byCategory = getDocsByCategory();
  const order = new Set([...CATEGORY_ORDER, ...Object.keys(byCategory)]);
  return Array.from(order).filter((cat) => byCategory[cat]).map((cat) => [cat, byCategory[cat]]);
};
