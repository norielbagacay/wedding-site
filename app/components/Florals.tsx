/**
 * A watercolor-style corner bouquet (roses, buds, leaves, baby's breath) drawn for
 * the top-left corner of whatever it decorates; rotate it 180° for the opposite corner.
 */

type Tone = "blush" | "peach" | "cream";

const TONES: Record<Tone, { light: string; dark: string; edge: string; core: string }> = {
  blush: { light: "#f8ded6", dark: "#dea195", edge: "#cf8f84", core: "#bf7a6f" },
  peach: { light: "#fce8d6", dark: "#e9b48e", edge: "#d9a079", core: "#c48a62" },
  cream: { light: "#fffbf4", dark: "#eadbc5", edge: "#d6c1a2", core: "#c3aa86" },
};

const OUTER_PETALS = [0, 60, 120, 180, 240, 300];
const INNER_PETALS = [36, 108, 180, 252, 324];

type FloralsProps = {
  /** Unique per instance so gradient ids don't collide on the page. */
  idPrefix: string;
  className?: string;
};

export function Florals({ idPrefix: id, className }: FloralsProps) {
  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false" className={className}>
      <defs>
        {(Object.keys(TONES) as Tone[]).map((tone) => (
          <g key={tone}>
            <radialGradient id={`${id}-${tone}`} cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor={TONES[tone].light} />
              <stop offset="100%" stopColor={TONES[tone].dark} />
            </radialGradient>
            <radialGradient id={`${id}-${tone}-core`} r="60%">
              <stop offset="0%" stopColor={TONES[tone].core} />
              <stop offset="100%" stopColor={TONES[tone].dark} />
            </radialGradient>
          </g>
        ))}
        <linearGradient id={`${id}-leaf`} x1="0" x2="1">
          <stop offset="0%" stopColor="#8a9d7e" />
          <stop offset="100%" stopColor="#c2ceb1" />
        </linearGradient>
      </defs>

      <g opacity="0.95">
        <Leaf id={id} x={62} y={62} angle={-8} length={122} />
        <Leaf id={id} x={62} y={62} angle={98} length={122} />
        <Leaf id={id} x={70} y={58} angle={-32} length={82} />
        <Leaf id={id} x={58} y={70} angle={122} length={82} />
        <Leaf id={id} x={70} y={66} angle={14} length={96} />
        <Leaf id={id} x={66} y={70} angle={76} length={96} />
        <Leaf id={id} x={78} y={78} angle={42} length={84} />
        <Leaf id={id} x={60} y={60} angle={-125} length={46} />
        <Leaf id={id} x={60} y={60} angle={215} length={46} />
      </g>

      <Bud id={id} x={170} y={30} angle={62} tone="blush" />
      <Bud id={id} x={30} y={170} angle={-152} tone="peach" />

      <Rose id={id} x={124} y={46} size={24} tone="peach" />
      <Rose id={id} x={46} y={124} size={22} tone="cream" />
      <Rose id={id} x={106} y={102} size={16} tone="blush" />
      <Rose id={id} x={62} y={62} size={36} tone="blush" />

      <Blossoms
        points={[
          [148, 78], [155, 69], [141, 88], [160, 84], [165, 60],
          [80, 146], [70, 154], [88, 152], [58, 166], [178, 54],
        ]}
      />
    </svg>
  );
}

function Rose({ id, x, y, size, tone }: { id: string; x: number; y: number; size: number; tone: Tone }) {
  const fill = `url(#${id}-${tone})`;
  const { edge, core } = TONES[tone];
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 30})`}>
      {OUTER_PETALS.map((angle) => (
        <ellipse
          key={angle}
          cy="-14"
          rx="16"
          ry="13"
          transform={`rotate(${angle})`}
          fill={fill}
          stroke={edge}
          strokeOpacity="0.35"
          strokeWidth="0.7"
        />
      ))}
      {INNER_PETALS.map((angle) => (
        <ellipse
          key={angle}
          cy="-8"
          rx="11"
          ry="9"
          transform={`rotate(${angle})`}
          fill={fill}
          stroke={edge}
          strokeOpacity="0.3"
          strokeWidth="0.6"
        />
      ))}
      <circle r="8" fill={`url(#${id}-${tone}-core)`} />
      <path
        d="M0 -1a2 2 0 1 1 2 2a4 4 0 1 1-4-4a6 6 0 1 1 6 6"
        fill="none"
        stroke={core}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </g>
  );
}

function Leaf({ id, x, y, angle, length }: { id: string; x: number; y: number; angle: number; length: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${length / 42})`}>
      <path d="M0 0C10-9 30-10 42 0C30 10 10 9 0 0Z" fill={`url(#${id}-leaf)`} />
      <path d="M3 0H38" stroke="#6d8264" strokeWidth="0.7" opacity="0.4" />
    </g>
  );
}

function Bud({ id, x, y, angle, tone }: { id: string; x: number; y: number; angle: number; tone: Tone }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d="M0 4C1 12 0 20-2 28" fill="none" stroke="#8a9d7e" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cy="-4" rx="5.5" ry="8.5" fill={`url(#${id}-${tone})`} stroke={TONES[tone].edge} strokeOpacity="0.4" strokeWidth="0.6" />
      <path d="M-6 3Q0-2 6 3Q0 8-6 3Z" fill="#8a9d7e" />
    </g>
  );
}

function Blossoms({ points }: { points: [number, number][] }) {
  return (
    <g>
      {points.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="2.6" fill="#fffdf8" stroke="#dcc6a8" strokeWidth="0.6" />
          <circle cx={x} cy={y} r="0.9" fill="#e3c08f" />
        </g>
      ))}
    </g>
  );
}
