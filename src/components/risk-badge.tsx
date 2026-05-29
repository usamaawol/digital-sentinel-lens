import { cn } from "@/lib/utils";

type Risk = "safe" | "low" | "medium" | "high";

const styles: Record<Risk, string> = {
  safe: "bg-success/15 text-success border-success/30",
  low: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

const labels: Record<Risk, string> = {
  safe: "Safe",
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
};

export function RiskBadge({ risk, className }: { risk: Risk; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[risk],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[risk]}
    </span>
  );
}
