"use client";

/**
 * Disparo de eventos anônimos pelo navegador (NM-17) e vínculo com a sessão
 * de prancha quando a criança está em /p/<token> (NM-25).
 * Id anônimo aleatório, guardado no aparelho, renovado a cada 24 h.
 * Nunca envia nome, e-mail ou qualquer identificador de pessoa.
 */
import type { EventType } from "./events";

const KEY = "nm-anon";
const DAY = 24 * 60 * 60 * 1000;
const SESSION_FRESH = 30 * 60 * 1000;

type Data = { actionId?: string; videoId?: string; durationMs?: number; sessionId?: string };

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

const inBoard = () => typeof window !== "undefined" && window.location.pathname.startsWith("/p/");

/* Sessão de prancha: definida por <BoardSession/>; eventos esperam por ela. */
let sessionId: string | null = null;
const pending: { type: EventType; data: Data }[] = [];

function send(type: EventType, data: Data) {
  const body = JSON.stringify({ type, anonSessionId: anonId(), ...data });
  try {
    if (navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) return;
  } catch {
    /* cai para fetch */
  }
  fetch("/api/events", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
}

export function track(type: EventType, data: Data = {}) {
  if (typeof window === "undefined") return;
  if (!inBoard()) return send(type, data);
  if (!sessionId) {
    pending.push({ type, data });
    return;
  }
  send(type, { ...data, sessionId });
}

let inflight: Promise<void> | null = null;

/** Garante uma sessão para esta aba (reaproveita por 30 min). Chamado pelo <BoardSession/>. */
export function ensureSession(token: string): Promise<void> {
  // Chamadas simultâneas (StrictMode em dev, duas montagens) compartilham a mesma criação.
  if (!inflight) inflight = createOrReuse(token).finally(() => (inflight = null));
  return inflight;
}

async function createOrReuse(token: string): Promise<void> {
  if (sessionId) return;
  const key = `nm-session:${token}`;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const { id, t } = JSON.parse(raw) as { id: string; t: number };
      if (Date.now() - t < SESSION_FRESH) return setSession(id, key);
    }
  } catch {
    /* sem storage: cria sempre */
  }
  try {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return;
    const { id } = (await res.json()) as { id: string };
    setSession(id, key);
  } catch {
    /* sem sessão: eventos ficam na fila e se perdem ao sair; não trava a criança */
  }
}

function setSession(id: string, key: string) {
  sessionId = id;
  try {
    sessionStorage.setItem(key, JSON.stringify({ id, t: Date.now() }));
  } catch {
    /* ok */
  }
  while (pending.length) {
    const e = pending.shift()!;
    send(e.type, { ...e.data, sessionId: id });
  }
}
