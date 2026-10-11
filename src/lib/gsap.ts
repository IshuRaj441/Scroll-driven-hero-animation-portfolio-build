import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Register GSAP plugins exactly once, at module scope. Every component imports
 * `gsap` from here, so React Strict Mode's double-invoke can never double-register.
 * The window guard keeps this file importable during SSR/static export.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Stop iOS URL-bar show/hide from re-triggering pin maths mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/* ------------------------------------------------------------------ *
 * Shared motion constants. Named here so no component hard-codes a
 * timing/distance value inline (see NOTES.md §4 for the rationale).
 * ------------------------------------------------------------------ */

/** Seconds of catch-up for ScrollTrigger scrub — fluid without feeling laggy. */
export const SCRUB_SMOOTHING = 1;

/** How long the hero stays pinned, measured in viewport heights of scroll. */
export const PIN_DURATION_VH = 2.5;

/** Degrees the wheels turn across the full sweep (3 full revolutions). */
export const WHEEL_ROTATION_MAX = 1080;

/** Peak body tilt from scroll velocity, in degrees. */
export const TILT_MAX_DEG = 1.2;

/** Peak suspension bounce from scroll velocity, in pixels. */
export const BOUNCE_MAX_PX = 3;

/** Velocity is clamped so fast flicks cannot blow past the tilt/bounce limits. */
export const VELOCITY_CLAMP = 1200;

/** Per-letter stagger for the headline reveal, in seconds. */
export const HEADLINE_STAGGER = 0.05;

/** Per-stat stagger for the metrics reveal, in seconds. */
export const STATS_STAGGER = 0.12;

/**
 * Parallax rates, expressed as a fraction of each layer's own width (`xPercent`).
 * Deeper layers move less, so the eye reads them as further away.
 */
export const PARALLAX_SKY = 0.04;
export const PARALLAX_SKYLINE_BACK = 0.12;
export const PARALLAX_SKYLINE_FRONT = 0.22;
export const PARALLAX_ROAD = 0.3;

/* Named eases so every timeline speaks the same motion language. */
export const EASE_OUT = "power3.out";
export const EASE_IN_OUT = "power2.inOut";
export const EASE_LINEAR = "none";

export { gsap, ScrollTrigger };
