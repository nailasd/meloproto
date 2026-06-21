import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Plus, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col px-5 pb-28 pt-6">
      {/* top brand bar */}
      <header className="mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-vibe flex h-9 w-9 items-center justify-center rounded-xl shadow-glow">
            <Sparkles size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-vibe">vibematch</span>
        </Link>
        <Link
          to="/create"
          className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-white/10"
        >
          beta
        </Link>
      </header>

      <main className="flex-1">{children}</main>

      {/* bottom nav */}
      <nav className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-card/80 px-2 py-2 shadow-soft backdrop-blur-xl">
        <NavBtn to="/" active={pathname === "/"} icon={<Compass size={20} />} label="explore" />
        <Link
          to="/create"
          className="bg-vibe mx-1 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-glow transition hover:scale-105"
        >
          <Plus size={22} strokeWidth={2.5} />
        </Link>
        <NavBtn to="/profile" active={pathname === "/profile"} icon={<Sparkles size={20} />} label="vibe" />
      </nav>
    </div>
  );
}

function NavBtn({ to, active, icon, label }: { to: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[10px] font-medium transition ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
