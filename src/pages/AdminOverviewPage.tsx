import { useEffect, useState } from "react";
import { Users, Activity, AlertTriangle, Mail, Database, TrendingUp } from "lucide-react";
import { AdminLayout } from "../components/AdminLayout";
import { supabase } from "../lib/supabase";
import type { Profile, Scan, ContactMessage, DetectedPattern } from "../lib/types";

export function AdminOverviewPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }, { data: pat }, { data: m }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("scans").select("*").order("created_at", { ascending: false }),
        supabase.from("detected_patterns").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      ]);
      setProfiles(p ?? []);
      setScans(s ?? []);
      setPatterns(pat ?? []);
      setMessages(m ?? []);
      setLoading(false);
    })();
  }, []);

  const unreadMessages = messages.filter((m) => !m.is_read).length;
  const highSeverity = patterns.filter((p) => p.severity === "High").length;

  const stats = [
    { label: "Total Users", value: profiles.length, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Total Scans", value: scans.length, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Patterns Detected", value: patterns.length, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Unread Messages", value: unreadMessages, icon: Mail, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  // Recent activity
  const recentScans = scans.slice(0, 10);
  // Pattern distribution
  const typeCounts = patterns.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1;
    return acc;
  }, {});
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = topTypes[0]?.[1] ?? 1;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Overview</h1>
        <p className="mt-1 text-slate-400">
          Monitor all user activity, scans, and messages across DarkScan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{loading ? "—" : s.value}</p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={18} className="text-amber-400" />
            <h2 className="font-semibold">Recent User Activity</h2>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : recentScans.length === 0 ? (
            <p className="text-sm text-slate-400">No scans yet.</p>
          ) : (
            <div className="space-y-2">
              {recentScans.map((s) => {
                const user = profiles.find((p) => p.id === s.user_id);
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[220px]">{s.target}</p>
                      <p className="text-xs text-slate-500">
                        {user?.email ?? "Unknown"} · {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">{s.scan_type}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pattern distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-400" />
            <h2 className="font-semibold">Pattern Distribution</h2>
          </div>
          {topTypes.length === 0 ? (
            <p className="text-sm text-slate-400">No patterns detected yet.</p>
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
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-slate-300">
              <span className="font-bold text-red-400">{highSeverity}</span> high-severity patterns detected
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
        <Database size={14} />
        Admin data is scoped to your account. All queries are RLS-protected.
      </div>
    </AdminLayout>
  );
}
