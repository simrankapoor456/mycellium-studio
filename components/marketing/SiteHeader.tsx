import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
      <Link className="flex items-center gap-3 text-forest" href="/" aria-label="mycellium studio home">
        <span className="grid size-10 place-items-center rounded-full border border-forest/25 font-serif text-xl">✣</span>
        <span className="font-serif text-xl font-semibold tracking-tight">mycellium studio</span>
      </Link>
      <nav className="flex items-center gap-3 text-sm font-semibold text-forest/70" aria-label="Primary navigation">
        <Link className="px-3 py-2 transition hover:text-forest" href="/login">Sign in</Link>
        <Link className="rounded-full border border-forest/20 bg-paper/70 px-4 py-2 transition hover:border-forest/40" href="/signup">
          Get started
        </Link>
      </nav>
    </header>
  );
}
