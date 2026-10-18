/**
 * A small music-box rendition of Pachelbel's Canon in D, synthesized with Web Audio
 * so the site ships no audio file. It must be started from a click (browser autoplay rules).
 */

/** Seconds per beat; each chord lasts two beats. */
const BEAT = 0.62;

/** Chord roots (MIDI) for D – A – Bm – F#m – G – D – G – A, and whether each is minor. */
const CHORDS: [root: number, minor: boolean][] = [
  [62, false],
  [57, false],
  [59, true],
  [54, true],
  [55, false],
  [62, false],
  [55, false],
  [57, false],
];

/** Two passes of the melody, one note per chord. */
const MELODY = [
  [78, 76, 74, 73, 71, 69, 71, 73],
  [86, 85, 83, 81, 79, 78, 79, 76],
];

type Note = { beat: number; midi: number; velocity: number };

function buildLoop(): { notes: Note[]; beats: number } {
  const notes: Note[] = [];
  MELODY.forEach((line, pass) => {
    CHORDS.forEach(([root, minor], i) => {
      const bar = (pass * CHORDS.length + i) * 2;
      notes.push({ beat: bar, midi: line[i], velocity: 1 });
      // Rolling eighth-note arpeggio underneath: root, fifth, octave, third above.
      [0, 7, 12, minor ? 15 : 16].forEach((step, j) => {
        notes.push({ beat: bar + j / 2, midi: root + step, velocity: 0.4 });
      });
    });
  });
  return { notes, beats: MELODY.length * CHORDS.length * 2 };
}

const LOOP = buildLoop();

function frequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export type MusicBoxPlayer = {
  setMuted(muted: boolean): void;
  stop(): void;
};

/** Starts the tune on a loop. Returns null where Web Audio is unavailable. */
export function startMusicBox(): MusicBoxPlayer | null {
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0.16;

  // A short feedback echo stands in for the ring of the box's wooden case.
  const echo = ctx.createDelay();
  echo.delayTime.value = 0.23;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.28;
  echo.connect(feedback).connect(echo);
  master.connect(ctx.destination);
  master.connect(echo);
  echo.connect(ctx.destination);

  /** A plucked steel tine: a bright attack and a long, falling ring. */
  function pluck(midi: number, at: number, velocity: number) {
    const f = frequency(midi);
    const ring = Math.max(0.7, 2.4 - (midi - 54) * 0.04);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(velocity, at + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, at + ring);
    env.connect(master);

    for (const [ratio, level] of [
      [1, 1],
      [4.2, 0.12],
      [2, 0.18],
    ]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f * ratio;
      const partial = ctx.createGain();
      partial.gain.value = level;
      osc.connect(partial).connect(env);
      osc.start(at);
      osc.stop(at + ring + 0.05);
    }
  }

  // Look-ahead scheduler: every 100ms, queue the notes due in the next 300ms.
  const startAt = ctx.currentTime + 0.1;
  let cursor = 0;
  let loopStart = startAt;
  function schedule() {
    const horizon = ctx.currentTime + 0.3;
    for (;;) {
      if (cursor === LOOP.notes.length) {
        cursor = 0;
        loopStart += LOOP.beats * BEAT;
      }
      const note = LOOP.notes[cursor];
      const at = loopStart + note.beat * BEAT;
      if (at > horizon) break;
      if (at >= ctx.currentTime) pluck(note.midi, at, note.velocity);
      cursor += 1;
    }
  }
  schedule();
  const timer = window.setInterval(schedule, 100);

  let muted = false;
  // Pausing the context also pauses its clock, so the tune resumes where it left off.
  function sync() {
    if (muted || document.hidden) void ctx.suspend();
    else void ctx.resume();
  }
  document.addEventListener("visibilitychange", sync);

  return {
    setMuted(next) {
      muted = next;
      sync();
    },
    stop() {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      void ctx.close();
    },
  };
}
