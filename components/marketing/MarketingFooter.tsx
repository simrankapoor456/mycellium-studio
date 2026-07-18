import Link from "next/link";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Container } from "@/components/ui/Container";

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-surface py-10">
      <Container className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-md text-sm leading-6 text-ink/70">AI Product Architect for turning rough ideas into grounded product understanding and execution plans.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-forest" aria-label="Footer navigation">
          <Link href="#product">Product</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="#faq">FAQ</Link>
          <Link href="/login">Log in</Link>
        </nav>
        <p className="text-xs text-ink/70 sm:col-span-2">© 2026 Mycellium Studio. Phase 3A product experience.</p>
      </Container>
    </footer>
  );
}
