import { useEffect, useState } from "react";

const apiSections = [
  { id: "authentication", label: "Authentication" },
  { id: "view-methods", label: "View Methods" },
  { id: "change-methods", label: "Change Methods" },
  { id: "owner-methods", label: "Owner Methods" },
  { id: "ai-resolution-flow", label: "AI Resolution Flow" },
  { id: "contract-addresses", label: "Contract Addresses" },
];

const mcpSections = [
  { id: "mcp-overview", label: "Overview" },
  { id: "mcp-tools", label: "Tools" },
  { id: "mcp-resources", label: "Resources" },
  { id: "mcp-examples", label: "Examples" },
];

const allSections = [...apiSections, ...mcpSections];

export default function OnThisPageSidebar() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const els = allSections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveId(e.target.id);
            break;
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      className="hidden lg:block fixed left-0 top-0 bottom-0 w-56 xl:w-64 z-40 overflow-y-auto"
      aria-label="On this page"
    >
      <div className="sticky top-24 pt-8 pb-16 pl-6 pr-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-400/90 mb-4">
          On this page
        </p>
        <nav className="flex flex-col gap-2">
          <div>
            <p className="text-xs font-semibold text-purple-400/70 mb-2 px-3">API Reference</p>
            <div className="flex flex-col gap-0.5">
              {apiSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                    activeId === s.id
                      ? "bg-purple-500/10 text-purple-300 font-medium border border-purple-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-400/70 mb-2 px-3 mt-4">MCP Documentation</p>
            <div className="flex flex-col gap-0.5">
              {mcpSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                    activeId === s.id
                      ? "bg-blue-500/10 text-blue-300 font-medium border border-blue-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
