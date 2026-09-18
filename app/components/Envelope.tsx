"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Envelope.module.css";
import { Florals } from "./Florals";

/** Durations of the "opening" and "leaving" stages in Envelope.module.css. */
const OPENING_MS = 1700;
const LEAVING_MS = 700;

type Stage = "sealed" | "opening" | "card" | "leaving" | "open";

type EnvelopeProps = {
  backgroundSrc?: string;
  monogram: readonly [string, string];
  names: string;
  dateDisplay: string;
  /** The full invitation shown once the envelope is open. */
  card: ReactNode;
  children: ReactNode;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Covers the page with a sealed invitation until the guest opens it and reads the card. */
export function Envelope({ backgroundSrc, monogram, names, dateDisplay, card, children }: EnvelopeProps) {
  const [stage, setStage] = useState<Stage>("sealed");
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (stage === "card") enterRef.current?.focus();
  }, [stage]);

  function open() {
    if (stage !== "sealed") return;
    if (prefersReducedMotion()) {
      setStage("card");
      return;
    }
    setStage("opening");
    window.setTimeout(() => setStage("card"), OPENING_MS);
  }

  function enter() {
    if (stage !== "card") return;
    if (prefersReducedMotion()) {
      setStage("open");
      return;
    }
    setStage("leaving");
    window.setTimeout(() => setStage("open"), LEAVING_MS);
  }

  return (
    <>
      <div inert={stage !== "open"}>{children}</div>
      {stage !== "open" && (
        <div
          className={styles.overlay}
          data-stage={stage}
          role="dialog"
          aria-modal="true"
          aria-labelledby="envelope-title"
        >
          {backgroundSrc && (
            <Image
              src={backgroundSrc}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              className={styles.backdropImage}
            />
          )}

          <div className={styles.sealedLayer}>
            <p id="envelope-title" className={`${styles.title} ${styles.fadeEarly}`}>
              You&rsquo;re Invited
            </p>

            {/* Decorative: tapping the envelope is a shortcut for the button below. */}
            <div className={styles.envelope} onClick={open} aria-hidden="true">
              <span className={styles.back} />
              <span className={styles.card}>
                <span className={styles.cardNames}>{names}</span>
                <span className={styles.cardDate}>{dateDisplay}</span>
              </span>
              <span className={styles.pocket} />
              <span className={styles.pocketBottom} />
              <span className={styles.flap} />
              <span className={styles.seal}>
                {monogram[0]}
                {monogram[1]}
              </span>
              <Florals idPrefix="env-tl" className={`${styles.floral} ${styles.floralTopLeft}`} />
              <Florals idPrefix="env-tr" className={`${styles.floral} ${styles.floralTopRight}`} />
              <Florals idPrefix="env-bl" className={`${styles.floral} ${styles.floralBottomLeft}`} />
              <Florals idPrefix="env-br" className={`${styles.floral} ${styles.floralBottomRight}`} />
            </div>

            <button
              type="button"
              onClick={open}
              autoFocus
              className={`${styles.fadeEarly} cursor-pointer rounded-full bg-tan px-10 py-3.5 text-2xl font-medium text-ivory shadow-sm transition-colors hover:bg-tan-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tan-dark`}
            >
              Open Invitation
            </button>
          </div>

          <div className={styles.cardLayer}>
            <div className={styles.cardLift}>{card}</div>
            <button
              ref={enterRef}
              type="button"
              onClick={enter}
              className="shrink-0 cursor-pointer rounded-full bg-tan px-10 py-3.5 text-2xl font-medium text-ivory shadow-sm transition-colors hover:bg-tan-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tan-dark"
            >
              View Details &amp; RSVP
            </button>
          </div>
        </div>
      )}
    </>
  );
}
