import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, X, Sparkles, Search, Check, ArrowRight, Play } from "lucide-react";
import { Cover } from "@/components/Cover";
import { allTracks, mockMatches, vibes, type Match, type Track } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Melo — vote & match the sounds that share your vibe" },
      { name: "description", content: "Melo is a music discovery network where the community pairs songs by vibe. Vote on matches or propose your own." },
      { property: "og:title", content: "Melo" },
      { property: "og:description", content: "Vote on song matches. Propose your own. Find the sounds that match your vibe." },
    ],
  }),
  component: MeloPage,
});

type Tab = "vote" | "match";

function MeloPage() {
  const [tab, setTab] = useState<Tab>("vote");

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[520px] flex-col px-5 pb-10 pt-6">
      {/* brand */}
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-melo flex h-10 w-10 items-center justify-center rounded-2xl shadow-pop">
            <Sparkles size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-melo">Melo</span>
          </h1>
        </div>
        <div className="rounded-full border border-foreground/10 bg-white/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-foreground/60 backdrop-blur">
          beta
        </div>
      </header>

      {/* tab switcher */}
      <TabSwitcher tab={tab} setTab={setTab} />

      <main className="mt-6 flex-1">
        {tab === "vote" ? <VoteView /> : <MatchView />}
      </main>
    </div>
  );
}

function TabSwitcher({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="relative flex rounded-full border border-foreground/10 bg-white/70 p-1 shadow-pop backdrop-blur">
      <button
        onClick={() => setTab("vote")}
        className={`relative z-10 flex-1 rounded-full py-2.5 text-sm font-bold transition ${
          tab === "vote" ? "text-white" : "text-foreground/60 hover:text-foreground"
        }`}
      >
        {tab === "vote" && <span className="bg-melo absolute inset-0 -z-10 rounded-full shadow-pop" />}
        Voter
      </button>
      <button
        onClick={() => setTab("match")}
        className={`relative z-10 flex-1 rounded-full py-2.5 text-sm font-bold transition ${
          tab === "match" ? "text-white" : "text-foreground/60 hover:text-foreground"
        }`}
      >
        {tab === "match" && <span className="bg-melo absolute inset-0 -z-10 rounded-full shadow-pop" />}
        Matcher
      </button>
    </div>
  );
}

/* ----------------------------- VOTE (Tinder) ----------------------------- */

const ACCENTS = [
  "var(--melo-blue)",
  "var(--melo-green)",
  "var(--melo-violet)",
  "var(--melo-pink)",
  "var(--melo-yellow)",
];

