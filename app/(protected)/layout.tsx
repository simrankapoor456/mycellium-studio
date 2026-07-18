import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { logoutAction } from "@/app/(protected)/actions";
import { requireUser } from "@/lib/auth/current-user";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="min-h-[100dvh] bg-canvas text-ink">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-4 focus:py-3" href="#workspace-content">Skip to workspace content</a>
      <header className="border-b border-line bg-surface">
        <Container className="flex min-h-20 items-center justify-between gap-4">
          <BrandLogo href="/dashboard" />
          <nav className="flex items-center gap-1 sm:gap-3" aria-label="Workspace navigation">
            <a className="min-h-11 px-3 py-3 text-sm font-bold text-forest" href="/dashboard">Projects</a>
            <form action={logoutAction}>
              <Button className="px-3 sm:px-5" type="submit" variant="quiet">Sign out</Button>
            </form>
          </nav>
        </Container>
      </header>
      <Container className="py-8 lg:py-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-xs text-ink/70">
          <span>Personal studio</span>
          <span className="max-w-full truncate">{user.email ?? "Account owner"}</span>
        </div>
        <div id="workspace-content">{children}</div>
      </Container>
    </div>
  );
}
