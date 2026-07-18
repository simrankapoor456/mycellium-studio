"use client";

import { Button } from "@/components/ui/Button";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="product-error-surface border border-clay/30 bg-surface p-7 sm:p-9">
      <h1 className="display-type text-3xl text-forest">The studio lost the thread</h1>
      <p className="mt-3 text-ink/65">Your projects are still safe. The connection did not finish, so let’s bring them back into view.</p>
      <Button className="mt-6" onClick={reset} type="button">Try the studio again</Button>
    </section>
  );
}
