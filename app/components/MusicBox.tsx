"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createMusic, type Music } from "../lib/music";
import { MusicIcon, MusicOffIcon } from "./icons";
import styles from "./MusicBox.module.css";
import body from "../../public/box/body.webp";
import couple from "../../public/box/couple.webp";
import lidClosed from "../../public/box/lid-closed.webp";
import lidOpen from "../../public/box/lid-open.webp";
import play from "../../public/box/play.webp";
import hero from "../../public/box/hero.png";
import room from "../../public/box/room.png";

/** The lid swings for this long, after a short press of the play button. */
const LID_DELAY_MS = 200;

/** The song that plays, looped, once the box is opened. */
const MUSIC_SRC = "/music.mp3";
const LID_MS = 2600;
/** …then it eases back a few degrees against its hinge stay and comes to rest. */
const SETTLE_MS = 700;
const SETTLE_DEG = 3;

/** How soft the edge is where the couple is uncovered, in % of their window. */
const FEATHER = 5;

/** Keep moving toward the couple from 0:03 until the hero transition. */
const COUPLE_ZOOM_START_SECONDS = 3;
const COUPLE_ZOOM_SCALE = 2.2;

/** Begin the hero transition at 0:06 in the song. */
const HERO_CUE_SECONDS = 6;
/** Continue without music if playback is blocked, muted, or unavailable. */
const HOLD_MS = 3000;
/** Fade to white immediately at the cue, then reveal the hero. */
const ZOOM_MS = 1000;

/** In the music box's pixels (MusicBox.module.css): the hinge line, how far the closed
    lid reaches in front of it, and the couple's window. */
const HINGE_Y = 448;
const LID_FRONT = 177;
const WELL_TOP = 60;
const WELL_HEIGHT = 540;

type Stage = "closed" | "opening" | "open" | "zoom" | "done";

/** Gentle at both ends, like a lid lifted by hand. */
function easeInOutSine(t: number) {
  return (1 - Math.cos(Math.PI * t)) / 2;
}

/** 0 → 1 as `value` goes from `from` to `to`. */
function ramp(value: number, from: number, to: number) {
  return Math.min(1, Math.max(0, (value - from) / (to - from)));
}

/** [x, y] and size in the music box's pixels (1774 × 887), delay s */
const SPARKLES: [number, number, number, number][] = [
  [1120, 300, 26, 0],
  [1580, 280, 20, 0.8],
  [1190, 470, 18, 1.5],
  [1530, 500, 24, 0.4],
  [1260, 200, 16, 2.1],
  [1460, 160, 20, 1.1],
  [1050, 560, 22, 1.8],
  [1650, 540, 20, 0.2],
  [1600, 400, 16, 1.3],
  [1110, 410, 18, 2.8],
  [1300, 90, 20, 0.6],
  [1420, 60, 17, 2.4],
];

type MusicBoxProps = {
  names: string;
  /** The wedding month, written on the hero beside its painted day and year. */
  heroMonth: string;
  /** The wedding details, unlocked for scrolling once the box has played. */
  children: ReactNode;
};

