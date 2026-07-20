import { useEffect, useState } from "react";
import { Mail, MailOpen, Loader2, Send } from "lucide-react";
import { AdminLayout } from "../components/AdminLayout";
import { supabase } from "../lib/supabase";
import type { ContactMessage } from "../lib/types";

export function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      setMessages(data ?? []);
      setLoading(false);
    })();
  }, []);

  async function markRead(msg: ContactMessage) {
    setSelected(msg);
    if (!msg.is_read) {
      await supabase.from("contact_messages").update({ is_read: true }).eq("id", msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
      );
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Mail size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
            <p className="text-sm text-slate-400">
              Messages sent to contact@darkscan.ai from users.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" /> Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Mail size={32} className="mx-auto text-slate-600" />
          <p className="mt-3 text-sm text-slate-400">No messages yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Message list */}
          <div className="space-y-2 lg:col-span-1">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => markRead(m)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selected?.id === m.id
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {m.is_read ? (
                      <MailOpen size={14} className="text-slate-500" />
                    ) : (
                      <Mail size={14} className="text-amber-400" />
                    )}
                    <span className="text-sm font-medium text-white">{m.name}</span>
                  </div>
                  {!m.is_read && (
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">{m.email}</p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {m.subject ?? m.message.slice(0, 50)}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {selected.subject ?? "(no subject)"}
                  </h2>
                  <span className="text-xs text-slate-500">
                    {new Date(selected.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                  <Send size={14} />
                  From: <span className="text-white">{selected.name}</span> ({selected.email})
                </div>
                <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-slate-300">
                    {selected.message}
                  </p>
                </div>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject ?? "Your message")}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  <Send size={14} /> Reply via email
                </a>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
                <p className="text-sm text-slate-400">
                  Select a message to view its contents.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
