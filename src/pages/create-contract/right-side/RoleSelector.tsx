import type { UserRole } from "../types";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/60 ml-2">I am the</label>
      <div className="bg-white/10 p-1 rounded-full flex relative backdrop-blur-md border border-white/10">
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/20 rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${value === "freelancer" ? "left-[calc(50%+2px)]" : "left-1"}`}
        />
        <button
          type="button"
          onClick={() => onChange("client")}
          className={`flex-1 py-3 text-sm font-medium relative z-10 transition-colors ${value === "client" ? "text-white" : "text-white/40"}`}
        >
          Client
        </button>
        <button
          type="button"
          onClick={() => onChange("freelancer")}
          className={`flex-1 py-3 text-sm font-medium relative z-10 transition-colors ${value === "freelancer" ? "text-white" : "text-white/40"}`}
        >
          Freelancer
        </button>
      </div>
    </div>
  );
}
