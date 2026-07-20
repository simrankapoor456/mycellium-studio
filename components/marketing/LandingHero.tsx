"use client";

import { type PointerEvent, useRef } from "react";

import { BrandMark } from "@/components/brand/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function LandingHero() {
  const environmentRef = useRef<HTMLDivElement>(null);
  const markStageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  function settleEnvironment() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (environmentRef.current) environmentRef.current.style.transform = "translate3d(0, 0, 0)";
    if (markStageRef.current) markStageRef.current.style.transform = "translate3d(0, 0, 0)";
  }

  function moveEnvironment(event: PointerEvent<HTMLElement>) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    positionRef.current = {
      x: (event.clientX - bounds.left) / bounds.width - 0.5,
      y: (event.clientY - bounds.top) / bounds.height - 0.5,
    };

    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      const { x, y } = positionRef.current;
      if (environmentRef.current) environmentRef.current.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0) scale(1.025)`;
      if (markStageRef.current) markStageRef.current.style.transform = `translate3d(${x * 5}px, ${y * 4}px, 0)`;
      frameRef.current = null;
    });
  }

  return (
    <section className="living-hero" onPointerLeave={settleEnvironment} onPointerMove={moveEnvironment}>
      <div aria-hidden="true" className="living-hero__environment" ref={environmentRef} />
      <div aria-hidden="true" className="living-hero__grain" />
      <Container className="living-hero__inner">
        <p className="living-hero__kicker">Living product intelligence</p>
        <div className="living-hero__mark-stage" ref={markStageRef}>
          <span aria-hidden="true" className="living-hero__halo" />
          <BrandMark animated className="living-hero__mark" label="Mycellium Studio living network" />
        </div>
        <h1>Ideas take <em>root</em>. Products take shape.</h1>
        <p className="living-hero__summary">Turn scattered product context into grounded discovery, architecture, and an editable Product Blueprint.</p>
        <div className="living-hero__actions">
          <ButtonLink href="/signup">Start your project <span aria-hidden="true">&rarr;</span></ButtonLink>
          <ButtonLink href="#how-it-works" variant="secondary">See how it works</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
