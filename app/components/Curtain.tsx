"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Curtain.module.css";
import { FloralCorner } from "./Florals";
import { FlowerIcon } from "./icons";

/** Durations of the "opening" and "leaving" stages in Curtain.module.css. */
const OPENING_MS = 2000;
const LEAVING_MS = 700;

type Stage = "closed" | "opening" | "card" | "leaving" | "open";

type CurtainProps = {
  backgroundSrc?: string;
  /** Shown on the closed curtains, e.g. "G & R". */
  initials: string;
  dateDisplay: string;
  /** The full invitation revealed when the curtains open. */
  card: ReactNode;
  children: ReactNode;
};

const PILL =
  "cursor-pointer rounded-full bg-tan px-10 py-3.5 text-2xl font-medium text-ivory shadow-sm transition-colors hover:bg-tan-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tan-dark";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Covers the page with closed curtains until the guest opens them and reads the card. */
export function Curtain({ backgroundSrc, initials, dateDisplay, card, children }: CurtainProps) {
  const [stage, setStage] = useState<Stage>("closed");
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (stage === "card") enterRef.current?.focus();
  }, [stage]);

  function open() {
    if (stage !== "closed") return;
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
          aria-labelledby="curtain-title"
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

          {/* The invitation waits behind the curtains. */}
          <div className={styles.cardLayer}>
            <div className={styles.cardLift}>{card}</div>
            <button ref={enterRef} type="button" onClick={enter} className={`shrink-0 ${PILL}`}>
              View Details &amp; RSVP
            </button>
          </div>

          {/* Decorative: tapping the curtains is a shortcut for the button. */}
          <div className={styles.curtains} onClick={open} aria-hidden="true">
            <span className={`${styles.panel} ${styles.panelLeft}`} />
            <span className={`${styles.panel} ${styles.panelRight}`} />
            <span className={styles.valance} />
          </div>

          <FloralCorner idPrefix="curtain-tl" className={`${styles.floral} ${styles.floralTopLeft}`} />
          <FloralCorner idPrefix="curtain-tr" className={`${styles.floral} ${styles.floralTopRight}`} />
          <FloralCorner idPrefix="curtain-bl" className={`${styles.floral} ${styles.floralBottomLeft}`} />
          <FloralCorner idPrefix="curtain-br" className={`${styles.floral} ${styles.floralBottomRight}`} />

          <div className={styles.front}>
            <p id="curtain-title" className={styles.title}>
              You&rsquo;re Invited
            </p>
            <span className={styles.seal} aria-hidden="true">
              <FlowerIcon className={styles.sealFlower} />
            </span>
            <p className={styles.names}>{initials}</p>
            <p className={styles.date}>{dateDisplay}</p>
            <button
              type="button"
              onClick={open}
              autoFocus
              className={`${styles.openButton} ${PILL}`}
            >
              Open Invitation
            </button>
          </div>
        </div>
      )}
    </>
  );
}
