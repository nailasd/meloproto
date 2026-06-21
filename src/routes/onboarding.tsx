import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Bienvenue sur Melo" },
      { name: "description", content: "Synchronise ta musique pour démarrer." },
    ],
  }),
  component: OnboardingPage,
});

type Provider = { id: string; name: string; color: string; emoji: string };

const providers: Provider[] = [
  { id: "spotify", name: "Spotify", color: "#34e0a1", emoji: "🟢" },
  { id: "deezer", name: "Deezer", color: "#8a5cff", emoji: "🟣" },
  { id: "apple", name: "Apple Music", color: "#ff5ea8", emoji: "🍎" },
  { id: "ytm", name: "YouTube Music", color: "#ff4d4d", emoji: "▶️" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  const sync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setDone(true); }, 1600);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-6 pb-10 pt-12" style={{ minHeight: "100dvh" }}>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-melo">Melo</span>
        </h1>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-foreground/50">beta</p>
      </header>

      {!done ? (
        <>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">Connecte ta musique</h2>
            <p className="mt-2 text-sm text-foreground/60">
              On lit tes sons préférés pour pré-remplir ton profil et te proposer direct des matchs qui collent.
            </p>
          </div>

          <div className="grid gap-3">
            {providers.map((p) => {
              const active = selected === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  disabled={syncing}
                  className={`flex items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition shadow-pop ${
                    active ? "" : "border-foreground/10 hover:border-foreground/20"
                  }`}
                  style={active ? { borderColor: p.color, boxShadow: `0 0 0 1px ${p.color}, 0 18px 40px -18px ${p.color}80` } : undefined}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: `${p.color}20` }}>
                    {p.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold">{p.name}</p>
                    <p className="text-xs text-foreground/50">Sync tes top sons & playlists</p>
                  </div>
                  {active && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: p.color }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            disabled={!selected || syncing}
            onClick={sync}
            className="bg-melo mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-pop transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {syncing ? (
              <><Sparkles size={18} className="animate-pulse" /> Synchronisation…</>
            ) : (
              <>Continuer <ArrowRight size={18} /></>
            )}
          </button>

          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-4 text-center text-xs font-semibold text-foreground/50 hover:text-foreground"
          >
            Passer pour l'instant
          </button>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="bg-melo mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] shadow-glow">
            <Check size={36} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Profil prêt ✨</h2>
          <p className="mt-2 max-w-xs text-sm text-foreground/60">
            On a importé tes top sons et détecté ton style musical. À toi de jouer.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="bg-melo mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-pop"
          >
            Découvrir les matchs <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
