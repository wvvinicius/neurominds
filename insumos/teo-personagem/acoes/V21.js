// V21 — Nadar no mar. De lado, nadando crawl no lugar entre ondinhas que passam.
// Uma ondinha passa por ciclo (2 s): o Teo sobe e desce com ela, sem parar de nadar.
const B = require('../lib/base');
const { praia } = require('../lib/cenario');
const { nadador, entradasMao, respingos } = require('./obj-lote3');
const { OL, W, H, r2, tracoSvg: st } = B;

const X = 860, S = 1.8, SUP = 790, DY = 52, P = 1;   // DY = quadril abaixo da linha da água
const LAMBDA = 960, T_ONDA = 2, A = 44;              // ondinha: comprimento, período (1 por ciclo) e altura
// superfície do mar em x no instante t (a onda anda para a esquerda, contra o nado)
const onda = (x, t) => SUP - A * Math.cos(2 * Math.PI * (x / LAMBDA + t / T_ONDA))
  - 7 * Math.cos(2 * Math.PI * (x / 240 + t / 1));
const inclin = (x, t) => B.deg(Math.atan((onda(x + 40, t) - onda(x - 40, t)) / 80));

function pose(t) {
  const yAgua = onda(X + 120, t);
  const o = { x: X, y: yAgua + DY, s: S, oculos: false, molhado: false, dLean: -0.4 * inclin(X + 60, t),
    expr: (u) => (u > 0.1 && u < 0.4 ? { base: 'riso' } : { base: 'feliz', olho: 'feliz', boca: 'riso' }) };
  // a boca fica sempre acima da água: se a onda passar dela, o Teo sobe junto
  const b = nadador(t, o).teo.info;
  const boca = b.aCena(b.boca);
  o.y -= Math.max(0, boca[1] - (onda(boca[0], t) - 34));
  return nadador(t, o);
}

function mar(t, y0, cor, opac) {
  let d = `M -20 ${H + 20} L -20 ${r2(onda(-20, t) + y0)}`;
  for (let x = 0; x <= W + 20; x += 20) d += ` L ${x} ${r2(onda(x, t) + y0)}`;
  return `<path d="${d} L ${W + 20} ${H + 20} Z" fill="${cor}" opacity="${opac}"/>`;
}
function linhaOnda(t) {
  let d = `M -20 ${r2(onda(-20, t))}`;
  for (let x = 0; x <= W + 20; x += 20) d += ` L ${x} ${r2(onda(x, t))}`;
  // espuminha nas cristas (onde a onda está mais alta)
  let espuma = '';
  for (let k = -1; k < 3; k++) {
    const xc = LAMBDA * (k - t / T_ONDA);
    if (xc < -100 || xc > W + 100) continue;
    const y = onda(xc, t);
    const perto = B.clamp(Math.abs(xc - (X + 120)) / 260 - 0.6, 0, 1);   // some ao passar pelo Teo
    if (perto <= 0) continue;
    espuma += `<g transform="translate(${r2(xc - 30)} ${r2(y - 4)}) scale(${r2(perto)})" opacity="${r2(perto)}"><path d="M -120 14 Q -60 -10 -10 -34 Q 40 -50 62 -20 Q 40 -36 20 -18 Q 30 -4 46 -6 Q 20 14 -30 14 Z" fill="#fff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/></g>`;
  }
  return st(d, 7, '#E8F8FF') + espuma;
}
// ondinhas ao fundo, em faixas, correndo para a esquerda (loop em 6 s)
function ondasFundo(t) {
  let d = '';
  [[600, 120, 300], [680, 160, 360]].forEach(([y, vel, passo], j) => {
    const off = -((t * vel) % passo);
    for (let i = -1; i < W / passo + 2; i++) d += `M ${r2(off + i * passo + j * 90)} ${y + (i % 2) * 22} q 30 -14 60 0 `;
  });
  return st(d, 6, '#E8F8FF');
}

module.exports = {
  id: 'V21', slug: 'nadar-mar', acao: 'Nadar', contexto: 'Nadar no mar',
  criar() {
    const cen = praia();
    const ev = [];
    for (const e of entradasMao(P, 0.0)) {
      const { teo } = pose(e.t0);
      const m = teo.info.aCena(e.lado === 'perto' ? teo.info.maoPerto : teo.info.maoLonge);
      ev.push({ t0: e.t0, x: m[0], y: onda(m[0], e.t0), n: 7, forca: 0.8, coroa: true, tipo: 'mao' });
    }
    for (let k = -8; k < 48; k++) {
      const t0 = k * 0.125, { teo } = pose(t0);
      const p = teo.info.aCena(k % 2 ? teo.info.pePerto : teo.info.peLonge);
      ev.push({ t0, x: p[0] - 20, y: onda(p[0] - 20, t0), n: 4, forca: 0.6, vx: -120, tipo: 'pe' });
    }
    return {
      eventos: ev.filter(e => e.t0 >= 0 && e.t0 < B.DURACAO).map(e => ({ t: e.t0, tipo: e.tipo }))
        .concat([0, 1, 2].map(i => ({ t: (i + 0.25) * B.CICLO, tipo: 'onda' }))),
      frame(f) {
        const { t } = B.tempo(f);
        const { teo } = pose(t);
        return B.quadro(cen.svg + ondasFundo(t) + mar(t, 30, '#3FA9E0', 1) + teo.svg + mar(t, 0, '#2E9AD6', 0.55) + linhaOnda(t) +
          respingos(ev, t, x => onda(x, t)));
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'mao') S.colocar(fx, S.SOM.splash(0.8), e.t, 0.5);
      if (e.tipo === 'pe') S.colocar(fx, S.SOM.splash(0.3), e.t, 0.1);
      if (e.tipo === 'onda') S.colocar(fx, S.SOM.vush(1.0), e.t, 0.12);
    }
    return { fx, amb: S.AMB.mar() };
  },
};
