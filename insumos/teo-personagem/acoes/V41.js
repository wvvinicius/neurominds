// V41 — Jogar um jogo: dado no tabuleiro. De frente, sentado à mesa da sala.
// Cada repetição: sacode o dado na mão, joga, o dado rola e quica no tabuleiro e cai no 6;
// o Teo comemora com os braços para cima e, rapidinho, pega o dado de volta.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { sala } = require('../lib/cenario');
const { mesaFrente, encostoFrente, bracoFrente, naCenaFrente } = require('./obj-lote4');
const { OL, r2 } = B;

const s = 1.5, X = 960, TOPO = 650;
const POUSO = [868, 606];                  // onde o dado para (cena)
const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
function dado(x, y, tam, rot, face) {
  const h = tam / 2, p = tam * 0.27;
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})">
    <rect x="${-h}" y="${-h}" width="${tam}" height="${tam}" rx="${tam * 0.2}" fill="#fff" stroke="${OL}" stroke-width="5"/>
    ${PIPS[face].map(([a, b]) => `<circle cx="${r2(a * p)}" cy="${r2(b * p)}" r="${r2(tam * 0.09)}" fill="${face === 6 ? '#E63946' : OL}"/>`).join('')}</g>`;
}
function tabuleiro(fundo) {
  // tabuleiro deitado na mesa (trapézio), com trilha de casinhas coloridas
  const f = TOPO - 8, b = fundo + 10, xf0 = 700, xf1 = 1220, xb0 = 740, xb1 = 1180;
  const cores = ['#E63946', '#FFC93C', '#2F6BDB', '#5DAE5B', '#B565D9', '#F28C28'];
  let casas = '';
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = i / n, c = (i + 1) / n;
    const P = (k, v) => [B.mix(B.mix(xb0, xf0, v), B.mix(xb1, xf1, v), k), B.mix(b, f, v)];
    for (const [v0, v1] of [[0.1, 0.4], [0.6, 0.9]]) {
      const pts = [P(a, v0), P(c, v0), P(c, v1), P(a, v1)].map(q => q.map(r2).join(' ')).join(' L ');
      casas += `<path d="M ${pts} Z" fill="${cores[(i + (v0 > 0.5 ? 3 : 0)) % 6]}" stroke="${OL}" stroke-width="3"/>`;
    }
  }
  return `<path d="M ${xf0} ${f} L ${xb0} ${b} L ${xb1} ${b} L ${xf1} ${f} Z" fill="#FFF4D6" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>${casas}`;
}
const peao = (x, y, cor) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="20" ry="7" fill="${cor}" stroke="${OL}" stroke-width="4"/>
  <path d="M -14 -2 L -8 -34 L 8 -34 L 14 -2 Z" fill="${cor}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><circle cx="0" cy="-42" r="12" fill="${cor}" stroke="${OL}" stroke-width="4"/></g>`;

