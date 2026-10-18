import { ProLinkForm } from "@/components/admin/ProLinkForm";
import { ui } from "@/components/admin/ui";
import { listProfessionals } from "@/lib/admin";
import { fmtDate } from "@/lib/format";
import { mailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

/** Profissionais cadastrados e geração de link de acesso pelo admin. */
export default async function ProfessionalsPage() {
  const pros = await listProfessionals();

  return (
    <div className="flex flex-col gap-8">
      <section className={`${ui.card} flex flex-col gap-4`}>
        <div>
          <h1 className={ui.h2}>Acesso de profissional</h1>
          <p className="text-sm text-ink/60">
            Gere um link e mande por WhatsApp. Ao abrir, a pessoa entra na área do profissional sem senha.
            {!mailConfigured() && " O envio por e-mail ainda não está configurado."}
          </p>
        </div>
        <ProLinkForm />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className={ui.h2}>Profissionais</h2>
          <span className="text-sm font-extrabold text-ink/50">{pros.length} cadastrados</span>
        </div>
        {pros.length === 0 ? (
          <p className={`${ui.card} text-ink/60`}>Ninguém entrou ainda. O cadastro acontece no primeiro acesso.</p>
        ) : (
          <div className={`${ui.card} overflow-x-auto p-0`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-mist text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3 text-right">Alunos</th>
                  <th className="px-4 py-3 text-right">Desde</th>
                </tr>
              </thead>
              <tbody>
                {pros.map((p) => (
                  <tr key={p.id} className="border-t border-fog">
                    <td className="px-4 py-3 font-extrabold">{p.name ?? "—"}</td>
                    <td className="px-4 py-3">{p.email}</td>
                    <td className="px-4 py-3 text-right">{p.studentCount}</td>
                    <td className="px-4 py-3 text-right">{fmtDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
