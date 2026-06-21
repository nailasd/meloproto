import { Heart, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { Cover } from "./Cover";
import type { Match } from "@/lib/mock-data";

export function MatchCard({ match }: { match: Match }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(match.likes);

  return (
    <article className="bg-card-gradient relative overflow-hidden rounded-3xl border border-white/10 p-5 shadow-soft transition-transform hover:-translate-y-0.5">
      {/* author */}
      <header className="mb-4 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${match.author.avatarColor}, #1a0033)` }}
        >
          {match.author.name[0].toUpperCase()}
        </div>
        <span className="text-sm font-medium text-foreground">{match.author.name}</span>
        <span className="text-xs text-muted-foreground">· {match.createdAt}</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles size={11} className="text-accent" />
          {match.vibe}
        </span>
      </header>

      {/* the match: source → match */}
      <div className="relative flex items-center justify-between gap-3 py-2">
        <TrackBlock track={match.source} align="left" />

        {/* connector */}
        <div className="relative flex shrink-0 flex-col items-center">
          <div className="bg-vibe h-px w-10" />
          <div className="bg-vibe my-1 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-glow">
            <Sparkles size={16} strokeWidth={2.5} />
          </div>
          <div className="bg-vibe h-px w-10" />
        </div>

        <TrackBlock track={match.match} align="right" />
      </div>

      {/* actions */}
      <footer className="mt-4 flex items-center gap-2">
        <button
          onClick={() => {
            setLiked(!liked);
            setLikeCount((c) => c + (liked ? -1 : 1));
          }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
            liked
              ? "bg-accent/20 text-accent shadow-pink"
              : "bg-white/5 text-foreground hover:bg-white/10"
          }`}
        >
          <Heart size={15} fill={liked ? "currentColor" : "none"} />
          {likeCount}
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-white/10">
          <Play size={15} fill="currentColor" />
          preview
        </button>
        <button className="ml-auto rounded-full bg-white/5 px-3.5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-white/10">
          + ma biblio
        </button>
      </footer>
    </article>
  );
}

function TrackBlock({ track, align }: { track: { title: string; artist: string; color: string }; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-2 ${align === "right" ? "items-end text-right" : "items-start"}`}>
      <Cover color={track.color} size={88} />
      <div className="min-w-0 w-full">
        <p className="truncate text-sm font-semibold text-foreground">{track.title}</p>
        <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
      </div>
    </div>
  );
}
