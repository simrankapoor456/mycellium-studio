"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, FC } from "react";

import { gsap, SplitTextPlugin, useGSAP } from "@/lib/motion/gsap-client";

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
}

const SplitText: FC<SplitTextProps> = ({
  text,
  className = "",
  delay = 45,
  duration = 0.72,
  ease = "power3.out",
  splitType = "words",
  from = { opacity: 0, y: 24 },
  to = { opacity: 1, y: 0 },
  threshold = 0.12,
  rootMargin = "-48px",
  tag = "p",
  textAlign = "left",
  onLetterAnimationComplete,
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const callbackRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    callbackRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    let active = true;
    const ready = document.fonts?.ready ?? Promise.resolve();

    void ready.then(() => {
      if (active) setFontsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || !text || !fontsLoaded) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const split = new SplitTextPlugin(element, {
          type: splitType,
          smartWrap: true,
          linesClass: "split-line",
          wordsClass: "split-word",
          charsClass: "split-char",
        });
        const targets = splitType.includes("chars") ? split.chars : splitType.includes("lines") ? split.lines : split.words;
        const tween = gsap.fromTo(targets, from, {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: element,
            start: `top ${Math.round((1 - threshold) * 100)}%${rootMargin}`,
            once: true,
          },
          onComplete: () => callbackRef.current?.(),
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          split.revert();
        };
      });

      return () => media.revert();
    },
    {
      dependencies: [text, delay, duration, ease, splitType, threshold, rootMargin, fontsLoaded],
      scope: ref,
      revertOnUpdate: true,
    },
  );

  const Tag: ElementType = tag;
  return (
    <Tag className={`split-parent ${className}`} ref={ref} style={{ textAlign }}>
      {text}
    </Tag>
  );
};

export default SplitText;
