import Link from "next/link";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Container } from "@/components/ui/Container";

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <Container className="marketing-footer__layout">
        <div>
          <BrandLogo light />
          <p>Living product intelligence for grounded discovery, architecture, and editable Product Blueprints.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="#product">Product</Link><Link href="#pricing">Pricing</Link><Link href="#faq">FAQ</Link><Link href="/login">Log in</Link>
        </nav>
        <p className="marketing-footer__legal">&copy; 2026 Mycellium Studio. Ideas take root here.</p>
      </Container>
    </footer>
  );
}
