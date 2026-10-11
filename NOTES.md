# NOTES — Phase 0: Reference Study & Motion Plan

> Planning document only. Nothing here is copied into the implementation. This captures
> _what the reference does_, _why it feels the way it does_, and _what our original version
> will do differently_.

Reference audited: `https://paraschaturvedi.github.io/car-scroll-animation`
Single static `index.html` (no build step), GSAP **3.12.2** + ScrollTrigger via CDN.

---

## 1. Reference structure (as observed)

### Layer stack (top → bottom on the z-axis)

| z   | Element                        | Role                                                 | Notes                                                 |
| --- | ------------------------------ | ---------------------------------------------------- | ----------------------------------------------------- |
| 10  | `.car` (`img`)                 | Vehicle bitmap, top-down McLaren PNG                 | `left:0`, height `200px`, absolute inside `.road`     |
| 5   | `.value-add` + `.value-letter` | Headline "WELCOME ITZ FIZZ", 15 letter spans         | `8rem`, `left:5%`, letters `opacity:0` (color `#111`) |
| 5   | `.text-box` #1–#4              | 4 metric boxes (58 / 23 / 27 / 40 %)                 | `opacity:0`, gap + `.show` transition added manually  |
| 1   | `.trail`                       | Green `#45db7d` progress bar behind car              | animated via `width`                                  |
| 0   | `.road`                        | Dark strip `100vw × 200px`, `overflow:hidden`        | the "stage" the car drives across                     |
| —   | `.track`                       | `position:sticky; top:0; height:100vh`, bg `#d1d1d1` | also GSAP `pin` target                                |
| —   | `.section`                     | `height:200vh`, bg `#121212`                         | scroll driver (200vh)                                 |

### Scroll logic (as written)

- **One master tween** drives the car: `gsap.to(car, { x: innerWidth - 150, ease:'none',
scrollTrigger:{ trigger:'.section', start:'top top', end:'bottom top', scrub:true, pin:'.track' } })`.
  So vehicle X is a **function of scroll progress**, range `0 → viewportWidth-150`, linear (`ease:none`).
- An `onUpdate` callback runs on every scrub tick and does three things:
  1. Computes `carX = x + carWidth/2`.
  2. Toggles each `.value-letter` `opacity` 0/1 by comparing `carX` against the letter's static
     `offsetLeft` (measured **once** up-front relative to the headline box).
  3. `gsap.set(trail, { width: carX })` — grows the green trail with the car.
- **Stat boxes** each get their own ScrollTrigger at fixed scroll offsets:
  `start: top+=400/600/800/1000 top`, `end: +=200`, `scrub:true`, tweening `opacity 0→1`.
  i.e. staggered reveal windows, 200px wide, sequential.

### Effective timing map of the reference (over a 200vh section)

| Scroll distance (from hero top) | What happens                                                  |
| ------------------------------- | ------------------------------------------------------------- |
| 0 → 100vh                       | car sweeps full width; letters flip on as the car passes them |
| 400–600px                       | stat #1 fades in                                              |
| 600–800px                       | stat #2 fades in                                              |
| 800–1000px                      | stat #3 fades in                                              |
| 1000–1200px                     | stat #4 fades in                                              |
| 100vh → 200vh                   | pinned hero holds; section bottom reached, pin releases       |

### Easing / smoothing observed

- Car motion: `ease:"none"` (linear) so it tracks the scrollbar 1:1.
- `scrub:true` = **no smoothing** → motion is only as fluid as the wheel. This is the main
  reason it can feel steppy; our version will use `scrub:1` (or Lenis) for interpolation.
- Letter reveal: **binary** opacity flip (0 or 1), no fade — reads as "pop", not premium.
- Stat reveal: plain linear opacity with `scrub:true`, no transform, no count-up.

### Weaknesses we will improve (for the assignment, not to copy)

1. Animates `width` of `.trail` → **layout** property. Brief forbids layout animation; we use
   `scaleX`/`clip-path` transforms instead.
