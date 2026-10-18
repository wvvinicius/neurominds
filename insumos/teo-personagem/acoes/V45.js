// V45 — Encaixar uma peça de quebra-cabeça. De lado, sentado numa cadeira diante da mesinha, no quarto.
// Cada repetição: olha a peça, gira na mão até achar o jeito certo, encaixa no tabuleiro ("clique" + brilho)
// e comemora pequeno (punho para cima, pezinhos balançando); na volta rápida tira a peça e volta à pose inicial.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { quarto, OBJ, ret } = require('../lib/cenario');
const { brilho } = require('./obj-lote2');
const { OL, r2, tracoSvg: st } = B;

const PECA = 'M -30 -30 L -10 -30 C -16 -48 16 -48 10 -30 L 30 -30 L 30 -10 C 48 -16 48 16 30 10 L 30 30 L -30 30 Z';
const COR_PECA = '#FFC93C';
const ACH = 0.5;                       // achatamento do tampo (visto um pouco de cima)
const MESA = { x0: 930, x1: 1480, frente: 615, fundo: 615 - 230 * ACH, chao: 900 };
const TAB = { x: 1110, y: 556, cel: 92 };   // centro do tabuleiro (cena) e tamanho da célula
// célula vazia (onde a peça entra): canto superior direito
const BURACO = [TAB.x + TAB.cel / 2, TAB.y - TAB.cel / 2 * ACH];

