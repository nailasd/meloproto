import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Match, Track } from "@/lib/mock-data";

const AVATAR_COLORS = ["#8a5cff", "#ff5ea8", "#c084fc", "#f472b6", "#a78bfa", "#e879f9"];

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}j`;
}

type Row = {
  id: string; author_id: string | null; author_name: string; source: unknown; match: unknown;
  vibe: string; genre: string; likes_count: number; nopes_count: number; created_at: string;
};

export type DbMatch = Match & { authorId: string | null; nopes: number };

function toMatch(r: Row): DbMatch {
  return {
    id: r.id,
    source: { cover: "", ...(r.source as Track) },
    match: { cover: "", ...(r.match as Track) },
    vibe: r.vibe,
    genre: r.genre as Match["genre"],
    author: { name: r.author_name, avatarColor: AVATAR_COLORS[r.author_name.length % AVATAR_COLORS.length] },
    likes: r.likes_count,
    nopes: r.nopes_count,
    createdAt: ago(r.created_at),
    authorId: r.author_id,
  };
}

export function useUserId() {
  return useQuery({
    queryKey: ["me-id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data as Row[]).map(toMatch);
    },
  });
}

/** Matches the current user hasn't voted on yet (and didn't author). */
export function useVoteQueue() {
  const matches = useMatches();
  const me = useUserId();
  const votes = useQuery({
    queryKey: ["my-votes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("votes").select("match_id");
      if (error) throw error;
      return new Set(data.map((v) => v.match_id));
    },
  });
  const list = (matches.data ?? []).filter((m) => !votes.data?.has(m.id) && m.authorId !== me.data);
  return { data: list, isLoading: matches.isLoading || votes.isLoading };
}

export function useVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, liked }: { matchId: string; liked: boolean }) => {
      const { error } = await supabase.from("votes").insert({ match_id: matchId, liked });
      if (error && error.code !== "23505") throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-votes"] }),
  });
}

export function usePublishMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { source: Track; match: Track; vibe: string; genre: string }) => {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      const strip = (t: Track) => ({ id: t.id, title: t.title, artist: t.artist, color: t.color });
      const { error } = await supabase.from("matches").insert({
        author_id: uid, source: strip(p.source), match: strip(p.match), vibe: p.vibe, genre: p.genre,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      if (!uid) return null;
      const [{ data: profile }, { data: mine }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("matches").select("*").eq("author_id", uid).order("created_at", { ascending: false }),
      ]);
      const rows = (mine ?? []) as Row[];
      const likes = rows.reduce((a, r) => a + r.likes_count, 0);
      const total = rows.reduce((a, r) => a + r.likes_count + r.nopes_count, 0);
      return {
        name: profile?.username ?? "melo",
        handle: `@${(profile?.username ?? "melo").toLowerCase().replace(/\s+/g, "")}`,
        avatarColor: profile?.avatar_color ?? "#8a5cff",
        topGenres: profile?.top_genres ?? [],
        matchesUploaded: rows.length,
        validatedRate: total ? Math.round((likes / total) * 100) : 0,
        recentMatches: rows.slice(0, 5).map(toMatch),
      };
    },
  });
}
