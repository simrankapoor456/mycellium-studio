"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";

import { ProductGraph } from "@/components/marketing/diagrams/ProductGraph";

export function ProductGraphHero() {
  const backRef = useRef<SVGGElement>(null);
  const middleRef = useRef<SVGGElement>(null);
  const frontRef = useRef<SVGGElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);

  function resetDepth() {
    backRef.current?.style.removeProperty("transform");
    middleRef.current?.style.removeProperty("transform");
    frontRef.current?.style.removeProperty("transform");
    lightRef.current?.style.removeProperty("transform");
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleMotionPreference(event: MediaQueryListEvent) {
      reduceMotionRef.current = event.matches;

      if (event.matches) {
        backRef.current?.style.removeProperty("transform");
        middleRef.current?.style.removeProperty("transform");
        frontRef.current?.style.removeProperty("transform");
        lightRef.current?.style.removeProperty("transform");
      }
    }

    reduceMotionRef.current = mediaQuery.matches;
    mediaQuery.addEventListener("change", handleMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionPreference);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || reduceMotionRef.current) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      if (backRef.current) {
        backRef.current.style.transform = `translate3d(${horizontal * -5}px, ${vertical * -4}px, 0)`;
      }

      if (middleRef.current) {
        middleRef.current.style.transform = `translate3d(${horizontal * 8}px, ${vertical * 6}px, 0)`;
      }

      if (frontRef.current) {
        frontRef.current.style.transform = `translate3d(${horizontal * 15}px, ${vertical * 11}px, 0)`;
      }

      if (lightRef.current) {
        lightRef.current.style.transform = `translate3d(${horizontal * 28}px, ${vertical * 20}px, 0)`;
      }
    });
  }

  function handlePointerLeave() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    resetDepth();
  }

  return (
    <figure
      className="signature-hero-graph spatial-surface"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <div aria-hidden="true" className="signature-hero-graph__light" ref={lightRef} />
      <div className="signature-hero-graph__header">
        <span>Live Product Graph</span>
        <span>Fixed demo data</span>
      </div>
      <ProductGraph
        activeLevel={4}
        ariaLabel="A product graph developing a rough idea into structured delivery work"
        entry
        layerRefs={{ back: backRef, middle: middleRef, front: frontRef }}
      />
      <figcaption className="signature-hero-graph__caption">
        <span>Seed</span>
        <span>Discovery</span>
        <span>Requirements</span>
        <span>Architecture</span>
        <span>Execution</span>
      </figcaption>
    </figure>
  );
}
