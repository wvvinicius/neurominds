import { ui } from "@/components/admin/ui";
import { getUsageStats } from "@/lib/events";

export const dynamic = "force-dynamic";

const fmtMs = (ms: number | null) => (ms == null ? "—" : `${(ms / 1000).toFixed(1)} s`);

/** Painel de uso (NM-15): só contagens anônimas. */
export default async function UsagePage() {
  const s = await getUsageStats();

  const tiles = [
    { label: "Sessões anônimas", value: s.sessions },
    { label: "Interações", value: s.events },
    { label: "Vídeos vistos até o fim", value: s.finishes },
    { label: "Interações nos últimos 7 dias", value: s.last7d },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className={ui.h2}>Uso</h1>
        <p className="text-sm text-ink/60">
          Contagens anônimas. Uma sessão é um aparelho num período de 24 h, sem nome nem identificação.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className={ui.card}>
            <p className="font-display text-5xl text-ink/85">{t.value}</p>
            <p className="text-sm font-extrabold text-ink/50">{t.label}</p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Por ação</h2>
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
              {s.perAction.map((a) => (
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Por vídeo</h2>
        <div className={`${ui.card} overflow-x-auto p-0`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">Vídeo</th>
                <th className="px-4 py-3 text-right">Iniciados</th>
                <th className="px-4 py-3 text-right">Até o fim</th>
                <th className="px-4 py-3 text-right">Tempo médio</th>
              </tr>
            </thead>
            <tbody>
              {s.perVideo.map((v) => (
                <tr key={v.id} className="border-t border-fog">
                  <td className="px-4 py-3">
                    <span className="font-extrabold">{v.caption}</span>
                    <span className="text-ink/50">
                      {" "}
                      · <span aria-hidden="true">{v.actionEmoji}</span> {v.actionName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{v.plays}</td>
                  <td className="px-4 py-3 text-right font-extrabold">{v.finishes}</td>
                  <td className="px-4 py-3 text-right">{fmtMs(v.avgMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
