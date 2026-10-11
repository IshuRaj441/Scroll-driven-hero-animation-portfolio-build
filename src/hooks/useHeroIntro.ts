"use client";

import { type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT, gsap, HEADLINE_STAGGER, STATS_STAGGER } from "@/lib/gsap";

/*
 * Intro motion values. Named so the reveal can be tuned from one place, and kept
 * deliberately gentle — the brief asks for "smooth, premium, never abrupt".
 */
const HEADLINE_FROM_Y = 28;
const HEADLINE_DURATION = 0.9;
const LETTER_FROM_Y = 18;
const LETTER_DURATION = 0.8;
const LETTERS_START = 0.08;
const STATS_START = 0.5;
const STAT_FROM_Y = 16;
const STAT_DURATION = 0.7;
const COUNT_DURATION = 1.1;
const VEHICLE_FROM_Y = 26;
const VEHICLE_DURATION = 0.9;
const VEHICLE_START = 0.45;
/** Wait for webfonts (with a fallback) so letters never reflow mid-reveal. */
const FONT_WAIT_FALLBACK_MS = 400;

/**
 * One-shot hero load animation, scoped to `scope`. Runs a single GSAP timeline that
 * fades/staggers the headline letters, then reveals the stats (each counting up from
 * zero) and lifts the vehicle in. Everything is transform/opacity only.
 *
 * State is applied in a layout effect (useGSAP), so the "from" frames are painted
 * before the browser can flash the finished layout — no load flicker, and the DOM
 * still ships real values for no-JS/SEO.
 */
export function useHeroIntro(scope: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      // Reduced motion: the server-rendered markup already IS the final, readable state.
      if (reduced) return;

      const root = scope.current;
      if (!root) return;

      const headline = gsap.utils.toArray<HTMLElement>("[data-headline]", root);
      const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", root);
      const stats = gsap.utils.toArray<HTMLElement>("[data-stat]", root);
      const vehicle = gsap.utils.toArray<HTMLElement>("[data-vehicle]", root);
      const counters = gsap.utils.toArray<HTMLElement>("[data-count]", root);

      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE_OUT } });

      tl.fromTo(
        headline,
        { y: HEADLINE_FROM_Y, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: HEADLINE_DURATION },
        0,
      );
      tl.fromTo(
        letters,
        { y: LETTER_FROM_Y, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: LETTER_DURATION, stagger: HEADLINE_STAGGER },
        LETTERS_START,
      );
      tl.fromTo(
        stats,
        { y: STAT_FROM_Y, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: STAT_DURATION, stagger: STATS_STAGGER },
        STATS_START,
      );
      tl.fromTo(
        vehicle,
        { y: VEHICLE_FROM_Y, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: VEHICLE_DURATION },
        VEHICLE_START,
      );

      // Count each figure 0 → target in step with its card's reveal.
      counters.forEach((el, index) => {
        const target = Number(el.dataset.target ?? "0");
        const proxy = { value: 0 };
        tl.to(
          proxy,
          {
            value: target,
            duration: COUNT_DURATION,
            ease: EASE_OUT,
            onUpdate: () => {
              el.textContent = String(Math.round(proxy.value));
            },
          },
          STATS_START + index * STATS_STAGGER,
        );
      });

      // Hold the reveal until fonts are ready (or a short fallback elapses).
      let cancelled = false;
      const start = () => {
        if (!cancelled) tl.play();
      };
      const timer = window.setTimeout(start, FONT_WAIT_FALLBACK_MS);
      document.fonts?.ready.then(() => {
        window.clearTimeout(timer);
        start();
      });

      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    },
    { scope, dependencies: [reduced], revertOnUpdate: true },
  );
}
