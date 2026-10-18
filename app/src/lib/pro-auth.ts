/**
 * Login do profissional (NM-19): link mágico por e-mail, sem senha.
 * Sessão por cookie assinado (id + HMAC). Sem tabela de sessão.
 * Segredo: AUTH_SECRET, ou ADMIN_PASSWORD, ou "neurominds-dev" fora de produção.
 */
import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";
import { sendMail } from "./mail";

const COOKIE = "nm_pro";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 dias
const TOKEN_MINUTES = 20;

export type Professional = { id: string; email: string; name: string | null };

function secret(): string | null {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? null : "neurominds-dev";
}

const sign = (id: string, key: string) => createHmac("sha256", key).update(`pro:${id}`).digest("hex");
const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function getProfessional(): Promise<Professional | null> {
  const key = secret();
  if (!key) return null;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const [id, sig] = value.split(".");
  if (!id || !sig || !safeEqual(sig, sign(id, key))) return null;
  const db = await getDb();
  const r = await db.execute({ sql: "SELECT id, email, name FROM professional WHERE id = ?", args: [id] });
  if (!r.rows.length) return null;
  const row = r.rows[0];
  return { id: String(row.id), email: String(row.email), name: row.name ? String(row.name) : null };
}

export async function requireProfessional(): Promise<Professional> {
  const pro = await getProfessional();
  if (!pro) redirect("/pro/login");
  return pro;
}

async function baseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Gera o link mágico e envia. Devolve o link quando o e-mail não foi enviado (dev). */
export async function startLogin(email: string, name: string | null): Promise<{ sent: boolean; link?: string }> {
  const db = await getDb();
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_MINUTES * 60 * 1000).toISOString().replace("T", " ").slice(0, 19);
  await db.execute({
    sql: "INSERT INTO login_token (token_hash, email, name, expires_at) VALUES (?, ?, ?, ?)",
    args: [hashToken(token), email, name, expires],
  });
  const link = `${await baseUrl()}/pro/entrar?token=${token}`;
  const status = await sendMail({
    to: email,
    subject: "Seu acesso à NeuroMinds",
    text: `Olá! Toque no link para entrar na área do profissional. Ele vale por ${TOKEN_MINUTES} minutos.\n\n${link}\n\nSe você não pediu este acesso, ignore este e-mail.`,
    html: `<p>Olá! Toque no botão para entrar na área do profissional. O link vale por ${TOKEN_MINUTES} minutos.</p>
<p><a href="${link}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#1b7fbd;color:#fff;font-weight:800;text-decoration:none">Entrar na NeuroMinds</a></p>
<p style="color:#666;font-size:13px">Se você não pediu este acesso, ignore este e-mail.</p>`,
  });
  if (status === "sent") return { sent: true };
  // Só em desenvolvimento o link pode aparecer na tela. Em produção seria login livre.
  if (process.env.NODE_ENV !== "production") return { sent: false, link };
  throw new Error("envio de e-mail não configurado (RESEND_API_KEY). Avise o responsável pelo site.");
}

/** Valida o token, cria o profissional se for a primeira vez e abre a sessão. */
export async function completeLogin(token: string): Promise<boolean> {
  const key = secret();
  if (!key || !/^[a-f0-9]{64}$/.test(token)) return false;
  const db = await getDb();
  const r = await db.execute({
    sql: "SELECT email, name FROM login_token WHERE token_hash = ? AND used_at IS NULL AND expires_at > datetime('now')",
    args: [hashToken(token)],
  });
  if (!r.rows.length) return false;
  const email = String(r.rows[0].email);
  const name = r.rows[0].name ? String(r.rows[0].name) : null;
  await db.execute({ sql: "UPDATE login_token SET used_at = datetime('now') WHERE token_hash = ?", args: [hashToken(token)] });

  const existing = await db.execute({ sql: "SELECT id, name FROM professional WHERE email = ?", args: [email] });
  let id: string;
  if (existing.rows.length) {
    id = String(existing.rows[0].id);
    if (name && !existing.rows[0].name) {
      await db.execute({ sql: "UPDATE professional SET name = ? WHERE id = ?", args: [name, id] });
    }
  } else {
    id = randomUUID();
    await db.execute({ sql: "INSERT INTO professional (id, email, name) VALUES (?, ?, ?)", args: [id, email, name] });
  }

  (await cookies()).set(COOKIE, `${id}.${sign(id, key)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function logoutProfessional() {
  (await cookies()).delete(COOKIE);
}
