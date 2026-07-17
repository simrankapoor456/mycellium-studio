import type { PlanOutput } from "@/lib/domain/plan/schemas";

export function FoundationPreview({ plan }: { plan: PlanOutput }) {
  const storyCount = plan.epics.reduce((total, epic) => total + epic.stories.length, 0);

  return (
    <section id="foundation" className="border-y border-line bg-forest px-6 py-20 text-paper lg:px-10 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
        <div id="phase-one">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage">Phase 1 foundation</p>
          <h2 className="mt-5 max-w-md font-serif text-5xl leading-none tracking-tight">A dependable spine before the workspace.</h2>
          <p className="mt-6 max-w-md leading-7 text-paper/70">
            The first release establishes validated contracts, deterministic planning, and portable exports without accounts, databases, or external services.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl border border-paper/10 bg-paper/7 p-7 sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-sage">Deterministic sample</p>
            <h3 className="mt-3 font-serif text-3xl">{plan.project_name}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-paper/65">{plan.project_summary}</p>
          </article>
          <article className="rounded-3xl border border-paper/10 bg-paper/7 p-7">
            <strong className="font-serif text-5xl text-sage">{plan.epics.length}</strong>
            <p className="mt-3 text-sm text-paper/65">Grounded epics from validated input</p>
          </article>
          <article className="rounded-3xl border border-paper/10 bg-paper/7 p-7">
            <strong className="font-serif text-5xl text-clay">{storyCount}</strong>
            <p className="mt-3 text-sm text-paper/65">Typed stories ready for review and export</p>
          </article>
        </div>
      </div>
    </section>
  );
}