2. Raster PNG vehicle (not original, not crisp, no separable wheels).
3. No load/intro animation; headline is decorative spans only (not screen-reader friendly).
4. No `prefers-reduced-motion`, no mobile strategy, all sizes hard-coded (`8rem`, `200px`).
5. Binary letter reveal + no headline response after the car passes.
6. `position:sticky` **and** GSAP `pin` on the same element is redundant/fragile.
7. No wheel rotation, no suspension/tilt, no parallax depth layers.
8. Stats are hard-coded in markup, not data-driven.

---

## 2. Our original concept

**Theme:** a dark, premium "night freeway" hero. An **original inline-SVG performance coupe**
(side view) drives left→right across a layered skyline. Wheels are separate SVG groups so they
can spin independently; the body group gets velocity-driven tilt/suspension. All motion is
transform-only and scrubbed by scroll **progress**.

No assets are reused. The SVG is authored by us; the palette, copy, layout, and timeline are new.

---

## 3. Proposed final scroll timeline (progress 0 → 1)

Scrub window: pinned hero held for **+250vh** of scroll (total section ≈ `100svh + 250vh`).
Progress `p` is `ScrollTrigger.progress` for the pinned range. All ranges are chosen so features
overlap slightly (no dead zones) and reverse identically.

| Progress `p` | Layer                 | Motion (transform-only)                                                    | Easing / notes                                          |
| ------------ | --------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| 0.00 → 1.00  | **Vehicle X**         | `x: from 8vw → (100vw - carW - 8vw)`                                       | `ease:none` (linear vs progress) + `scrub:1` smoothing  |
| 0.00 → 1.00  | **Wheels**            | `rotation: 0 → 1080deg`, _proportional to X_ (rad = distance / radius)     | derived from same progress, so it never desyncs         |
| 0.05 → 0.95  | **Body tilt**         | `rotation: -1.2deg → 1.2deg` from scroll **velocity**                      | velocity→tilt via `quickTo`, clamped, springs back to 0 |
| 0.00 → 0.60  | **Suspension bounce** | `y` micro-bounce (±3px) driven by `abs(velocity)`                          | decays as car settles                                   |
| 0.00 → 1.00  | **Sky (back)**        | `x`: `0 → -4%`, `scale 1.04`                                               | slowest = furthest                                      |
| 0.00 → 1.00  | **Skyline (back)**    | `x`: `0 → -12%`                                                            | mid depth                                               |
| 0.00 → 1.00  | **Skyline (front)**   | `x`: `0 → -22%`                                                            | nearest skyline                                         |
| 0.00 → 1.00  | **Road lines**        | `scaleX: 1 → 1.6`, `x` drift `0 → -30%`                                    | foreground speed cue                                    |
| 0.00 → 1.00  | **Speed streaks**     | `scaleX`/`opacity` pulse with velocity                                     | transform + opacity only                                |
| 0.00 → 0.85  | **Headline letters**  | per-letter `y: 0→-40px`, `opacity: 1→0.15` as car front passes each letter | car-position → letter-x comparison (measured once)      |
| 0.00 → 0.20  | **Headline wrapper**  | `y: 0→-24px`, slight `scale 1→0.98`                                        | gentle recede                                           |
| 0.10 → 0.30  | **Stat 1**            | reveal: `y +24→0`, `opacity 0→1`, count `0→58%`                            | overlapping windows                                     |
| 0.30 → 0.50  | **Stat 2**            | same pattern, `0→23%`                                                      |                                                         |
| 0.50 → 0.70  | **Stat 3**            | same pattern, `0→27%`                                                      |                                                         |
| 0.70 → 0.90  | **Stat 4**            | same pattern, `0→40%`                                                      |                                                         |
| 0.92 → 1.00  | **Vignette / scrim**  | `opacity 0→0.5`                                                            | hands off to next section                               |

**Reverse-scroll:** every item above is inside a single scrubbed timeline or independent scrubbed
tweens, so scrolling up runs the exact inverse. No `toggleActions`, no snapping (`snap`),
no time-based `from` tweens in the scroll path.

