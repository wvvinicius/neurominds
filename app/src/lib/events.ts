/**
 * Eventos anônimos (NM-17) e painel de uso (NM-15).
 * Nunca há identificação de pessoa: só um id aleatório de sessão,
 * gerado no navegador e renovado a cada 24 h. Ver wiki/07-dados-e-lgpd.md.
 */
import { getDb } from "./db";

export const EVENT_TYPES = ["open_home", "open_action", "play_video", "finish_video"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type EventInput = {
  anonSessionId: string;
  type: EventType;
  actionId?: string | null;
  videoId?: string | null;
  durationMs?: number | null;
  /** Sessão de prancha (NM-25). Nulo no uso público. */
  sessionId?: string | null;
};

export async function insertEvent(e: EventInput) {
  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO event (anon_session_id, type, action_id, video_id, duration_ms, session_id) VALUES (?, ?, ?, ?, ?, ?)",
    args: [e.anonSessionId, e.type, e.actionId ?? null, e.videoId ?? null, e.durationMs ?? null, e.sessionId ?? null],
  });
  // Última atividade da sessão: o fim é o último evento.
  if (e.sessionId) {
    await db.execute({ sql: "UPDATE session SET ended_at = datetime('now') WHERE id = ?", args: [e.sessionId] });
  }
}

export type UsageStats = {
  sessions: number;
  events: number;
  finishes: number;
  last7d: number;
  perAction: { id: string; name: string; emoji: string; opens: number; plays: number; finishes: number }[];
  perVideo: { id: string; caption: string; actionName: string; actionEmoji: string; plays: number; finishes: number; avgMs: number | null }[];
};

export async function getUsageStats(): Promise<UsageStats> {
  const db = await getDb();
  const [totals, perAction, perVideo] = await Promise.all([
    db.execute(`SELECT
        COUNT(DISTINCT anon_session_id) AS sessions,
        COUNT(*) AS events,
        SUM(type = 'finish_video') AS finishes,
        SUM(created_at >= datetime('now', '-7 days')) AS last7d
      FROM event`),
    db.execute(`SELECT a.id, a.name, a.emoji,
        SUM(e.type = 'open_action') AS opens,
        SUM(e.type = 'play_video') AS plays,
        SUM(e.type = 'finish_video') AS finishes
      FROM action a LEFT JOIN event e ON e.action_id = a.id
      GROUP BY a.id ORDER BY opens DESC, a.sort_order`),
    db.execute(`SELECT v.id, COALESCE(v.caption, v.src) AS caption, a.name AS action_name, a.emoji AS action_emoji,
        SUM(e.type = 'play_video') AS plays,
        SUM(e.type = 'finish_video') AS finishes,
        AVG(CASE WHEN e.type = 'finish_video' THEN e.duration_ms END) AS avg_ms
      FROM video v JOIN action a ON a.id = v.action_id LEFT JOIN event e ON e.video_id = v.id
      GROUP BY v.id ORDER BY finishes DESC, plays DESC LIMIT 30`),
  ]);
  const t = totals.rows[0];
  return {
    sessions: Number(t.sessions ?? 0),
    events: Number(t.events ?? 0),
    finishes: Number(t.finishes ?? 0),
    last7d: Number(t.last7d ?? 0),
    perAction: perAction.rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      emoji: String(r.emoji),
      opens: Number(r.opens ?? 0),
      plays: Number(r.plays ?? 0),
      finishes: Number(r.finishes ?? 0),
    })),
    perVideo: perVideo.rows.map((r) => ({
      id: String(r.id),
      caption: String(r.caption),
      actionName: String(r.action_name),
      actionEmoji: String(r.action_emoji),
      plays: Number(r.plays ?? 0),
      finishes: Number(r.finishes ?? 0),
      avgMs: r.avg_ms == null ? null : Number(r.avg_ms),
    })),
  };
}
