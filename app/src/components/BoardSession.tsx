"use client";

import { useEffect } from "react";
import { ensureSession } from "@/lib/track";

/** Abre (ou reaproveita) a sessão de prancha da criança nesta aba (NM-25). */
export function BoardSession({ token }: { token: string }) {
  useEffect(() => {
    ensureSession(token);
  }, [token]);
  return null;
}
