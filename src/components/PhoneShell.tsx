import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, User } from "lucide-react";
import type { ReactNode } from "react";

export function PhoneShell({ children, hideHeader = false }: { children: ReactNode; hideHeader?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-5 pt-5" style={{ minHeight: "100dvh", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {!hideHeader && (
        <header className="relative mb-5 flex h-12 items-center justify-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-melo">Melo</span>
          </h1>
          <span className="absolute right-0 rounded-full border border-foreground/10 bg-white/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground/60 backdrop-blur">
            beta
          </span>
        </header>
      )}

      <main className="flex-1">{children}</main>

      <BottomNav pathname={pathname} />
    </div>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  const items = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/explore", icon: Compass, label: "Explorer" },
    { to: "/profile", icon: User, label: "Profil" },
  ] as const;

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-32px)] max-w-[380px] -translate-x-1/2 items-center justify-around rounded-full border border-foreground/10 bg-white/85 p-1.5 shadow-pop backdrop-blur-xl"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
    >
      {items.map(({ to, icon: Icon, label }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 transition ${
              active ? "text-white" : "text-foreground/55 hover:text-foreground"
            }`}
          >
            {active && <span className="bg-melo absolute inset-0 -z-10 rounded-full shadow-pop" />}
            <Icon size={20} strokeWidth={2.4} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
