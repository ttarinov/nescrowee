const rows = [
  { what: "Money", where: "NEAR smart contract balance", why: "Held by code, not a company" },
  { what: "Contract state", where: "Same NEAR contract", why: "Milestones, disputes, proofs — all on-chain" },
  { what: "Chat", where: "NEAR Social", why: "On-chain messaging, not someone's database" },
  { what: "AI", where: "NEAR AI Cloud (TEE)", why: "Runs in secure hardware, signs every response" },
  { what: "App", where: "Your browser", why: "Orchestrates everything — no backend" },
];

const WhatWhereWhyTable = () => (
  <div className="mt-8 overflow-x-auto rounded-2xl border border-purple-500/10">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-purple-500/10 bg-purple-500/[0.03]">
          <th className="px-4 py-3 font-semibold text-white">What</th>
          <th className="px-4 py-3 font-semibold text-white">Where</th>
          <th className="px-4 py-3 font-semibold text-white">Why</th>
        </tr>
      </thead>
      <tbody className="text-gray-400">
        {rows.map((row, i, arr) => (
          <tr
            key={row.what}
            className={i < arr.length - 1 ? "border-b border-purple-500/5" : ""}
          >
            <td className="px-4 py-3 font-medium text-white">{row.what}</td>
            <td className="px-4 py-3">{row.where}</td>
            <td className="px-4 py-3">{row.why}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default WhatWhereWhyTable;
