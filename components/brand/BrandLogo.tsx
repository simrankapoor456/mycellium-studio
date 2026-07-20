import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { cn } from "@/lib/class-names";

type BrandLogoProps = {
  href?: string;
  light?: boolean;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({
  href = "/",
  light = false,
  compact = false,
  className,
}: BrandLogoProps) {
  return (
    <Link
      aria-label="Mycellium Studio home"
      className={cn("brand-logo inline-flex min-h-11 items-center", light && "brand-logo--light", className)}
      href={href}
    >
      <BrandMark className="brand-logo__mark" />
      {compact ? null : (
        <span aria-hidden="true" className="brand-logo__wordmark">
          <span>Mycellium</span>
          <small>Studio</small>
        </span>
      )}
    </Link>
  );
}
