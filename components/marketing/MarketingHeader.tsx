import Link from "next/link";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const navigation = [
  ["Product", "#product"],
  ["How it works", "#how-it-works"],
  ["Philosophy", "#philosophy"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

export function MarketingHeader() {
  return (
    <header className="border-b border-line/80 bg-canvas/95">
      <Container className="flex min-h-20 items-center justify-between gap-5">
        <BrandLogo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navigation.map(([label, href]) => (
            <Link className="min-h-11 px-3 py-3 text-sm font-semibold text-ink/65 hover:text-forest" href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <ButtonLink className="px-3" href="/login" variant="quiet">Log in</ButtonLink>
          <ButtonLink className="hidden sm:inline-flex" href="/signup">Start free</ButtonLink>
        </div>
      </Container>
      <nav className="overflow-x-auto border-t border-line/60 px-5 lg:hidden" aria-label="Page navigation">
        <div className="mx-auto flex w-max min-w-full justify-center">
          {navigation.map(([label, href]) => (
            <Link className="min-h-11 whitespace-nowrap px-3 py-3 text-sm font-semibold text-ink/65" href={href} key={href}>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
