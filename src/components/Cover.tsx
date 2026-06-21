import { Music2 } from "lucide-react";

export function Cover({
  color,
  size = 96,
  className = "",
}: {
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, #1a0033 120%)`,
        boxShadow: `0 8px 28px -8px ${color}80, inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 30% 20%, white, transparent 50%)`,
        }}
      />
      <Music2 className="relative z-10 text-white/90" size={size * 0.32} strokeWidth={2.2} />
    </div>
  );
}
