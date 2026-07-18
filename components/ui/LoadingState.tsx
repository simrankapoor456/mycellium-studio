export function LoadingState({ cards = 3 }: { cards?: number }) {
  return (
    <div aria-label="Loading projects" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading projects</span>
      <div className="h-11 w-52 rounded-lg bg-sage/30" />
      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <div className="h-72 rounded-xl border border-line bg-surface/65" key={index} />
        ))}
      </div>
    </div>
  );
}
