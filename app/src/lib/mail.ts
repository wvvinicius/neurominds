/**
 * Envio de e-mail por API HTTP, sem SDK.
 * Provedor escolhido pelas variáveis: BREVO_API_KEY (preferido, sem domínio) ou RESEND_API_KEY.
 * Sem nenhum dos dois: não envia, registra no console e devolve "skipped".
 * Remetente em MAIL_FROM, no formato `Nome <email>`.
 */

type Mail = { to: string; subject: string; text: string; html: string };

export function mailConfigured(): boolean {
  return !!(process.env.BREVO_API_KEY || process.env.RESEND_API_KEY);
}

function sender(): { name: string; email: string } {
  const raw = process.env.MAIL_FROM ?? "NeuroMinds <onboarding@resend.dev>";
  const m = raw.match(/^\s*(?:"?([^"<]*)"?\s*)?<([^>]+)>\s*$/);
  return m ? { name: (m[1] ?? "NeuroMinds").trim() || "NeuroMinds", email: m[2].trim() } : { name: "NeuroMinds", email: raw.trim() };
}

async function viaBrevo(mail: Mail) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY!, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: sender(),
      to: [{ email: mail.to }],
      subject: mail.subject,
      textContent: mail.text,
      htmlContent: mail.html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
}

async function viaResend(mail: Mail) {
  const s = sender();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: `${s.name} <${s.email}>`, to: [mail.to], subject: mail.subject, text: mail.text, html: mail.html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
}

export async function sendMail(mail: Mail): Promise<"sent" | "skipped"> {
  if (process.env.BREVO_API_KEY) {
    await viaBrevo(mail);
    return "sent";
  }
  if (process.env.RESEND_API_KEY) {
    await viaResend(mail);
    return "sent";
  }
  console.log(`[mail não enviado] para ${mail.to}: ${mail.subject}\n${mail.text}`);
  return "skipped";
}
