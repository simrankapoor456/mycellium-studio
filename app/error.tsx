"use client";

import { useEffect } from "react";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("A route failed to render.", error);
  }, [error]);

  return (
    <main className="route-state">
      <BrandMark className="route-state__mark" />
      <p className="route-state__code">Connection interrupted</p>
      <h1>This view could not settle.</h1>
      <p>Your saved work is unchanged. Try this view again, or return to a known route.</p>
      <div className="route-state__actions">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/dashboard" variant="secondary">Return to projects</ButtonLink>
        <ButtonLink href="/" variant="quiet">Home</ButtonLink>
      </div>
    </main>
  );
}
