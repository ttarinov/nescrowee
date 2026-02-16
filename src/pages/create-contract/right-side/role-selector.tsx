import type { UserRole } from "../types";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="flex gap-0 rounded-full">
      <button
        type="button"
        onClick={() => onChange("client")}
        className={`flex-1 py-2 text-xs font-medium rounded-full transition-all ${value === "client" ? "bg-gradient-to-r from-purple-500 to-purple-950 text-white shadow-md" : "text-white/50 hover:text-white/70"}`}
      >
        {value === "client" ? (
          <>
            <span className="opacity-70">I am the </span>
            <span className="font-bold">Client</span>
          </>
        ) : (
          "Client"
        )}
      </button>
      <button
        type="button"
        onClick={() => onChange("freelancer")}
        className={`flex-1 py-2 text-xs font-medium rounded-full transition-all ${value === "freelancer" ? "bg-gradient-to-r from-purple-500 to-purple-950 text-white shadow-md" : "text-white/50 hover:text-white/70"}`}
      >
        {value === "freelancer" ? (
          <>
            <span className="opacity-70">I am the </span>
            <span className="font-bold">Freelancer</span>
          </>
        ) : (
          "Freelancer"
        )}
      </button>
    </div>
  );
}
