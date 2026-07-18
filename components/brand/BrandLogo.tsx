import Image from "next/image";
import Link from "next/link";

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
  const source = light ? "/brand/mycellium-mark-light.svg" : "/brand/mycellium-mark.svg";

  return (
    <Link
      aria-label="Mycellium Studio home"
      className={cn("inline-flex min-h-11 items-center gap-2.5 font-semibold", className)}
      href={href}
    >
      <Image alt="" height={40} priority src={source} width={40} />
      {compact ? null : (
        <span className="leading-none tracking-[-0.025em]">
          Mycellium <span className={light ? "text-sage" : "text-moss"}>Studio</span>
        </span>
      )}
    </Link>
  );
}
