import Link from "next/link";

import { cn } from "@/lib/class-names";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

function buttonClasses(variant: ButtonVariant, className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-[color,background-color,border-color,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-55",
    variant === "primary" && "bg-forest text-paper hover:bg-forest-strong active:translate-y-px",
    variant === "secondary" && "border border-line-strong bg-surface text-forest hover:border-forest",
    variant === "quiet" && "text-forest hover:bg-surface-quiet",
    variant === "danger" && "bg-clay text-paper hover:brightness-90",
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: Readonly<{
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}>) {
  return <Link className={buttonClasses(variant, className)} href={href}>{children}</Link>;
}
