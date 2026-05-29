import { ShieldCheck } from "lucide-react";

export function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${dims} bg-gradient-primary rounded-xl grid place-items-center shadow-glow`}
      >
        <ShieldCheck className="h-1/2 w-1/2 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`font-semibold tracking-tight ${text}`}>Privacy Guard</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI</span>
      </div>
    </div>
  );
}
