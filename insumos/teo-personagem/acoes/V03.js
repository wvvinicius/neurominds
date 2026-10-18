// V03 — Esperar a vez na brincadeira. No parque, na fila do escorregador.
// O Teo espera ansioso, saltitando na ponta dos pés e acompanhando com os olhos a outra criança
// (que não fala), que a cada repetição (2 s) sobe a escadinha, escorrega e corre por trás para subir de novo.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { parque } = require('../lib/cenario');
const { crianca } = require('./obj-lote3');
const { OL, r2, tracoSvg: st } = B;

const CHAO = 900, SK = 1.7, ST = 1.4, TX = 640;
const ESC = { x0: 990, x1: 1070, topo: 480 };            // escadinha: pé (x0, chão) → topo (x1, plataforma)
const PLAT = { x0: 1050, x1: 1220, y: 480 };
// rampa: s = 0..1 → ponto da superfície (curva suave, reta no topo e na saída)
const rampa = (s) => [PLAT.x1 + 560 * s, PLAT.y + 370 * (0.5 - 0.5 * Math.cos(Math.PI * B.clamp(s)))];
const inclRampa = (s) => { const a = rampa(s - 0.01), b = rampa(s + 0.01); return B.angulo(a, b); };

function escorregador() {
  // suportes, escadinha, plataforma e rampa (com borda vermelha)
  let d = `M ${r2(PLAT.x1)} ${PLAT.y}`;
  for (let i = 1; i <= 40; i++) { const [x, y] = rampa(i / 40); d += ` L ${r2(x)} ${r2(y)}`; }
  const [xf, yf] = rampa(1);
  d += ` L ${r2(xf + 70)} ${r2(yf)}`;
  let borda = d.replace(/L ([\d.]+) ([\d.]+)/g, (_, x, y) => `L ${x} ${r2(+y - 22)}`).replace(/^M ([\d.]+) ([\d.]+)/, (_, x, y) => `M ${x} ${r2(+y - 22)}`);
  const degraus = Array.from({ length: 5 }, (_, i) => {
    const k = (i + 1) / 6, y = CHAO - (CHAO - ESC.topo) * k, x = B.mix(ESC.x0, ESC.x1, k);
    return st(`M ${r2(x - 40)} ${r2(y)} L ${r2(x + 40)} ${r2(y)}`, 12) + st(`M ${r2(x - 40)} ${r2(y)} L ${r2(x + 40)} ${r2(y)}`, 5, '#FFC93C');
  }).join('');
  const trilho = (dx) => st(`M ${ESC.x0 + dx} ${CHAO} L ${ESC.x1 + dx} ${ESC.topo - 70}`, 22) + st(`M ${ESC.x0 + dx} ${CHAO} L ${ESC.x1 + dx} ${ESC.topo - 70}`, 12, '#2F6BDB');
  return {
    atras: `${st(`M ${PLAT.x1 - 10} ${PLAT.y} L ${PLAT.x1 - 10} ${CHAO}`, 22) + st(`M ${PLAT.x1 - 10} ${PLAT.y} L ${PLAT.x1 - 10} ${CHAO}`, 12, '#2F6BDB')}
      ${st(`M 1500 ${r2(rampa(0.55)[1])} L 1500 ${CHAO}`, 20) + st(`M 1500 ${r2(rampa(0.55)[1])} L 1500 ${CHAO}`, 10, '#2F6BDB')}
      ${trilho(48)}`,
    frente: `<rect x="${PLAT.x0}" y="${PLAT.y}" width="${PLAT.x1 - PLAT.x0 + 4}" height="26" rx="6" fill="#FFC93C" stroke="${OL}" stroke-width="6"/>
            <path d="${d} L ${r2(xf + 70)} ${r2(yf + 34)} ${Array.from({ length: 41 }, (_, i) => { const [x, y] = rampa(1 - i / 40); return `L ${r2(x)} ${r2(y + 34)}`; }).join(' ')} Z" fill="#E63946" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      ${st(borda, 22)}${st(borda, 12, '#FFC93C')}`,
    escada: `${trilho(-8)}${degraus}`,
  };
}

