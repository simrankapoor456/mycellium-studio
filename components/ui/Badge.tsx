import { cn } from "@/lib/class-names";

type BadgeTone = "neutral" | "success" | "warning" | "accent";

export function Badge({
  children,
  tone = "neutral",
  className,
}: Readonly<{ children: React.ReactNode; tone?: BadgeTone; className?: string }>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold",
        tone === "neutral" && "bg-surface-quiet text-forest",
        tone === "success" && "bg-sage/45 text-forest-strong",
        tone === "warning" && "bg-gold/25 text-forest-strong",
        tone === "accent" && "bg-forest text-paper",
        className,
      )}
    >
      {children}
    </span>
  );
}
