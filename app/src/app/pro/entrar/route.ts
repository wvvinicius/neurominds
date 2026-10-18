import { NextResponse } from "next/server";
import { completeLogin } from "@/lib/pro-auth";

/** Destino do link mágico (NM-19). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const ok = await completeLogin(token);
  return NextResponse.redirect(new URL(ok ? "/pro" : "/pro/login?erro=link", url.origin));
}