### Load-time (intro) timeline — runs once, before scroll interaction

| t (s) | Item              | Motion                                                                |
| ----- | ----------------- | --------------------------------------------------------------------- |
| 0.00  | Headline wrapper  | `y:28→0`, `opacity 0→1`                                               |
| 0.10  | Letters           | stagger `0.05s`, per-letter `y:18→0`, `opacity 0→1`, `rotateX` slight |
| 0.55  | Stats             | stagger `0.12s`, `y:16→0`, `opacity 0→1`, count-up 0→target (eased)   |
| 0.60  | Vehicle           | `y:24→0`, `opacity 0→1`, wheels settle                                |
| 0.70  | Background layers | gentle `opacity`/`scale` settle                                       |

`prefers-reduced-motion: reduce` → skip intro tween (jump to final state), no scrub, no
parallax, stat values shown at final numbers, layout stays fully readable.

---

## 4. Constants (single source of truth in `src/lib/gsap.ts`)

- `SCRUB_SMOOTHING = 1` — seconds of catch-up; fluid without feeling laggy.
- `PIN_SCROLL_LENGTH = "+=250%"` — how long the hero stays pinned.
- `WHEEL_ROTATION_MAX = 1080` — 3 full turns across the sweep.
- `TILT_MAX_DEG = 1.2`, `BOUNCE_MAX_PX = 3`, `VELOCITY_CLAMP = 1200`.
- `HEADLINE_STAGGER = 0.05`, `STATS_STAGGER = 0.12`.
- Shared eases: `EASE_OUT = "power3.out"`, `EASE_IN_OUT = "power2.inOut"`, `EASE_LINEAR = "none"`.
- Parallax factors named: `PARALLAX_SKY = 0.04`, `PARALLAX_SKYLINE_BACK = 0.12`,
  `PARALLAX_SKYLINE_FRONT = 0.22`, `PARALLAX_ROAD = 0.30`.

Full timeline is written with `ScrollTrigger.progress` in mind; the same constants feed mobile
(simplified) and desktop (full) via a breakpoint check, no magic numbers inline.

---

## 5. Verified toolchain (npm latest, cross-checked for compatibility)

| Package              | Version | Notes                                                    |
| -------------------- | ------- | -------------------------------------------------------- |
| next                 | 16.4.0  | App Router, static export                                |
| react / react-dom    | 19.3.0  | matches Next 16                                          |
| gsap                 | 3.15.0  | includes ScrollTrigger (free)                            |
| tailwindcss          | 4.3.3   | v4 engine                                                |
| @tailwindcss/postcss | 4.x     | required by Tailwind v4                                  |
| lenis                | 1.3.26  | optional smooth scroll; used only for non-reduced-motion |
| typescript           | 7.x     | latest stable                                            |
| eslint               | 10.x    | + `eslint-config-next` 16.4.0                            |
| prettier             | 3.9.10  | formatting                                               |

> Note: versions are pinned to the latest stable as resolved at Phase 0; exact numbers are
> re-confirmed and locked in `package.json` during Phase 1 (Phase 0 changes nothing on disk
> except this file).

---

## 6. Phase 0 conflicts / decisions (per brief)

- **`sticky` + `pin` together** (reference): we use **only** ScrollTrigger `pin` with
  `pinSpacing:false` on a normal-flow section, avoiding double-stick bugs and layout shift.
- **Trail bar** (reference animates `width`): replaced by **speed streaks** animated with
  `scaleX` + `opacity` (transform/opacity only).
- **Contrast:** headline sits on a dark scrim over the sky; we guarantee ≥ 4.5:1 by tuning
  the scrim opacity rather than relying on the artwork.
- **Screen reader:** the visible letter-spaced headline is `aria-hidden`; an adjacent
  visually-hidden `<h1>`/`aria-label` carries the real string so AT reads "WELCOME ITZ FIZZ".