function VoteView() {
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<{ yes: number; no: number }>({ yes: 0, no: 0 });
  const [lastVote, setLastVote] = useState<"yes" | "no" | null>(null);

  const current = mockMatches[index % mockMatches.length];
  const accent = ACCENTS[index % ACCENTS.length];

  const vote = (v: "yes" | "no") => {
    setVotes((s) => ({ ...s, [v]: s[v] + 1 }));
    setLastVote(v);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setLastVote(null);
    }, 220);
  };

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-bold tracking-tight">Ce match, ça vibe&nbsp;?</h2>
        <span className="text-xs font-medium text-foreground/50">
          {votes.yes + votes.no} votes
        </span>
      </div>
      <p className="mb-5 text-sm text-foreground/60">
        Glisse vers la droite si les deux sons matchent vraiment.
      </p>

      <div key={current.id + index} className="animate-pop">
        <VoteCard match={current} accent={accent} />
      </div>

      {/* vote buttons */}
      <div className="mt-6 flex items-center justify-center gap-5">
        <button
          onClick={() => vote("no")}
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-foreground/10 bg-white text-foreground shadow-pop transition active:scale-95 ${
            lastVote === "no" ? "scale-90" : ""
          }`}
          style={{ borderColor: lastVote === "no" ? "var(--melo-pink)" : undefined }}
          aria-label="Passer"
        >
          <X size={26} strokeWidth={3} />
        </button>
        <button
          onClick={() => vote("yes")}
          className={`bg-melo flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-glow transition active:scale-95 ${
            lastVote === "yes" ? "scale-90" : ""
          }`}
          aria-label="Ça matche"
        >
          <Heart size={32} strokeWidth={2.6} fill="currentColor" />
        </button>
        <button
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-foreground/10 bg-white text-foreground shadow-pop transition active:scale-95"
          aria-label="Écouter"
        >
          <Play size={22} strokeWidth={2.6} fill="currentColor" />
        </button>
      </div>
    </section>
  );
}

function VoteCard({ match, accent }: { match: Match; accent: string }) {
  return (
    <article
      className="relative overflow-hidden rounded-[28px] p-5 text-card-foreground shadow-pop"
      style={{
        background: "var(--ink)",
        border: `2px solid ${accent}`,
        boxShadow: `0 18px 40px -18px ${accent}80, 0 0 0 1px ${accent}30`,
      }}
    >
      {/* glow blob */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: accent }}
      />

      <header className="relative mb-5 flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: accent }}
        >
          {match.author.name[0].toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-white">{match.author.name}</span>
        <span className="text-xs text-white/40">· {match.createdAt}</span>
        <span
          className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
          style={{ background: `${accent}25`, color: accent }}
        >
          <Sparkles size={11} /> {match.vibe}
        </span>
      </header>

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TrackSide track={match.source} />
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-pop"
          style={{ background: accent }}
        >
          <Sparkles size={18} strokeWidth={2.6} />
        </div>
        <TrackSide track={match.match} align="right" />
      </div>

      <footer className="relative mt-5 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
        <span className="text-xs font-medium text-white/60">
          {match.likes} personnes ont matché
        </span>
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: accent }}
        >
          en ligne
        </span>
      </footer>
    </article>
  );
}

function TrackSide({ track, align = "left" }: { track: Track; align?: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${align === "right" ? "items-end text-right" : "items-start"}`}>
      <Cover color={track.color} size={104} />
      <div className="w-full min-w-0">
        <p className="truncate text-sm font-bold text-white">{track.title}</p>
        <p className="truncate text-xs text-white/50">{track.artist}</p>
      </div>
    </div>
  );
}

/* ----------------------------- MATCH (create) ----------------------------- */

