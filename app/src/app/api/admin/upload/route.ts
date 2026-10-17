import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/auth";

/**
 * Upload de vídeo direto do navegador para o Vercel Blob (NM-13).
 * O arquivo não passa pelo servidor; aqui só se emite o token de upload.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sem acesso." }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Armazenamento de vídeos não configurado (BLOB_READ_WRITE_TOKEN). Use 'adicionar por link'." },
      { status: 501 },
    );
  }
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
        maximumSizeInBytes: 50 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        /* o registro no banco é feito pelo navegador após o upload (addVideoAction) */
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Falha no upload." }, { status: 400 });
  }
}