module.exports = {
  id: 'V41', slug: 'jogar-dado', acao: 'Jogar', contexto: 'Jogar um jogo (jogar o dado no tabuleiro)',
  criar() {
    const cen = sala({ janela: true, quadro: true });
    const Y = teoFrente.emPe(cen.chao, s);
    const mesa = mesaFrente({ x: X, topo: TOPO, w: 900, prof: 70, toalha: { cor: '#7CC8FF', cor2: null, altura: 175 } });
    const loc = q => [(q[0] - X) / s, (q[1] - Y) / s];
    const SACODE = [62, -118], SOLTA = [16, -74], PEGA = loc([POUSO[0] + 4, POUSO[1] - 6]);
    const KD = [[0, SACODE], [0.3, SACODE], [0.36, SOLTA], [0.44, [70, -60]], [0.58, [92, -60]], [0.6, [150, -200]], [0.84, [150, -200]], [0.9, PEGA], [0.93, PEGA], [1, SACODE]];
    const KE = [[0, [-96, -58]], [0.58, [-96, -58]], [0.6, [-150, -200]], [0.84, [-150, -200]], [0.9, [-96, -58]], [1, [-96, -58]]];
    const T0 = 0.36, T1 = 0.6;                    // o dado voa/rola entre T0 e T1
    return {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + 0.06) * B.CICLO, tipo: 'sacode' }, { t: (i + 0.44) * B.CICLO, tipo: 'dado' }, { t: (i + 0.62) * B.CICLO, tipo: 'oba' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const sacode = u > 0.04 && u < 0.32 ? Math.sin(2 * Math.PI * t / 0.125) : 0;
        let maoD = B.kf(KD, u);
        maoD = [maoD[0] + 4 * sacode, maoD[1] - 12 * Math.abs(sacode)];
        const maoE = B.kf(KE, u);
        const festa = B.kf([[0, 0], [0.58, 0], [0.62, 1], [0.82, 1], [0.88, 0], [1, 0]], u);
        const pulo = festa * Math.abs(B.onda(t, 0.25)) * 10;
        const naMao = u < T0 || u >= 0.91;
        const p = {
          x: X, y: Y - pulo, s, lean: 0, cabeca: festa ? 4 * B.onda(t, 0.5) : (u > 0.34 && u < 0.6 ? -4 : 0),
          bracoDir: { alvo: maoD, dobra: 1 }, bracoEsq: { alvo: maoE, dobra: -1 },
          expr: festa > 0.3 ? 'riso' : u > 0.3 && u < 0.6 ? { base: 'surpreso', olhar: [-8, 8] } : u < 0.3 ? { base: 'concentrado', olhar: [6, 4] } : { base: 'feliz', olhar: [-6, 8] },
          piscar: festa < 0.3 && B.piscando(t),
        };
        const teo = teoFrente(p);
        const i = teo.info;
        // dado: na mão, voando/rolando ou parado no tabuleiro
        let dadoMesa = '', dadoMao = '';
        if (naMao) {
          const h = i.maoDir;
          dadoMao = dado(h[0] - 14, h[1] - 12, 30, 12 * sacode + 10, 3) + `<circle cx="${r2(h[0])}" cy="${r2(h[1])}" r="16" fill="${B.C.skin}" stroke="${OL}" stroke-width="6"/>`;
        } else if (u < T1) {
          const k = (u - T0) / (T1 - T0);
          const ini = i.aCena([SOLTA[0] - 14, SOLTA[1] - 12]);
          const x = B.mix(ini[0], POUSO[0], 1 - (1 - k) ** 2);
          // quiques cada vez menores até parar
          const base = B.mix(ini[1], POUSO[1], Math.min(1, k * 3));
          const q = k < 0.35 ? 70 * Math.sin(Math.PI * k / 0.35) : k < 0.65 ? 34 * Math.sin(Math.PI * (k - 0.35) / 0.3) : k < 0.85 ? 12 * Math.sin(Math.PI * (k - 0.65) / 0.2) : 0;
          const rot = -720 * (1 - (1 - k) ** 2);
          const face = k > 0.85 ? 6 : [2, 5, 1, 4, 3, 6][Math.floor(k * 18) % 6];
          dadoMesa = dado(x, base - q, 45, rot, face);
        } else if (u < 0.91) dadoMesa = dado(POUSO[0], POUSO[1], 45, -720, 6);
        // brilhos em volta do 6
        let brilho = '';
        const a = B.bump(u, 0.6, 0.88);
        if (a > 0.02) brilho = [[-60, -40], [56, -50], [0, -78]].map(([dx, dy], j) => `<path transform="translate(${POUSO[0] + dx} ${POUSO[1] + dy}) scale(${r2(a * 1.5 * (0.8 + 0.2 * j))})" d="M 0 -18 Q 3 -3 18 0 Q 3 3 0 18 Q -3 3 -18 0 Q -3 -3 0 -18 Z" fill="#FFE066" stroke="${OL}" stroke-width="3"/>`).join('');
        const bracos = naCenaFrente(p, bracoFrente(i.ombroEsq, i.cotoveloEsq, i.maoEsq) + bracoFrente(i.ombroDir, i.cotoveloDir, i.maoDir) + dadoMao);
        return B.quadro(cen.svg + encostoFrente(X, 430, 300, 260, '#5DAE5B') + teo.svg + mesa.tampo + tabuleiro(mesa.fundo) + mesa.frente
          + peao(1090, 604, '#2F6BDB') + peao(1150, 620, '#E63946') + dadoMesa + brilho + bracos);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'sacode') for (let k = 0; k < 9; k++) S.colocar(fx, S.SOM.clique(), e.t + k * 0.0625, 0.3);
      if (e.tipo === 'dado') S.colocar(fx, S.SOM.dado(), e.t - 0.08, 0.6);
      if (e.tipo === 'oba') { S.colocar(fx, S.SOM.nota('do2', 0.15), e.t, 0.3); S.colocar(fx, S.SOM.nota('mi2', 0.15), e.t + 0.1, 0.3); S.colocar(fx, S.SOM.nota('sol2', 0.3), e.t + 0.2, 0.3); }
    }
    return { fx, amb: S.AMB.casa() };
  },
};