function MatchView() {
  const [source, setSource] = useState<Track | null>(null);
  const [matchTrack, setMatchTrack] = useState<Track | null>(null);
  const [vibe, setVibe] = useState("");
  const [picking, setPicking] = useState<"source" | "match" | null>("source");
  const [query, setQuery] = useState("");
  const [published, setPublished] = useState(false);

  const accent = source
    ? matchTrack
      ? "var(--melo-green)"
      : "var(--melo-violet)"
    : "var(--melo-blue)";

  const tracks = useMemo(() => {
    const q = query.toLowerCase();
    return allTracks
      .filter((t) => (picking === "match" ? t.id !== source?.id : true))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
  }, [query, picking, source]);

  const canPublish = source && matchTrack && vibe;

  if (published) {
    return (
      <section className="animate-pop rounded-[28px] border-2 p-8 text-center text-card-foreground shadow-glow"
        style={{ background: "var(--ink)", borderColor: "var(--melo-green)" }}>
        <div className="bg-cool mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-pop">
          <Check size={28} strokeWidth={3} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Match publié&nbsp;✨</h3>
        <p className="mt-2 text-sm text-white/60">
          Ton match part en vote. Tu seras notifié quand la communauté réagit.
        </p>
        <button
          onClick={() => {
            setSource(null); setMatchTrack(null); setVibe(""); setPicking("source"); setPublished(false);
          }}
          className="bg-melo mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-pop"
        >
          en proposer un autre <ArrowRight size={16} />
        </button>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight">Propose un match</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Associe deux sons qui partagent la même vibe.
        </p>
      </div>

      {/* preview card with two slots */}
      <article
        className="relative mb-5 overflow-hidden rounded-[28px] p-5 text-card-foreground shadow-pop transition-all"
        style={{
          background: "var(--ink)",
          border: `2px solid ${accent}`,
          boxShadow: `0 18px 40px -18px ${accent}80`,
        }}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Slot
            track={source}
            color="var(--melo-blue)"
            label="Son source"
            active={picking === "source"}
            onClick={() => setPicking("source")}
          />
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-pop"
            style={{ background: accent }}
          >
            <Sparkles size={18} strokeWidth={2.6} />
          </div>
          <Slot
            track={matchTrack}
            color="var(--melo-pink)"
            label="Son qui matche"
            active={picking === "match"}
            onClick={() => setPicking("match")}
            align="right"
          />
        </div>
      </article>

      {/* picker */}
      {picking && (
        <div className="mb-5">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={picking === "source" ? "cherche le son source…" : "cherche le son qui matche…"}
              className="w-full rounded-2xl border border-foreground/10 bg-white py-3 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-foreground/30 focus:shadow-pop"
            />
          </div>
          <div className="grid max-h-[280px] grid-cols-1 gap-2 overflow-y-auto pr-1">
            {tracks.map((t) => {
              const selected = picking === "source" ? source?.id === t.id : matchTrack?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (picking === "source") {
                      setSource(t);
                      setPicking(matchTrack ? null : "match");
                    } else {
                      setMatchTrack(t);
                      setPicking(null);
                    }
                    setQuery("");
                  }}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-2.5 text-left transition ${
                    selected ? "shadow-pop" : "border-foreground/10 hover:border-foreground/20"
                  }`}
                  style={selected ? { borderColor: picking === "source" ? "var(--melo-blue)" : "var(--melo-pink)" } : undefined}
                >
                  <Cover color={t.color} size={44} className="!rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{t.title}</p>
                    <p className="truncate text-xs text-foreground/50">{t.artist}</p>
                  </div>
                  {selected && <Check size={18} className="text-foreground" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* vibe */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-foreground/60">
          La vibe
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          {vibes.slice(0, 8).map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v)}
              className={`rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition ${
                vibe === v
                  ? "bg-melo border-transparent text-white shadow-pop"
                  : "border-foreground/10 bg-white text-foreground/70 hover:border-foreground/30"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <input
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          placeholder="ou écris ta propre vibe…"
          className="w-full rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-foreground/40 focus:border-foreground/30 focus:shadow-pop"
        />
      </div>

      <button
        disabled={!canPublish}
        onClick={() => setPublished(true)}
        className="bg-melo flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-pop transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        publier le match <ArrowRight size={18} />
      </button>
    </section>
  );
}

function Slot({
  track, color, label, active, onClick, align = "left",
}: {
  track: Track | null;
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-0 flex-col gap-2 rounded-2xl p-1 text-left transition ${
        align === "right" ? "items-end text-right" : "items-start"
      } ${active ? "ring-2 ring-offset-2 ring-offset-[var(--ink)]" : ""}`}
      style={active ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
    >
      {track ? (
        <Cover color={track.color} size={104} />
      ) : (
        <div
          className="flex h-[104px] w-[104px] items-center justify-center rounded-2xl border-2 border-dashed text-2xl font-bold"
          style={{ borderColor: color, color }}
        >
          +
        </div>
      )}
      <div className="w-full min-w-0">
        {track ? (
          <>
            <p className="truncate text-sm font-bold text-white">{track.title}</p>
            <p className="truncate text-xs text-white/50">{track.artist}</p>
          </>
        ) : (
          <>
            <p className="truncate text-xs font-bold uppercase tracking-widest" style={{ color }}>
              {label}
            </p>
            <p className="truncate text-xs text-white/40">choisis un son</p>
          </>
        )}
      </div>
    </button>
  );
}
