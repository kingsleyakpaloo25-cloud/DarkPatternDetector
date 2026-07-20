import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Globe,
  Camera,
  Sparkles,
  LogOut,
  Shield,
  Menu,
  X,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function UserLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/scan/website", label: "Website Scanner", icon: Globe },
    { to: "/scan/screenshot", label: "Screenshot Scanner", icon: Camera },
    { to: "/scan/ai", label: "AI Detection", icon: Sparkles },
    { to: "/contact", label: "Contact", icon: Mail },
  ];

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
              <Shield className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Dark<span className="text-cyan-400">Scan</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <l.icon size={16} />
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-slate-400">
              {profile?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>

          <button
            className="md:hidden text-slate-300"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 md:hidden">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                  location.pathname === l.to
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-300"
                }`}
              >
                <l.icon size={16} />
                {l.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="mt-2 flex w-full items-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-300"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
