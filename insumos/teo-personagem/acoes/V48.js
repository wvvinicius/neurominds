// V48 — Beber água no copo. De lado, na cozinha.
// Cada repetição: leva o copo à boca, inclina a cabeça para trás e dá três goles; abaixa o copo
// e faz cara de satisfeito ("aaah!"). O copo é opaco, então não precisa encher de novo.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { cozinha } = require('../lib/cenario');
const { OL, r2, tracoSvg: st } = B;

const s = 1.55, X = 860;
const GOLES = [0.36, 0.46, 0.56];

// copo com centro em (0,0), altura 70; tilt em graus
function copo(cx, cy, tilt) {
  return `<g transform="translate(${r2(cx)} ${r2(cy)}) rotate(${r2(tilt)}) scale(1.3)">
    <path d="M -24 -36 L 24 -36 L 18 34 Q 0 40 -18 34 Z" fill="#2F9BE0" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="0" cy="-36" rx="24" ry="6" fill="#7CC8FF" stroke="${OL}" stroke-width="5"/>
    ${st('M -12 -22 L -10 22', 6, '#9ED8FF')}
    <circle cx="6" cy="6" r="7" fill="#FFE066" stroke="${OL}" stroke-width="3"/></g>`;
}

module.exports = {
  id: 'V48', slug: 'beber-agua', acao: 'Beber', contexto: 'Beber água no copo',
  criar() {
    const cen = cozinha();
    const Y = teoLado.emPe(cen.chao, s);
    const REPOUSO = [52, -52];
    return {
      eventos: [0, 1, 2].flatMap(i => [...GOLES.map(g => ({ t: (i + g) * B.CICLO, tipo: 'gole' })), { t: (i + 0.7) * B.CICLO, tipo: 'ah' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const leva = B.kf([[0, 0], [0.1, 0], [0.28, 1], [0.64, 1], [0.76, 0], [1, 0]], u);
        const bebendo = B.kf([[0, 0], [0.26, 0], [0.34, 1], [0.6, 1], [0.66, 0], [1, 0]], u);
        const gole = GOLES.reduce((a, g) => a + B.bump(u, g - 0.03, g + 0.04), 0);
        const lean = -4 - 6 * bebendo;
        const cabeca = -6 * leva - 12 * bebendo - 3 * gole;
        const satisfeito = u > 0.68 && u < 0.97;
        const ah = u > 0.68 && u < 0.8;
        const base = { x: X, y: Y, s, lean, cabeca };
        const boca = teoLado(base).info.boca;
        const tilt = -10 * leva - 55 * bebendo - 4 * gole;
        const up = [Math.sin(B.rad(tilt)), -Math.cos(B.rad(tilt))];
        const centroBoca = [boca[0] + 6 - up[0] * 46, boca[1] + 2 - up[1] * 46];
        const centro = B.lerp([REPOUSO[0] + 8, REPOUSO[1] - 6], centroBoca, leva);
        const mao = [centro[0] - 8 + 6 * leva, centro[1] + 6];
        const teo = teoLado({
          ...base,
          pernaPerto: { alvo: [8, 114.7], dobra: -1 }, pernaLonge: { alvo: [-14, 111.7], dobra: -1 },
          bracoPerto: { alvo: mao, dobra: 1 },
          bracoLonge: satisfeito ? { alvo: [44, -40 + 6 * B.onda(t, 0.25)], dobra: 1 } : { a1: -12, a2: 6 },
          expr: bebendo > 0.5 ? { base: 'calmo', olho: 'fechado', boca: 'fechada', blush: true }
            : ah ? { base: 'orgulho', olho: 'fechado', boca: 'o' } : satisfeito ? { base: 'orgulho', olho: 'feliz' } : 'feliz',
          piscar: B.piscando(t),
          itensMeio: copo(centro[0], centro[1], tilt),
        });
        // brilho de satisfação
        let extra = '';
        const sat = B.bump(u, 0.68, 0.95);
        if (sat > 0.02) {
          const c = teo.info.aCena(teo.info.daCabeca([0, -40]));
          extra += [[120, -80], [150, 20], [-60, -190]].map(([dx, dy], j) => `<path transform="translate(${r2(c[0] + dx)} ${r2(c[1] + dy - 20 * sat)}) scale(${r2(sat * 1.6 * (0.8 + 0.2 * j))})" d="M 0 -18 Q 3 -3 18 0 Q 3 3 0 18 Q -3 3 -18 0 Q -3 -3 0 -18 Z" fill="#FFE066" stroke="${OL}" stroke-width="3"/>`).join('');
        }
        return B.quadro(cen.svg + teo.svg + extra);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'gole') S.colocar(fx, S.SOM.gole(), e.t, 0.6);
      if (e.tipo === 'ah') { S.colocar(fx, S.SOM.ding(1568), e.t, 0.12); S.colocar(fx, S.SOM.ding(2093), e.t + 0.1, 0.08); }
    }
    return { fx, amb: S.AMB.casa() };
  },
};
