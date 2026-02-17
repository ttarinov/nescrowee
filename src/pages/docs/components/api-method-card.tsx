interface ApiMethodCardProps {
  name: string;
  type: "view" | "change";
  description: string;
  parameters: Array<{ name: string; type: string; description: string; required?: boolean }>;
  returns?: string;
  example?: string;
}

export function ApiMethodCard({
  name,
  type,
  description,
  parameters,
  returns,
  example,
}: ApiMethodCardProps) {
  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              type === "view"
                ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
            }`}
          >
            {type === "view" ? "View Method" : "Change Method"}
          </span>
        </div>
      </div>

      <p className="text-gray-300 mb-6">{description}</p>

      {parameters.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-3">Parameters</h4>
          <div className="space-y-3">
            {parameters.map((param) => (
              <div key={param.name} className="border-l-2 border-slate-700 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm font-mono text-purple-300">{param.name}</code>
                  <code className="text-xs text-gray-500">{param.type}</code>
                  {param.required !== false && (
                    <span className="text-xs text-red-400">required</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{param.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {returns && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-2">Returns</h4>
          <code className="text-sm text-gray-300 bg-slate-800 px-2 py-1 rounded">
            {returns}
          </code>
        </div>
      )}

      {example && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Example</h4>
          <pre className="bg-slate-800 border border-slate-700 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-gray-300">{example}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
