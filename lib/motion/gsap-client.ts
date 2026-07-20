"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as SplitTextPlugin } from "gsap/SplitText";

if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
  gsap.registerPlugin(ScrollTrigger, SplitTextPlugin, useGSAP);
}

export { gsap, ScrollTrigger, SplitTextPlugin, useGSAP };
