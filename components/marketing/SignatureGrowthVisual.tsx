"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/motion/gsap-client";

export function SignatureGrowthVisual({ activeIndex, label }: Readonly<{ activeIndex: number; label: string }>) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (process.env.NODE_ENV === "test") return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const latest = scopeRef.current?.querySelectorAll<SVGElement>(`[data-level="${activeIndex}"]`);
      if (!latest?.length) return;
      const timeline = gsap.timeline();
      timeline.fromTo(latest, { opacity: 0.36, scale: 0.97, transformOrigin: "center" }, { duration: 0.42, ease: "power3.out", opacity: 1, scale: 1, stagger: 0.025 });
      return () => timeline.revert();
    });
    return () => media.revert();
  }, { dependencies: [activeIndex], scope: scopeRef });

  return (
    <div className="signature-growth" data-active-level={activeIndex} ref={scopeRef}>
      <svg aria-hidden="true" viewBox="0 0 800 620">
        <g className="signature-growth__fragments" data-level="0" data-visible={activeIndex >= 0}>
          <rect height="34" rx="8" width="112" x="86" y="84" /><text x="103" y="105">Need</text>
          <rect height="34" rx="8" width="126" x="585" y="82" /><text x="602" y="103">Constraint</text>
          <rect height="34" rx="8" width="124" x="102" y="486" /><text x="119" y="507">Observation</text>
        </g>
        <g className="signature-growth__seed" data-level="1" data-visible={activeIndex >= 1}><circle cx="398" cy="304" r="22" /><circle cx="398" cy="304" r="7" /></g>
        <path className="signature-growth__root" d="M398 326 C396 376 350 392 344 448" data-level="2" data-visible={activeIndex >= 2} pathLength="1" />
        <g className="signature-growth__evidence" data-level="3" data-visible={activeIndex >= 3}>
          <path d="M396 350 C330 344 294 314 250 282" /><path d="M384 374 C330 390 300 422 270 458" /><path d="M408 360 C470 346 510 314 548 276" />
          <circle cx="250" cy="282" r="8" /><circle cx="270" cy="458" r="8" /><circle cx="548" cy="276" r="8" />
        </g>
        <g className="signature-growth__open" data-level="4" data-visible={activeIndex >= 4}>
          <path d="M250 282 C204 252 188 214 168 174" /><path d="M548 276 C602 244 626 208 650 166" />
          <rect height="38" rx="10" width="112" x="112" y="136" /><text x="134" y="160">Question</text>
          <rect height="38" rx="10" width="128" x="594" y="128" /><text x="613" y="152">Boundary</text>
        </g>
        <g className="signature-growth__connections" data-level="5" data-visible={activeIndex >= 5}>
          <path d="M168 174 C274 108 504 110 650 166" /><path d="M250 282 C334 224 460 220 548 276" /><path d="M270 458 C380 510 506 472 548 276" />
        </g>
        <g className="signature-growth__foundation" data-level="6" data-visible={activeIndex >= 6}><path d="M154 322 C208 184 322 122 460 142 C598 162 670 274 630 398 C590 522 388 554 244 472 C176 434 134 378 154 322Z" /><text x="326" y="552">REVIEWED FOUNDATION</text></g>
        <g className="signature-growth__architecture" data-level="7" data-visible={activeIndex >= 7}>
          <path d="M292 258 L292 202 L506 202 L506 258" /><rect height="52" rx="8" width="92" x="248" y="188" /><rect height="52" rx="8" width="92" x="352" y="166" /><rect height="52" rx="8" width="92" x="458" y="188" />
        </g>
        <g className="signature-growth__blueprint" data-level="8" data-visible={activeIndex >= 8}><rect height="154" rx="12" width="188" x="304" y="232" /><path d="M334 270 H462 M334 296 H438 M334 322 H456 M334 348 H414" /><text x="342" y="254">PRODUCT BLUEPRINT</text></g>
        <g className="signature-growth__execution" data-level="9" data-visible={activeIndex >= 9}><path d="M398 386 V430 M398 430 C334 430 304 450 270 476 M398 430 V490 M398 430 C462 430 494 450 528 476" /><circle cx="270" cy="476" r="14" /><circle cx="398" cy="490" r="14" /><circle cx="528" cy="476" r="14" /></g>
        <g className="signature-growth__value" data-level="10" data-visible={activeIndex >= 10}><path d="M398 166 C392 120 362 98 338 72 M398 166 C406 120 438 98 464 72" /><circle cx="332" cy="62" r="24" /><circle cx="470" cy="62" r="24" /><circle cx="402" cy="92" r="19" /></g>
        <g className="signature-growth__renewal" data-level="11" data-visible={activeIndex >= 11}><path d="M528 476 C636 510 690 488 718 438" /><circle cx="724" cy="424" r="10" /><path d="M724 414 C730 396 744 388 758 382" /></g>
      </svg>
      <p className="sr-only">{label}. Product context connects through evidence, an approved foundation, architecture, a Product Blueprint, execution, and useful product value before learning begins a new cycle.</p>
    </div>
  );
}
