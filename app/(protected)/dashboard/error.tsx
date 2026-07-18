"use client";

import { Button } from "@/components/ui/Button";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="product-error-surface border border-clay/30 bg-surface p-7 sm:p-9">
      <h1 className="display-type text-3xl text-forest">Projects could not be loaded</h1>
      <p className="mt-3 text-ink/65">The workspace connection did not complete. Try loading your projects again.</p>
      <Button className="mt-6" onClick={reset} type="button">Load projects again</Button>
    </section>
  );
}
