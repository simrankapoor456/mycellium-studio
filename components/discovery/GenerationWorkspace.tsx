"use client";

const GENERATION_STAGES = [
  "Grounding the product understanding",
  "Checking unresolved decisions",
  "Mapping requirements",
  "Shaping architecture",
  "Defining scope",
  "Organizing epics and stories",
  "Sequencing delivery",
  "Finalizing the blueprint",
] as const;

export function GenerationWorkspace({ error, onRetry, onReturn }: Readonly<{ error: string; onRetry: () => void; onReturn: () => void }>) {
  const failed = error.length > 0;
  return (
    <main className="generation-workspace" aria-busy={!failed} aria-live="polite">
      <div className="generation-workspace__core" aria-hidden="true"><span /><span /><span /></div>
      <span className="eyebrow">Mycel Core · architecture</span>
      <h1>{failed ? "The blueprint needs another pass." : "Your foundation is becoming a blueprint."}</h1>
      <p>{failed ? error : "The approved context is safe. Mycel Core is validating each layer before anything is persisted."}</p>
      <ol>
        {GENERATION_STAGES.map((label, index) => (
          <li data-state={failed ? (index === 0 ? "failed" : "requested") : (index === 0 ? "active" : "requested")} key={label}>
            <span>{index + 1}</span><strong>{label}</strong><small>{failed && index === 0 ? "Needs retry" : index === 0 ? "Active" : "Requested"}</small>
          </li>
        ))}
      </ol>
      {failed ? <div className="generation-workspace__actions"><button onClick={onRetry} type="button">Retry blueprint generation</button><button onClick={onReturn} type="button">Return to foundation review</button></div> : null}
    </main>
  );
}

export { GENERATION_STAGES };
