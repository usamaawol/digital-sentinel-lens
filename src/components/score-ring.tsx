import { scoreBand } from "@/lib/mock-data";

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
}

export function ScoreRing({ score, size = 140, stroke = 10, label }: Props) {
  const band = scoreBand(score);
  const color =
    band === "safe"
      ? "var(--color-success)"
      : band === "low"
        ? "var(--color-primary)"
        : band === "medium"
          ? "var(--color-warning)"
          : "var(--color-destructive)";
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-muted)"
          strokeWidth={stroke}
          fill="none"
          opacity={0.4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms ease", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums">{score}</div>
          {label && <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>}
        </div>
      </div>
    </div>
  );
}
