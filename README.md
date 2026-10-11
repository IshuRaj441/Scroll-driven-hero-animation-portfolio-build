# Welcome Itz Fizz — Scroll-Driven Hero

[![Deploy to GitHub Pages](https://github.com/<username>/<repo>/actions/workflows/deploy.yml/badge.svg)](https://github.com/<username>/<repo>/actions/workflows/deploy.yml)

A portfolio-grade scroll-driven hero animation built with **Next.js (App Router)**, **React 19**, **GSAP + ScrollTrigger**, **Tailwind CSS v4** and **TypeScript**. A letter-spaced `W E L C O M E   I T Z   F I Z Z` headline, four impact metrics, and an original multi-layer SVG coupe that sweeps across a night freeway as you scroll.

> 🔗 Live demo: `https://<username>.github.io/<repo>/` — GitHub repo: `https://github.com/<username>/<repo>`

The concept and motion directions are inspired by [paraschaturvedi's car scroll animation](https://paraschaturvedi.github.io/car-scroll-animation/); every asset, SVG, layout and tween in this project is built from scratch.

---

## What it does

**On load** — the headline fades and rises letter by letter, the stats count up from `0` to their targets (`92%`, `58%`, `34%`, `71%`) with eased counters, and the vehicle and background layers reveal themselves.

**On scroll** — the hero pins for **2.5 viewport heights** (1.8 on small screens, see _Responsive_) and one scrubbed timeline (`scrub: 1`) drives a left→right journey across the road:

| Scroll progress | What happens                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `0.00 → 1.00`   | Coupe travels left → right; both wheels rotate **1080°** in direct proportion to distance travelled                            |
| `0.00 → 1.00`   | Parallax depth: sky drifts 4%, skyline-back 12%, skyline-front 22%, road lines 30% of their own width                          |
| `0.00 → 1.00`   | Headline recedes upward and fades into the background                                                                          |
| `0.04 → 0.76`   | Headline letters lift in reading order — a left→right wave that mirrors the car's run                                          |
| continuous      | Scroll **velocity** drives body tilt (±1.2°) and suspension bounce (±3px) via `quickTo`, settling 180 ms after scrolling stops |
| `1.00`          | Foreground road settles at opacity 0.2; the car and road become the frame                                                      |

Scrolling back reverses the journey pixel-for-pixel — no one-way tween, every value is a pure transform of scroll progress.

## Built with

- **Next.js 16** (App Router, `output: "export"` static site) + **React 19**
- **GSAP 3.15** with **ScrollTrigger** — pinned hero, scrubbed timeline, `gsap.matchMedia` for breakpoints, `gsap.quickTo` for velocity physics
- **Tailwind CSS v4** — CSS-first `@theme` tokens for the night palette (`night-950` → `night-700`, accent `#5ee7ff`)
- **TypeScript 5.9** — strict, zero explicit `any`

## Performance & accessibility

- **Lighthouse (static export):** Accessibility **100**, Best Practices **100**, SEO **100** — zero audit failures.
- **60fps discipline:** the whole scrolled journey is **transform/opacity only** (plus `will-change` on animated layers) so everything runs on the compositor; the only layout reads live inside a refresh-only handler, never a scroll callback.
- **~170 KB gzip of JS** total, no raster images, self-hosted `woff2` fonts with `font-display: swap`, and a CLS-proof loading sequence (tabular, fixed-width counters).
- **First paint needs no JS:** pure-CSS guards render a complete static hero before hydration; a `<noscript>` block keeps it visible with JS disabled.
- **`prefers-reduced-motion`:** respected end-to-end — no pin, no scrub, no counters; the hero stays a clean static composition.
- **Responsive 360 → 1920px+:** the rich experience runs ≥768px; below that a _simplified on mobile_ config takes over (shorter 1.8vh pin, 720° wheel turn, gentler parallax, no letter wave). `gsap.matchMedia` rebuilds the pin cleanly when the breakpoint is crossed, and function-based positions re-read on resize.
- **Semantic a11y:** single `h1` with `aria-label` + `aria-hidden` letters, a real `<dl>/<dt>/<dd>` for the metrics, `aria-hidden` decorative SVG art, `lang="en"`, landmark regions, and a visible `:focus-visible` ring.

## Getting started

```bash
npm install        # install dependencies
npm run dev        # start the dev server at http://localhost:3000
```

Other scripts:

| Command             | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `npm run format`    | Prettier (Tailwind-aware) over the whole repo                  |
| `npm run lint`      | ESLint                                                         |
| `npm run build`     | Production build → static export in `./out`                    |
| `npm run typecheck` | `tsc --noEmit` (run after `build`, which generates Next types) |
| `npm run preview`   | Serve `./out` locally, e.g. `npm run preview -- --port 3100`   |

## Project structure

```
src/
├── app/                  # App Router: layout, page, global CSS
│   └── globals.css       # Tailwind v4 @theme tokens, reduced-motion & no-flash guards
├── components/hero/      # Hero, Headline (per-letter), Stats (dl…), Vehicle (SVG), ParallaxLayers, Road
├── data/stats.ts         # The four typed impact metrics (single source of truth)
├── hooks/                # useHeroScroll, useHeroIntro, useReducedMotion
└── lib/gsap.ts           # GSAP/ScrollTrigger setup + every motion constant
.github/workflows/        # deploy.yml — build + publish to GitHub Pages
```

## Deploying to GitHub Pages

1. Push this repo to GitHub (it needs to be a **public or Pages-enabled private** repo).
2. Create the repo with the name you want to serve under, e.g. `github.com/<username>/<repo>`.
3. On GitHub, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
4. Push to `main` (or run the workflow manually via **Actions**). The workflow builds `./out` with `NEXT_PUBLIC_BASE_PATH=/<repo>` and publishes it with `actions/deploy-pages`.
5. After the first successful deploy, replace `<username>` / `<repo>` in `public/robots.txt`, `public/sitemap.xml`, and this file's links, then redeploy.

Your site is then live at `https://<username>.github.io/<repo>/`.

## License

MIT — do whatever you like, but the `W E L C O M E   I T Z   F I Z Z` concept is a fictional personal project.
