/**
 * Acesso ao admin (NM-11): senha única em ADMIN_PASSWORD, cookie assinado.
 * Em desenvolvimento, sem a variável, a senha é "neurominds".
 * Em produção, sem a variável, o admin fica desligado.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "nm_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? null : "neurominds";
}

function tokenFor(password: string): string {
  return createHmac("sha256", password).update("neurominds-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function isAdmin(): Promise<boolean> {
  const pw = adminPassword();
  if (!pw) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  return !!value && safeEqual(value, tokenFor(pw));
}

export async function login(password: string): Promise<boolean> {
  const pw = adminPassword();
  if (!pw || !safeEqual(password, pw)) return false;
  (await cookies()).set(COOKIE, tokenFor(pw), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}
