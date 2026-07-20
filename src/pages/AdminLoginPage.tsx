import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Lock } from "lucide-react";
import { AuthShell } from "../components/AuthShell";
import { PasswordInput, TextInput } from "../components/Inputs";
import { supabase, FUNCTIONS_URL } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const ADMIN_EMAIL = "AndrewsOsei1@gmail.com";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Sign in with Supabase auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // Ensure the admin profile is promoted (idempotent edge function)
      try {
        await fetch(`${FUNCTIONS_URL}/setup-admin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session?.access_token}`,
          },
          body: JSON.stringify({}),
        });
      } catch {
        // non-fatal: profile may already be admin
      }

      // Reload profile to pick up is_admin flag
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }

      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  // If already signed in as admin, redirect
  if (session) {
    // handled by route guard
  }

  return (
    <AuthShell
      title="Admin Portal"
      subtitle="Restricted access. Administrators only."
      accent="amber"
      footer={
        <Link to="/login" className="text-slate-500 transition hover:text-slate-300">
          Back to user sign in
        </Link>
      }
    >
      <div className="mb-5 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
        <Lock size={14} />
        Authorized personnel only. All actions are logged.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="Admin email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          label="Password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in to Admin"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Shield size={12} />
        DarkScan Admin Console
      </div>
    </AuthShell>
  );
}