// ---------- a outra criança: posição e pose ao longo do ciclo ----------
function corrida(fase, amp = 1) {
  const p = 2 * Math.PI * fase;
  const perna = (ph) => { const th = 34 * Math.sin(ph) * amp; return { a1: th, a2: th - (14 + 70 * Math.max(0, Math.cos(ph))) * amp }; };
  const braco = (ph) => { const a = -40 * Math.sin(ph) * amp; return { a1: a, a2: a + 80 * amp }; };
  return { pernaPerto: perna(p), pernaLonge: perna(p + Math.PI), bracoPerto: braco(p + Math.PI), bracoLonge: braco(p) };
}
function poseCrianca(u) {
  const yPe = crianca.emPe(CHAO, SK);
  const sentado = (x, y, lean, bracos) => ({ x, y, lean, pernaPerto: { a1: 70 - lean, a2: 84 - lean }, pernaLonge: { a1: 64 - lean, a2: 80 - lean }, ...bracos });
  const bracosCima = { bracoPerto: { a1: 60, a2: 92 }, bracoLonge: { a1: 50, a2: 86 } };   // segurando nas bordas
  // 1) sobe a escadinha (0 → 0.3)
  if (u < 0.3) {
    const k = B.clamp((u - 0.02) / 0.28), passo = 2 * Math.PI * 3 * k;
    const x = B.mix(ESC.x0 - 20, ESC.x1 - 30, k), y = B.mix(yPe, ESC.topo - 40, B.ease(k));
    const m = B.ease(Math.min(1, k * 5)), sp = Math.sin(passo) * m;   // m: sai da pose em pé para a de subir
    return { camada: 'escada', x, y, lean: 10 * m, expr: 'feliz',
      pernaPerto: { a1: B.mix(4, 30, m) + 30 * sp, a2: B.mix(0, -10, m) }, pernaLonge: { a1: B.mix(-4, 30, m) - 30 * sp, a2: B.mix(0, -10, m) },
      bracoPerto: { a1: B.mix(10, 95, m) + 25 * sp, a2: B.mix(20, 125, m) }, bracoLonge: { a1: B.mix(-10, 95, m) - 25 * sp, a2: B.mix(6, 125, m) } };
  }
  // 2) senta no alto (0.3 → 0.4)
  if (u < 0.4) {
    const k = B.ease((u - 0.3) / 0.1);
    const p0 = [ESC.x1 - 30, ESC.topo - 40], p1 = [PLAT.x1 - 40, PLAT.y - 20 * SK];
    const s = sentado(B.mix(p0[0], p1[0], k), B.mix(p0[1], p1[1], k), -6, bracosCima);
    s.pernaPerto = { a1: B.mix(30, 64, k), a2: B.mix(-10, 78, k) }; s.pernaLonge = { a1: B.mix(30, 58, k), a2: B.mix(-10, 74, k) };
    return { camada: 'frente', expr: 'feliz', ...s };
  }
  // 3) escorrega (0.4 → 0.62)
  if (u < 0.62) {
    const k = B.clamp((u - 0.4) / 0.22), sR = k * k * (3 - 2 * k) * 0.97 + 0.03 * k;
    const [x, y] = rampa(sR), inc = inclRampa(sR);
    const s = sentado(x - 20, y - 20 * SK, -14, bracosCima);
    s.pernaPerto = { a1: 90 - inc, a2: 92 - inc }; s.pernaLonge = { a1: 84 - inc, a2: 88 - inc };
    return { camada: 'frente', expr: 'riso', ...s };
  }
  // 4) levanta na saída (0.62 → 0.72)
  const [xf, yf] = rampa(1);
  if (u < 0.72) {
    const k = B.ease((u - 0.62) / 0.1);
    return { camada: 'frente', x: B.mix(xf - 20, xf + 50, k), y: B.mix(yf - 20 * SK, yPe, k), lean: B.mix(-8, 6, k), expr: 'riso',
      pernaPerto: { a1: B.mix(90, 6, k), a2: B.mix(92, 0, k) }, pernaLonge: { a1: B.mix(84, -4, k), a2: B.mix(88, 0, k) },
      bracoPerto: { a1: B.mix(60, 10, k), a2: B.mix(92, 20, k) }, bracoLonge: { a1: B.mix(50, -10, k), a2: B.mix(86, 6, k) } };
  }
  // 5) corre por trás do escorregador de volta para a escadinha (0.72 → 0.97), vira e espera (0.97 → 1)
  if (u < 0.97) {
    const k = (u - 0.72) / 0.25, x = B.mix(xf + 50, ESC.x0 - 20, B.ease(k)), amp = Math.sin(Math.PI * B.clamp(k)) ** 0.5;
    return { camada: 'atras', x, y: yPe - 8 * Math.abs(Math.sin(2 * Math.PI * 3 * k)) * amp, lean: 10 * amp, espelhar: true, expr: 'riso', ...corrida(3 * k, amp) };
  }
  return { camada: 'escada', x: ESC.x0 - 20, y: yPe, lean: 0, expr: 'feliz' };
}

