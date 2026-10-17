import { NextResponse } from "next/server";
import { EVENT_TYPES, insertEvent, type EventType } from "@/lib/events";

const short = (v: unknown, max = 64) =>
  typeof v === "string" && v.length > 0 && v.length <= max ? v : null;

/** Recebe eventos anônimos do navegador (NM-17). Sem autenticação, sem dados pessoais. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const type = body.type;
  const anon = short(body.anonSessionId);
  if (!anon || typeof type !== "string" || !(EVENT_TYPES as readonly string[]).includes(type)) {
    return new NextResponse(null, { status: 400 });
  }
  const durationMs =
    typeof body.durationMs === "number" && Number.isFinite(body.durationMs)
      ? Math.max(0, Math.min(Math.round(body.durationMs), 6 * 60 * 60 * 1000))
      : null;
  try {
    await insertEvent({
      anonSessionId: anon,
      type: type as EventType,
      actionId: short(body.actionId),
      videoId: short(body.videoId),
      durationMs,
    });
  } catch {
    /* métrica nunca derruba a experiência */
  }
  return new NextResponse(null, { status: 204 });
}
