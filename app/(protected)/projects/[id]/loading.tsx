export default function ProjectLoading() {
  return (
    <div aria-label="Loading project" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading project</span>
      <div className="h-11 w-40 rounded-lg bg-sage/30" />
      <div className="mt-6 h-36 border-b border-line bg-surface/55" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_21rem]">
        <div className="h-96 rounded-xl border border-line bg-surface/65" />
        <div className="h-72 rounded-xl border border-line bg-surface/65" />
      </div>
    </div>
  );
}
