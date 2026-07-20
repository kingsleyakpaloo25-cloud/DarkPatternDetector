import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, Chrome } from "lucide-react";
import { AuthShell } from "../components/AuthShell";
import { PasswordInput, TextInput } from "../components/Inputs";
import { supabase } from "../lib/supabase";

type Mode = "email" | "phone";

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "email") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate("/dashboard");
      } else {
        // Phone login: send OTP, then go to verify
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone,
          options: { shouldCreateUser: false },
        });
        if (otpError) throw otpError;
        sessionStorage.setItem("pending_phone", phone);
        navigate("/verify-phone");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (googleError) setError(googleError.message);
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your DarkScan account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-cyan-400 hover:text-cyan-300">
            Sign up
          </Link>
        </>
      }
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-1">
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition ${
            mode === "email"
              ? "bg-cyan-500 text-slate-950"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Mail size={16} /> Email
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition ${
            mode === "phone"
              ? "bg-cyan-500 text-slate-950"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Phone size={16} /> Phone
        </button>
      </div>

      <button
        onClick={handleGoogle}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500"
      >
        <Chrome size={18} /> Continue with Google
      </button>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-xs text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "email" ? (
          <>
            <TextInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        ) : (
          <TextInput
            label="Phone number"
            type="tel"
            placeholder="+233 24 466 7232"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        )}

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
          {loading
            ? "Please wait..."
            : mode === "email"
              ? "Sign in"
              : "Send verification code"}
        </button>
      </form>
    </AuthShell>
  );
}
