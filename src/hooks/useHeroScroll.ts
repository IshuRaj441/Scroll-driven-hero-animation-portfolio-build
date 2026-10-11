"use client";

import { type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  BOUNCE_MAX_PX,
  EASE_LINEAR,
  gsap,
  PARALLAX_ROAD,
  PARALLAX_SKY,
  PARALLAX_SKYLINE_BACK,
  PARALLAX_SKYLINE_FRONT,
  PIN_DURATION_VH,
  SCRUB_SMOOTHING,
  ScrollTrigger,
  TILT_MAX_DEG,
  VELOCITY_CLAMP,
  WHEEL_ROTATION_MAX,
} from "@/lib/gsap";

/*
 * Scroll-motion values. The whole journey is expressed as progress 0 → 1 so every
 * layer can be reasoned about on a single axis; see NOTES.md §3 for the map.
 */
const LETTER_WAVE_START = 0.04;
const LETTER_WAVE_SPAN = 0.72;
/** How far a letter rises (in % of its own height) as the car sweeps past it. */
const LETTER_LIFT_PERCENT = -58;
const LETTER_LIFT_DURATION = 0.14;
const HEADLINE_RECEDE_PERCENT = -12;
/** Where the foreground settles so the road/car becomes the focus. */
const FOREGROUND_FADE_TO = 0.2;
const VELOCITY_TILT_DURATION = 0.4;
const VELOCITY_BOUNCE_DURATION = 0.35;
/** Idle period before the suspension returns to rest (ms after the last scroll tick). */
const SUSPENSION_SETTLE_MS = 180;

type MotionConfig = {
  /** Pin duration, in viewport heights of scroll. */
  pinVh: number;
  /** Total wheel turn across the sweep, in degrees. */
  wheelRotation: number;
  /** Parallax rate for each layer, as a fraction of the layer's own width. */
  parallaxSky: number;
  parallaxBack: number;
  parallaxFront: number;
  parallaxRoad: number;
  /** Final foreground opacity once the car has taken over the frame. */
  foregroundFadeTo: number;
  /** Headline recede, in % of its own height. */
  headlineRecedePct: number;
  /** Per-letter lift wave (turned off on small screens to keep it calm). */
  lettersRespond: boolean;
  /** Velocity-driven body tilt and suspension bounce, with its velocity clamp. */
  tiltMaxDeg: number;
  bounceMaxPx: number;
  velocityClamp: number;
};

/** The full desktop experience — the numbers used since Phase 4. */
const DESKTOP_MOTION: MotionConfig = {
  pinVh: PIN_DURATION_VH,
  wheelRotation: WHEEL_ROTATION_MAX,
  parallaxSky: PARALLAX_SKY,
  parallaxBack: PARALLAX_SKYLINE_BACK,
  parallaxFront: PARALLAX_SKYLINE_FRONT,
  parallaxRoad: PARALLAX_ROAD,
  foregroundFadeTo: FOREGROUND_FADE_TO,
  headlineRecedePct: HEADLINE_RECEDE_PERCENT,
  lettersRespond: true,
  tiltMaxDeg: TILT_MAX_DEG,
  bounceMaxPx: BOUNCE_MAX_PX,
  velocityClamp: VELOCITY_CLAMP,
};

/** Simplified motion below 768px: shorter runway, gentler parallax, no letter wave. */
const MOBILE_MOTION: MotionConfig = {
  pinVh: 1.8,
  wheelRotation: 720,
  parallaxSky: 0.02,
  parallaxBack: 0.06,
  parallaxFront: 0.1,
  parallaxRoad: 0.18,
  foregroundFadeTo: 0.25,
  headlineRecedePct: -8,
  lettersRespond: false,
  tiltMaxDeg: 0.8,
  bounceMaxPx: 2,
  velocityClamp: 900,
};

/**
 * Builds one pinned, scrubbed timeline against a motion config. Measured once here —
 * the only layout reads are inside `getTravel`, which ScrollTrigger re-runs on refresh
 * (never inside a scroll callback), so resizes stay correct.
 */
