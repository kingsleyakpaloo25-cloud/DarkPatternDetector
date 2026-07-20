import { useState } from "react";
import { Globe, Loader2, Search } from "lucide-react";
import { UserLayout } from "../components/UserLayout";
import { DetectionReport } from "../components/DetectionReport";
import { supabase, FUNCTIONS_URL } from "../lib/supabase";
import { saveScan } from "../lib/saveScan";
import type { PatternHit } from "../lib/types";

export function WebsiteScannerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    patterns: PatternHit[];
    title: string;
    target: string;
  } | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const resp = await fetch(`${FUNCTIONS_URL}/scan-website`, {
        method: "POST",
        headers,
        body: JSON.stringify({ url }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${resp.status})`);
      }
      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      const patterns: PatternHit[] = data.patterns ?? [];
      setResult({
        patterns,
        title: data.title ?? url,
        target: data.url ?? url,
      });
      await saveScan("website", data.url ?? url, data.title ?? url, patterns);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <UserLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Globe size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Website Scanner</h1>
            <p className="text-sm text-slate-400">
              Enter a URL — DarkScan fetches the HTML & CSS, runs detection
              algorithms, and reports every dark pattern found.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleScan} className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <Search size={16} /> Scan
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && !result && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-cyan-400" />
          <p className="mt-4 text-sm text-slate-400">
            Fetching HTML & CSS, running detection algorithms...
          </p>
        </div>
      )}

      {result && (
        <DetectionReport
          patterns={result.patterns}
          title={result.title}
          target={result.target}
          onClose={() => setResult(null)}
        />
      )}
    </UserLayout>
  );
}
