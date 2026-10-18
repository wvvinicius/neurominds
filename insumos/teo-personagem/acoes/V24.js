// V24 — Pagar. De lado, no caixa do mercado, com a atendente (não fala).
// Cada repetição: o Teo estica o braço com a nota, a atendente pega, guarda na gaveta da caixa registradora
// ("ding!") e o Teo, contente, tira rapidinho outra nota do bolso.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { mercado, ret } = require('../lib/cenario');
const { OL, r2, limb, tracoSvg: st } = B;

const s = 1.5, X = 960;
const TOPO = 640;                                // tampo do balcão
const PELE_AT = '#C98D5E', CAB_AT = '#4A2C1E', FARDA = '#3FB5A3';

const nota = (x, y, rot = 0, k = 1) => `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${r2(k)})">
  <rect x="-40" y="-22" width="80" height="44" rx="5" fill="#8FD18A" stroke="${OL}" stroke-width="5"/>
  <rect x="-32" y="-14" width="64" height="28" rx="3" fill="none" stroke="#4E9E4A" stroke-width="3"/>
  <circle cx="0" cy="0" r="9" fill="#C9F0C4" stroke="#4E9E4A" stroke-width="3"/></g>`;

// atendente (olhando para a esquerda), atrás do balcão. Ombro da frente em OMB.
const AX = 1600, OMB0 = [1560, 470], KA_ = 1.35;
const OMB = [AX + (OMB0[0] - AX) * KA_, TOPO + (OMB0[1] - TOPO) * KA_];
function atendente(t, piscar, sorriso) {
  const hx = AX - 30, hy = 315;
  const olho = piscar ? st(`M ${hx - 52} ${hy - 6} q 10 8 20 0`, 5) : `<ellipse cx="${hx - 42}" cy="${hy - 8}" rx="8" ry="11" fill="${OL}"/><circle cx="${hx - 45}" cy="${hy - 12}" r="3" fill="#fff"/>`;
  return `<path d="M ${AX - 95} 760 L ${AX - 90} 470 Q ${AX - 60} 430 ${AX} 428 Q ${AX + 70} 432 ${AX + 92} 480 L ${AX + 100} 760 Z" fill="${FARDA}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M ${AX - 70} 520 L ${AX + 20} 520 L ${AX + 26} 760 L ${AX - 76} 760 Z" fill="#fff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="${AX - 50}" y="470" width="40" height="22" rx="4" fill="#FFC93C" stroke="${OL}" stroke-width="4"/>
    <rect x="${hx - 20}" y="${hy + 70}" width="44" height="50" fill="${PELE_AT}" stroke="${OL}" stroke-width="6"/>
    <circle cx="${hx + 40}" cy="${hy - 90}" r="40" fill="${CAB_AT}" stroke="${OL}" stroke-width="6"/>
    <ellipse cx="${hx}" cy="${hy}" rx="80" ry="88" fill="${PELE_AT}" stroke="${OL}" stroke-width="6"/>
    <path d="M ${hx - 82} ${hy - 10} Q ${hx - 80} ${hy - 96} ${hx} ${hy - 92} Q ${hx + 80} ${hy - 90} ${hx + 84} ${hy + 10} Q ${hx + 70} ${hy + 60} ${hx + 50} ${hy + 40} Q ${hx + 40} ${hy - 30} ${hx - 20} ${hy - 44} Q ${hx - 60} ${hy - 50} ${hx - 82} ${hy - 10} Z" fill="${CAB_AT}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="${hx + 34}" cy="${hy + 12}" r="15" fill="${PELE_AT}" stroke="${OL}" stroke-width="6"/>
    ${olho}${st(`M ${hx - 56} ${hy - 32} q 12 -8 24 -2`, 5)}
    <ellipse cx="${hx - 30}" cy="${hy + 26}" rx="10" ry="6" fill="#E07A6A" opacity="0.7"/>
    ${st(`M ${hx - 82} ${hy + 8} q -8 6 0 12`, 5)}
    ${sorriso ? `<path d="M ${hx - 70} ${hy + 36} Q ${hx - 50} ${hy + 46} ${hx - 34} ${hy + 36} Q ${hx - 44} ${hy + 64} ${hx - 64} ${hy + 56} Z" fill="${B.C.mouth}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>`
      : st(`M ${hx - 70} ${hy + 40} Q ${hx - 52} ${hy + 52} ${hx - 36} ${hy + 40}`, 5)}`;
}
function bracoAt(mao) {
  const E = B.ik(OMB, mao, 165, 160, -1);
  return limb([OMB, E, mao], PELE_AT, 32) + limb([OMB, B.lerp(OMB, E, 0.55)], FARDA, 50) +
    `<circle cx="${r2(mao[0])}" cy="${r2(mao[1])}" r="24" fill="${PELE_AT}" stroke="${OL}" stroke-width="6"/>`;
}
function balcao(chao) {
  return `${ret(1080, TOPO, 760, 30, '#E9EEF2')}${ret(1100, TOPO + 30, 720, chao - TOPO - 30, '#E63946')}
    ${st(`M 1100 ${TOPO + 100} L 1820 ${TOPO + 100}`, 8, '#fff')}`;
}
// caixa registradora; gaveta = 0 (fechada) .. 1 (aberta, sai para a direita, do lado da atendente)
function registradora(gaveta) {
  const gx = 1270 + 70 * gaveta;
  return `${ret(gx, TOPO - 40, 200, 40, '#7D8792', 'rx="6"')}
    ${gaveta > 0.05 ? [0, 1, 2].map(i => `<rect x="${gx + 140 + i * 18 - 70 * gaveta}" y="${TOPO - 36}" width="14" height="8" fill="#8FD18A" opacity="${r2(gaveta)}"/>`).join('') : ''}
    <circle cx="${gx + 30}" cy="${TOPO - 20}" r="7" fill="#C9D1D9" stroke="${OL}" stroke-width="3"/>
    <path d="M 1270 ${TOPO - 40} L 1290 ${TOPO - 150} L 1450 ${TOPO - 150} L 1470 ${TOPO - 40} Z" fill="#B9C3CC" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${[0, 1, 2].map(j => [0, 1, 2, 3].map(i => `<rect x="${1302 + i * 36 - j * 4}" y="${TOPO - 136 + j * 30}" width="26" height="20" rx="5" fill="${j === 2 && i === 3 ? '#5DAE5B' : '#fff'}" stroke="${OL}" stroke-width="3.5"/>`).join('')).join('')}
    ${ret(1330, TOPO - 230, 110, 66, '#2E3A44', 'rx="8"')}<rect x="1342" y="${TOPO - 218}" width="86" height="42" rx="4" fill="#7FE0A8"/>
    ${ret(1376, TOPO - 166, 18, 18, '#7D8792')}`;
}

module.exports = {
  id: 'V24', slug: 'pagar', acao: 'Pagar', contexto: 'Entregar o dinheiro no caixa',
  criar() {
    const cen = mercado();
    const Y = teoLado.emPe(cen.chao, s);
    const loc = q => [(q[0] - X) / s, (q[1] - Y) / s];
    const PEITO = [34, -70], BOLSO = [22, 22], LADO = [10, 4];
    const ENTREGA = loc([1150, 586]);
    // mão do Teo (local) e da atendente (cena)
    const KT = [[0, PEITO], [0.08, PEITO], [0.3, ENTREGA], [0.42, ENTREGA], [0.56, LADO], [0.72, LADO], [0.82, BOLSO], [0.86, BOLSO], [0.97, PEITO], [1, PEITO]];
    const REP = [1500, 628], PEGA = [1192, 580], GAV = [1520, 590];
    const KA = [[0, REP], [0.2, REP], [0.36, PEGA], [0.42, PEGA], [0.54, GAV], [0.62, GAV], [0.76, REP], [1, REP]];
    return {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + 0.4) * B.CICLO, tipo: 'pega' }, { t: (i + 0.5) * B.CICLO, tipo: 'abre' },
        { t: (i + 0.63) * B.CICLO, tipo: 'ding' }, { t: (i + 0.84) * B.CICLO, tipo: 'bolso' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const maoT = B.kf(KT, u), maoA = B.kf(KA, u);
        const gaveta = B.kf([[0, 0], [0.46, 0], [0.52, 1], [0.6, 1], [0.64, 0], [1, 0]], u);
        const notaTeo = u < 0.41 || u >= 0.84;           // a nota está na mão do Teo
        const notaAt = u >= 0.41 && u < 0.6;             // na mão da atendente
        const estica = B.kf([[0, 0], [0.08, 0], [0.3, 1], [0.42, 1], [0.56, 0], [1, 0]], u);
        const ding = B.bump(u, 0.62, 0.8);
        const teo = teoLado({
          x: X, y: Y, s, lean: 4 + 10 * estica + 6 * B.bump(u, 0.78, 0.9),
          pernaPerto: { alvo: [8 + 12 * estica, 114.7], dobra: -1 }, pernaLonge: { alvo: [-12, 111.7], dobra: -1 },
          bracoPerto: { alvo: maoT, dobra: 1 }, bracoLonge: { a1: -10, a2: 6 },
          expr: ding > 0.2 ? 'riso' : u > 0.78 && u < 0.92 ? { base: 'feliz', olhar: [2, 8] } : 'feliz', piscar: B.piscando(t),
          cabeca: u > 0.78 && u < 0.92 ? 8 : 0,
          itensFrente: i => notaTeo ? nota(i.maoPerto[0] + 16, i.maoPerto[1] - 8, i.antebracoPerto - 20, 1 / s * 1.2) + `<circle cx="${r2(i.maoPerto[0])}" cy="${r2(i.maoPerto[1])}" r="15" fill="${B.C.skin}" stroke="${OL}" stroke-width="6"/>` : '',
        });
        // notinha na mão da atendente ou caindo na gaveta
        const notaA = notaAt ? nota(maoA[0] - 22, maoA[1] - 6, -10 + 40 * B.clamp((u - 0.46) / 0.08), 1.2) : '';
        // brilhinho do "ding"
        const brilho = ding > 0.02 ? [[-60, -40], [60, -50], [0, -80]].map(([dx, dy], j) => `<path transform="translate(${1385 + dx} ${TOPO - 250 + dy - 30 * ding}) scale(${r2(1.7 * ding * (0.9 + 0.2 * j))})" d="M 0 -18 Q 3 -3 18 0 Q 3 3 0 18 Q -3 3 -18 0 Q -3 -3 0 -18 Z" fill="#FFE066" stroke="${OL}" stroke-width="3"/>`).join('') : '';
        return B.quadro(cen.svg + `<g transform="translate(${AX} ${TOPO}) scale(${KA_}) translate(${-AX} ${-TOPO})">${atendente(t, B.piscando(t + 0.6), ding > 0.1 || (u > 0.36 && u < 0.46))}</g>` + balcao(cen.chao) + registradora(gaveta) + notaA + bracoAt(maoA) + teo.svg + brilho);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'pega') S.colocar(fx, S.SOM.papel(0.18), e.t, 0.3);
      if (e.tipo === 'abre') S.colocar(fx, S.SOM.clique(), e.t, 0.4);
      if (e.tipo === 'ding') S.colocar(fx, S.SOM.caixaRegistradora(), e.t, 0.5);
      if (e.tipo === 'bolso') S.colocar(fx, S.SOM.papel(0.22), e.t, 0.25);
    }
    return { fx, amb: S.AMB.mercado() };
  },
};
