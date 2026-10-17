"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import * as admin from "@/lib/admin";
import { isAdmin, login, logout } from "@/lib/auth";

export type FormState = { error?: string };

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** Tudo que o admin muda aparece na hora no site público. */
function refresh() {
  revalidatePath("/", "layout");
}

const text = (fd: FormData, key: string, max = 80) => String(fd.get(key) ?? "").trim().slice(0, max);

/* ---------- sessão ---------- */

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ok = await login(String(formData.get("password") ?? ""));
  if (!ok) return { error: "Senha incorreta." };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

/* ---------- ações ---------- */

export async function createActionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await guard();
  const name = text(formData, "name", 40);
  const emoji = text(formData, "emoji", 8);
  const color = formData.get("color");
  if (!name) return { error: "Dê um nome à ação." };
  if (!emoji) return { error: "Escolha um emoji." };
  if (!admin.isColor(color)) return { error: "Escolha uma cor." };
  await admin.createAction({ name, emoji, color });
  refresh();
  return {};
}

export async function updateActionAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await guard();
  const name = text(formData, "name", 40);
  const emoji = text(formData, "emoji", 8);
  const color = formData.get("color");
  if (!name || !emoji || !admin.isColor(color)) return { error: "Preencha nome, emoji e cor." };
  await admin.updateAction(id, { name, emoji, color });
  refresh();
  return {};
}

export async function toggleActionAction(id: string, active: boolean) {
  await guard();
  await admin.setActionActive(id, active);
  refresh();
}

export async function moveActionAction(id: string, dir: "up" | "down") {
  await guard();
  await admin.moveAction(id, dir);
  refresh();
}

export async function deleteActionAction(id: string) {
  await guard();
  await admin.deleteAction(id);
  refresh();
  redirect("/admin");
}

/* ---------- vídeos ---------- */

export async function addVideoAction(actionId: string, src: string, caption: string): Promise<FormState> {
  await guard();
  const url = src.trim();
  if (!/^(https?:\/\/|\/)/.test(url)) return { error: "Informe um link http(s) ou um caminho que comece com /." };
  await admin.addVideo(actionId, url, caption.trim() ? caption.trim().slice(0, 80) : null);
  refresh();
  return {};
}

export async function addVideoByUrlAction(actionId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  return addVideoAction(actionId, text(formData, "src", 500), text(formData, "caption"));
}

export async function updateVideoCaptionAction(id: string, formData: FormData) {
  await guard();
  const caption = text(formData, "caption");
  await admin.updateVideoCaption(id, caption || null);
  refresh();
}

export async function toggleVideoAction(id: string, active: boolean) {
  await guard();
  await admin.setVideoActive(id, active);
  refresh();
}

export async function moveVideoAction(id: string, dir: "up" | "down") {
  await guard();
  await admin.moveVideo(id, dir);
  refresh();
}

export async function deleteVideoAction(id: string) {
  await guard();
  const src = await admin.deleteVideo(id);
  // Arquivo no Blob some junto. Caminhos em /public ficam (são do repositório).
  if (src && src.includes(".blob.vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(src);
    } catch {
      /* já removido ou sem permissão; o registro já saiu do banco */
    }
  }
  refresh();
}