module.exports = {
  id: 'V03', slug: 'esperar-vez-escorregador', acao: 'Esperar', contexto: 'Esperar a vez na brincadeira (fila do escorregador)',
  criar() {
    const cen = parque({ arvores: true });
    const esc = escorregador();
    const Y0 = teoLado.emPe(CHAO, ST);
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.4) * B.CICLO, tipo: 'escorrega' }, { t: (i + 0.64) * B.CICLO, tipo: 'pousa' },
        ...[0, 1, 2, 3].map(j => ({ t: (i + j * 0.25 + 0.06) * B.CICLO, tipo: 'pulinho' })),
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const c = poseCrianca(u);
        const kid = crianca({ s: SK, sombra: u >= 0.68 || u < 0.03, ...c });
        // Teo: pulinhos na ponta dos pés (4 por ciclo), punhos fechados, olhos seguindo a criança
        const pulo = Math.abs(Math.sin(2 * Math.PI * t / 1.0));          // 2 pulinhos por segundo
        const ponta = 0.5 + 0.5 * pulo;
        const cabK = [c.x, c.y - 150 * SK];
        const olho = [TX + 60 * ST, Y0 - 210 * ST];
        const dx = cabK[0] - olho[0], dy = cabK[1] - olho[1], dd = Math.hypot(dx, dy) || 1;
        const animado = u > 0.38 && u < 0.66;
        const sobe = 16 * ponta + 10 * pulo;
        const teo = teoLado({
          x: TX, y: Y0 - sobe * ST, s: ST, lean: 4, cabeca: B.clamp(-dy / dd * 25, -14, 10) - 4,
          expr: animado ? { base: 'riso', olho: 'grande', olhar: [6 * dx / dd, 6 * dy / dd] } : { base: 'feliz', sob: 'alta', olho: 'grande', olhar: [6 * dx / dd, 6 * dy / dd] },
          pernaPerto: { alvo: [9, 114.7 - 0 + sobe - 6], dobra: -1, giroPe: 24 * ponta },
          pernaLonge: { alvo: [-6, 112 + sobe - 6], dobra: -1, giroPe: 24 * ponta },
          bracoPerto: { a1: 40 + 10 * pulo, a2: 150 - 10 * pulo }, bracoLonge: { a1: 30 + 10 * pulo, a2: 140 - 10 * pulo },
          sombraY: 136 + sobe, sombraLarg: 70 - 10 * pulo,
        });
        const atras = c.camada === 'atras' ? kid.svg ?? kid : '';
        const naEscada = c.camada === 'escada' ? kid : '';
        const naFrente = c.camada === 'frente' ? kid : '';
        return B.quadro(cen.svg + (c.camada === 'atras' ? kid : '') + esc.atras + naEscada + esc.escada + esc.frente + naFrente + teo.svg);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'escorrega') S.colocar(fx, S.SOM.esfrega(0.45, 1400), e.t, 0.35);
      if (e.tipo === 'pousa') S.colocar(fx, S.SOM.pisadaFofa(), e.t, 0.5);
      if (e.tipo === 'pulinho') S.colocar(fx, S.SOM.pisadaFofa(), e.t, 0.18);
    }
    return { fx, amb: S.AMB.parque() };
  },
};
