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

  /* ---- Fase 2 (spec 003): profissional, aluno, prancha, sessão ---- */
  `CREATE TABLE IF NOT EXISTS professional (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS login_token (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    expires_at TEXT NOT NULL,
    used_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS student (
    id TEXT PRIMARY KEY,
    professional_id TEXT NOT NULL,
    nickname TEXT NOT NULL,
    guardian_email TEXT,
    access_token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_student_pro ON student(professional_id)`,
  `CREATE TABLE IF NOT EXISTS student_action (
    student_id TEXT NOT NULL,
    action_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (student_id, action_id)
  )`,
  `CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    in_person INTEGER NOT NULL DEFAULT 0,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    ended_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_session_student ON session(student_id, started_at)`,
];

/** Colunas acrescentadas depois da criação original. `ALTER TABLE` não tem IF NOT EXISTS. */
const ADDED_COLUMNS: { table: string; column: string; ddl: string }[] = [
  { table: "event", column: "session_id", ddl: "ALTER TABLE event ADD COLUMN session_id TEXT" },
  { table: "session", column: "note", ddl: "ALTER TABLE session ADD COLUMN note TEXT" },
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
  for (const col of ADDED_COLUMNS) {
    const info = await c.execute(`PRAGMA table_info(${col.table})`);
    if (!info.rows.some((r) => r.name === col.column)) await c.execute(col.ddl);
  }
  await c.execute("CREATE INDEX IF NOT EXISTS idx_event_session ON event(session_id)");
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
