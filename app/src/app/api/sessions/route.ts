import { NextResponse } from "next/server";
import { createSession, getBoardByToken } from "@/lib/pro";
import { getProfessional } from "@/lib/pro-auth";

/**
 * Abre uma sessão de prancha (NM-25). Chamado pelo navegador da criança em /p/<token>.
 * Presencial quando quem abre é o profissional dono do aluno (cookie da área pro).
 */
export async function POST(request: Request) {
  let token = "";
  try {
    token = String(((await request.json()) as { token?: unknown }).token ?? "");
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const board = await getBoardByToken(token);
  if (!board) return new NextResponse(null, { status: 404 });
  const pro = await getProfessional();
  const inPerson = !!pro && pro.id === board.student.professionalId;
  const id = await createSession(board.student.id, inPerson);
  return NextResponse.json({ id, inPerson });
}
