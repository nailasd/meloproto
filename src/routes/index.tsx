import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MatchCard } from "@/components/MatchCard";
import { mockMatches, vibes } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "vibematch — explore music that matches your vibe" },
      { name: "description", content: "Discover song matches shared by people who feel the same vibe. A human-powered music discovery network." },
      { property: "og:title", content: "vibematch — music that matches your vibe" },
      { property: "og:description", content: "Pinterest meets Spotify. Share song pairs that share a vibe." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const filtered = activeVibe
    ? mockMatches.filter((m) => m.vibe.toLowerCase().includes(activeVibe.toLowerCase()))
    : mockMatches;

  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          sons qui<br />
          <span className="text-vibe">matchent ta vibe</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          partagés par des gens qui ressentent la même chose que toi.
        </p>
      </section>

      {/* vibe filter */}
      <div className="-mx-5 mb-6 overflow-x-auto px-5">
        <div className="flex gap-2 pb-1">
          <Chip active={activeVibe === null} onClick={() => setActiveVibe(null)}>
            tout
          </Chip>
          {vibes.map((v) => (
            <Chip
              key={v}
              active={activeVibe === v}
              onClick={() => setActiveVibe(activeVibe === v ? null : v)}
            >
              {v}
            </Chip>
          ))}
        </div>
      </div>

      {/* feed */}
      <div className="flex flex-col gap-4">
        {filtered.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            pas encore de match pour cette vibe. propose-en un ✨
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
        active
          ? "bg-vibe text-white shadow-glow"
          : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
