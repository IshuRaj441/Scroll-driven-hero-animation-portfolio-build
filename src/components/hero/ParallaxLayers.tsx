/**
 * Decorative background stack. Each moving layer carries a `data-layer` hook that the
 * scroll timeline (Phase 4) targets; nothing here is interactive or read by assistive
 * tech, so the wrapper is `aria-hidden`.
 */
type Building = {
  x: number;
  w: number;
  h: number;
};

/** Far skyline: shorter, hazier blocks. */
const BACK_SKYLINE: readonly Building[] = [
  { x: 0, w: 54, h: 96 },
  { x: 54, w: 40, h: 140 },
  { x: 94, w: 64, h: 78 },
  { x: 158, w: 48, h: 168 },
  { x: 206, w: 36, h: 120 },
  { x: 242, w: 58, h: 150 },
  { x: 344, w: 60, h: 186 },
  { x: 404, w: 38, h: 132 },
  { x: 442, w: 52, h: 110 },
  { x: 494, w: 64, h: 158 },
  { x: 558, w: 42, h: 96 },
  { x: 600, w: 56, h: 176 },
  { x: 656, w: 46, h: 124 },
  { x: 702, w: 60, h: 142 },
  { x: 800, w: 52, h: 164 },
  { x: 852, w: 44, h: 120 },
  { x: 896, w: 58, h: 150 },
  { x: 954, w: 40, h: 100 },
  { x: 994, w: 62, h: 138 },
  { x: 1056, w: 48, h: 170 },
  { x: 1104, w: 54, h: 112 },
  { x: 1158, w: 42, h: 146 },
  { x: 1200, w: 60, h: 128 },
  { x: 1260, w: 46, h: 158 },
  { x: 1306, w: 54, h: 110 },
  { x: 1360, w: 80, h: 140 },
];

/** Near skyline: taller, darker blocks that read as closer to camera. */
const FRONT_SKYLINE: readonly Building[] = [
  { x: 0, w: 70, h: 150 },
  { x: 70, w: 52, h: 196 },
  { x: 122, w: 64, h: 132 },
  { x: 186, w: 58, h: 208 },
  { x: 244, w: 48, h: 160 },
  { x: 292, w: 72, h: 182 },
  { x: 420, w: 66, h: 204 },
  { x: 486, w: 50, h: 166 },
  { x: 536, w: 70, h: 190 },
  { x: 606, w: 58, h: 148 },
  { x: 664, w: 74, h: 210 },
  { x: 738, w: 54, h: 158 },
  { x: 792, w: 62, h: 186 },
  { x: 854, w: 50, h: 140 },
  { x: 904, w: 70, h: 200 },
  { x: 974, w: 58, h: 168 },
  { x: 1032, w: 66, h: 194 },
  { x: 1098, w: 54, h: 152 },
  { x: 1152, w: 72, h: 206 },
  { x: 1224, w: 60, h: 170 },
  { x: 1284, w: 66, h: 188 },
  { x: 1350, w: 90, h: 160 },
];

type SkylineProps = {
  buildings: readonly Building[];
  layer: string;
  className: string;
};

function Skyline({ buildings, layer, className }: SkylineProps) {
  return (
    <svg
      data-layer={layer}
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      className={className}
      fill="currentColor"
    >
      {buildings.map((building, index) => (
        <rect
          key={index}
          x={building.x}
          y={220 - building.h}
          width={building.w}
          height={building.h}
        />
      ))}
    </svg>
  );
}

export function ParallaxLayers() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Night sky with a warm-to-cool horizon glow. */}
      <div
        data-layer="sky"
        className="absolute -inset-[6%] bg-[radial-gradient(120%_80%_at_50%_100%,#1b2b52_0%,#0a0f22_45%,#05070f_100%)] will-change-transform"
      />
      <div className="absolute inset-x-0 bottom-[var(--stage-h)] h-40 bg-[radial-gradient(60%_100%_at_50%_100%,rgba(94,231,255,0.22),transparent_72%)]" />

      <Skyline
        buildings={BACK_SKYLINE}
        layer="skyline-back"
        className="absolute bottom-[var(--stage-h)] left-[-6%] h-[clamp(96px,20svh,190px)] w-[112%] text-[#16224a] will-change-transform"
      />
      <Skyline
        buildings={FRONT_SKYLINE}
        layer="skyline-front"
        className="absolute bottom-[var(--stage-h)] left-[-8%] h-[clamp(120px,26svh,240px)] w-[116%] text-[#0b1024] will-change-transform"
      />
    </div>
  );
}
