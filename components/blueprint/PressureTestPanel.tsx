"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { PressureTestSchema, type PressureTest } from "@/lib/domain/pressure-test/schemas";

type PressureTestPanelProps = Readonly<{
  initialPressureTest: PressureTest | null;
  projectId: string;
  onUpdated: (pressureTest: PressureTest) => void;
}>;

export function PressureTestPanel({ initialPressureTest, projectId, onUpdated }: PressureTestPanelProps) {
  const [pressureTest, setPressureTest] = useState(initialPressureTest);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}/pressure-test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: crypto.randomUUID() }) });
      const responseBody: unknown = await response.json();
      if (!response.ok) throw new Error(readError(responseBody));
      const result = PressureTestSchema.parse(responseBody);
      setPressureTest(result);
      onUpdated(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pressure Test could not be completed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="pressure-test" id="pressure-test">
      <header><div><span className="eyebrow">Pressure Test</span><h2>Where could this blueprint break?</h2><p>Findings stay separate until you choose to edit the blueprint.</p></div><Button loading={pending} onClick={() => void handleRun()} type="button">{pending ? "Testing the blueprint" : pressureTest ? "Run again" : "Run Pressure Test"}</Button></header>
      {error ? <p role="alert">{error}</p> : null}
      {pressureTest ? <div className="pressure-test__results"><strong>{pressureTest.overallAssessment}</strong><span>{pressureTest.pressureTestMode === "ai" ? "Mycel Core · AI enhanced" : "Mycel Core · Reliable mode"}</span><PressureList items={pressureTest.criticalFindings} title="Critical findings" /><PressureList items={pressureTest.scopeCuts} title="Scope cuts" /><PressureList items={pressureTest.risks} title="Risks" /><PressureList items={pressureTest.questions} title="Questions" /><PressureList items={pressureTest.recommendedNextActions} title="Recommended next actions" /></div> : <p>No Pressure Test has been saved for this blueprint version.</p>}
    </section>
  );
}

function PressureList({ items, title }: { items: readonly string[]; title: string }) {
  if (items.length === 0) return null;
  return <section><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

function readError(input: unknown): string {
  if (typeof input === "object" && input !== null && "error" in input && typeof input.error === "string") return input.error;
  return "Pressure Test could not be completed.";
}
