import { useEffect, useState } from "react";
import { Database, Download, Loader2, FileText, Users, Activity, AlertTriangle } from "lucide-react";
import { AdminLayout } from "../components/AdminLayout";
import { supabase } from "../lib/supabase";
import type { Profile, Scan, DetectedPattern, ContactMessage } from "../lib/types";

export function AdminDatabasePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }, { data: pat }, { data: m }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("scans").select("*"),
        supabase.from("detected_patterns").select("*"),
        supabase.from("contact_messages").select("*"),
      ]);
      setProfiles(p ?? []);
      setScans(s ?? []);
      setPatterns(pat ?? []);
      setMessages(m ?? []);
      setLoading(false);
    })();
  }, []);

  function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
    if (rows.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = r[h];
            if (val === null || val === undefined) return "";
            const s = String(val).replace(/"/g, '""');
            return `"${s}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJSON(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadAll() {
    setDownloading(true);
    try {
      const fullExport = {
        exported_at: new Date().toISOString(),
        profiles,
        scans,
        detected_patterns: patterns,
        contact_messages: messages,
      };
      downloadJSON("darkscan-database-export.json", fullExport);
      downloadCSV("darkscan-users.csv", profiles as unknown as Record<string, unknown>[]);
      downloadCSV("darkscan-scans.csv", scans as unknown as Record<string, unknown>[]);
      downloadCSV("darkscan-patterns.csv", patterns as unknown as Record<string, unknown>[]);
      downloadCSV("darkscan-messages.csv", messages as unknown as Record<string, unknown>[]);
    } finally {
      setDownloading(false);
    }
  }

  const tables = [
    { name: "profiles", label: "Users", count: profiles.length, icon: Users, color: "text-cyan-400" },
    { name: "scans", label: "Scans", count: scans.length, icon: Activity, color: "text-emerald-400" },
    { name: "detected_patterns", label: "Detected Patterns", count: patterns.length, icon: AlertTriangle, color: "text-red-400" },
    { name: "contact_messages", label: "Messages", count: messages.length, icon: FileText, color: "text-amber-400" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Database size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Database Export</h1>
            <p className="text-sm text-slate-400">
              Download the full database of registered users and system activity.
            </p>
          </div>
        </div>
      </div>

      {/* Download all */}
      <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-white">Download everything</h2>
            <p className="text-sm text-slate-400">
              Exports all tables as JSON + individual CSV files.
            </p>
          </div>
          <button
            onClick={downloadAll}
            disabled={downloading || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Exporting...
              </>
            ) : (
              <>
                <Download size={16} /> Download all data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table cards */}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" /> Loading database...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tables.map((t) => {
            const data =
              t.name === "profiles" ? profiles :
              t.name === "scans" ? scans :
              t.name === "detected_patterns" ? patterns :
              messages;
            return (
              <div key={t.name} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 ${t.color}`}>
                      <t.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{t.label}</h3>
                      <p className="text-xs text-slate-500">{t.name}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-white">{t.count}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => downloadCSV(`darkscan-${t.name}.csv`, data as unknown as Record<string, unknown>[])}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-400"
                  >
                    <Download size={14} /> CSV
                  </button>
                  <button
                    onClick={() => downloadJSON(`darkscan-${t.name}.json`, data)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-400"
                  >
                    <Download size={14} /> JSON
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Users preview table */}
      <h2 className="mt-10 text-lg font-semibold">User database preview</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {profiles.slice(0, 20).map((p) => (
              <tr key={p.id} className="hover:bg-slate-950/50">
                <td className="px-4 py-3 text-white">{p.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-300">{p.email}</td>
                <td className="px-4 py-3 text-slate-400">{p.phone ?? "—"}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {profiles.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-400">No users registered yet.</p>
        )}
      </div>
    </AdminLayout>
  );
}
