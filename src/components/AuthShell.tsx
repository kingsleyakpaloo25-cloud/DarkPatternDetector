import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  accent = "cyan",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  accent?: "cyan" | "amber";
}) {
  const grad =
    accent === "amber"
      ? "from-amber-400 to-red-600"
      : "from-cyan-400 to-blue-600";
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
      <div
        className={`absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br ${grad} opacity-20 blur-3xl`}
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${grad}`}
          >
            <Shield className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            Dark<span className={accent === "amber" ? "text-amber-400" : "text-cyan-400"}>Scan</span>
          </span>
        </Link>
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
