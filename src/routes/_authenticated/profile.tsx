import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Flame, Check, Music2, LogIn } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/melo-data";
import { Cover } from "@/components/Cover";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profil musical — Melo" },
      { name: "description", content: "Ton profil musical, tes matchs et ton style." },
    ],
  }),
  component: () => (
    <PhoneShell>
      <ProfilePage />
    </PhoneShell>
  ),
});

function ProfilePage() {
  const { data: u, isLoading } = useMyProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  };
  if (isLoading || !u) return <p className="py-20 text-center text-sm text-foreground/50">Chargement…</p>;
  return (
    <section className="pb-4">
      <div className="mb-2 flex justify-end">
        <button onClick={signOut} aria-label="Se déconnecter" className="flex h-9 items-center gap-1.5 rounded-full border border-foreground/10 bg-white/70 px-3 text-xs font-bold backdrop-blur">
          <LogOut size={14} /> Déconnexion
        </button>
      </div>

      {/* avatar + name */}
      <div className="mb-6 flex flex-col items-center">
        <div
          className="relative mb-3 flex h-28 w-28 items-center justify-center rounded-[28px] text-4xl font-extrabold text-white shadow-pop"
          style={{ background: `linear-gradient(135deg, ${u.avatarColor}, var(--melo-pink))` }}
        >
          {u.name[0].toUpperCase()}
          <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-melo text-white shadow-pop">
            <Flame size={14} strokeWidth={2.8} fill="currentColor" />
          </span>

        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">{u.name}</h2>
        <p className="text-sm text-foreground/50">{u.handle}</p>
      </div>

      {/* stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat label="Matchs publiés" value={u.matchesUploaded} accent="var(--melo-blue)" />
        <Stat label="Taux validé" value={`${u.validatedRate}%`} accent="var(--melo-green)" />
      </div>

      {/* musical profile */}
      <div className="mb-6 rounded-[24px] border-2 p-5 text-white shadow-pop" style={{ background: "var(--ink)", borderColor: "var(--melo-violet)" }}>
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60">
          <Music2 size={12} /> Profil musical
        </p>
        <div className="flex flex-wrap gap-2">
          {u.topGenres.length === 0 && <p className="text-sm text-white/50">Connecte ton compte musical pour remplir ton profil.</p>}
          {u.topGenres.map((g, i) => {
            const colors = ["var(--melo-blue)", "var(--melo-pink)", "var(--melo-green)", "var(--melo-violet)", "var(--melo-yellow)"];
            const c = colors[i % colors.length];
            return (
              <span key={g} className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: `${c}25`, color: c, border: `1px solid ${c}50` }}>
                {g}
              </span>
            );
          })}
        </div>
        <Link
          to="/onboarding"
          className="mt-4 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          <span className="flex items-center gap-2"><LogIn size={14} /> Re-synchroniser Spotify / Deezer</span>
          <span className="text-white/40">→</span>
        </Link>
      </div>

      {/* recent matches */}
      <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-foreground/60">Derniers sons matchés</h3>
      <div className="grid gap-3">
        {u.recentMatches.length === 0 && <p className="text-sm text-foreground/50">Tu n'as pas encore publié de match.</p>}
        {u.recentMatches.map((m, i) => {
          const accents = ["var(--melo-pink)", "var(--melo-blue)", "var(--melo-green)"];
          const accent = accents[i % accents.length];
          return (
            <article key={m.id} className="rounded-2xl border-2 p-3 text-white shadow-pop" style={{ background: "var(--ink)", borderColor: accent }}>
              <div className="flex items-center gap-3">
                <Cover color={m.source.color} size={48} className="!rounded-xl" />
                <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: accent }}>
                  <Flame size={11} className="text-white" strokeWidth={2.8} fill="currentColor" />
                </div>

                <Cover color={m.match.color} size={48} className="!rounded-xl" />
                <div className="min-w-0 flex-1 text-right">
                  <p className="truncate text-[11px] font-bold" style={{ color: accent }}>{m.vibe}</p>
                  <p className="text-[10px] text-white/40">{m.likes} ♥ · {m.createdAt}</p>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <p className="truncate text-white/70"><span className="font-bold">{m.source.title}</span> · {m.source.artist}</p>
                <p className="truncate text-right text-white/70"><span className="font-bold">{m.match.title}</span> · {m.match.artist}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border-2 bg-white p-4 shadow-pop" style={{ borderColor: accent }}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">{label}</p>
      <p className="mt-1 text-3xl font-extrabold" style={{ color: accent }}>{value}</p>
      <Check size={18} className="absolute right-3 top-3 text-foreground/20" />
    </div>
  );
}
