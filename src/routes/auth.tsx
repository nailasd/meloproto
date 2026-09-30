import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Melo" },
      { name: "description", content: "Crée ton compte Melo ou connecte-toi pour voter et matcher des sons." },
      { property: "og:title", content: "Connexion — Melo" },
      { property: "og:description", content: "Rejoins Melo, le réseau où la communauté matche les sons par vibe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/" }); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (s) navigate({ to: "/" }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { username: username.trim() } },
      });
      setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Vérifie tes emails pour confirmer ton compte ✉️" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ ok: false, text: "Email ou mot de passe incorrect." });
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg({ ok: false, text: "Connexion Google impossible." });
  };

  const input = "w-full rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-foreground/40 focus:border-foreground/30 focus:shadow-pop";

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-[420px] flex-col justify-center px-6 py-10">
      <h1 className="text-center text-5xl font-extrabold tracking-tight">Melo</h1>
      <p className="mb-8 mt-2 text-center text-sm text-foreground/60">Your next favourite song.</p>

      <div className="rounded-[28px] border-2 p-6 shadow-pop" style={{ background: "var(--ink)", borderColor: "var(--melo-violet)" }}>
        <div className="mb-5 flex rounded-full bg-white/10 p-1">
          {(["in", "up"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setMsg(null); }}
              className={`relative flex-1 rounded-full py-2 text-sm font-bold ${mode === m ? "bg-melo text-white" : "text-white/60"}`}>
              {m === "in" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="grid gap-3">
          {mode === "up" && (
            <input required minLength={2} maxLength={24} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="nom d'utilisateur" className={input} />
          )}
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className={input} />
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mot de passe" className={input} />
          <button disabled={busy} className="bg-melo mt-1 rounded-2xl py-3.5 text-sm font-bold text-white shadow-pop disabled:opacity-50">
            {mode === "in" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-white/40"><span className="h-px flex-1 bg-white/15" />ou<span className="h-px flex-1 bg-white/15" /></div>
        <button onClick={google} className="w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-foreground">
          Continuer avec Google
        </button>

        {msg && <p className={`mt-4 text-center text-sm ${msg.ok ? "text-white" : "text-[var(--melo-pink)]"}`}>{msg.text}</p>}
      </div>
    </div>
  );
}
