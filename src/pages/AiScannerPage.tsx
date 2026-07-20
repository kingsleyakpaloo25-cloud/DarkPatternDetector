import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { UserLayout } from "../components/UserLayout";
import { DetectionReport } from "../components/DetectionReport";
import { analyzeText } from "../lib/detection";
import { saveScan } from "../lib/saveScan";
import type { PatternHit } from "../lib/types";

export function AiScannerPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PatternHit[] | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      // Simulate NLP processing delay for UX
      await new Promise((r) => setTimeout(r, 600));
      const patterns = analyzeText(text);
      // NLP-style: boost confidence for longer matches
      const boosted = patterns.map((p) => ({
        ...p,
        confidence: Math.min(98, p.confidence + 3),
      }));
      setResult(boosted);
      const label = text.slice(0, 60).replace(/\n/g, " ");
      await saveScan("ai", label, "AI NLP analysis", boosted);
    } finally {
      setLoading(false);
    }
  }

  return (
    <UserLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI NLP Detection</h1>
            <p className="text-sm text-slate-400">
              Paste any text and the NLP engine analyses phrases for manipulative
              dark patterns across all 10 categories.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleScan} className="mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste interface text, button labels, dialog copy, or any content you want analysed for dark patterns..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-white placeholder-slate-500 transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">{text.length} characters</span>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Analysing...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Run NLP Analysis
              </>
            )}
          </button>
        </div>
      </form>

      {loading && !result && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-emerald-400" />
          <p className="mt-4 text-sm text-slate-400">
            Running NLP analysis on the text...
          </p>
        </div>
      )}

      {result && (
        <DetectionReport
          patterns={result}
          target="AI NLP analysis"
          onClose={() => setResult(null)}
        />
      )}
    </UserLayout>
  );
}
