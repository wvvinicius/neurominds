"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as pro from "@/lib/pro";
import { logoutProfessional, requireProfessional, startLogin } from "@/lib/pro-auth";

export type LoginState = { error?: string; sentTo?: string; devLink?: string };
export type FormState = { error?: string; ok?: boolean };

const text = (fd: FormData, key: string, max = 80) => String(fd.get(key) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- sessão ---------- */

export async function loginProAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = text(formData, "email", 120).toLowerCase();
  const name = text(formData, "name", 60) || null;
  if (!EMAIL.test(email)) return { error: "Digite um e-mail válido." };
  try {
    const r = await startLogin(email, name);
    return r.sent ? { sentTo: email } : { sentTo: email, devLink: r.link };
  } catch (e) {
    return { error: e instanceof Error ? `Não consegui enviar o e-mail: ${e.message}` : "Não consegui enviar o e-mail." };
  }
}

export async function logoutProAction() {
  await logoutProfessional();
  redirect("/pro/login");
}

/* ---------- alunos ---------- */

export async function createStudentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireProfessional();
  const nickname = text(formData, "nickname", 40);
  const guardian = text(formData, "guardianEmail", 120).toLowerCase();
  if (!nickname) return { error: "Dê um apelido para a criança (não use o nome real)." };
  if (guardian && !EMAIL.test(guardian)) return { error: "E-mail do responsável inválido." };
  const id = await pro.createStudent(me.id, nickname, guardian || null);
  revalidatePath("/pro");
  redirect(`/pro/alunos/${id}`);
}

export async function updateStudentAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireProfessional();
  const nickname = text(formData, "nickname", 40);
  const guardian = text(formData, "guardianEmail", 120).toLowerCase();
  if (!nickname) return { error: "O apelido não pode ficar vazio." };
  if (guardian && !EMAIL.test(guardian)) return { error: "E-mail do responsável inválido." };
  await pro.updateStudent(me.id, id, nickname, guardian || null);
  revalidatePath(`/pro/alunos/${id}`);
  revalidatePath("/pro");
  return { ok: true };
}

export async function saveBoardAction(id: string, formData: FormData) {
  const me = await requireProfessional();
  const ids = formData.getAll("action").map(String).filter((x) => x.length <= 64);
  await pro.setStudentActions(me.id, id, ids);
  revalidatePath(`/pro/alunos/${id}`);
  revalidatePath("/pro");
}

export async function regenerateTokenAction(id: string) {
  const me = await requireProfessional();
  await pro.regenerateToken(me.id, id);
  revalidatePath(`/pro/alunos/${id}`);
}

export async function deleteStudentAction(id: string) {
  const me = await requireProfessional();
  await pro.deleteStudent(me.id, id);
  revalidatePath("/pro");
  redirect("/pro");
}
