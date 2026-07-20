import { Container } from "@/components/ui/Container";
import { WorkspaceNavigation } from "@/components/shell/WorkspaceNavigation";
import { requireUser } from "@/lib/auth/current-user";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="workspace-shell min-h-[100dvh] bg-canvas text-ink">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-4 focus:py-3" href="#workspace-content">Skip to workspace content</a>
      <Container className="workspace-shell__navigation-wrap">
        <WorkspaceNavigation email={user.email ?? "Account owner"} />
      </Container>
      <Container className="workspace-frame">
        <div id="workspace-content">{children}</div>
      </Container>
    </div>
  );
}
