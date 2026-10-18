// V47 — Comer. De frente, sentado à mesa da cozinha, com prato de comida.
// Cada repetição: enche a colher no prato, leva à boca (abre bem), fecha e mastiga feliz.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { cozinha } = require('../lib/cenario');
const { mesaFrente, encostoFrente, bracoFrente, naCenaFrente } = require('./obj-lote4');
const { OL, r2, tracoSvg: st } = B;

const s = 1.5, X = 960;
const PRATO = [960, 612];

function prato() {
  const [x, y] = PRATO;
  return `<ellipse cx="${x}" cy="${y + 8}" rx="150" ry="36" fill="#000" opacity="0.08"/>
    <ellipse cx="${x}" cy="${y}" rx="150" ry="38" fill="#fff" stroke="${OL}" stroke-width="6"/>
    <ellipse cx="${x}" cy="${y - 2}" rx="100" ry="22" fill="#EEF3F6" stroke="#C9D3DA" stroke-width="4"/>
    <path d="M ${x - 86} ${y - 2} Q ${x - 60} ${y - 40} ${x - 10} ${y - 30} Q ${x + 6} ${y - 10} ${x - 6} ${y + 10} Q ${x - 60} ${y + 14} ${x - 86} ${y - 2} Z" fill="#FFFDF5" stroke="${OL}" stroke-width="5"/>
    ${[[-60, -12], [-40, -22], [-30, -6], [-54, 2], [-20, -18]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="5" ry="3" fill="#E9E2CF"/>`).join('')}
    <path d="M ${x - 4} ${y + 8} Q ${x + 10} ${y - 30} ${x + 50} ${y - 26} Q ${x + 90} ${y - 16} ${x + 84} ${y + 4} Q ${x + 40} ${y + 16} ${x - 4} ${y + 8} Z" fill="#7A4A2A" stroke="${OL}" stroke-width="5"/>
    ${[[20, -10], [44, -16], [62, -6], [36, 0]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="6" ry="4" fill="#5A3218"/>`).join('')}
    ${[[-70, 10], [70, 12], [92, -8]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="7" fill="#6CC04A" stroke="${OL}" stroke-width="3"/>`).join('')}`;
}
// colher em coordenadas locais do Teo: ponta (concha) em T, cabo até a mão H
function colher(T, H, comida) {
  const ang = B.angulo(H, T);
  return `${st(`M ${r2(H[0])} ${r2(H[1])} L ${r2(T[0])} ${r2(T[1])}`, 13)}${st(`M ${r2(H[0])} ${r2(H[1])} L ${r2(T[0])} ${r2(T[1])}`, 6, '#C9D1D9')}
    <g transform="translate(${r2(T[0])} ${r2(T[1])}) rotate(${r2(ang)})">
      <ellipse cx="2" cy="0" rx="14" ry="9" fill="#C9D1D9" stroke="${OL}" stroke-width="4"/>
      ${comida ? `<ellipse cx="2" cy="-4" rx="11" ry="8" fill="#FFFDF5" stroke="${OL}" stroke-width="3"/><circle cx="6" cy="-6" r="3" fill="#7A4A2A"/>` : ''}</g>`;
}

module.exports = {
  id: 'V47', slug: 'comer', acao: 'Comer', contexto: 'Comer (colherada no prato)',
  criar() {
    const cen = cozinha();
    const Y = teoFrente.emPe(cen.chao, s);
    const mesa = mesaFrente({ x: X, topo: 650, w: 900, prof: 70, toalha: { cor: '#FFFFFF', cor2: '#F7B2B2', altura: 175 } });
    const loc = q => [(q[0] - X) / s, (q[1] - Y) / s];
    const PR = loc(PRATO);
    // ponta da colher (T) e vetor ponta→mão (D), em local
    const BOCA = [0, -214];
    const KT = [[0, [PR[0] + 34, PR[1] - 10]], [0.08, [PR[0] + 34, PR[1] - 10]], [0.16, [PR[0] - 30, PR[1] - 2]], [0.22, [PR[0] - 40, PR[1] - 10]],
      [0.4, BOCA], [0.46, BOCA], [0.58, [PR[0] + 34, PR[1] - 10]], [1, [PR[0] + 34, PR[1] - 10]]];
    const KD = [[0, [52, -6]], [0.08, [52, -6]], [0.22, [50, 4]], [0.4, [40, 40]], [0.46, [40, 40]], [0.58, [52, -6]], [1, [52, -6]]];
    return {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + 0.17) * B.CICLO, tipo: 'raspa' }, { t: (i + 0.44) * B.CICLO, tipo: 'nhac' },
        ...[0, 1, 2, 3, 4, 5].map(k => ({ t: (i + 0.52) * B.CICLO + k * 0.125, tipo: 'mastiga' }))]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const T = B.kf(KT, u), D = B.kf(KD, u), H = B.add(T, D);
        const comida = u >= 0.2 && u < 0.45;
        const abre = u > 0.3 && u < 0.44;
        const mastiga = u >= 0.48 && u < 0.92;
        const leva = B.bump(u, 0.22, 0.58);
        const expr = abre ? { base: 'cantando', olho: 'aberto', olhar: [0, 6], blush: true }
          : mastiga ? ((t / 0.25) % 1 < 0.5 ? { base: 'mastigando', boca: 'fechada' } : 'mastigando')
            : u >= 0.44 && u < 0.48 ? { base: 'mastigando', olho: 'feliz' } : { base: 'feliz', olhar: [0, 6] };
        const p = {
          x: X, y: Y, s, lean: 0, cabeca: mastiga ? 4 * B.onda(t, 0.5) : -3 * leva,
          bracoDir: { alvo: H, dobra: 1 }, bracoEsq: { alvo: [-92, -56], dobra: -1 },
          expr, fase: t / 0.25, piscar: !abre && B.piscando(t),
        };
        const teo = teoFrente(p);
        const i = teo.info;
        const bracos = bracoFrente(i.ombroEsq, i.cotoveloEsq, i.maoEsq) + colher(T, H, comida) + bracoFrente(i.ombroDir, i.cotoveloDir, i.maoDir);
        // estrelinhas de "que delícia" enquanto mastiga
        let brilho = '';
        const a = B.bump(u, 0.55, 0.9);
        if (a > 0.02) brilho = [[-150, -300], [150, -320]].map(([dx, dy], j) => {
          const q = i.aCena([dx, dy - 20 * a]);
          return `<path transform="translate(${r2(q[0])} ${r2(q[1])}) scale(${r2(a * 1.8)}) rotate(${r2(20 * B.onda(t, 1, j * 0.3))})" d="M 0 -18 Q 3 -3 18 0 Q 3 3 0 18 Q -3 3 -18 0 Q -3 -3 0 -18 Z" fill="#FFE066" stroke="${OL}" stroke-width="3"/>`;
        }).join('');
        return B.quadro(cen.svg + encostoFrente(X, 430, 300, 260) + teo.svg + mesa.tampo + mesa.frente + prato() + naCenaFrente(p, bracos) + brilho);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'raspa') S.colocar(fx, S.SOM.toc(), e.t, 0.35);
      if (e.tipo === 'nhac') S.colocar(fx, S.SOM.plop(), e.t, 0.4);
      if (e.tipo === 'mastiga') S.colocar(fx, S.SOM.pisadaFofa(), e.t, 0.18);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
