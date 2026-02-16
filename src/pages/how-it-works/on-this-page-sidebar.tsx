import { useEffect, useState } from "react";

const sections = [
  { id: "where-everything-lives", label: "Where Everything Lives" },
  { id: "disagreement", label: "What happens when there's a disagreement" },
  { id: "which-ai", label: "Which AI handles your dispute" },
  { id: "trust-the-system", label: "Why you can trust the system" },
  { id: "verify", label: "Don't trust — verify" },
];

export default function OnThisPageSidebar() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
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
        <nav className="flex flex-col gap-0.5">
          {sections.map((s) => (
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
        </nav>
      </div>
    </aside>
  );
}
