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
        "ui-badge",
        `ui-badge--${tone}`,
        className,
      )}
    >
      {children}
    </span>
  );
}
