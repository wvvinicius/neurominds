/**
 * Envio de e-mail via Resend (API HTTP, sem SDK).
 * Sem RESEND_API_KEY: não envia, registra no console e devolve "skipped".
 * Quem chama decide o que fazer (em dev, mostrar o link na tela).
 */

type Mail = { to: string; subject: string; text: string; html: string };

export function mailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendMail(mail: Mail): Promise<"sent" | "skipped"> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[mail não enviado] para ${mail.to}: ${mail.subject}\n${mail.text}`);
    return "skipped";
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? "NeuroMinds <onboarding@resend.dev>",
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 200)}`);
  }
  return "sent";
}
