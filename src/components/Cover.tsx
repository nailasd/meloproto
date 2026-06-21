import { Music2, Play } from "lucide-react";

export function Cover({
  color,
  size = 96,
  className = "",
  playable = false,
  onPlay,
}: {
  color: string;
  size?: number;
  className?: string;
  playable?: boolean;
  onPlay?: () => void;
}) {
  return (
    <div
      className={`group relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, #1a0033 120%)`,
        boxShadow: `0 8px 28px -8px ${color}80, inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: `radial-gradient(circle at 30% 20%, white, transparent 50%)` }}
      />
      <Music2 className="relative z-10 text-white/80" size={size * 0.28} strokeWidth={2.2} />
      {playable && (
        <button
          onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
          aria-label="Écouter un extrait"
          className="absolute bottom-2 right-2 z-20 flex items-center justify-center rounded-full bg-white text-foreground shadow-pop transition active:scale-90"
          style={{ width: Math.max(28, size * 0.28), height: Math.max(28, size * 0.28) }}
        >
          <Play size={Math.max(12, size * 0.13)} strokeWidth={2.6} fill="currentColor" />
        </button>
      )}
    </div>
  );
}
