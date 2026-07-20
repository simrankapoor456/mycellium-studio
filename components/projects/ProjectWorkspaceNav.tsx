"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = Readonly<{
  active: "overview" | "discovery" | "review" | "export";
  blueprintAvailable: boolean;
  discoveryStarted?: boolean;
  foundationApproved?: boolean;
  projectId: string;
}>;

type JourneyStep = Readonly<{
  id: string;
  label: string;
  meta: string;
  href: string;
  available: boolean;
  complete: boolean;
  active: boolean;
}>;

export function ProjectWorkspaceNav({ active, blueprintAvailable, discoveryStarted = active !== "overview", foundationApproved = blueprintAvailable, projectId }: Props) {
  const [condensed, setCondensed] = useState(false);
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const steps: JourneyStep[] = [
    { id: "starting", label: "Starting point", meta: "Seed", href: `/projects/${projectId}`, available: true, complete: discoveryStarted, active: active === "overview" && !blueprintAvailable },
    { id: "discovery", label: "Discovery", meta: "Roots", href: `/projects/${projectId}/discover`, available: true, complete: discoveryStarted, active: active === "discovery" },
    { id: "review", label: "Foundation review", meta: "Foundation", href: `/projects/${projectId}/review`, available: discoveryStarted, complete: foundationApproved, active: active === "review" && !foundationApproved },
    { id: "architecture", label: "Architecture", meta: "Structure", href: `/projects/${projectId}/review`, available: foundationApproved, complete: blueprintAvailable, active: active === "review" && foundationApproved },
    { id: "blueprint", label: "Product Blueprint", meta: "Blueprint", href: `/projects/${projectId}`, available: blueprintAvailable, complete: blueprintAvailable, active: active === "overview" && blueprintAvailable },
    { id: "export", label: "Export", meta: blueprintAvailable ? "Portable files" : "Blueprint required", href: `/projects/${projectId}/export`, available: true, complete: false, active: active === "export" },
  ];
  const currentStep = steps.find((step) => step.active) ?? steps[0]!;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setCondensed(!entry?.isIntersecting), { rootMargin: "-96px 0px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const current = rail?.querySelector<HTMLElement>("[aria-current='step']");
    if (!rail || !current) return;
    const left = current.offsetLeft - (rail.clientWidth - current.offsetWidth) / 2;
    if (typeof rail.scrollTo === "function") rail.scrollTo({ left: Math.max(0, left), behavior: "auto" });
  }, [currentStep.id]);

  return (
    <>
      <span aria-hidden="true" className="project-journey__sentinel" ref={sentinelRef} />
      <nav aria-label="Project journey" className="project-journey" data-condensed={condensed}>
        <div className="project-journey__desktop">
          <div className="project-journey__summary"><span>Project journey</span><strong>{currentStep.label}</strong></div>
          <JourneyList railRef={railRef} steps={steps} />
        </div>
        <details className="project-journey__mobile">
          <summary><span><small>Project journey</small><strong>{currentStep.label}</strong></span><span aria-hidden="true">View stages</span></summary>
          <JourneyList steps={steps} />
        </details>
      </nav>
    </>
  );
}

function JourneyList({ steps, railRef }: Readonly<{ steps: JourneyStep[]; railRef?: React.RefObject<HTMLOListElement | null> }>) {
  return (
    <ol ref={railRef}>
      {steps.map((step, index) => (
        <li data-active={step.active} data-available={step.available} data-complete={step.complete} key={step.id}>
          <span aria-hidden="true" className="project-journey__index">{step.complete ? "✓" : index + 1}</span>
          {step.available
            ? <Link aria-current={step.active ? "step" : undefined} href={step.href}><strong>{step.label}</strong><small>{step.meta}</small></Link>
            : <span aria-disabled="true"><strong>{step.label}</strong><small>{lockedReason(step.id)}</small></span>}
        </li>
      ))}
    </ol>
  );
}

function lockedReason(id: string): string {
  if (id === "review") return "Begin discovery first";
  if (id === "architecture") return "Approve the foundation first";
  return "Create a persisted blueprint first";
}
