import { useEffect, useState } from "react";
import { Users, Search, Loader2 } from "lucide-react";
import { AdminLayout } from "../components/AdminLayout";
import { supabase } from "../lib/supabase";
import type { Profile, Scan } from "../lib/types";

export function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("scans").select("*"),
      ]);
      setProfiles(p ?? []);
      setScans(s ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.phone ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function scanCount(userId: string) {
    return scans.filter((s) => s.user_id === userId).length;
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registered Users</h1>
            <p className="text-sm text-slate-400">
              All users who have registered and are using the system.
            </p>
          </div>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" /> Loading users...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Phone</th>
                <th className="px-4 py-3 font-medium">Scans</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Joined</th>
                <th className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((p) => (
                <tr key={p.id} className="transition hover:bg-slate-950/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                        {(p.full_name ?? p.email)[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{p.full_name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{p.email}</td>
                  <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{scanCount(p.id)}</td>
                  <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {p.is_admin ? (
                      <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-400">
                        Admin
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">
                        User
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              No users found.
            </p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
