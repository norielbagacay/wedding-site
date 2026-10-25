/**
 * The background song (public/music.mp3), looped. It loads with the page so it can
 * start as soon as the play icon is tapped.
 */

export type Music = {
  /** Starts (or resumes) with a short fade-in. */
  play(): void;
  /** Actual song position; null if playback is muted, blocked, or unavailable. */
  getPlaybackTime(): number | null;
  setMuted(muted: boolean): void;
  stop(): void;
};

const VOLUME = 0.7;
const FADE_MS = 1200;

export function createMusic(src: string): Music {
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;

  let playbackFailed = false;
  let wanted = false;
  let muted = false;
  let fade = 0;

  /** Eases the volume to `target`; pauses once it reaches silence. */
  function fadeTo(target: number) {
    cancelAnimationFrame(fade);
    const from = audio.volume;
    const start = performance.now();
    fade = requestAnimationFrame(function step(now) {
      // A frame's timestamp can be a little earlier than `start`, so clamp both.
      const t = Math.min(1, Math.max(0, (now - start) / FADE_MS));
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * t));
      if (t < 1) fade = requestAnimationFrame(step);
      else if (target === 0) audio.pause();
    });
  }

  function sync() {
    if (wanted && !muted && !document.hidden) {
      playbackFailed = false;
      audio.play().catch(() => { playbackFailed = true; });
      fadeTo(VOLUME);
    } else {
      fadeTo(0);
    }
  }

  document.addEventListener("visibilitychange", sync);

  return {
    play() {
      wanted = true;
      sync();
    },
    getPlaybackTime() {
      return muted || playbackFailed || audio.error ? null : audio.currentTime;
    },
    setMuted(next) {
      muted = next;
      sync();
    },
    stop() {
      cancelAnimationFrame(fade);
      document.removeEventListener("visibilitychange", sync);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    },
  };
}
