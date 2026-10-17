"use client";

/**
 * Disparo de eventos anônimos pelo navegador (NM-17).
 * Id de sessão aleatório, guardado no aparelho, renovado a cada 24 h.
 * Nunca envia nome, e-mail ou qualquer identificador de pessoa.
 */
import type { EventType } from "./events";

const KEY = "nm-anon";
const DAY = 24 * 60 * 60 * 1000;

function anonId(): string {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const { id, t } = JSON.parse(raw) as { id: string; t: number };
      if (Date.now() - t < DAY) return id;
    }
    const id = crypto.randomUUID();
    localStorage.setItem(KEY, JSON.stringify({ id, t: Date.now() }));
    return id;
  } catch {
    return "anon";
  }
}

export function track(type: EventType, data: { actionId?: string; videoId?: string; durationMs?: number } = {}) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ type, anonSessionId: anonId(), ...data });
  try {
    if (navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) return;
  } catch {
    /* cai para fetch */
  }
  fetch("/api/events", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
  }).catch(() => {});
}
