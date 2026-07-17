export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
      <a className="flex items-center gap-3 text-forest" href="#top" aria-label="mycellium studio home">
        <span className="grid size-10 place-items-center rounded-full border border-forest/25 font-serif text-xl">
          ✣
        </span>
        <span className="font-serif text-xl font-semibold tracking-tight">mycellium studio</span>
      </a>
      <nav className="flex items-center gap-6 text-sm font-semibold text-forest/70" aria-label="Primary navigation">
        <a className="hidden transition hover:text-forest sm:block" href="#foundation">
          Foundation
        </a>
        <a className="rounded-full border border-forest/20 bg-paper/70 px-4 py-2 transition hover:border-forest/40" href="#phase-one">
          Phase 1
        </a>
      </nav>
    </header>
  );
}
