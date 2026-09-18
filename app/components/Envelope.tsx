"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import styles from "./Envelope.module.css";

/** Matches the end of the sequence in Envelope.module.css. */
const OPEN_DURATION_MS = 2600;

type Stage = "sealed" | "opening" | "open";

type EnvelopeProps = {
  backgroundSrc?: string;
  monogram: readonly [string, string];
  names: string;
  dateDisplay: string;
  children: ReactNode;
};

/** Covers the page with a sealed invitation until the guest opens it. */
export function Envelope({ backgroundSrc, monogram, names, dateDisplay, children }: EnvelopeProps) {
  const [stage, setStage] = useState<Stage>("sealed");

  function open() {
    if (stage !== "sealed") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("open");
      return;
    }
    setStage("opening");
    window.setTimeout(() => setStage("open"), OPEN_DURATION_MS);
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
      )}
    </>
  );
}
