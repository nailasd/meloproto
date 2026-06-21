import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sparkles, Check, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Cover } from "@/components/Cover";
import { allTracks, vibes, type Track } from "@/lib/mock-data";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Créer un match — vibematch" },
      { name: "description", content: "Associe deux sons qui partagent la même vibe et partage-les avec la communauté." },
    ],
  }),
  component: CreateMatch,
});

function CreateMatch() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [source, setSource] = useState<Track | null>(null);
  const [match, setMatch] = useState<Track | null>(null);
  const [vibe, setVibe] = useState<string>("");
  const [query, setQuery] = useState("");

  const filteredTracks = allTracks.filter((t) => {
    if (query.length === 0) return true;
    const q = query.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
  }).filter((t) => (step === 2 ? t.id !== source?.id : true));

  const canPublish = source && match && vibe;

  return (
    <AppShell>
      <section className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          étape {step} / 3
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight">
          {step === 1 && <>choisis un <span className="text-vibe">son que t'aimes</span></>}
          {step === 2 && <>trouve un <span className="text-vibe">son qui matche</span></>}
          {step === 3 && <>décris la <span className="text-vibe">vibe</span></>}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {step === 1 && "le son que tu écoutes en boucle en ce moment."}
          {step === 2 && "un son qui te donne la même sensation."}
          {step === 3 && "en un mot — ce qui les rassemble."}
        </p>
      </section>

      {/* progress */}
      <div className="mb-6 flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all ${
              s <= step ? "bg-vibe shadow-glow" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* selected previews */}
      {(source || match) && (
        <div className="bg-card-gradient mb-5 flex items-center justify-between gap-3 rounded-3xl border border-white/10 p-4">
          {source ? <MiniTrack track={source} /> : <EmptyTrack label="?" />}
          <div className="bg-vibe flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-glow">
            <Sparkles size={14} strokeWidth={2.5} />
          </div>
          {match ? <MiniTrack track={match} align="right" /> : <EmptyTrack label="?" align="right" />}
        </div>
      )}

      {(step === 1 || step === 2) && (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="cherche un titre, un artiste…"
              className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:bg-white/10"
            />
          </div>
          <div className="flex flex-col gap-2">
            {filteredTracks.map((t) => {
              const selected = step === 1 ? source?.id === t.id : match?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (step === 1) {
                      setSource(t);
                      setStep(2);
                      setQuery("");
                    } else {
                      setMatch(t);
                      setStep(3);
                      setQuery("");
                    }
                  }}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    selected
                      ? "border-primary/60 bg-primary/10 shadow-glow"
                      : "border-white/10 bg-card/40 hover:border-white/20 hover:bg-card/70"
                  }`}
                >
                  <Cover color={t.color} size={48} className="!rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
                  </div>
                  {selected && <Check size={18} className="text-primary" />}
                </button>
              );
            })}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {vibes.map((v) => (
              <button
                key={v}
                onClick={() => setVibe(v)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  vibe === v
                    ? "bg-vibe text-white shadow-glow"
                    : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
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
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:bg-white/10"
          />

          <button
            disabled={!canPublish}
            onClick={() => navigate({ to: "/" })}
            className="bg-vibe mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-semibold text-white shadow-glow transition disabled:opacity-40"
          >
            publier le match <ArrowRight size={18} />
          </button>
        </>
      )}

      {step > 1 && step < 3 && (
        <button
          onClick={() => setStep((s) => (s === 2 ? 1 : 2) as 1 | 2)}
          className="mt-6 w-full rounded-full border border-white/10 bg-white/5 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          ← retour
        </button>
      )}
    </AppShell>
  );
}

function MiniTrack({ track, align = "left" }: { track: Track; align?: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2.5 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <Cover color={track.color} size={44} className="!rounded-xl" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{track.title}</p>
        <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
      </div>
    </div>
  );
}

function EmptyTrack({ label, align = "left" }: { label: string; align?: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2.5 opacity-50 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-white/20 text-lg text-muted-foreground">
        {label}
      </div>
      <p className="truncate text-xs text-muted-foreground">à choisir</p>
    </div>
  );
}
