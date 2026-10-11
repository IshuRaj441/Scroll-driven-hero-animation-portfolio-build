/**
 * Original side-view coupe, authored as inline SVG.
 *
 * Two animation targets are exposed via data attributes:
 *  - `data-part="body"` — the shell, which tilts/bounces with scroll velocity.
 *  - `data-wheel`       — each wheel's spinning group, centred on its own axle so
 *                         GSAP can rotate it in place without any layout maths.
 * The artwork is purely decorative, so the whole `<svg>` is `aria-hidden`.
 */
const TIRE_RADIUS = 46;
const WHEEL_REAR_X = 152;
const WHEEL_FRONT_X = 498;
const WHEEL_Y = 178;
const SPOKE_COUNT = 5;

type WheelProps = {
  cx: number;
  cy: number;
};

function Wheel({ cx, cy }: WheelProps) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* Inner group shares the axle as its origin, so a rotation spins it in place. */}
      <g
        data-wheel
        data-tire-radius={TIRE_RADIUS}
        className="will-change-transform"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <circle r={TIRE_RADIUS} fill="#0a0f1c" />
        <circle r={TIRE_RADIUS} fill="none" stroke="#1c2740" strokeWidth={2} />
        <circle r={34} fill="none" stroke="#ffffff" strokeOpacity={0.05} />
        <circle r={30} fill="url(#veh-rim)" />
        <circle r={30} fill="none" stroke="#e8eefb" strokeOpacity={0.25} />
        {Array.from({ length: SPOKE_COUNT }).map((_, index) => (
          <rect
            key={index}
            x={-2.5}
            y={-27}
            width={5}
            height={19}
            rx={2.5}
            fill="#cdd7ea"
            transform={`rotate(${(index * 360) / SPOKE_COUNT})`}
          />
        ))}
        <circle r={7} fill="#e8eefb" />
        <circle r={3} fill="#64708c" />
      </g>
    </g>
  );
}

type VehicleProps = {
  className?: string;
};

export function Vehicle({ className }: VehicleProps) {
  return (
    <div data-vehicle className={["will-change-transform", className].filter(Boolean).join(" ")}>
      {/* Soft contact shadow that stays under the car while the body bounces. */}
      <div className="absolute inset-x-[10%] bottom-[-2%] h-[10%] rounded-[50%] bg-black/50 blur-md" />
      <svg viewBox="0 0 660 224" aria-hidden="true" className="relative block h-auto w-full">
        <defs>
          <linearGradient id="veh-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4e88" />
            <stop offset="0.55" stopColor="#1a2547" />
            <stop offset="1" stopColor="#0c1428" />
          </linearGradient>
          <linearGradient id="veh-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a9ecff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#2a4a80" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="veh-rim" cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#eef3ff" />
            <stop offset="0.6" stopColor="#8b97b3" />
            <stop offset="1" stopColor="#454e66" />
          </radialGradient>
          <linearGradient id="veh-head" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8fe9ff" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Wheels sit behind the shell so the fenders overlap their upper half. */}
        <Wheel cx={WHEEL_REAR_X} cy={WHEEL_Y} />
        <Wheel cx={WHEEL_FRONT_X} cy={WHEEL_Y} />

        <g data-part="body" className="will-change-transform">
          {/* Main shell silhouette. */}
          <path
            d="M40 156 L36 118 C38 96 56 84 92 80 L168 72 C214 66 236 34 300 32 L372 32 C432 34 462 64 520 72 L600 80 C632 84 642 102 638 126 L632 156 Z"
            fill="url(#veh-body)"
            stroke="#5ee7ff"
            strokeOpacity={0.18}
            strokeWidth={1.5}
          />

          {/* Fender arches: decorative strokes that read as wheel openings. */}
          <path d="M106 156 A46 46 0 0 1 198 156" fill="none" stroke="#0c1428" strokeWidth={4} />
          <path d="M452 156 A46 46 0 0 1 544 156" fill="none" stroke="#0c1428" strokeWidth={4} />

          {/* Cabin glass, with a B-pillar splitting the side windows. */}
          <path
            d="M186 74 C224 66 246 40 304 38 L366 38 C424 40 446 62 506 74 Z"
            fill="url(#veh-glass)"
          />
          <rect x={298} y={36} width={9} height={40} rx={3} fill="#141d38" />

          {/* Lights. */}
          <path d="M604 92 C620 92 632 100 634 112 L606 110 Z" fill="url(#veh-head)" />
          <rect x={36} y={98} width={22} height={12} rx={3} fill="#ff4d5e" opacity={0.9} />

          {/* A single body crease for depth. */}
          <path d="M84 110 L560 118" stroke="#ffffff" strokeOpacity={0.06} strokeWidth={2} />

          {/* Accent underglow along the rocker. */}
          <rect x={150} y={148} width={360} height={3} rx={1.5} fill="#5ee7ff" opacity={0.5} />
        </g>
      </svg>
    </div>
  );
}