function buildScrollMotion(root: HTMLElement, config: MotionConfig): () => void {
  const vehicle = gsap.utils.toArray<HTMLElement>("[data-vehicle]", root)[0];
  const wheels = gsap.utils.toArray<HTMLElement>("[data-wheel]", root);
  const body = gsap.utils.toArray<HTMLElement>('[data-part="body"]', root)[0];
  const sky = gsap.utils.toArray<HTMLElement>('[data-layer="sky"]', root)[0];
  const skylineBack = gsap.utils.toArray<HTMLElement>('[data-layer="skyline-back"]', root)[0];
  const skylineFront = gsap.utils.toArray<HTMLElement>('[data-layer="skyline-front"]', root)[0];
  const roadLines = gsap.utils.toArray<HTMLElement>('[data-layer="road-lines"]', root)[0];
  const foreground = gsap.utils.toArray<HTMLElement>("[data-foreground]", root)[0];
  const headline = gsap.utils.toArray<HTMLElement>("[data-headline]", root)[0];
  const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", root);

  if (
    !vehicle ||
    !body ||
    !sky ||
    !skylineBack ||
    !skylineFront ||
    !roadLines ||
    !foreground ||
    !headline
  ) {
    return () => undefined;
  }

  /**
   * Distance the car travels: stage width minus the car, with equal margins both
   * sides (the car starts at its CSS `left` offset). Recomputed on every refresh so
   * resizes stay correct; `invalidateOnRefresh` makes GSAP re-read this.
   */
  const getTravel = () => {
    const stage = root.querySelector<HTMLElement>("[data-stage]");
    if (!stage) return 0;
    return Math.max(0, stage.clientWidth - vehicle.offsetWidth - 2 * vehicle.offsetLeft);
  };

  // Suspension: quickTo so repeated velocity changes blend instead of stacking.
  const setTilt = gsap.quickTo(body, "rotation", {
    duration: VELOCITY_TILT_DURATION,
    ease: "power2.out",
  });
  const setBounce = gsap.quickTo(body, "y", {
    duration: VELOCITY_BOUNCE_DURATION,
    ease: "power2.out",
  });
  const restSuspension = () => {
    setTilt(0);
    setBounce(0);
  };

  // Returns the body to rest one short idle after the last scroll event. A
  // self-clearing timer beats ScrollTrigger's `scrollEnd` event, which only fires
  // when its internal idle detector decides to — brittle across browsers.
  let settleTimer: ReturnType<typeof setTimeout> | undefined;

  const timeline = gsap.timeline({
    defaults: { ease: EASE_LINEAR },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => `+=${window.innerHeight * config.pinVh}`,
      pin: true,
      scrub: SCRUB_SMOOTHING,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const velocity = gsap.utils.clamp(
          -config.velocityClamp,
          config.velocityClamp,
          self.getVelocity(),
        );
        setTilt((velocity / config.velocityClamp) * config.tiltMaxDeg);
        setBounce(-(Math.abs(velocity) / config.velocityClamp) * config.bounceMaxPx);
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(restSuspension, SUSPENSION_SETTLE_MS);
      },
      onLeave: restSuspension,
      onLeaveBack: restSuspension,
    },
  });

  // Vehicle sweep; wheels turn in direct proportion to distance travelled.
  timeline.to(vehicle, { x: getTravel, duration: 1 }, 0);
  timeline.to(wheels, { rotation: config.wheelRotation, duration: 1 }, 0);

  // Parallax: nearer layers travel further, building depth.
  timeline.to(sky, { xPercent: -config.parallaxSky * 100, duration: 1 }, 0);
  timeline.to(skylineBack, { xPercent: -config.parallaxBack * 100, duration: 1 }, 0);
  timeline.to(skylineFront, { xPercent: -config.parallaxFront * 100, duration: 1 }, 0);
  timeline.to(roadLines, { xPercent: -config.parallaxRoad * 100, duration: 1 }, 0);

  // Foreground recedes and fades so the road and car take over.
  timeline.to(foreground, { opacity: config.foregroundFadeTo, duration: 1 }, 0);
  timeline.to(headline, { yPercent: config.headlineRecedePct, duration: 1 }, 0);

  // Per-letter wave: letters lift in reading order, matching the car's left→right run.
  if (config.lettersRespond) {
    letters.forEach((letter, index) => {
      const ratio = letters.length > 1 ? index / (letters.length - 1) : 0;
      const at = LETTER_WAVE_START + ratio * LETTER_WAVE_SPAN;
      timeline.to(
        letter,
        { yPercent: LETTER_LIFT_PERCENT, duration: LETTER_LIFT_DURATION, ease: "power1.out" },
        at,
      );
    });
  }

  return () => {
    if (settleTimer) clearTimeout(settleTimer);
  };
}

/**
 * Pins the hero and scrubs one timeline against scroll progress: the car sweeps across
 * the road, wheels turn in proportion to distance travelled, background layers drift at
 * different rates, and the headline lifts away in a left-to-right wave. Body tilt and
 * suspension bounce ride on scroll *velocity* (via quickTo, so they settle smoothly).
 *
 * Everything is transform/opacity only, and the only layout reads happen inside
 * `getTravel`, which ScrollTrigger calls on refresh — never inside a scroll callback.
 *
 * Responsive: a full-strength build ≥768px and a calmer one below. `gsap.matchMedia`
 * rebuilds the relevant ScrollTrigger when the breakpoint is crossed and reverts it on
 * unmount, so resize never leaves a stale pin behind.
 */
export function useHeroScroll(scope: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      // Reduced motion: no pin, no scrub — the hero stays a clean, static composition.
      if (reduced) return;

      const root = scope.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767.98px)",
        },
        (context) =>
          buildScrollMotion(root, context.conditions?.isDesktop ? DESKTOP_MOTION : MOBILE_MOTION),
      );

      // Font swap can nudge layout; re-measure once fonts are ready.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => mm.revert();
    },
    { scope, dependencies: [reduced], revertOnUpdate: true },
  );
}
