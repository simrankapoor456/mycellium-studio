"use client";

import { useEffect } from "react";
import type Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/motion/gsap-client";

export function MarketingMotionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let instance: Lenis | null = null;
    let ticker: ((time: number) => void) | null = null;

    async function start() {
      if (disposed || motionPreference.matches || instance) return;

      const { default: LenisConstructor } = await import("lenis");
      if (disposed || motionPreference.matches) return;

      instance = new LenisConstructor({
        anchors: { offset: -96 },
        autoRaf: false,
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) => Boolean(node.closest("input, textarea, select, dialog, [data-native-scroll]")),
      });

      const handleScroll = () => ScrollTrigger.update();
      ticker = (time) => instance?.raf(time * 1_000);
      instance.on("scroll", handleScroll);
      gsap.ticker.add(ticker);
      ScrollTrigger.refresh();
    }

    function stop() {
      if (ticker) gsap.ticker.remove(ticker);
      ticker = null;
      instance?.destroy();
      instance = null;
    }

    function handleMotionPreference() {
      if (motionPreference.matches) stop();
      else void start();
    }

    const startTimer = window.setTimeout(() => void start(), 120);
    motionPreference.addEventListener("change", handleMotionPreference);

    return () => {
      disposed = true;
      window.clearTimeout(startTimer);
      motionPreference.removeEventListener("change", handleMotionPreference);
      stop();
    };
  }, []);

  return children;
}
