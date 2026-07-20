import Link from "next/link";

import { cn } from "@/lib/class-names";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

function buttonClasses(variant: ButtonVariant, className?: string) {
  return cn(
    "ui-button",
    `ui-button--${variant}`,
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
