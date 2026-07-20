import { BrandMark } from "@/components/brand/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/current-user";
import { PROJECT_START_HREF } from "@/lib/marketing/links";

export default async function NotFound() {
  const user = await getCurrentUser();

  return (
    <main className="route-state">
      <BrandMark className="route-state__mark" />
      <p className="route-state__code">404</p>
      <h1>This path does not connect.</h1>
      <p>The page may have moved, or the address may be incomplete. Your saved work has not been changed.</p>
      <div className="route-state__actions">
        <ButtonLink href={user ? "/dashboard" : "/"}>{user ? "Return to projects" : "Return home"}</ButtonLink>
        {!user ? <ButtonLink href={PROJECT_START_HREF} variant="secondary">Start your project</ButtonLink> : null}
      </div>
    </main>
  );
}
