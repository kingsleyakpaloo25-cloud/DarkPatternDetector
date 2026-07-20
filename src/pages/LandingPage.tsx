import { Link } from "react-router-dom";
import {
  Shield,
  Globe,
  Camera,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Website Scanner",
    desc: "Enter a URL and DarkScan fetches the HTML & CSS, runs detection algorithms, and reports every dark pattern it finds.",
  },
  {
    icon: Camera,
    title: "Screenshot Scanner",
    desc: "Upload a screenshot and our OCR engine extracts the text, spots suspicious wording and deceptive buttons, and returns a full report.",
  },
  {
    icon: Sparkles,
    title: "AI NLP Detection",
    desc: "A natural-language module analyses phrases for manipulative patterns across 10 dark pattern categories.",
  },
];

const patternTypes = [
  "Hidden costs",
  "Forced action",
  "Confirmshaming",
  "Sneak into basket",
  "Fake countdown timers",
  "Misdirection",
  "Privacy manipulation",
  "Obstruction",
  "Roach Motel",
  "Pre-selected checkboxes",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
              <Shield className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Dark<span className="text-cyan-400">Scan</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-slate-950 to-slate-950" />
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-medium text-cyan-400">
              <AlertTriangle size={12} />
              Automatic Dark Pattern Detection
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Expose the dark patterns
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                hiding in any interface
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              DarkScan analyses websites and screenshots for manipulative
              design — hidden costs, confirmshaming, fake urgency and more —
              and gives you a clear, actionable report.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Start scanning free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition hover:border-cyan-500/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 transition group-hover:scale-110">
                <f.icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pattern types */}
      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            10 dark pattern categories we detect
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
            Every scan checks for all of the following manipulative tactics.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {patternTypes.map((p) => (
              <div
                key={p}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <CheckCircle2 size={18} className="shrink-0 text-cyan-400" />
                <span className="text-sm text-slate-200">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Example detection report
          </h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Dark Pattern Found</h3>
                <p className="text-xs text-slate-400">example.com</p>
              </div>
            </div>
            <div className="p-5">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-400">
                      Type
                    </span>
                    <span className="font-semibold text-white">Confirmshaming</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
                      High
                    </span>
                    <span className="text-sm text-slate-300">
                      Confidence: <span className="font-semibold text-white">93%</span>
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  The dialog attempts to shame the user into accepting.
                </p>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-500/5 p-3">
                  <span className="mt-0.5 text-xs font-semibold text-emerald-400">
                    Recommendation
                  </span>
                  <p className="text-sm text-slate-300">Use neutral wording.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-10 text-center sm:p-16">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to scan your first interface?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Create a free account and start detecting dark patterns in minutes.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Create your account
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="text-sm text-slate-400">
              DarkScan — Automatic Dark Pattern Detection
            </span>
          </div>
          <Link
            to="/admin/login"
            className="text-xs text-slate-500 transition hover:text-slate-300"
          >
            Admin portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
