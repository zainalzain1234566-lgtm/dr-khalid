"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Calm, no-overshoot ease shared by every GSAP timeline (matches Motion's EASE). */
gsap.defaults({ ease: "power3.out", duration: 0.5 });

/** Only animate when the viewer allows motion; content stays static otherwise. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** Fires once, when the element's top reaches 80% of the viewport (~20% visible). */
export const onceInView = (trigger: Element) => ({ trigger, start: "top 80%", once: true });

export { gsap, useGSAP };
