import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteStudentAction, regenerateTokenAction, saveBoardAction, saveSessionNoteAction, updateStudentAction } from "@/app/pro/actions";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { colorDot, ui } from "@/components/admin/ui";
import { CopyButton } from "@/components/pro/CopyButton";
import { StudentForm } from "@/components/pro/StudentForm";
import { getActions } from "@/lib/data";
import { fmtDateTime, fmtDuration } from "@/lib/format";
import { getStudent, getStudentReport, type StudentReport } from "@/lib/pro";
import { requireProfessional } from "@/lib/pro-auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function siteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

type SessionRow = StudentReport["sessions"][number];

/** Linha da sessão e, se foi no consultório, a linha de observação do profissional. */
function SessionRows({ studentId, session: s }: { studentId: string; session: SessionRow }) {
  return (
    <>
      <tr className="border-t border-fog">
        <td className="px-4 py-3 font-extrabold">{fmtDateTime(s.startedAt)}</td>
        <td className="px-4 py-3">
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${s.inPerson ? "bg-nm-green-soft text-nm-green-deep" : "bg-nm-yellow-soft text-nm-yellow-deep"}`}>
            {s.inPerson ? "Consultório" : "Em casa"}
          </span>
        </td>
        <td className="px-4 py-3 text-right">{fmtDuration(s.seconds)}</td>
        <td className="px-4 py-3 text-right">{s.actionsOpened}</td>
        <td className="px-4 py-3 text-right font-extrabold">{s.finishes}</td>
      </tr>
      {s.inPerson && (
        <tr>
          <td colSpan={5} className="px-4 pb-4 pt-0">
            <form action={saveSessionNoteAction.bind(null, studentId, s.id)} className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <textarea
                name="note"
                rows={2}
                maxLength={2000}
                defaultValue={s.note ?? ""}
                placeholder="Observação do atendimento (opcional). Ex.: entendeu 'chutar' no futebol, pediu para repetir o karatê."
                className="min-h-14 w-full flex-1 rounded-xl border-2 border-fog bg-paper px-4 py-2 text-sm font-semibold outline-none transition-colors focus:border-nm-blue-deep"
              />
              <button type="submit" className={`${ui.btn} ${ui.secondary} h-10 shrink-0 px-4`}>
                Salvar observação
              </button>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

/** Aluno: dados, prancha (NM-21), link da criança (NM-23), relatório (NM-26), exclusão (NM-27). */
export default async function StudentPage({ params }: Props) {
  const me = await requireProfessional();
  const { id } = await params;
  const [student, actions, report] = await Promise.all([getStudent(me.id, id), getActions(), getStudentReport(me.id, id)]);
  if (!student || !report) notFound();

  const link = `${await siteUrl()}/p/${student.accessToken}`;
  const chosen = new Set(student.actionIds);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/pro" className={`${ui.btn} ${ui.secondary} h-10 px-4`}>
          ← Alunos
        </Link>
        <h1 className={ui.h2}>{student.nickname}</h1>
      </div>

      {/* Link da criança */}
      <section className={`${ui.card} flex flex-col gap-3`}>
        <h2 className="text-lg font-extrabold">Link da criança</h2>
        <p className="text-sm text-ink/60">
          Quem abrir este link vê só o painel de verbos de {student.nickname}, sem login. Mande para o responsável, ou abra aqui no consultório: a sessão fica marcada como presencial.
        </p>
        <code className="break-all rounded-xl bg-mist px-4 py-3 text-sm">{link}</code>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={link} />
          <Link href={`/p/${student.accessToken}`} className={`${ui.btn} ${ui.success}`}>
            Abrir agora no consultório
          </Link>
          <form action={regenerateTokenAction.bind(null, student.id)}>
            <ConfirmSubmit message="Gerar um link novo? O link antigo deixa de funcionar." className={`${ui.btn} ${ui.secondary}`}>
              Gerar link novo
            </ConfirmSubmit>
          </form>
        </div>
      </section>

      {/* Prancha */}
      <section className={`${ui.card} flex flex-col gap-4`}>
        <div>
          <h2 className="text-lg font-extrabold">Painel de verbos</h2>
          <p className="text-sm text-ink/60">Marque as ações que {student.nickname} vai ver. Quem faz judô não precisa do mesmo painel de quem faz balé.</p>
        </div>
        <form action={saveBoardAction.bind(null, student.id)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {actions.map((a) => (
              <label key={a.id} className="cursor-pointer">
                <input type="checkbox" name="action" value={a.id} defaultChecked={chosen.has(a.id)} className="peer sr-only" />
                <span className="flex items-center gap-3 rounded-2xl bg-mist p-3 ring-4 ring-transparent transition-[background-color,box-shadow] peer-checked:bg-paper peer-checked:ring-nm-blue-deep peer-focus-visible:ring-nm-blue-mid">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${colorDot[a.color]}`} aria-hidden="true">
                    {a.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-extrabold">{a.name}</span>
                    <span className="block text-xs text-ink/50">{a.videos.length} {a.videos.length === 1 ? "vídeo" : "vídeos"}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className={`${ui.btn} ${ui.primary}`}>
              Salvar painel
            </button>
            <span className="text-sm text-ink/50">{chosen.size} de {actions.length} marcadas</span>
          </div>
        </form>
      </section>

      {/* Relatório */}
      <section className="flex flex-col gap-4">
        <h2 className={ui.h2}>Relatório</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Sessões", value: String(report.totals.sessions) },
            { label: "Tempo total", value: `${report.totals.minutes} min` },
            { label: "Vídeos até o fim", value: String(report.totals.finishes) },
            { label: "Último uso", value: fmtDateTime(report.totals.lastAt) },
          ].map((t) => (
            <div key={t.label} className={ui.card}>
              <p className="font-display text-4xl text-ink/85">{t.value}</p>
              <p className="text-sm font-extrabold text-ink/50">{t.label}</p>
            </div>
          ))}
        </div>

        {report.sessions.length === 0 ? (
          <p className={`${ui.card} text-ink/60`}>Ainda não houve uso. Quando {student.nickname} abrir o link, as sessões aparecem aqui.</p>
        ) : (
          <>
            <div className={`${ui.card} overflow-x-auto p-0`}>
              <table className="w-full text-left text-sm">
                <thead className="bg-mist text-xs uppercase text-ink/50">
                  <tr>
                    <th className="px-4 py-3">Quando</th>
                    <th className="px-4 py-3">Onde</th>
                    <th className="px-4 py-3 text-right">Duração</th>
                    <th className="px-4 py-3 text-right">Ações abertas</th>
                    <th className="px-4 py-3 text-right">Vídeos até o fim</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sessions.map((s) => (
                    <SessionRows key={s.id} studentId={student.id} session={s} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`${ui.card} overflow-x-auto p-0`}>
              <table className="w-full text-left text-sm">
                <thead className="bg-mist text-xs uppercase text-ink/50">
                  <tr>
                    <th className="px-4 py-3">Ação</th>
                    <th className="px-4 py-3 text-right">Aberturas</th>
                    <th className="px-4 py-3 text-right">Vídeos iniciados</th>
                    <th className="px-4 py-3 text-right">Vistos até o fim</th>
                  </tr>
                </thead>
                <tbody>
                  {report.perAction.map((a) => (
                    <tr key={a.id} className="border-t border-fog">
                      <td className="px-4 py-3 text-base font-extrabold">
                        <span aria-hidden="true">{a.emoji}</span> {a.name}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold">{a.opens}</td>
                      <td className="px-4 py-3 text-right">{a.plays}</td>
                      <td className="px-4 py-3 text-right">{a.finishes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Dados */}
      <section className={`${ui.card} flex flex-col gap-4`}>
        <h2 className="text-lg font-extrabold">Dados</h2>
        <StudentForm action={updateStudentAction.bind(null, student.id)} initial={student} submitLabel="Salvar" />
      </section>

      {/* Excluir */}
      <section className={`${ui.card} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <h2 className="text-lg font-extrabold">Excluir aluno</h2>
          <p className="text-sm text-ink/60">Apaga apelido, painel, sessões e todo o histórico. Não dá para desfazer.</p>
        </div>
        <form action={deleteStudentAction.bind(null, student.id)}>
          <ConfirmSubmit message={`Excluir ${student.nickname} e todo o histórico?`} className={`${ui.btn} ${ui.danger}`}>
            Excluir aluno
          </ConfirmSubmit>
        </form>
      </section>
    </div>
  );
}
