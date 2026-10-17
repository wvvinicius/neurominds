"use client";

import { useEffect, useRef } from "react";
import type { EventType } from "@/lib/events";
import { track } from "@/lib/track";

/** Registra um evento anônimo ao montar. Uma vez só, mesmo com StrictMode. */
export function Track({ type, actionId }: { type: EventType; actionId?: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track(type, { actionId });
  }, [type, actionId]);
  return null;
}