/** The front page: a music box that opens, like a real one, when tapped. */
export function MusicBox({ names, heroMonth, children }: MusicBoxProps) {
  const [stage, setStage] = useState<Stage>("closed");
  const [muted, setMuted] = useState(false);
  const music = useRef<Music | null>(null);
  const musicRef = useRef<HTMLButtonElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const outsideRef = useRef<HTMLDivElement>(null);
  const insideRef = useRef<HTMLDivElement>(null);
  const wellRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Always greet guests with the closed box, even after a reload halfway down the page.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const song = createMusic(MUSIC_SRC);
    music.current = song;
    return () => song.stop();
  }, []);

  // Follow the audio clock so buffering does not move the lyric cue.
  useEffect(() => {
    if (stage === "zoom") {
      const timer = window.setTimeout(() => setStage("done"), ZOOM_MS);
      return () => window.clearTimeout(timer);
    }
    if (stage !== "open") return;
    const started = performance.now();
    let frame = requestAnimationFrame(function checkCue(now) {
      const position = music.current?.getPlaybackTime() ?? null;
      if (
        (position !== null && position >= HERO_CUE_SECONDS) ||
        (position === null && now - started >= HOLD_MS)
      ) {
        setStage("zoom");
        return;
      }
      frame = requestAnimationFrame(checkCue);
    });
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  // Keep the camera zooming with the song until the hero transition begins.
  useEffect(() => {
    if (stage !== "opening" && stage !== "open") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scene = sceneRef.current;
    if (!scene) return;
    let frame = requestAnimationFrame(function zoomToCouple() {
      const position = music.current?.getPlaybackTime() ?? null;
      if (position !== null) {
        const progress = easeInOutSine(ramp(position, COUPLE_ZOOM_START_SECONDS, HERO_CUE_SECONDS));
        // The couple stands around 72% down the room; bring them toward the center.
        scene.style.transform = `translateY(${-22 * progress}%) scale(${1 + (COUPLE_ZOOM_SCALE - 1) * progress})`;
      }
      frame = requestAnimationFrame(zoomToCouple);
    });
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  // Swing the lid frame by frame, uncovering the couple exactly as far as its edge has risen.
  useEffect(() => {
    if (stage !== "opening") return;
    const lid = lidRef.current!;
    const outside = outsideRef.current!;
    const inside = insideRef.current!;
    const faces = [outside, inside];
    const well = wellRef.current!;
    const start = performance.now() + LID_DELAY_MS;
    let frame = requestAnimationFrame(function step(now) {
      const elapsed = Math.max(0, now - start);
      const settle = Math.min(1, Math.max(0, (elapsed - LID_MS) / SETTLE_MS));
      const angle =
        elapsed < LID_MS
          ? 180 * easeInOutSine(elapsed / LID_MS)
          : 180 - SETTLE_DEG * Math.sin(Math.PI * settle) * (1 - settle);
      const cos = Math.cos((angle * Math.PI) / 180);
      // Until it is upright the lid is in front of the couple, uncovering them as its edge
      // rises; once it is behind them, the rest of the couple comes into view.
      const edge =
        cos >= 0
          ? HINGE_Y + (LID_FRONT + 12) * cos
          : HINGE_Y - (HINGE_Y - WELL_TOP + 40) * easeInOutSine(ramp(angle, 90, 130));
      const hidden = ((edge - WELL_TOP) / WELL_HEIGHT) * 100;
      lid.style.transform = `rotateX(${angle}deg)`;
      const mask = `linear-gradient(to bottom, #0000 ${hidden - FEATHER}%, #000 ${hidden + FEATHER}%)`;
      well.style.maskImage = mask;
      well.style.webkitMaskImage = mask;
      // Faces darken as they turn edge-on to the light, and cross-fade around upright.
      for (const face of faces)
        face.style.filter = `brightness(${1 - 0.3 * Math.sqrt(1 - cos * cos)})`;
      outside.style.opacity = String(1 - ramp(angle, 84, 92));
      inside.style.opacity = String(ramp(angle, 89, 100));
      // Light glances across the mirror as it tilts up toward the viewer.
      inside.style.setProperty("--sweep", String(1 - ramp(angle, 110, 178)));
      if (settle < 1) {
        frame = requestAnimationFrame(step);
      } else {
        // Leave everything exactly where the last frame put it: clearing these styles here
        // would show the closed lid for a frame before the "open" styles apply (a blink).
        lid.style.transform = "rotateX(180deg)";
        well.style.maskImage = "none";
        well.style.webkitMaskImage = "none";
        for (const face of faces) face.style.filter = "none";
        setStage("open");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  // The tapped box is no longer a button; keep keyboard focus on the page.
  useEffect(() => {
    if (stage !== "closed" && document.activeElement === document.body) {
      musicRef.current?.focus({ preventScroll: true });
    }
  }, [stage]);

  function openBox() {
    if (stage !== "closed") return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    music.current?.play();
    setStage(still ? "done" : "opening");
  }

  function toggleMusic() {
    music.current?.setMuted(!muted);
    setMuted(!muted);
  }

  return (
    <>
      <div
        className={styles.front}
        data-stage={stage}
        style={{ "--room": `url("${room.src}")`, "--hero": `url("${hero.src}")` } as CSSProperties}
      >
        <div className={styles.backdrop} aria-hidden="true" />

        <div ref={sceneRef} className={styles.scene}>
          <Image src={room} alt="" unoptimized preload placeholder="blur" className={styles.room} />

          <h1 className={styles.title}>
            {names}
          </h1>

          <div className={styles.box} aria-hidden="true">
            <span className={styles.shadow} />
            <Image src={body} alt="" unoptimized preload className={styles.body} />

            {/* Hinged at the back edge: the outside shows while it lifts, then the lining. */}
            <div ref={lidRef} className={styles.lid}>
              <div ref={outsideRef} className={`${styles.face} ${styles.lidOutside}`}>
                <Image src={lidClosed} alt="" unoptimized preload />
              </div>
              <div ref={insideRef} className={`${styles.face} ${styles.lidInside}`}>
                <Image src={lidOpen} alt="" unoptimized loading="eager" />
                {/* A mirror in the oval frame, reflecting the room and the dancing couple. */}
                <span className={styles.mirror}>
                  <span className={styles.mirrorRoom} />
                  <span className={styles.reflection}>
                    <Image src={couple} alt="" unoptimized loading="eager" />
                  </span>
                  <span className={styles.sheen} />
                </span>
              </div>
            </div>

            <span className={styles.light} />
            <div ref={wellRef} className={styles.coupleWell}>
              <div className={styles.couple}>
                <Image src={couple} alt="" unoptimized loading="eager" />
              </div>
            </div>
            <span className={`${styles.ring} ${styles.ringLow}`} />
            <span className={`${styles.ring} ${styles.ringHigh}`} />
            <div className={styles.sparkles}>
              {SPARKLES.map(([x, y, size, delay], i) => (
                <span
                  key={i}
                  style={{
                    left: `${x / 17.74}%`,
                    top: `${y / 8.87}%`,
                    width: `${size / 17.74}%`,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
            <span className={styles.play}>
              <Image src={play} alt="" unoptimized preload />
            </span>
          </div>

          {stage === "closed" && (
            <button
              type="button"
              onClick={openBox}
              className={styles.hotspot}
              aria-label="Tap to open the music box"
            />
          )}
        </div>

        {/* After the box: the portrait invitation and a link to the details. */}
        <div className={styles.hero} inert={stage !== "done"}>
          <div className={styles.heroBackdrop} aria-hidden="true" />
          <div className={styles.heroStage}>
            <Image src={hero} alt="" unoptimized loading="eager" className={styles.heroImage} />
            <span className={styles.heroMonth} aria-hidden="true">
              {heroMonth}
            </span>
          <a href="#details" className={styles.heroScroll}>
            <span>Scroll down</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          </div>
        </div>

        <div className={styles.whiteout} aria-hidden="true" />
      </div>

      {stage !== "closed" && (
        <button
          ref={musicRef}
          type="button"
          onClick={toggleMusic}
          className={styles.music}
          aria-label={muted ? "Play music" : "Pause music"}
        >
          {muted ? (
            <MusicOffIcon className={styles.musicIcon} />
          ) : (
            <MusicIcon className={styles.musicIcon} />
          )}
        </button>
      )}

      <div inert={stage !== "done"}>{children}</div>
    </>
  );
}
