export function Hero() {
  return (
    <section id="top" className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-28 lg:pt-24">
      <div className="max-w-3xl">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.22em] text-clay">Planning that grows with care</p>
        <h1 className="font-serif text-6xl leading-[0.95] tracking-[-0.045em] text-forest sm:text-7xl lg:text-8xl">
          From rough idea to rooted plan.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-forest/72 sm:text-xl">
          mycellium studio shapes early software thinking into clear scope, connected work, and a plan people can review before they build.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a className="rounded-full bg-ocean px-6 py-3 text-sm font-bold text-white shadow-lg shadow-ocean/15 transition hover:-translate-y-0.5" href="#foundation">
            Explore the foundation
          </a>
          <a className="rounded-full border border-forest/20 bg-paper/70 px-6 py-3 text-sm font-bold text-forest transition hover:border-forest/40" href="#phase-one">
            See the Phase 1 boundary
          </a>
        </div>
      </div>
      <div className="relative min-h-96" aria-hidden="true">
        <div className="absolute inset-x-8 top-6 h-72 rounded-[48%] border border-forest/10 bg-paper/70 shadow-2xl shadow-forest/10" />
        <div className="absolute left-[18%] top-[18%] h-64 w-px rotate-[24deg] bg-forest/20" />
        <div className="absolute left-[54%] top-[9%] h-72 w-px -rotate-[28deg] bg-ocean/25" />
        <div className="absolute left-[31%] top-[40%] size-20 rounded-full border-[12px] border-sage bg-canvas shadow-xl" />
        <div className="absolute right-[14%] top-[18%] size-28 rounded-full bg-ocean text-white shadow-xl">
          <span className="grid size-full place-items-center font-serif text-4xl">01</span>
        </div>
        <div className="absolute bottom-[6%] left-[9%] rounded-full bg-clay px-5 py-3 text-xs font-bold uppercase tracking-widest text-white">
          Brief → plan
        </div>
      </div>
    </section>
  );
}
