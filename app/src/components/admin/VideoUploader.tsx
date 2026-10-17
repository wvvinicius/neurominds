"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { addVideoAction, addVideoByUrlAction, type FormState } from "@/app/admin/actions";
import { ui } from "./ui";

/**
 * Duas formas de adicionar vídeo (NM-13):
 * 1. Enviar arquivo: vai direto do navegador para o Vercel Blob, depois grava no banco.
 * 2. Adicionar por link: URL pública ou caminho em /public.
 */
export function VideoUploader({ actionId }: { actionId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const byUrl = addVideoByUrlAction.bind(null, actionId);
  const [urlState, urlAction, urlPending] = useActionState<FormState, FormData>(byUrl, {});

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return setError("Escolha um arquivo de vídeo.");
    if (file.size > 50 * 1024 * 1024) return setError("Arquivo acima de 50 MB. Reduza antes de enviar.");
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: file.type || "video/mp4",
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });
      const res = await addVideoAction(actionId, blob.url, caption);
      if (res.error) setError(res.error);
      else {
        setCaption("");
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha no envio.";
      setError(
        /501|não configurado|BLOB_READ_WRITE_TOKEN/i.test(msg)
          ? "Armazenamento de vídeos não configurado na hospedagem. Por enquanto, use 'Adicionar por link'."
          : msg,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={send} className={`${ui.card} flex flex-col gap-3`}>
        <h3 className="text-lg font-extrabold">Enviar arquivo</h3>
        <p className="text-sm text-ink/60">MP4 16:9, 5 a 8 s, até 15 MB de preferência. Ver wiki/06-conteudo-videos.md.</p>
        <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="block text-sm file:mr-3 file:rounded-full file:border-0 file:bg-mist file:px-4 file:py-2 file:font-extrabold" />
        <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={80} placeholder="Legenda curta (ex.: Chutar no futebol)" className={ui.input} />
        {busy && (
          <div className="h-3 overflow-hidden rounded-full bg-mist" aria-label={`Enviando ${progress}%`}>
            <div className="h-full rounded-full bg-nm-blue-deep transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <p className={ui.error}>{error}</p>}
        <div>
          <button type="submit" disabled={busy} className={`${ui.btn} ${ui.primary}`}>
            {busy ? `Enviando ${progress}%` : "Enviar vídeo"}
          </button>
        </div>
      </form>

      <form action={urlAction} className={`${ui.card} flex flex-col gap-3`}>
        <h3 className="text-lg font-extrabold">Adicionar por link</h3>
        <p className="text-sm text-ink/60">URL pública de um MP4, ou caminho do repositório como /videos/chutar/chutar-futebol.mp4.</p>
        <input name="src" required placeholder="https://... ou /videos/..." className={ui.input} />
        <input name="caption" maxLength={80} placeholder="Legenda curta" className={ui.input} />
        {urlState.error && <p className={ui.error}>{urlState.error}</p>}
        <div>
          <button type="submit" disabled={urlPending} className={`${ui.btn} ${ui.secondary}`}>
            {urlPending ? "Adicionando..." : "Adicionar link"}
          </button>
        </div>
      </form>
    </div>
  );
}
