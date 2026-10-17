/**
 * Única porta de leitura pública de ações e vídeos (FR-010 da spec 001).
 * Lê do banco (ver db.ts). O admin grava pelas funções em admin.ts.
 */
import type { Row } from "@libsql/client";
import { getDb } from "./db";
import type { Action, ActionColor, Video } from "./types";

export type { Action, ActionColor, Video } from "./types";
export { ACTION_COLORS } from "./types";

export function rowToVideo(r: Row): Video {
  return {
    id: String(r.id),
    src: String(r.src),
    caption: r.caption ? String(r.caption) : undefined,
    sortOrder: Number(r.sort_order),
    isActive: Number(r.is_active) === 1,
  };
}

export function rowToAction(r: Row, videos: Video[] = []): Action {
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    emoji: String(r.emoji),
    color: r.color as ActionColor,
    sortOrder: Number(r.sort_order),
    isActive: Number(r.is_active) === 1,
    videos,
  };
}

/** Ações ativas, com seus vídeos ativos, em ordem. */
export async function getActions(): Promise<Action[]> {
  const db = await getDb();
  const [a, v] = await Promise.all([
    db.execute("SELECT * FROM action WHERE is_active = 1 ORDER BY sort_order, name"),
    db.execute("SELECT * FROM video WHERE is_active = 1 ORDER BY sort_order, created_at"),
  ]);
  const byAction = new Map<string, Video[]>();
  for (const r of v.rows) {
    const key = String(r.action_id);
    if (!byAction.has(key)) byAction.set(key, []);
    byAction.get(key)!.push(rowToVideo(r));
  }
  return a.rows.map((r) => rowToAction(r, byAction.get(String(r.id)) ?? []));
}

export async function getActionBySlug(slug: string): Promise<Action | null> {
  const db = await getDb();
  const a = await db.execute({ sql: "SELECT * FROM action WHERE slug = ? AND is_active = 1", args: [slug] });
  if (!a.rows.length) return null;
  const v = await db.execute({
    sql: "SELECT * FROM video WHERE action_id = ? AND is_active = 1 ORDER BY sort_order, created_at",
    args: [a.rows[0].id],
  });
  return rowToAction(a.rows[0], v.rows.map(rowToVideo));
}
