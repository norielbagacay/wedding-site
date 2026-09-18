/**
 * Watercolor-style florals (roses, buds, leaves, baby's breath) drawn as SVG.
 * Every instance needs its own `idPrefix` so gradient ids don't collide on the page.
 */

type Tone = "blush" | "peach" | "cream";

const TONES: Record<Tone, { light: string; dark: string; edge: string; core: string }> = {
  blush: { light: "#f8ded6", dark: "#dea195", edge: "#cf8f84", core: "#bf7a6f" },
  peach: { light: "#fce8d6", dark: "#e9b48e", edge: "#d9a079", core: "#c48a62" },
  cream: { light: "#fffbf4", dark: "#eadbc5", edge: "#d6c1a2", core: "#c3aa86" },
};

type Arrangement = {
  /** x, y, angle (0 = pointing right), length */
  leaves: [number, number, number, number][];
  /** x, y, angle (0 = pointing up), tone */
  buds: [number, number, number, Tone][];
  /** x, y, size, tone — later roses sit on top */
  roses: [number, number, number, Tone][];
  blossoms: [number, number][];
};

/** A bouquet for the top-left corner of whatever it decorates; mirror it for other corners. */
const CORNER: Arrangement = {
  leaves: [
    [62, 62, -8, 122], [62, 62, 98, 122], [70, 58, -32, 82], [58, 70, 122, 82],
    [70, 66, 14, 96], [66, 70, 76, 96], [78, 78, 42, 84], [60, 60, -125, 46], [60, 60, 215, 46],
  ],
  buds: [[170, 30, 62, "blush"], [30, 170, -152, "peach"]],
  roses: [[124, 46, 24, "peach"], [46, 124, 22, "cream"], [106, 102, 16, "blush"], [62, 62, 36, "blush"]],
  blossoms: [
    [148, 78], [155, 69], [141, 88], [160, 84], [165, 60],
    [80, 146], [70, 154], [88, 152], [58, 166], [178, 54],
  ],
};

/** A horizontal spray for under headings. */
const DIVIDER: Arrangement = {
  leaves: [
    [104, 34, 188, 64], [104, 36, 166, 50], [136, 34, -8, 64], [136, 36, 14, 50],
    [112, 28, 222, 26], [128, 28, -42, 26],
  ],
  buds: [[46, 34, -78, "peach"], [194, 34, 78, "blush"]],
  roses: [[97, 37, 11, "peach"], [143, 37, 11, "cream"], [120, 32, 17, "blush"]],
  blossoms: [[80, 26], [72, 40], [160, 26], [168, 40], [86, 46], [154, 46]],
};

type FloralProps = { idPrefix: string; className?: string };

export function FloralCorner({ idPrefix, className }: FloralProps) {
  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false" className={className}>
      <FloralDefs id={idPrefix} />
      <Flowers id={idPrefix} arrangement={CORNER} />
    </svg>
  );
}

export function FloralDivider({ idPrefix, className }: FloralProps) {
  return (
    <svg viewBox="0 0 240 64" aria-hidden="true" focusable="false" className={className}>
      <FloralDefs id={idPrefix} />
      <Flowers id={idPrefix} arrangement={DIVIDER} />
    </svg>
  );
}

function FloralDefs({ id }: { id: string }) {
  return (
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
  );
}

function Flowers({ id, arrangement }: { id: string; arrangement: Arrangement }) {
  return (
    <>
      <g opacity="0.95">
        {arrangement.leaves.map(([x, y, angle, length]) => (
          <Leaf key={`${x}-${y}-${angle}`} id={id} x={x} y={y} angle={angle} length={length} />
        ))}
      </g>
      {arrangement.buds.map(([x, y, angle, tone]) => (
        <Bud key={`${x}-${y}`} id={id} x={x} y={y} angle={angle} tone={tone} />
      ))}
      {arrangement.roses.map(([x, y, size, tone]) => (
        <Rose key={`${x}-${y}`} id={id} x={x} y={y} size={size} tone={tone} />
      ))}
      {arrangement.blossoms.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="2.6" fill="#fffdf8" stroke="#dcc6a8" strokeWidth="0.6" />
          <circle cx={x} cy={y} r="0.9" fill="#e3c08f" />
        </g>
      ))}
    </>
  );
}

const OUTER_PETALS = [0, 60, 120, 180, 240, 300];
const INNER_PETALS = [36, 108, 180, 252, 324];

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
      <ellipse
        cy="-4"
        rx="5.5"
        ry="8.5"
        fill={`url(#${id}-${tone})`}
        stroke={TONES[tone].edge}
        strokeOpacity="0.4"
        strokeWidth="0.6"
      />
      <path d="M-6 3Q0-2 6 3Q0 8-6 3Z" fill="#8a9d7e" />
    </g>
  );
}
