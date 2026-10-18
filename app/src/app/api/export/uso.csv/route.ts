import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { exportUsageCsv } from "@/lib/pro";
import { getProfessional } from "@/lib/pro-auth";

/** CSV agregado e anônimo para a FENIC (NM-18). Profissional logado ou admin. */
export async function GET() {
  const ok = (await getProfessional()) || (await isAdmin());
  if (!ok) return new NextResponse("Sem acesso.", { status: 401 });
  const csv = await exportUsageCsv();
  return new NextResponse("﻿" + csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="neurominds-uso-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
