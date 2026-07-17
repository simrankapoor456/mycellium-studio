import Link from "next/link";

import { logoutAction } from "@/app/(protected)/actions";
import { requireUser } from "@/lib/auth/current-user";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
          <Link className="font-serif text-xl font-semibold text-forest" href="/dashboard">
            mycellium studio
          </Link>
          <nav className="flex items-center gap-4" aria-label="Workspace navigation">
            <Link className="text-sm font-bold text-forest/75 hover:text-forest" href="/dashboard">
              Projects
            </Link>
            <form action={logoutAction}>
              <button
                className="rounded-full border border-forest/20 px-4 py-2 text-sm font-bold text-forest hover:border-forest/45"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        <p className="mb-6 text-xs text-forest/55">Signed in as {user.email ?? "account owner"}</p>
        {children}
      </div>
    </div>
  );
}
