"use client";

import { Button } from "@/components/ui/Button";

export function GenerationWorkspace({ error, onRetry, onReturn }: Readonly<{ error: string; onRetry: () => void; onReturn: () => void }>) {
  const failed = error.length > 0;
  const steps = failed
    ? [
        ["Preparing foundation", "Still saved"],
        ["Architecting product", "Response interrupted"],
        ["Saving blueprint", "Not confirmed"],
        ["Completed", "Retry available"],
      ]
    : [
        ["Preparing foundation", "Submitted"],
        ["Architecting product", "In progress"],
        ["Saving blueprint", "Waiting for a validated result"],
        ["Completed", "Confirmed only after persistence"],
      ];
  return (
    <main className="generation-workspace" aria-busy={!failed} aria-live="polite">
      <div className="generation-workspace__core" aria-hidden="true"><span /><span /><span /></div>
      <span className="eyebrow">Mycel Core / architecture</span>
      <h1>{failed ? "The blueprint was not saved." : "Creating a Product Blueprint from the approved foundation."}</h1>
      <p>{failed ? error : "The result will appear only after the complete blueprint passes validation and is persisted. No progress is inferred while the request is running."}</p>
      <ol aria-label="Blueprint generation status" className="generation-workspace__status">
        {steps.map(([label, status], index) => <li data-state={failed && index > 0 ? "interrupted" : index === 0 ? "complete" : "waiting"} key={label}><strong>{label}</strong><small>{status}</small></li>)}
        {failed ? <li data-state="interrupted"><strong>Interrupted / Retry</strong><small>Your foundation remains saved.</small></li> : null}
      </ol>
      {!failed ? <div className="generation-workspace__truth"><span aria-hidden="true" /><strong>Waiting for a persisted result</strong><small>Your approved foundation remains unchanged.</small></div> : null}
      {failed ? <div className="generation-workspace__actions"><Button onClick={onRetry} type="button">Retry blueprint generation</Button><Button onClick={onReturn} type="button" variant="secondary">Return to foundation review</Button></div> : null}
    </main>
  );
}
