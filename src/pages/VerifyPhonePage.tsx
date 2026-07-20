import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { TextInput } from "../components/Inputs";
import { supabase } from "../lib/supabase";

export function VerifyPhonePage() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phone = sessionStorage.getItem("pending_phone") || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      if (verifyError) throw verifyError;
      sessionStorage.removeItem("pending_phone");
      sessionStorage.removeItem("pending_name");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Verify your phone"
      subtitle={`Enter the code we sent to ${phone}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Verification code"
          placeholder="123456"
          value={token}
          onChange={(e) => setToken(e.target.value)}
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
          className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </AuthShell>
  );
}
