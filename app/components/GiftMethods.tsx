"use client";

import Image from "next/image";
import { useState } from "react";
import type { GiftMethod } from "../content";
import { GiftIcon } from "./icons";

/** Ivory cards with each account's details and a button that copies the number. */
export function GiftMethods({ methods }: { methods: GiftMethod[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(method: GiftMethod) {
    try {
      // Without spaces, so it pastes cleanly into banking apps.
      await navigator.clipboard.writeText(method.accountNumber.replace(/\s+/g, ""));
      setCopied(method.name);
      window.setTimeout(() => setCopied((name) => (name === method.name ? null : name)), 2000);
    } catch {
      // Clipboard access can be blocked; the number is still there to copy by hand.
    }
  }

  return (
    <ul className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
      {methods.map((method) => (
        <li
          key={method.name}
          className="rounded-3xl border border-gold/40 bg-ivory/80 px-6 py-8 shadow-[0_16px_32px_-20px_rgb(80_60_40/0.4)]"
        >
          <GiftIcon className="mx-auto size-8 text-gold" />
          <h3 className="mt-3 text-sm tracking-[0.3em] text-gold-dark uppercase">{method.name}</h3>
          {method.qr && (
            <Image
              src={method.qr}
              alt={`${method.name} QR code`}
              width={176}
              height={176}
              className="mx-auto mt-4 size-44 rounded-xl border border-gold/30 bg-white p-2"
            />
          )}
          <p className="mt-4 text-xl">{method.accountName}</p>
          <p className="mt-1 text-2xl tracking-[0.12em] tabular-nums">{method.accountNumber}</p>
          <button
            type="button"
            onClick={() => copy(method)}
            className="mt-5 cursor-pointer rounded-full border border-gold/60 px-6 py-2 text-sm tracking-[0.25em] text-gold-dark uppercase transition-colors hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-dark"
          >
            <span aria-live="polite">{copied === method.name ? "Copied!" : "Copy number"}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
