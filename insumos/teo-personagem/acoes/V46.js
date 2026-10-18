// V46 — Encaixar uma peça de bloco de montar. De frente, no quarto, ao lado de uma mesinha com uma torrezinha de blocos.
// Cada repetição: levanta o bloco, alinha devagar em cima da torre, aperta ("clique" + brilho), bate palminhas;
// na volta rápida puxa o bloco de volta (pop) e fica com ele na mão de novo.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { quarto, ret } = require('../lib/cenario');
const { brilho } = require('./obj-lote2');
const { OL, r2, tracoSvg: st } = B;

const BW = 120, BH = 64;                       // bloco
const MESA = { x0: 1020, x1: 1360, topo: 780, chao: 905 };
const TORRE_X = 1110;
const CORES = ['#2F6BDB', '#5DAE5B', '#FFC93C'];
const COR_NOVO = '#E63946';
const TOPO_TORRE = MESA.topo - CORES.length * BH;

// bloco com pinos; (x, y) = centro da base; amassa = achatamento no clique
function bloco(x, y, cor, rot = 0, amassa = 1) {
  const pinos = [-BW / 4, BW / 4].map(px => `<rect x="${px - 15}" y="${-BH - 14}" width="30" height="16" rx="3" fill="${cor}" stroke="${OL}" stroke-width="5"/>`).join('');
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(1 ${r2(amassa)})">${pinos}
    <rect x="${-BW / 2}" y="${-BH}" width="${BW}" height="${BH}" rx="6" fill="${cor}" stroke="${OL}" stroke-width="6"/>
    ${st(`M ${-BW / 2 + 12} ${-BH + 14} L ${-BW / 2 + 12} -14`, 5, '#FFFFFF', 'opacity="0.45"')}</g>`;
}

module.exports = {
  id: 'V46', slug: 'encaixar-bloco', acao: 'Encaixar', contexto: 'Encaixar uma peça de bloco de montar',
  criar() {
    const cen = quarto();
    const s = 1.5, X = 840, Y = teoFrente.emPe(cen.chao, s);
    const loc = ([x, y]) => [(x - X) / s, (y - Y) / s];
    const CLIQUE = 0.48;
    const MAO = [X + 138, 700], ALTO = [TORRE_X, TOPO_TORRE - 90], QUASE = [TORRE_X, TOPO_TORRE - 14], ENCAIXE = [TORRE_X, TOPO_TORRE];
    const mesa = `${ret(MESA.x0 + 26, MESA.topo + 20, 26, MESA.chao - MESA.topo - 20, '#C8915A')}${ret(MESA.x1 - 52, MESA.topo + 20, 26, MESA.chao - MESA.topo - 20, '#C8915A')}${ret(MESA.x0, MESA.topo, MESA.x1 - MESA.x0, 26, '#C8915A')}`;
    return {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + CLIQUE) * B.CICLO, tipo: 'clique' }, ...[0.59, 0.65, 0.71].map(p => ({ t: (i + p) * B.CICLO, tipo: 'palma' })), { t: (i + 0.85) * B.CICLO, tipo: 'pop' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const pos = B.kf([[0, MAO], [0.08, MAO], [0.24, ALTO], [0.3, ALTO], [0.44, QUASE], [CLIQUE, ENCAIXE], [0.82, ENCAIXE], [0.87, [TORRE_X, TOPO_TORRE - 50]], [0.97, MAO], [1, MAO]], u);
        const rot = B.kf([[0, -8], [0.08, -8], [0.24, 6], [0.3, -4], [0.4, 0], [0.87, 0], [0.97, -8], [1, -8]], u);
        const amassa = u >= CLIQUE && u < CLIQUE + 0.04 ? 0.9 : 1;
        const naMao = !(u > CLIQUE + 0.02 && u < 0.8);
        const palmas = B.kf([[0, 0], [0.52, 0], [0.56, 1], [0.72, 1], [0.78, 0], [1, 0]], u);
        const palma = 14 * Math.abs(Math.cos((u - 0.56) / 0.06 * Math.PI));
        const segura = loc(B.add(pos, [-BW / 2 - 2, -BH / 2]));
        const solta = [62, -40];
        const larga = B.kf([[0, 0], [CLIQUE + 0.01, 0], [CLIQUE + 0.05, 1], [0.76, 1], [0.81, 0], [1, 0]], u);   // 1 = soltou o bloco
        const base = B.lerp(segura, solta, larga);
        // mão direita (da tela) segura o bloco; a esquerda descansa e depois bate palminhas com a direita
        const maoPerto = B.lerp(base, [10 + palma, -96], palmas);
        const maoLonge = B.lerp([-72, -40], [-10 - palma, -96], palmas);
        const alinhando = u > 0.28 && u < CLIQUE;
        const expr = palmas > 0.4 ? { base: 'riso' } : alinhando ? { base: 'concentrado', olhar: [9, 4] }
          : u >= CLIQUE && u < 0.52 ? { base: 'surpreso', olhar: [9, 2] } : { base: 'feliz', olhar: [7, 2] };
        const pulinho = palmas > 0.9 ? 6 * Math.abs(Math.sin((u - 0.56) / 0.12 * Math.PI)) : 0;
        const teo = teoFrente({
          x: X, y: Y - pulinho * s, s, lean: alinhando ? 4 : 2, cabeca: alinhando ? 7 : 3,
          bracoDir: { alvo: B.add(maoPerto, [0, pulinho]), dobra: 1 }, bracoEsq: { alvo: B.add(maoLonge, [0, pulinho]), dobra: -1 },
          expr, piscar: expr.base === 'feliz' && B.piscando(t),
          sombraY: 124 + pulinho,
        });
        // a torre balança um tiquinho com o clique
        const bal = 2.5 * Math.exp(-Math.max(0, u - CLIQUE) * 25) * Math.sin(Math.max(0, u - CLIQUE) * 120) * (u >= CLIQUE ? 1 : 0);
        let torre = '';
        CORES.forEach((c, i) => { torre += bloco(TORRE_X, MESA.topo - i * BH, c, bal * (i + 1) * 0.3); });
        const novo = bloco(pos[0], pos[1], COR_NOVO, rot, amassa);
        const mp = teo.info.aCena(teo.info.maoDir);
        const mao = larga < 0.5 && palmas < 0.2 ? `<circle cx="${r2(mp[0])}" cy="${r2(mp[1])}" r="${r2(15 * s)}" fill="${B.C.skin}" stroke="${OL}" stroke-width="${r2(6 * s)}"/>` : '';
        const kb = B.bump(u, CLIQUE - 0.01, 0.7);
        const brilhos = brilho(TORRE_X + 95, TOPO_TORRE - 70, 60, kb, '#FFF6B0', 40 * u) + brilho(TORRE_X - 90, TOPO_TORRE - 100, 38, B.bump(u, CLIQUE + 0.02, 0.68), '#FFFFFF') + brilho(TORRE_X + 20, TOPO_TORRE - 150, 30, B.bump(u, CLIQUE + 0.04, 0.66), '#FFF6B0');
        const ki = B.bump(u, CLIQUE, CLIQUE + 0.08);
        const impacto = ki > 0 ? st(`M ${TORRE_X - BW / 2 - 16} ${TOPO_TORRE - 10} l ${r2(-26 * ki)} ${r2(-10 * ki)} M ${TORRE_X - BW / 2 - 14} ${TOPO_TORRE + 8} l ${r2(-28 * ki)} ${r2(6 * ki)} M ${TORRE_X + BW / 2 + 16} ${TOPO_TORRE - 10} l ${r2(26 * ki)} ${r2(-10 * ki)} M ${TORRE_X + BW / 2 + 14} ${TOPO_TORRE + 8} l ${r2(28 * ki)} ${r2(6 * ki)}`, 6, OL, `opacity="${r2(ki)}"`) : '';
        return B.quadro(cen.svg + mesa + torre + teo.svg + novo + mao + impacto + brilhos);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'clique') { S.colocar(fx, S.SOM.encaixe(), e.t, 0.9); S.colocar(fx, S.SOM.ding(1760), e.t + 0.06, 0.3); }
      if (e.tipo === 'palma') S.colocar(fx, S.SOM.toc(), e.t, 0.35);
      if (e.tipo === 'pop') S.colocar(fx, S.SOM.plop(), e.t, 0.5);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
