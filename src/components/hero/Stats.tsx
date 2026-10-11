import type { Stat } from "@/data/stats";

type StatsProps = {
  stats: readonly Stat[];
};

/**
 * Impact metrics as a definition list: `<dt>` is the description, `<dd>` the figure.
 * Visually the figure sits above the label (flex-col-reverse) but the DOM order keeps
 * the natural "term → value" reading order for assistive tech.
 */
export function Stats({ stats }: StatsProps) {
  return (
    <dl
      data-stats
      className="mt-[clamp(1.75rem,4.5svh,3.25rem)] grid w-full max-w-5xl grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          data-stat
          data-stat-index={index}
          // Each stat starts hidden below its resting spot and is revealed on load.
          className="flex flex-col-reverse items-center text-center will-change-transform sm:items-start sm:text-left"
        >
          <dt className="mt-1.5 text-[0.7rem] leading-snug tracking-[0.08em] text-white/55 uppercase">
            {stat.label}
          </dt>
          <dd className="text-accent font-mono text-[clamp(1.6rem,3.6vw,2.75rem)] leading-none font-semibold tabular-nums">
            {/*
              Fixed 2-character width + tabular numerals keep the figure's box size
              constant while it counts 0 → target, so the loading animation causes
              no layout shift (CLS).
            */}
            <span data-count data-target={stat.value} className="inline-block min-w-[2ch]">
              {stat.value}
            </span>
            <span aria-hidden="true">%</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
