export function LoadingState({ cards = 3, label = "Loading projects" }: { cards?: number; label?: string }) {
  return (
    <div aria-label={label} aria-live="polite" className="loading-state animate-pulse">
      <span className="sr-only">{label}</span>
      <div className="h-11 w-52 rounded-lg bg-sage/30" />
      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <div className="loading-state__card h-72 rounded-xl border border-line bg-surface/65" key={index} />
        ))}
      </div>
    </div>
  );
}
