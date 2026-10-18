// V20 — Nadar na piscina. De lado, com óculos de natação, nadando crawl no lugar.
// A raia e as marolinhas passam para trás (dá a sensação de avançar com a câmera fixa).
// Cada repetição (2 s): duas braçadas de cada braço, pernada sem parar e uma respirada de lado.
const B = require('../lib/base');
const { piscinaFundo } = require('../lib/cenario');
const { nadador, entradasMao, respingos } = require('./obj-lote3');
const { OL, W, H, r2, tracoSvg: st } = B;

const X = 820, Y = 838, S = 1.8, SUP = 780, P = 1;   // P = segundos por braçada completa

function raia(t, y) {
  // boias da raia correndo para a esquerda (120 px a cada 2 s → loop)
  const off = -((t * 60) % 120);
  let svg = st(`M 0 ${y} L ${W} ${y}`, 6, '#fff');
  for (let x = off - 120; x < W + 120; x += 60) {
    const c = Math.round((x - off) / 60) % 2 ? '#E63946' : '#fff';
    svg += `<ellipse cx="${r2(x)}" cy="${y}" rx="26" ry="15" fill="${c}" stroke="${OL}" stroke-width="5"/>`;
  }
  return svg;
}
function marolas(t, y0, vel, passo = 300) {
  const off = -((t * vel) % passo);
  let d = '';
  for (let i = -1; i < W / passo + 2; i++) d += `M ${r2(off + i * passo)} ${y0 + (i % 2) * 40} q 30 -14 60 0 `;
  return st(d, 6, '#E8F8FF');
}

module.exports = {
  id: 'V20', slug: 'nadar-piscina', acao: 'Nadar', contexto: 'Nadar na piscina',
  criar() {
    const cen = piscinaFundo();
    // respingos: mão entrando na água (2 por segundo) e pés batendo (8 por segundo, pequenos)
    const ev = [];
    for (const e of entradasMao(P, 0.0)) {
      const { teo } = nadador(e.t0, { x: X, y: Y, s: S });
      const m = teo.info.aCena(e.lado === 'perto' ? teo.info.maoPerto : teo.info.maoLonge);
      ev.push({ t0: e.t0, x: m[0], y: SUP, n: 7, forca: 0.8, coroa: true, anel: true, tipo: 'mao' });
    }
    for (let k = -8; k < 48; k++) {
      const t0 = k * 0.125;
      const { teo } = nadador(t0, { x: X, y: Y, s: S });
      const p = teo.info.aCena(k % 2 ? teo.info.pePerto : teo.info.peLonge);
      ev.push({ t0, x: p[0] - 20, y: SUP, n: 4, forca: 0.6, vx: -120, tipo: 'pe' });
    }
    const agua = `<rect x="0" y="${SUP}" width="${W}" height="${H - SUP}" fill="#3FAEE6" opacity="0.45"/>`;
    return {
      eventos: ev.filter(e => e.t0 >= 0 && e.t0 < B.DURACAO).map(e => ({ t: e.t0, tipo: e.tipo })).concat(
        [0, 1, 2].map(i => ({ t: (i + 0.62) * B.CICLO, tipo: 'respira' }))),
      frame(f) {
        const { t } = B.tempo(f);
        const { teo } = nadador(t, { x: X, y: Y, s: S, respA: 0.55, respB: 0.85 });
        const sup = `<g transform="translate(${r2(-((t * 80) % 160))} 0)">${st(`M -160 ${SUP} ${Array.from({ length: 16 }, (_, i) => `q 40 ${i % 2 ? 7 : -7} 80 0`).join(' ')}`, 6, '#E8F8FF')}</g>`;
        return B.quadro(cen.svg + marolas(t, 640, 60) + raia(t, 668) + teo.svg + agua + sup + marolas(t, 900, 80, 360) +
          respingos(ev, t, SUP));
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'mao') S.colocar(fx, S.SOM.splash(0.8), e.t, 0.5);
      if (e.tipo === 'pe') S.colocar(fx, S.SOM.splash(0.3), e.t, 0.12);
      if (e.tipo === 'respira') S.colocar(fx, S.SOM.vush(0.3), e.t, 0.18);
    }
    return { fx, amb: S.AMB.piscina() };
  },
};
