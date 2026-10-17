/**
 * Banco: SQLite via libSQL.
 * - Dev: arquivo local em app/data/neurominds.db (ignorado pelo git).
 * - Produção: Turso (SQLite hospedado) via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
 * - Vercel sem Turso: arquivo em /tmp, efêmero. O app funciona com o seed,
 *   mas o que o admin gravar some a cada reinício. Ver wiki/04-stack-e-deploy.md.
 *
 * Migração e seed rodam na primeira consulta de cada processo.
 */
import { createClient, type Client, type InStatement } from "@libsql/client";
import { mkdirSync } from "node:fs";
import seed from "@/data/seed.json";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS action (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS video (
    id TEXT PRIMARY KEY,
    action_id TEXT NOT NULL,
    src TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_video_action ON video(action_id, sort_order)`,
  `CREATE TABLE IF NOT EXISTS event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anon_session_id TEXT NOT NULL,
    type TEXT NOT NULL,
    action_id TEXT,
    video_id TEXT,
    duration_ms INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_event_type ON event(type, action_id)`,
  `CREATE INDEX IF NOT EXISTS idx_event_created ON event(created_at)`,
];

let client: Client | null = null;
let ready: Promise<void> | null = null;

/** Turso configurado, ou arquivo local fora da Vercel: os dados persistem. */
export function isPersistent(): boolean {
  return !!process.env.TURSO_DATABASE_URL || !process.env.VERCEL;
}

function resolveUrl(): string {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  if (process.env.VERCEL) return "file:/tmp/neurominds.db";
  mkdirSync("data", { recursive: true });
  return "file:data/neurominds.db";
}

function raw(): Client {
  if (!client) {
    client = createClient({ url: resolveUrl(), authToken: process.env.TURSO_AUTH_TOKEN });
  }
  return client;
}

export async function getDb(): Promise<Client> {
  if (!ready) ready = migrate().catch((e) => { ready = null; throw e; });
  await ready;
  return raw();
}

async function migrate() {
  const c = raw();
  for (const sql of SCHEMA) await c.execute(sql);
  const r = await c.execute("SELECT COUNT(*) AS n FROM action");
  if (Number(r.rows[0].n) === 0) await seedFromJson(c);
}

async function seedFromJson(c: Client) {
  const stmts: InStatement[] = [];
  for (const a of seed.actions) {
    stmts.push({
      sql: "INSERT INTO action (id, slug, name, emoji, color, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [a.id, a.slug, a.name, a.emoji, a.color, a.sortOrder, a.isActive ? 1 : 0],
    });
    for (const v of a.videos) {
      stmts.push({
        sql: "INSERT INTO video (id, action_id, src, caption, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        args: [v.id, a.id, v.src, v.caption ?? null, v.sortOrder, v.isActive ? 1 : 0],
      });
    }
  }
  if (stmts.length) await c.batch(stmts, "write");
}
