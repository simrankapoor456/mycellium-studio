import { cn } from "@/lib/class-names";

export function Card({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <div className={cn("product-surface ui-card", className)}>{children}</div>;
}
