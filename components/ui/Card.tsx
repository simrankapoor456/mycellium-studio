import { cn } from "@/lib/class-names";

export function Card({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <div className={cn("product-surface rounded-xl border border-line bg-surface", className)}>{children}</div>;
}
