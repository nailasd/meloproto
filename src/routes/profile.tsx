import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Ton profil vibe — vibematch" }],
  }),
  component: Profile,
});

function Profile() {
  return (
    <AppShell>
      <div className="bg-card-gradient flex flex-col items-center rounded-3xl border border-white/10 p-8 text-center">
        <div className="bg-vibe mb-4 flex h-20 w-20 animate-pulse-glow items-center justify-center rounded-3xl text-3xl">
          ✨
        </div>
        <h1 className="text-2xl font-bold">ton profil vibe</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          bientôt — connecte Spotify, Deezer ou Apple Music pour pré-remplir ton profil et matcher tes sons.
        </p>
        <button className="bg-vibe mt-6 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-glow">
          rejoindre la waitlist
        </button>
      </div>
    </AppShell>
  );
}
