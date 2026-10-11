"use client";

import { useRef } from "react";
import { stats } from "@/data/stats";
import { useHeroIntro } from "@/hooks/useHeroIntro";
import { useHeroScroll } from "@/hooks/useHeroScroll";
import { Headline } from "./Headline";
import { Stats } from "./Stats";
import { Vehicle } from "./Vehicle";
import { ParallaxLayers } from "./ParallaxLayers";

/**
 * The road band the car drives along. Lane lines are a decorative, transform-friendly
 * repeating gradient so Phase 4 can slide/scale it without touching layout.
 */
function Road() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Asphalt, darker toward the viewer for a shallow sense of perspective. */}
      <div
        data-layer="road-surface"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#0a1024_0%,#0c1428_38%,#070b16_100%)] will-change-transform"
      />
      {/* Horizon glow + hairline where the road meets the skyline. */}
      <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(94,231,255,0.16),transparent_72%)]" />
      <div className="bg-accent/30 absolute inset-x-0 top-0 h-px" />
      {/* Edge lines. */}
      <div className="absolute inset-x-0 top-[30%] h-px bg-white/10" />
      <div className="absolute inset-x-0 bottom-[14%] h-px bg-white/10" />
      {/* Dashed centre line, anchored where the wheels meet the road. The inner strip is
          over-wide so the parallax slide never exposes an empty edge. */}
      <div className="absolute inset-x-0 top-[58%] h-[3px] overflow-hidden">
        <div
          data-layer="road-lines"
          className="h-full w-[150%] bg-[repeating-linear-gradient(to_right,#5ee7ff_0_26px,transparent_26px_62px)] opacity-45 will-change-transform"
        />
      </div>
    </div>
  );
}

/**
 * Hero section. Fills the first viewport (`100svh`) and stacks three z-planes:
 * parallax background → text content → road + car. `--stage-h` is the single source of
 * truth for the road height so the background, road and car stay aligned.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  useHeroIntro(rootRef);
  useHeroScroll(rootRef);

  return (
    <section
      ref={rootRef}
      id="hero"
      aria-labelledby="hero-heading"
      data-hero
      className="relative isolate flex min-h-svh flex-col overflow-hidden [--stage-h:clamp(150px,24svh,240px)]"
    >
      <ParallaxLayers />

      <div
        data-foreground
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-5 pt-[clamp(3rem,11svh,7rem)] will-change-[opacity] sm:px-8"
      >
        <Headline id="hero-heading" />
        <Stats stats={stats} />
      </div>

      <div data-stage className="relative z-20 h-[var(--stage-h)] w-full shrink-0">
        <Road />
        <Vehicle className="absolute bottom-[42%] left-[6%] w-[clamp(210px,30vw,430px)]" />
      </div>
    </section>
  );
}
