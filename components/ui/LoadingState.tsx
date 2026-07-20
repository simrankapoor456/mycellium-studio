export function LoadingState({ cards = 3, label = "Loading projects" }: { cards?: number; label?: string }) {
  return (
    <div aria-label={label} aria-live="polite" className="loading-state">
      <span className="sr-only">{label}</span>
      <div className="loading-state__heading" />
      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <div className="loading-state__card" key={index} />
        ))}
      </div>
    </div>
  );
}
