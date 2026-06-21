import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { Cover } from "@/components/Cover";
import { PhoneShell } from "@/components/PhoneShell";
import { allTracks, mockMatches, universes, type Match, type Track } from "@/lib/mock-data";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explorer — Melo" },
      { name: "description", content: "Cherche un son et trouve les matchs de la communauté." },
    ],
  }),
  component: () => (
    <PhoneShell>
      <ExplorePage />
    </PhoneShell>
  ),
});

function ExplorePage() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Track | null>(null);
  const [universe, setUniverse] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return allTracks.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  const matches: Match[] = useMemo(() => {
    if (picked) return mockMatches.filter((m) => m.source.id === picked.id || m.match.id === picked.id);
    if (universe) {
      const u = universes.find((u) => u.id === universe)!;
      return mockMatches.filter((m) => m.vibe.toLowerCase().includes(u.name.toLowerCase().slice(0, 4)));
    }
    return mockMatches.slice(0, 4);
  }, [picked, universe]);

  return (
    <section>
      <h2 className="mb-1 text-2xl font-extrabold tracking-tight">Explorer</h2>
      <p className="mb-4 text-sm text-foreground/60">Cherche un son ou plonge dans un univers.</p>

      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPicked(null); setUniverse(null); }}
          placeholder="Cherche un son, un artiste…"
          className="w-full rounded-2xl border border-foreground/10 bg-white py-3.5 pl-12 pr-4 text-sm outline-none placeholder:text-foreground/40 focus:border-foreground/30 focus:shadow-pop"
        />
      </div>

      {results.length > 0 && (
        <div className="mb-5 grid gap-2">
          {results.map((t) => (
            <button
              key={t.id}
              onClick={() => { setPicked(t); setQuery(""); }}
              className="flex items-center gap-3 rounded-2xl border-2 border-foreground/10 bg-white p-2.5 text-left transition hover:border-foreground/30"
            >
              <Cover color={t.color} size={48} className="!rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{t.title}</p>
                <p className="truncate text-xs text-foreground/50">{t.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!picked && !query && (
        <>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-foreground/60">Univers de sons</h3>
          <div className="mb-6 grid grid-cols-2 gap-3">
            {universes.map((u) => (
              <button
                key={u.id}
                onClick={() => setUniverse(u.id === universe ? null : u.id)}
                className="relative flex h-28 flex-col justify-between overflow-hidden rounded-[22px] p-4 text-left text-white shadow-pop transition active:scale-[0.98]"
                style={{
                  background: "var(--ink)",
                  border: `2px solid ${u.color}`,
                  boxShadow: universe === u.id ? `0 0 0 2px ${u.color}, 0 18px 40px -18px ${u.color}` : undefined,
                }}
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl" style={{ background: u.color }} />
                <span className="text-3xl">{u.emoji}</span>
                <div>
                  <p className="text-base font-extrabold">{u.name}</p>
                  <p className="text-[11px] text-white/50">{u.count.toLocaleString()} matchs</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {picked && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border-2 p-3 text-white shadow-pop" style={{ background: "var(--ink)", borderColor: "var(--melo-violet)" }}>
          <Cover color={picked.color} size={48} className="!rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs uppercase tracking-widest text-white/50">Meilleurs matchs pour</p>
            <p className="truncate text-sm font-bold">{picked.title} — {picked.artist}</p>
          </div>
          <button onClick={() => setPicked(null)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">×</button>
        </div>
      )}

      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground/60">
        <TrendingUp size={14} /> {picked || universe ? "Matchs trouvés" : "Tendance"}
      </h3>

      <div className="grid gap-3">
        {matches.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-foreground/10 p-6 text-center text-sm text-foreground/50">
            Aucun match pour l'instant. Sois le premier à en proposer un.
          </p>
        )}
        {matches.map((m, i) => (
          <MiniMatch key={m.id} match={m} accent={["var(--melo-blue)", "var(--melo-pink)", "var(--melo-green)", "var(--melo-violet)", "var(--melo-yellow)"][i % 5]} />
        ))}
      </div>
    </section>
  );
}

function MiniMatch({ match, accent }: { match: Match; accent: string }) {
  return (
    <article
      className="relative overflow-hidden rounded-[22px] p-3.5 text-white shadow-pop"
      style={{ background: "var(--ink)", border: `2px solid ${accent}` }}
    >
      <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-3">
        <Cover color={match.source.color} size={52} className="!rounded-xl" />
        <div className="min-w-0">
          <p className="truncate text-xs font-bold">{match.source.title}</p>
          <p className="truncate text-[11px] text-white/50">{match.source.artist}</p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: accent }}>
          <Sparkles size={12} strokeWidth={2.8} />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Cover color={match.match.color} size={52} className="!rounded-xl" />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">{match.match.title}</p>
            <p className="truncate text-[11px] text-white/50">{match.match.artist}</p>
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11px]">
        <span className="rounded-full px-2 py-0.5 font-bold" style={{ background: `${accent}25`, color: accent }}>{match.vibe}</span>
        <span className="text-white/50">{match.likes} ♥ · @{match.author.name}</span>
      </div>
    </article>
  );
}
