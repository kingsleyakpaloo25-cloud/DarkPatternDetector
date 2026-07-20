import { useEffect, useState } from "react";
import {
  Globe,
  Camera,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  History,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UserLayout } from "../components/UserLayout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Scan, DetectedPattern } from "../lib/types";

export function DashboardPage() {
  const { profile } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: scanData } = await supabase
        .from("scans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setScans(scanData ?? []);

      const { data: patternData } = await supabase
        .from("detected_patterns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setPatterns(patternData ?? []);
      setLoading(false);
    })();
  }, []);

  const totalScans = scans.length;
  const websiteScans = scans.filter((s) => s.scan_type === "website").length;
  const screenshotScans = scans.filter((s) => s.scan_type === "screenshot").length;
  const aiScans = scans.filter((s) => s.scan_type === "ai").length;
  const totalPatterns = patterns.length;
  const highSeverity = patterns.filter((p) => p.severity === "High").length;

  // Pattern type distribution
  const typeCounts = patterns.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1;
    return acc;
  }, {});
  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCount = topTypes[0]?.[1] ?? 1;

  const stats = [
    {
      label: "Websites Analyzed",
      value: totalScans,
      icon: Globe,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Dark Patterns Detected",
      value: totalPatterns,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "High Severity",
      value: highSeverity,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Scan Types Used",
      value: [websiteScans, screenshotScans, aiScans].filter((n) => n > 0).length,
      icon: Sparkles,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  const quickActions = [
    { to: "/scan/website", label: "Scan a Website", desc: "Enter a URL and detect dark patterns in the HTML & CSS.", icon: Globe },
    { to: "/scan/screenshot", label: "Scan a Screenshot", desc: "Upload an image and use OCR to find manipulative text.", icon: Camera },
    { to: "/scan/ai", label: "AI NLP Detection", desc: "Paste text and let the NLP engine analyse it for dark patterns.", icon: Sparkles },
  ];

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-slate-400">
          Here&apos;s an overview of your dark pattern detection activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{loading ? "—" : s.value}</p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="mt-10 text-lg font-semibold">Quick actions</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-cyan-500/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <a.icon size={20} />
            </div>
            <h3 className="mt-3 font-semibold text-white">{a.label}</h3>
            <p className="mt-1 text-sm text-slate-400">{a.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-400 transition group-hover:gap-2">
              Start <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Detection history */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center gap-2">
            <History size={18} className="text-cyan-400" />
            <h2 className="font-semibold">Detection History</h2>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : scans.length === 0 ? (
            <p className="text-sm text-slate-400">
              No scans yet. Run your first scan to see history here.
            </p>
          ) : (
            <div className="space-y-2">
              {scans.slice(0, 8).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-md text-xs ${
                      s.scan_type === "website" ? "bg-cyan-500/10 text-cyan-400" :
                      s.scan_type === "screenshot" ? "bg-amber-500/10 text-amber-400" :
                      "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {s.scan_type === "website" ? <Globe size={16} /> :
                       s.scan_type === "screenshot" ? <Camera size={16} /> :
                       <Sparkles size={16} />}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">
                        {s.target}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(s.created_at).toLocaleDateString()} · {s.scan_type}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    s.pattern_count > 0
                      ? "bg-red-500/10 text-red-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {s.pattern_count} found
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detection statistics */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            <h2 className="font-semibold">Detection Statistics</h2>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : topTypes.length === 0 ? (
            <p className="text-sm text-slate-400">
              No patterns detected yet. Statistics will appear here after your first detection.
            </p>
          ) : (
            <div className="space-y-3">
              {topTypes.map(([type, count]) => (
                <div key={type}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{type}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-center">
              <p className="text-lg font-bold text-cyan-400">{websiteScans}</p>
              <p className="text-xs text-slate-500">Website</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-center">
              <p className="text-lg font-bold text-amber-400">{screenshotScans}</p>
              <p className="text-xs text-slate-500">Screenshot</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-center">
              <p className="text-lg font-bold text-emerald-400">{aiScans}</p>
              <p className="text-xs text-slate-500">AI</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
