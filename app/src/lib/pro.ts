/**
 * Dados da área do profissional (NM-20, NM-21, NM-23, NM-25, NM-26, NM-27, NM-18).
 * Segurança por linha (NM-28) feita na aplicação: toda consulta de aluno leva
 * o id do profissional logado. Nunca consultar aluno sem esse filtro.
 */
import { randomBytes, randomUUID } from "node:crypto";
import type { Row } from "@libsql/client";
import { getDb } from "./db";
import { rowToAction, rowToVideo } from "./data";
import type { Action } from "./types";

export type Student = {
  id: string;
  professionalId: string;
  nickname: string;
  guardianEmail: string | null;
  accessToken: string;
  createdAt: string;
};

export type StudentSummary = Student & { actionCount: number; sessionCount: number; lastSessionAt: string | null };

const newToken = () => randomBytes(24).toString("base64url");

function rowToStudent(r: Row): Student {
  return {
    id: String(r.id),
    professionalId: String(r.professional_id),
    nickname: String(r.nickname),
    guardianEmail: r.guardian_email ? String(r.guardian_email) : null,
    accessToken: String(r.access_token),
    createdAt: String(r.created_at),
  };
}

/* ---------- alunos ---------- */

export async function listStudents(proId: string): Promise<StudentSummary[]> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT s.*,
        (SELECT COUNT(*) FROM student_action sa WHERE sa.student_id = s.id) AS action_count,
        (SELECT COUNT(*) FROM session x WHERE x.student_id = s.id) AS session_count,
        (SELECT MAX(started_at) FROM session x WHERE x.student_id = s.id) AS last_session_at
      FROM student s WHERE s.professional_id = ? ORDER BY s.nickname`,
    args: [proId],
  });
  return r.rows.map((row) => ({
    ...rowToStudent(row),
    actionCount: Number(row.action_count),
    sessionCount: Number(row.session_count),
    lastSessionAt: row.last_session_at ? String(row.last_session_at) : null,
  }));
}

export async function getStudent(proId: string, id: string): Promise<(Student & { actionIds: string[] }) | null> {
  const db = await getDb();
  const r = await db.execute({ sql: "SELECT * FROM student WHERE id = ? AND professional_id = ?", args: [id, proId] });
  if (!r.rows.length) return null;
  const a = await db.execute({ sql: "SELECT action_id FROM student_action WHERE student_id = ? ORDER BY sort_order", args: [id] });
  return { ...rowToStudent(r.rows[0]), actionIds: a.rows.map((x) => String(x.action_id)) };
}

export async function createStudent(proId: string, nickname: string, guardianEmail: string | null): Promise<string> {
  const db = await getDb();
  const id = randomUUID();
  await db.execute({
    sql: "INSERT INTO student (id, professional_id, nickname, guardian_email, access_token) VALUES (?, ?, ?, ?, ?)",
    args: [id, proId, nickname, guardianEmail, newToken()],
  });
  return id;
}

export async function updateStudent(proId: string, id: string, nickname: string, guardianEmail: string | null) {
  const db = await getDb();
  await db.execute({
    sql: "UPDATE student SET nickname = ?, guardian_email = ? WHERE id = ? AND professional_id = ?",
    args: [nickname, guardianEmail, id, proId],
  });
}

export async function regenerateToken(proId: string, id: string) {
  const db = await getDb();
  await db.execute({
    sql: "UPDATE student SET access_token = ? WHERE id = ? AND professional_id = ?",
    args: [newToken(), id, proId],
  });
}

/** Apaga aluno, prancha, sessões e eventos das sessões (NM-27). */
export async function deleteStudent(proId: string, id: string) {
  const db = await getDb();
  const own = await db.execute({ sql: "SELECT 1 FROM student WHERE id = ? AND professional_id = ?", args: [id, proId] });
  if (!own.rows.length) return;
  await db.batch(
    [
      { sql: "DELETE FROM event WHERE session_id IN (SELECT id FROM session WHERE student_id = ?)", args: [id] },
      { sql: "DELETE FROM session WHERE student_id = ?", args: [id] },
      { sql: "DELETE FROM student_action WHERE student_id = ?", args: [id] },
      { sql: "DELETE FROM student WHERE id = ?", args: [id] },
    ],
    "write",
  );
}

/* ---------- prancha (NM-21) ---------- */

export async function setStudentActions(proId: string, id: string, actionIds: string[]) {
  const db = await getDb();
  const own = await db.execute({ sql: "SELECT 1 FROM student WHERE id = ? AND professional_id = ?", args: [id, proId] });
  if (!own.rows.length) return;
  // Mantém a ordem da biblioteca, para a prancha parecer com o site.
  const ordered = await db.execute("SELECT id FROM action WHERE is_active = 1 ORDER BY sort_order, name");
  const chosen = ordered.rows.map((r) => String(r.id)).filter((x) => actionIds.includes(x));
  await db.batch(
    [
      { sql: "DELETE FROM student_action WHERE student_id = ?", args: [id] },
      ...chosen.map((actionId, i) => ({
        sql: "INSERT INTO student_action (student_id, action_id, sort_order) VALUES (?, ?, ?)",
        args: [id, actionId, i + 1],
      })),
    ],
    "write",
  );
}

/* ---------- acesso da criança (NM-23) ---------- */

export type Board = { student: Student; actions: Action[] };

export async function getBoardByToken(token: string): Promise<Board | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const db = await getDb();
  const s = await db.execute({ sql: "SELECT * FROM student WHERE access_token = ?", args: [token] });
  if (!s.rows.length) return null;
  const student = rowToStudent(s.rows[0]);
  const a = await db.execute({
    sql: `SELECT a.* FROM student_action sa JOIN action a ON a.id = sa.action_id
          WHERE sa.student_id = ? AND a.is_active = 1 ORDER BY sa.sort_order`,
    args: [student.id],
  });
  if (!a.rows.length) return { student, actions: [] };
  const ids = a.rows.map((r) => String(r.id));
  const v = await db.execute({
    sql: `SELECT * FROM video WHERE is_active = 1 AND action_id IN (${ids.map(() => "?").join(",")}) ORDER BY sort_order, created_at`,
    args: ids,
  });
  const byAction = new Map<string, ReturnType<typeof rowToVideo>[]>();
  for (const r of v.rows) {
    const k = String(r.action_id);
    if (!byAction.has(k)) byAction.set(k, []);
    byAction.get(k)!.push(rowToVideo(r));
  }
  return { student, actions: a.rows.map((r) => rowToAction(r, byAction.get(String(r.id)) ?? [])) };
}

/* ---------- sessões (NM-25) ---------- */

export async function createSession(studentId: string, inPerson: boolean): Promise<string> {
  const db = await getDb();
  const id = randomUUID();
  await db.execute({
    sql: "INSERT INTO session (id, student_id, in_person) VALUES (?, ?, ?)",
    args: [id, studentId, inPerson ? 1 : 0],
  });
  return id;
}

/* ---------- relatório (NM-26) ---------- */

export type StudentReport = {
  totals: { sessions: number; minutes: number; lastAt: string | null; finishes: number };
  sessions: { id: string; startedAt: string; seconds: number; inPerson: boolean; actionsOpened: number; finishes: number }[];
  perAction: { id: string; name: string; emoji: string; opens: number; plays: number; finishes: number }[];
};

export async function getStudentReport(proId: string, id: string): Promise<StudentReport | null> {
  const db = await getDb();
  const own = await db.execute({ sql: "SELECT 1 FROM student WHERE id = ? AND professional_id = ?", args: [id, proId] });
  if (!own.rows.length) return null;
  const [totals, sessions, perAction] = await Promise.all([
    db.execute({
      sql: `SELECT COUNT(*) AS sessions,
          COALESCE(SUM((julianday(COALESCE(ended_at, started_at)) - julianday(started_at)) * 1440), 0) AS minutes,
          MAX(started_at) AS last_at,
          (SELECT COUNT(*) FROM event e JOIN session x ON x.id = e.session_id WHERE x.student_id = ? AND e.type = 'finish_video') AS finishes
        FROM session WHERE student_id = ?`,
      args: [id, id],
    }),
    db.execute({
      sql: `SELECT s.id, s.started_at, s.in_person,
          (julianday(COALESCE(s.ended_at, s.started_at)) - julianday(s.started_at)) * 86400 AS seconds,
          (SELECT COUNT(DISTINCT action_id) FROM event e WHERE e.session_id = s.id AND e.type = 'open_action') AS actions_opened,
          (SELECT COUNT(*) FROM event e WHERE e.session_id = s.id AND e.type = 'finish_video') AS finishes
        FROM session s WHERE s.student_id = ? ORDER BY s.started_at DESC LIMIT 60`,
      args: [id],
    }),
    db.execute({
      sql: `SELECT a.id, a.name, a.emoji,
          SUM(e.type = 'open_action') AS opens, SUM(e.type = 'play_video') AS plays, SUM(e.type = 'finish_video') AS finishes
        FROM event e JOIN session s ON s.id = e.session_id JOIN action a ON a.id = e.action_id
        WHERE s.student_id = ? GROUP BY a.id ORDER BY opens DESC, a.sort_order`,
      args: [id],
    }),
  ]);
  const t = totals.rows[0];
  return {
    totals: {
      sessions: Number(t.sessions ?? 0),
      minutes: Math.round(Number(t.minutes ?? 0)),
      lastAt: t.last_at ? String(t.last_at) : null,
      finishes: Number(t.finishes ?? 0),
    },
    sessions: sessions.rows.map((r) => ({
      id: String(r.id),
      startedAt: String(r.started_at),
      seconds: Math.round(Number(r.seconds ?? 0)),
      inPerson: Number(r.in_person) === 1,
      actionsOpened: Number(r.actions_opened ?? 0),
      finishes: Number(r.finishes ?? 0),
    })),
    perAction: perAction.rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      emoji: String(r.emoji),
      opens: Number(r.opens ?? 0),
      plays: Number(r.plays ?? 0),
      finishes: Number(r.finishes ?? 0),
    })),
  };
}

/* ---------- exportação anonimizada (NM-18) ---------- */

/** Agregado por semana e ação, de todo o uso. Sem apelido, sem e-mail, sem id de pessoa. */
export async function exportUsageCsv(): Promise<string> {
  const db = await getDb();
  const r = await db.execute(`SELECT strftime('%Y-%W', e.created_at) AS semana,
      COALESCE(a.name, '(site)') AS acao,
      SUM(e.type = 'open_action') AS aberturas,
      SUM(e.type = 'play_video') AS videos_iniciados,
      SUM(e.type = 'finish_video') AS videos_concluidos,
      COUNT(DISTINCT e.anon_session_id) AS sessoes_anonimas,
      COUNT(DISTINCT e.session_id) AS sessoes_de_prancha,
      SUM(CASE WHEN x.in_person = 1 THEN 1 ELSE 0 END) AS eventos_presenciais
    FROM event e LEFT JOIN action a ON a.id = e.action_id LEFT JOIN session x ON x.id = e.session_id
    GROUP BY semana, acao ORDER BY semana, acao`);
  const cols = ["semana", "acao", "aberturas", "videos_iniciados", "videos_concluidos", "sessoes_anonimas", "sessoes_de_prancha", "eventos_presenciais"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(";"), ...r.rows.map((row) => cols.map((c) => esc(row[c])).join(";"))].join("\n");
}
