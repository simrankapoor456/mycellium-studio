import { cn } from "@/lib/class-names";

export function Container({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <div className={cn("mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}
