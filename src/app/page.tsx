import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <main>
      {/* Plain block (not `flex`): ScrollTrigger skips pinSpacing when the pinned
          element's parent is a flex container, which would collapse the scroll runway. */}
      <Hero />

      {/* Real content below the hero so the page scrolls and the pin release is visible. */}
      <section className="mx-auto w-full max-w-3xl px-6 py-28 sm:py-36">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Built for motion</h2>
        <p className="mt-5 text-base leading-relaxed text-white/70">
          Every element above is driven by scroll progress rather than a timer. The hero pins while
          the vehicle crosses the frame, the wheels turn in proportion to distance travelled, and
          the background layers drift at different rates to build depth — all with transform-only
          animation for a steady frame budget.
        </p>
        <p className="mt-5 text-base leading-relaxed text-white/70">
          Scroll back up and the whole sequence plays in reverse, with no snapping or jumps. If your
          system requests reduced motion, the hero settles into a clean, static composition instead.
        </p>
      </section>
    </main>
  );
}
