"use client";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="rounded-[2rem] border border-clay/25 bg-paper p-8">
      <h1 className="font-serif text-3xl text-forest">Projects could not be loaded.</h1>
      <p className="mt-3 text-forest/70">Check the connection and try again.</p>
      <button className="mt-6 rounded-full bg-ocean px-5 py-3 text-sm font-bold text-white" onClick={reset} type="button">
        Try again
      </button>
    </section>
  );
}
