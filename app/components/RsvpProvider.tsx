"use client";

import { createContext, use, useCallback, useRef, type ReactNode } from "react";
import type { GoogleFormConfig } from "../lib/rsvp";
import { RsvpDialog } from "./RsvpDialog";

const OpenRsvpContext = createContext<(() => void) | null>(null);

type RsvpProviderProps = { form: GoogleFormConfig; deadline: string; children: ReactNode };

/** Holds the page's one RSVP pop-up so any RsvpButton can open it. */
export function RsvpProvider({ form, deadline, children }: RsvpProviderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = useCallback(() => dialogRef.current?.showModal(), []);
  return (
    <OpenRsvpContext value={open}>
      {children}
      <RsvpDialog ref={dialogRef} form={form} deadline={deadline} />
    </OpenRsvpContext>
  );
}

export function useOpenRsvp() {
  const open = use(OpenRsvpContext);
  if (!open) throw new Error("useOpenRsvp must be used inside <RsvpProvider>");
  return open;
}
