import Link from "next/link";
import { createStudentAction } from "@/app/pro/actions";
import { ui } from "@/components/admin/ui";
import { StudentForm } from "@/components/pro/StudentForm";
import { fmtDate } from "@/lib/format";
import { listStudents } from "@/lib/pro";
import { requireProfessional } from "@/lib/pro-auth";

export const dynamic = "force-dynamic";

/** Lista de alunos do profissional (NM-20). */
export default async function ProHome() {
  const me = await requireProfessional();
  const students = await listStudents(me.id);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h1 className={ui.h2}>Alunos</h1>
          <span className="text-sm font-extrabold text-ink/50">{students.length} cadastrados</span>
        </div>

        {students.length === 0 ? (
          <p className={`${ui.card} text-ink/60`}>Nenhum aluno ainda. Cadastre o primeiro abaixo: só um apelido basta.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {students.map((s) => (
              <li key={s.id}>
                <Link href={`/pro/alunos/${s.id}`} className={`${ui.card} flex items-center gap-4 transition-[box-shadow] hover:ring-nm-blue-mid`}>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-nm-blue-soft font-display text-3xl text-nm-blue-deep" aria-hidden="true">
                    {s.nickname.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-extrabold">{s.nickname}</p>
                    <p className="text-sm text-ink/50">
                      {s.actionCount} {s.actionCount === 1 ? "ação" : "ações"} no painel ·{s.sessionCount} {s.sessionCount === 1 ? "sessão" : "sessões"}
                      {s.lastSessionAt && ` · último uso ${fmtDate(s.lastSessionAt)}`}
                    </p>
                  </div>
                  <span className="text-nm-blue-deep" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${ui.card} flex flex-col gap-4`}>
        <h2 className={ui.h2}>Novo aluno</h2>
        <StudentForm action={createStudentAction} submitLabel="Cadastrar" />
      </section>
    </div>
  );
}
