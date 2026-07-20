import type { PatternHit } from "../lib/types";
import { AlertTriangle, ShieldCheck, X } from "lucide-react";

const severityStyles: Record<string, string> = {
  High: "border-red-500/40 bg-red-500/10 text-red-400",
  Medium: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  Low: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
};

export function DetectionReport({
  patterns,
  title,
  target,
  onClose,
}: {
  patterns: PatternHit[];
  title?: string;
  target?: string;
  onClose?: () => void;
}) {
  const found = patterns.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              found
                ? "bg-red-500/15 text-red-400"
                : "bg-emerald-500/15 text-emerald-400"
            }`}
          >
            {found ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {found ? "Dark Pattern Found" : "No Dark Patterns Detected"}
            </h3>
            {target && (
              <p className="text-xs text-slate-400">{target}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {title && (
            <span className="hidden text-sm text-slate-400 sm:block">{title}</span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {found ? (
          <div className="space-y-4">
            {patterns.map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-400">
                      Type
                    </span>
                    <span className="font-semibold text-white">{p.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-semibold ${severityStyles[p.severity]}`}
                    >
                      {p.severity}
                    </span>
                    <span className="text-sm text-slate-300">
                      Confidence:{" "}
                      <span className="font-semibold text-white">
                        {p.confidence}%
                      </span>
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-300">{p.description}</p>
                {p.evidence && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                    <p className="text-xs font-medium text-slate-500">
                      Evidence
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-300">
                      "{p.evidence}"
                    </p>
                  </div>
                )}
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-500/5 p-3">
                  <span className="mt-0.5 text-xs font-semibold text-emerald-400">
                    Recommendation
                  </span>
                  <p className="text-sm text-slate-300">{p.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            The analysis did not find any dark patterns in the provided content.
          </p>
        )}
      </div>
    </div>
  );
}
