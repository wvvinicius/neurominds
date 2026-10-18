"use server";

import { headers } from "next/headers";
import { sendMail } from "@/lib/mail";
import { listStudentsByGuardian } from "@/lib/pro";

export type GuardianState = { error?: string; done?: boolean; devLinks?: { nickname: string; url: string }[] };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function siteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * "Sou aluno": o responsável informa o e-mail e recebe os links das pranchas
 * cadastradas com ele. A resposta na tela é a mesma com ou sem cadastro,
 * para não revelar quem está no sistema.
 */
export async function requestBoardLinksAction(_prev: GuardianState, formData: FormData): Promise<GuardianState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  if (!EMAIL.test(email)) return { error: "Digite um e-mail válido." };

  const students = await listStudentsByGuardian(email);
  if (students.length === 0) return { done: true };

  const base = await siteUrl();
  const links = students.map((s) => ({ nickname: s.nickname, url: `${base}/p/${s.accessToken}` }));
  const lines = links.map((l) => `Painel de verbos de ${l.nickname}: ${l.url}`);

  try {
    const status = await sendMail({
      to: email,
      subject: links.length === 1 ? `Painel de verbos de ${links[0].nickname} na NeuroMinds` : "Seus painéis de verbos na NeuroMinds",
      text: `Olá! Aqui ${links.length === 1 ? "está o link do painel de verbos" : "estão os links dos painéis de verbos"}. Abra no tablet ou no celular; não precisa de senha.\n\n${lines.join("\n")}\n\nGuarde este e-mail: o link é o acesso da criança.`,
      html: `<p>Olá! Aqui ${links.length === 1 ? "está o link do painel de verbos" : "estão os links dos painéis de verbos"}. Abra no tablet ou no celular; não precisa de senha.</p>
${links.map((l) => `<p><a href="${l.url}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#f0d64a;color:#1a1a1a;font-weight:800;text-decoration:none">Abrir o painel de ${l.nickname}</a></p>`).join("")}
<p style="color:#666;font-size:13px">Guarde este e-mail: o link é o acesso da criança.</p>`,
    });
    if (status === "sent") return { done: true };
    if (process.env.NODE_ENV !== "production") return { done: true, devLinks: links };
    return { error: "O envio de e-mail não está configurado. Avise o responsável pelo site." };
  } catch (e) {
    return { error: e instanceof Error ? `Não consegui enviar: ${e.message}` : "Não consegui enviar o e-mail." };
  }
}
