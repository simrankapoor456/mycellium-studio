import Link from "next/link";

import { cn } from "@/lib/class-names";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "quiet"
  | "outline"
  | "destructive"
  | "danger"
  | "success";

function buttonClasses(variant: ButtonVariant, className?: string) {
  return cn(
    "ui-button",
    `ui-button--${variant}`,
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  iconOnly?: boolean;
};

export function Button({
  variant = "primary",
  className,
  loading = false,
  iconOnly = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const resolvedVariant = variant === "danger" ? "destructive" : variant;

  return (
    <button
      aria-busy={loading || undefined}
      className={cn(buttonClasses(resolvedVariant, className), iconOnly && "ui-button--icon-only")}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span aria-hidden="true" className="ui-button__spinner" /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  iconOnly = false,
}: Readonly<{
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  iconOnly?: boolean;
}>) {
  const resolvedVariant = variant === "danger" ? "destructive" : variant;
  return <Link className={cn(buttonClasses(resolvedVariant, className), iconOnly && "ui-button--icon-only")} href={href}>{children}</Link>;
}