function mesa() {
  const { x0, x1, frente, fundo, chao } = MESA, cor = '#C8915A';
  return `${ret(x0 + 30, frente, 26, chao - frente, cor)}${ret(x1 - 60, frente, 26, chao - frente, cor)}
    <path d="M ${x0} ${frente} L ${x1} ${frente} L ${x1} ${fundo} L ${x0} ${fundo} Z" fill="#E0AC72" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${ret(x0, frente, x1 - x0, 24, cor)}`;
}
function tabuleiro() {
  const c = TAB.cel;
  const cel = (i, j, cor, desenho) => `<g transform="translate(${(i - 0.5) * c} ${(j - 0.5) * c})"><rect x="${-c / 2}" y="${-c / 2}" width="${c}" height="${c}" fill="${cor}" stroke="${OL}" stroke-width="4"/>${desenho}</g>`;
  const inner = `<rect x="${-c - 12}" y="${-c - 12}" width="${2 * c + 24}" height="${2 * c + 24}" rx="8" fill="#9C6B3F" stroke="${OL}" stroke-width="6"/>
    ${cel(0, 0, '#7CC8FF', `<path d="M -22 14 Q 0 -30 22 14 Z" fill="#fff" stroke="${OL}" stroke-width="3"/>`)}
    ${cel(0, 1, '#67BF4A', `<circle cx="0" cy="0" r="12" fill="#E63946" stroke="${OL}" stroke-width="3"/>`)}
    ${cel(1, 1, '#67BF4A', `<circle cx="0" cy="0" r="12" fill="#B565D9" stroke="${OL}" stroke-width="3"/>`)}
    <g transform="translate(${c / 2} ${-c / 2})"><rect x="${-c / 2}" y="${-c / 2}" width="${c}" height="${c}" fill="#5A3B22"/>
      <path d="${PECA}" transform="scale(${c / 64})" fill="#3E2A18" stroke="${OL}" stroke-width="4"/></g>`;
  return `<g transform="translate(${TAB.x} ${TAB.y}) scale(1 ${ACH})">${inner}</g>`;
}
// peça: centro (x, y), rotação, achatamento (1 = de pé na mão, ACH = deitada no tabuleiro)
function peca(x, y, rot, ach, esc = 1) {
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(esc)} ${r2(esc * ach)}) rotate(${r2(rot)})">
    <path d="${PECA}" transform="scale(${TAB.cel / 64})" fill="${COR_PECA}" stroke="${OL}" stroke-width="${r2(5 / Math.max(ach, 0.5))}" stroke-linejoin="round"/>
    <circle cx="0" cy="0" r="14" fill="#FF8C2B" stroke="${OL}" stroke-width="3"/></g>`;
}

module.exports = {
  id: 'V45', slug: 'encaixar-quebra-cabeca', acao: 'Encaixar', contexto: 'Encaixar uma peça de quebra-cabeça',
  criar() {
    const cen = quarto();
    const ASSENTO = 690;
    const s = 1.5, X = 820, Y = ASSENTO - 24 * s;
    const loc = ([x, y]) => [(x - X) / s, (y - Y) / s];
    const CLIQUE = 0.55;
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.17) * B.CICLO, tipo: 'gira' }, { t: (i + 0.34) * B.CICLO, tipo: 'gira' },
        { t: (i + CLIQUE) * B.CICLO, tipo: 'clique' }, { t: (i + 0.86) * B.CICLO, tipo: 'tira' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        // peça: na mão (perto do peito, mais alto para olhar), descendo até o buraco, encaixada, tirada de volta
        const naMaoPos = [X + 150, 560];
        const olhar = [X + 185, 500];
        const rot = B.kf([[0, 90], [0.1, 90], [0.2, 180], [0.28, 180], [0.38, 360], [0.84, 360], [0.95, 450], [1, 450]], u);
        const pos = B.kf([[0, naMaoPos], [0.08, naMaoPos], [0.16, olhar], [0.38, olhar], [CLIQUE, BURACO], [0.82, BURACO], [0.92, naMaoPos], [1, naMaoPos]], u);
        const ach = B.kf([[0, 1], [0.42, 1], [CLIQUE, ACH], [0.82, ACH], [0.9, 1], [1, 1]], u);
        const encaixada = u >= CLIQUE && u < 0.82;
        // mão perto segura a peça pela esquerda; depois de encaixar, comemora com o punho
        const comemora = B.kf([[0, 0], [0.58, 0], [0.64, 1], [0.76, 1], [0.8, 0], [1, 0]], u);
        const segura = loc(B.add(pos, [-30, 8 * ach]));
        const maoPerto = B.lerp(segura, [34, -66 + 14 * Math.sin((u - 0.64) / 0.12 * 2 * Math.PI) * comemora], comemora);   // "isso!" puxando o cotovelo
        const maoLonge = B.lerp(B.add(segura, [24, 14]), [70, -40], B.kf([[0, 0], [CLIQUE, 0], [0.6, 1], [0.8, 1], [0.84, 0], [1, 0]], u));
        const leanK = B.kf([[0, 8], [0.42, 8], [CLIQUE, 22], [0.6, 6], [0.8, 6], [0.88, 18], [0.95, 8], [1, 8]], u);
        const expr = comemora > 0.4 ? { base: 'riso' }
          : u > 0.16 && u < 0.4 ? { base: 'concentrado', olhar: [4, -4] }
          : u >= 0.4 && u < CLIQUE ? { base: 'concentrado', olhar: [6, 8] }
          : encaixada ? { base: 'surpreso', olhar: [6, 8] } : { base: 'feliz', olhar: [6, 2] };
        const balanca = 10 * B.onda(t, 1) + 14 * comemora * B.onda(t, 0.25);
        const teo = teoLado({
          x: X, y: Y, s, lean: leanK, cabeca: u > 0.16 && u < 0.4 ? -6 : 4,
          pernaPerto: { a1: 88, a2: 6 + balanca, giroPe: 0 }, pernaLonge: { a1: 84, a2: 2 - balanca, giroPe: 0 },
          bracoPerto: { alvo: maoPerto, dobra: -1 }, bracoLonge: { alvo: maoLonge, dobra: -1 },
          expr, piscar: expr.base === 'feliz' && B.piscando(t),
          sombraY: (900 - Y) / s, sombraX: 30,
        });
        const kb = B.bump(u, CLIQUE - 0.01, 0.72);
        const brilhos = brilho(BURACO[0] + 50, BURACO[1] - 60, 64, kb, '#FFF6B0', 40 * u) + brilho(BURACO[0] - 60, BURACO[1] - 80, 40, B.bump(u, CLIQUE + 0.02, 0.7), '#FFFFFF') + brilho(BURACO[0] + 10, BURACO[1] - 130, 32, B.bump(u, CLIQUE + 0.04, 0.68), '#FFF6B0');
        const mp = teo.info.aCena(teo.info.maoPerto);
        const mao = comemora < 0.3 ? `<circle cx="${r2(mp[0])}" cy="${r2(mp[1])}" r="${r2(15 * s)}" fill="${B.C.skin}" stroke="${OL}" stroke-width="${r2(6 * s)}"/>` : '';
        // "clique": aninhas de impacto
        const ki = B.bump(u, CLIQUE, CLIQUE + 0.08);
        const impacto = ki > 0 ? st([0, 60, 120, 180].map(a => { const d = B.dirv(a + 30, 1); return `M ${r2(BURACO[0] + d[0] * 50)} ${r2(BURACO[1] + d[1] * 22)} L ${r2(BURACO[0] + d[0] * (50 + 30 * ki))} ${r2(BURACO[1] + d[1] * (22 + 14 * ki))}`; }).join(' '), 5, OL, `opacity="${r2(ki)}"`) : '';
        return B.quadro(cen.svg + OBJ.cadeira(X - 10, 900, '#E07A3F', ASSENTO) + mesa() + tabuleiro() + teo.svg + peca(pos[0], pos[1], rot, ach) + mao + impacto + brilhos);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'gira') S.colocar(fx, S.SOM.toc(), e.t, 0.2);
      if (e.tipo === 'clique') { S.colocar(fx, S.SOM.encaixe(), e.t, 0.8); S.colocar(fx, S.SOM.ding(1760), e.t + 0.05, 0.3); }
      if (e.tipo === 'tira') S.colocar(fx, S.SOM.vush(0.2), e.t, 0.15);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
