/**
 * Leituras e gravações do gerenciador de conteúdo (NM-12, NM-13).
 * Só chamadas por server actions e páginas protegidas por isAdmin().
 */
import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import { ACTION_COLORS, rowToAction, rowToVideo, type Action, type ActionColor } from "./data";

export type ActionSummary = Action & { videoCount: number };

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "acao";
}

export function isColor(v: unknown): v is ActionColor {
  return typeof v === "string" && (ACTION_COLORS as string[]).includes(v);
}

/* ---------- profissionais ---------- */

export type ProfessionalSummary = { id: string; email: string; name: string | null; createdAt: string; studentCount: number };

export async function listProfessionals(): Promise<ProfessionalSummary[]> {
  const db = await getDb();
  const r = await db.execute(
    `SELECT p.*, (SELECT COUNT(*) FROM student s WHERE s.professional_id = p.id) AS student_count
     FROM professional p ORDER BY p.created_at DESC`,
  );
  return r.rows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    createdAt: String(row.created_at),
    studentCount: Number(row.student_count),
  }));
}

/* ---------- ações ---------- */

export async function listActionsAdmin(): Promise<ActionSummary[]> {
  const db = await getDb();
  const r = await db.execute(
    `SELECT a.*, (SELECT COUNT(*) FROM video v WHERE v.action_id = a.id) AS video_count
     FROM action a ORDER BY a.sort_order, a.name`,
  );
  return r.rows.map((row) => ({ ...rowToAction(row), videoCount: Number(row.video_count) }));
}

export async function getActionAdmin(id: string): Promise<Action | null> {
  const db = await getDb();
  const a = await db.execute({ sql: "SELECT * FROM action WHERE id = ?", args: [id] });
  if (!a.rows.length) return null;
  const v = await db.execute({
    sql: "SELECT * FROM video WHERE action_id = ? ORDER BY sort_order, created_at",
    args: [id],
  });
  return rowToAction(a.rows[0], v.rows.map(rowToVideo));
}

export async function createAction(input: { name: string; emoji: string; color: ActionColor }) {
  const db = await getDb();
  const base = slugify(input.name);
  let slug = base;
  for (let i = 2; ; i++) {
    const r = await db.execute({ sql: "SELECT 1 FROM action WHERE slug = ?", args: [slug] });
    if (!r.rows.length) break;
    slug = `${base}-${i}`;
  }
  const max = await db.execute("SELECT COALESCE(MAX(sort_order), 0) AS m FROM action");
  const id = randomUUID();
  await db.execute({
    sql: "INSERT INTO action (id, slug, name, emoji, color, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
    args: [id, slug, input.name, input.emoji, input.color, Number(max.rows[0].m) + 1],
  });
  return id;
}

export async function updateAction(id: string, input: { name: string; emoji: string; color: ActionColor }) {
  const db = await getDb();
  await db.execute({
    sql: "UPDATE action SET name = ?, emoji = ?, color = ? WHERE id = ?",
    args: [input.name, input.emoji, input.color, id],
  });
}

export async function setActionActive(id: string, active: boolean) {
  const db = await getDb();
  await db.execute({ sql: "UPDATE action SET is_active = ? WHERE id = ?", args: [active ? 1 : 0, id] });
}

export async function deleteAction(id: string) {
  const db = await getDb();
  await db.batch(
    [
      { sql: "DELETE FROM video WHERE action_id = ?", args: [id] },
      { sql: "DELETE FROM action WHERE id = ?", args: [id] },
    ],
    "write",
  );
}

/** Move uma posição para cima ou para baixo, renumerando a lista toda. */
export async function moveAction(id: string, dir: "up" | "down") {
  const db = await getDb();
  const r = await db.execute("SELECT id FROM action ORDER BY sort_order, name");
  await reorder(r.rows.map((x) => String(x.id)), id, dir, "action");
}

/* ---------- vídeos ---------- */

export async function addVideo(actionId: string, src: string, caption: string | null) {
  const db = await getDb();
  const max = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order), 0) AS m FROM video WHERE action_id = ?",
    args: [actionId],
  });
  const id = randomUUID();
  await db.execute({
    sql: "INSERT INTO video (id, action_id, src, caption, sort_order, is_active) VALUES (?, ?, ?, ?, ?, 1)",
    args: [id, actionId, src, caption, Number(max.rows[0].m) + 1],
  });
  return id;
}

export async function updateVideoCaption(id: string, caption: string | null) {
  const db = await getDb();
  await db.execute({ sql: "UPDATE video SET caption = ? WHERE id = ?", args: [caption, id] });
}

export async function setVideoActive(id: string, active: boolean) {
  const db = await getDb();
  await db.execute({ sql: "UPDATE video SET is_active = ? WHERE id = ?", args: [active ? 1 : 0, id] });
}

export async function deleteVideo(id: string): Promise<string | null> {
  const db = await getDb();
  const r = await db.execute({ sql: "SELECT src FROM video WHERE id = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM video WHERE id = ?", args: [id] });
  return r.rows.length ? String(r.rows[0].src) : null;
}

export async function moveVideo(id: string, dir: "up" | "down") {
  const db = await getDb();
  const owner = await db.execute({ sql: "SELECT action_id FROM video WHERE id = ?", args: [id] });
  if (!owner.rows.length) return;
  const r = await db.execute({
    sql: "SELECT id FROM video WHERE action_id = ? ORDER BY sort_order, created_at",
    args: [owner.rows[0].action_id],
  });
  await reorder(r.rows.map((x) => String(x.id)), id, dir, "video");
}

async function reorder(ids: string[], id: string, dir: "up" | "down", table: "action" | "video") {
  const i = ids.indexOf(id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const db = await getDb();
  await db.batch(
    ids.map((x, k) => ({ sql: `UPDATE ${table} SET sort_order = ? WHERE id = ?`, args: [k + 1, x] })),
    "write",
  );
}
