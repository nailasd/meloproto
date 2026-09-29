import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Heart, X, Flame, Search, Check, ArrowRight } from "lucide-react";
import { Cover } from "@/components/Cover";
import { PhoneShell } from "@/components/PhoneShell";
import { allTracks, vibes, type Match, type Track } from "@/lib/mock-data";
import { useVoteQueue, useVote, usePublishMatch } from "@/lib/melo-data";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Melo — vote & match the sounds that share your vibe" },
      { name: "description", content: "Melo: vote on song matches or propose your own. Find the sounds that match your vibe." },
      { property: "og:title", content: "Melo" },
      { property: "og:description", content: "Vote on song matches. Propose your own." },
    ],
  }),
  component: () => (
    <PhoneShell>
      <MeloHome />
    </PhoneShell>
  ),
});

type Tab = "vote" | "match";

function MeloHome() {
  const [tab, setTab] = useState<Tab>("vote");
  return (
    <>
      <TabSwitcher tab={tab} setTab={setTab} />
      <div className="mt-6">{tab === "vote" ? <VoteView /> : <MatchView />}</div>
    </>
  );
}

function TabSwitcher({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="relative flex rounded-full border border-foreground/10 bg-white/70 p-1 shadow-pop backdrop-blur">
      {(["vote", "match"] as Tab[]).map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`relative z-10 flex-1 rounded-full py-2.5 text-sm font-bold transition ${
            tab === t ? "text-white" : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {tab === t && <span className="bg-melo absolute inset-0 -z-10 rounded-full shadow-pop" />}
          {t === "vote" ? "Voter" : "Matcher"}
        </button>
      ))}
    </div>
  );
}

const ACCENTS = ["var(--melo-violet)", "var(--melo-pink)"];

const FILTERS = [
  { id: "all",      label: "Pour toi" },
  { id: "rap-fr",   label: "Rap FR" },
  { id: "chill",    label: "Chill" },
  { id: "love",     label: "Love" },
  { id: "drive",    label: "Drive" },
  { id: "lo-fi",    label: "Lo-fi" },
  { id: "euphoria", label: "Euphoria" },
] as const;

function VoteView() {
  const [filter, setFilter] = useState<string>("all");
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const [exiting, setExiting] = useState<"yes" | "no" | null>(null);
  const queue = useVoteQueue();
  const voteMut = useVote();
  const [done, setDone] = useState<Set<string>>(new Set());

  const pool = useMemo(() => {
    const all = queue.data.filter((m) => !done.has(m.id));
    return filter === "all" ? all : all.filter((m) => m.genre === filter);
  }, [filter, queue.data, done]);
  const current = pool[0];
  const accent = ACCENTS[index % ACCENTS.length];

  // swipe state
  const startX = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  const vote = (v: "yes" | "no") => {
    if (exiting || !current) return;
    voteMut.mutate({ matchId: current.id, liked: v === "yes" });
    const id = current.id;
    setVotes((s) => ({ ...s, [v]: s[v] + 1 }));
    setExiting(v);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setDone((d) => new Set(d).add(id));
      setExiting(null);
      setDrag(0);
    }, 260);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    setDrag(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (startX.current === null) return;
    if (drag > 110) vote("yes");
    else if (drag < -110) vote("no");
    else setDrag(0);
    startX.current = null;
  };

  const translate = exiting === "yes" ? 520 : exiting === "no" ? -520 : drag;
  const rotate = translate * 0.05;
  const likeOpacity = Math.max(0, Math.min(1, drag / 120));
  const passOpacity = Math.max(0, Math.min(1, -drag / 120));

  return (
    <section>
      {/* Filters */}
      <div className="-mx-5 mb-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 pb-1">
          {FILTERS.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setIndex(0); }}
                className={`shrink-0 rounded-full border-2 px-4 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-melo border-transparent text-white shadow-pop"
                    : "border-foreground/10 bg-white/70 text-foreground/70 backdrop-blur hover:border-foreground/30"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipeable card */}
      <div className="relative touch-none select-none" style={{ minHeight: 460 }}>
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            transform: `translateX(${translate}px) rotate(${rotate}deg)`,
            transition: exiting || startX.current === null ? "transform 260ms cubic-bezier(0.22,1,0.36,1)" : "none",
          }}
        >
          {current ? (
            <VoteCard match={current} accent={accent} likeOpacity={likeOpacity} passOpacity={passOpacity} />
          ) : (
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-[32px] border-2 p-8 text-center text-white" style={{ background: "var(--ink)", borderColor: "var(--melo-violet)" }}>
              <Flame size={32} className="mb-3" fill="currentColor" />
              <p className="text-lg font-bold">{queue.isLoading ? "Chargement…" : "Tu as tout voté !"}</p>
              {!queue.isLoading && <p className="mt-2 text-sm text-white/60">Reviens plus tard ou propose ton propre match.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          onClick={() => vote("no")}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-foreground/10 bg-white text-foreground shadow-pop transition active:scale-90"
          aria-label="Passer"
        >
          <X size={26} strokeWidth={3} />
        </button>
        <span className="text-xs font-semibold text-foreground/40">{votes.yes + votes.no} votes</span>
        <button
          onClick={() => vote("yes")}
          className="bg-melo flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-glow transition active:scale-90"
          aria-label="Ça matche"
        >
          <Heart size={28} strokeWidth={2.6} fill="currentColor" />
        </button>
      </div>
    </section>
  );
}

function VoteCard({
  match,
  accent,
  likeOpacity,
  passOpacity,
}: {
  match: Match;
  accent: string;
  likeOpacity: number;
  passOpacity: number;
}) {
  return (
    <article
      className="relative overflow-hidden rounded-[32px] p-5 text-card-foreground shadow-pop"
      style={{
        background: "var(--ink)",
        border: `2px solid ${accent}`,
        boxShadow: `0 22px 50px -22px ${accent}99, 0 0 0 1px ${accent}30`,
      }}
    >
      {/* swipe overlays */}
      <div
        className="pointer-events-none absolute left-5 top-5 z-20 rotate-[-12deg] rounded-xl border-2 px-3 py-1 text-sm font-extrabold uppercase tracking-widest"
        style={{ borderColor: "var(--melo-pink)", color: "var(--melo-pink)", opacity: passOpacity }}
      >
        nope
      </div>
      <div
        className="pointer-events-none absolute right-5 top-5 z-20 rotate-[12deg] rounded-xl border-2 px-3 py-1 text-sm font-extrabold uppercase tracking-widest"
        style={{ borderColor: "var(--melo-violet-soft)", color: "var(--melo-violet-soft)", opacity: likeOpacity }}
      >
        match
      </div>

      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-50 blur-3xl" style={{ background: accent }} />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: accent }} />

      {/* header */}
      <header className="relative mb-5 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: accent }}>
          {match.author.name[0].toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-white">{match.author.name}</span>
        <span className="text-xs text-white/40">· {match.createdAt}</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${accent}25`, color: accent }}>
          {match.vibe}
        </span>
      </header>

      {/* stacked tracks — taller layout */}
      <div className="relative flex flex-col items-center gap-4 py-2">
        <TrackRow track={match.source} accent={accent} />

        <div className="relative flex w-full items-center gap-3">
          <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-pop" style={{ background: accent }}>
            <Flame size={22} strokeWidth={2.4} fill="currentColor" />
          </span>
          <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
        </div>

        <TrackRow track={match.match} accent={accent} />
      </div>

      {/* footer */}
      <footer className="relative mt-5 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
          <Flame size={12} fill="currentColor" /> {match.likes} ont matché
        </span>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>en ligne</span>
      </footer>
    </article>
  );
}

function TrackRow({ track, accent }: { track: Track; accent: string }) {
  return (
    <div className="flex w-full items-center gap-4 rounded-2xl bg-white/5 p-3" style={{ boxShadow: `inset 0 0 0 1px ${accent}25` }}>
      <Cover color={track.color} size={88} playable />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-extrabold text-white">{track.title}</p>
        <p className="truncate text-sm text-white/55">{track.artist}</p>
      </div>
    </div>
  );
}

function MatchView() {
  const [source, setSource] = useState<Track | null>(null);
  const [matchTrack, setMatchTrack] = useState<Track | null>(null);
  const [vibe, setVibe] = useState("");
  const [picking, setPicking] = useState<"source" | "match" | null>("source");
  const [query, setQuery] = useState("");
  const [published, setPublished] = useState(false);
  const publish = usePublishMatch();

  const accent = source && matchTrack ? "var(--melo-pink)" : "var(--melo-violet)";

  const tracks = useMemo(() => {
    const q = query.toLowerCase();
    return allTracks
      .filter((t) => (picking === "match" ? t.id !== source?.id : true))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
  }, [query, picking, source]);

  const canPublish = source && matchTrack && vibe;

  if (published) {
    return (
      <section className="animate-pop rounded-[28px] border-2 p-8 text-center text-card-foreground shadow-glow" style={{ background: "var(--ink)", borderColor: "var(--melo-pink)" }}>
        <div className="bg-melo mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-pop">
          <Check size={28} strokeWidth={3} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Match publié 🔥</h3>
        <p className="mt-2 text-sm text-white/60">Ton match part en vote. Tu seras notifié quand la communauté réagit.</p>
        <button
          onClick={() => { setSource(null); setMatchTrack(null); setVibe(""); setPicking("source"); setPublished(false); }}
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
        <p className="mt-1 text-sm text-foreground/60">Associe deux sons qui partagent la même vibe.</p>
      </div>

      <article
        className="relative mb-5 overflow-hidden rounded-[28px] p-5 text-card-foreground shadow-pop"
        style={{ background: "var(--ink)", border: `2px solid ${accent}`, boxShadow: `0 18px 40px -18px ${accent}80` }}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Slot track={source} color="var(--melo-violet)" label="Son source" active={picking === "source"} onClick={() => setPicking("source")} />
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-pop" style={{ background: accent }}>
            <Flame size={18} strokeWidth={2.4} fill="currentColor" />
          </div>
          <Slot track={matchTrack} color="var(--melo-pink)" label="Son qui matche" active={picking === "match"} onClick={() => setPicking("match")} align="right" />
        </div>
      </article>

      {picking && (
        <div className="mb-5">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={picking === "source" ? "cherche le son source…" : "cherche le son qui matche…"}
              className="w-full rounded-2xl border border-foreground/10 bg-white py-3 pl-11 pr-4 text-sm outline-none placeholder:text-foreground/40 focus:border-foreground/30 focus:shadow-pop"
            />
          </div>
          <div className="grid max-h-[260px] grid-cols-1 gap-2 overflow-y-auto pr-1">
            {tracks.map((t) => {
              const selected = picking === "source" ? source?.id === t.id : matchTrack?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (picking === "source") { setSource(t); setPicking(matchTrack ? null : "match"); }
                    else { setMatchTrack(t); setPicking(null); }
                    setQuery("");
                  }}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-2.5 text-left transition ${selected ? "shadow-pop" : "border-foreground/10 hover:border-foreground/20"}`}
                  style={selected ? { borderColor: picking === "source" ? "var(--melo-violet)" : "var(--melo-pink)" } : undefined}
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

      <div className="mb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-foreground/60">La vibe</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {vibes.slice(0, 8).map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v)}
              className={`rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition ${
                vibe === v ? "bg-melo border-transparent text-white shadow-pop" : "border-foreground/10 bg-white text-foreground/70 hover:border-foreground/30"
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
        disabled={!canPublish || publish.isPending}
        onClick={() => source && matchTrack && publish.mutate(
          { source, match: matchTrack, vibe, genre: guessGenre(vibe) },
          { onSuccess: () => setPublished(true) },
        )}
        className="bg-melo flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-pop transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        publier le match <ArrowRight size={18} />
      </button>
    </section>
  );
}

function Slot({ track, color, label, active, onClick, align = "left" }: {
  track: Track | null; color: string; label: string; active: boolean; onClick: () => void; align?: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-0 flex-col gap-2 rounded-2xl p-1 text-left transition ${align === "right" ? "items-end text-right" : "items-start"}`}
      style={active ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
    >
      {track ? (
        <Cover color={track.color} size={104} />
      ) : (
        <div className="flex h-[104px] w-[104px] items-center justify-center rounded-2xl border-2 border-dashed text-2xl font-bold" style={{ borderColor: color, color }}>+</div>
      )}
      <div className="w-full min-w-0">
        {track ? (
          <>
            <p className="truncate text-sm font-bold text-white">{track.title}</p>
            <p className="truncate text-xs text-white/50">{track.artist}</p>
          </>
        ) : (
          <>
            <p className="truncate text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
            <p className="truncate text-xs text-white/40">choisis un son</p>
          </>
        )}
      </div>
    </button>
  );
}

function guessGenre(vibe: string) {
  const v = vibe.toLowerCase();
  if (v.includes("rap")) return "rap-fr";
  if (v.includes("love") || v.includes("heart")) return "love";
  if (v.includes("drive")) return "drive";
  if (v.includes("lo-fi") || v.includes("lofi")) return "lo-fi";
  if (v.includes("euphor") || v.includes("hyper") || v.includes("rage")) return "euphoria";
  return "chill";
}
