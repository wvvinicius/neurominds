// V10 — Limpar o chão. De lado, na cozinha, com um rodo de pano.
// Cada repetição: esfrega a mancha de suco (vai e volta 3 vezes), a mancha some e o chão brilha;
// no fim do ciclo uma gotinha de suco pinga do copo na beirada da mesa e refaz a mancha (o Teo faz cara de "ah, não!").
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { cozinha, ret } = require('../lib/cenario');
const { brilho } = require('./obj-lote2');
const { OL, r2, tracoSvg: st } = B;

const SUCO = '#FFA62B';
const MESA = { x0: 1190, x1: 1720, topo: 640 };
const PINGO_X = 1205;            // a gota cai rente à beirada da mesa
const MANCHA = [1200, 924];      // centro da mancha no chão
const ESF = [0.06, 0.58];        // janela da esfregação (3 idas e voltas)
const GOTA = { nasce: 0.72, cai: 0.84, chega: 0.92 };

function mesa() {
  const { x0, x1, topo } = MESA, cor = '#C8915A';
  return `${ret(x0 + 70, topo + 20, 26, 900 - topo - 20, cor)}${ret(x1 - 110, topo + 20, 26, 900 - topo - 20, cor)}${ret(x0, topo, x1 - x0, 28, cor)}`;
}
// copo de suco perto da beirada
function copo(x, y) {
  return `<path d="M ${x - 30} ${y - 92} L ${x + 30} ${y - 92} L ${x + 24} ${y} L ${x - 24} ${y} Z" fill="#E8F6FF" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M ${x - 27} ${y - 62} L ${x + 27} ${y - 62} L ${x + 22.5} ${y - 3} L ${x - 22.5} ${y - 3} Z" fill="${SUCO}"/>
    ${st(`M ${x - 27} ${y - 62} L ${x + 27} ${y - 62}`, 4)}${st(`M ${x - 18} ${y - 82} L ${x - 15} ${y - 20}`, 5, '#fff')}
    ${st(`M ${x + 10} ${y - 92} L ${x + 28} ${y - 150} L ${x + 48} ${y - 150}`, 12)}${st(`M ${x + 10} ${y - 92} L ${x + 28} ${y - 150} L ${x + 48} ${y - 150}`, 6, '#E63946')}`;
}
// gota de suco (sem contorno de água)
const gotaSuco = (x, y, s) => B.gota(x, y, s, SUCO);
function mancha(k, cresce = 1) {
  if (k <= 0.01) return '';
  const [x, y] = MANCHA, rx = 85 * cresce, ry = 21 * cresce;
  return `<g opacity="${r2(Math.min(1, k * 1.2))}"><path d="M ${r2(x - rx)} ${y} Q ${r2(x - rx)} ${r2(y - ry)} ${r2(x - rx * 0.3)} ${r2(y - ry)} Q ${r2(x + rx * 0.1)} ${r2(y - ry * 1.3)} ${r2(x + rx * 0.5)} ${r2(y - ry * 0.9)} Q ${r2(x + rx)} ${r2(y - ry * 0.7)} ${r2(x + rx)} ${y} Q ${r2(x + rx * 0.8)} ${r2(y + ry)} ${r2(x + rx * 0.2)} ${r2(y + ry)} Q ${r2(x - rx * 0.4)} ${r2(y + ry * 1.2)} ${r2(x - rx)} ${y} Z"
    fill="${SUCO}" stroke="#C9771A" stroke-width="4"/>
    <ellipse cx="${r2(x - rx * 0.35)}" cy="${r2(y - ry * 0.3)}" rx="${r2(rx * 0.2)}" ry="${r2(ry * 0.25)}" fill="#FFD27A"/></g>`;
}

module.exports = {
  id: 'V10', slug: 'limpar-chao', acao: 'Limpar', contexto: 'Limpar o chão (com pano/rodo)',
  criar() {
    const cen = cozinha();
    const s = 1.5, X = 840, Y = teoLado.emPe(cen.chao, s);
    const loc = ([x, y]) => [(x - X) / s, (y - Y) / s];    // cena → local
    const M_LOC = loc(MANCHA);
    const eventos = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 6; j++) eventos.push({ t: (i + ESF[0] + (j + 0.5) * (ESF[1] - ESF[0]) / 6) * B.CICLO, tipo: 'esfrega' });
      eventos.push({ t: (i + 0.6) * B.CICLO, tipo: 'plim' });
      eventos.push({ t: (i + GOTA.chega) * B.CICLO, tipo: 'ploc' });
    }
    return {
      eventos,
      frame(f) {
        const { t, u } = B.tempo(f);
        // vai e volta do rodo: 3 ciclos completos dentro da janela; fora dela, o rodo descansa um pouco atrás da mancha
        const fe = B.clamp((u - ESF[0]) / (ESF[1] - ESF[0]));
        const esfregando = u > ESF[0] && u < ESF[1];
        const vai = esfregando ? 0.5 - 0.5 * Math.cos(fe * 3 * 2 * Math.PI) : 0;   // 0 = atrás, 1 = na frente
        const repouso = B.kf([[0, 0], [0.62, 0], [0.7, -0.35], [0.94, -0.35], [1, 0]], u);
        const d = vai + repouso;
        const M = [M_LOC[0] - 52 + 80 * d, M_LOC[1] - 6];         // cabeça do rodo no chão (local)
        const T = [M[0] - 220, -128];                            // ponta do cabo
        const lean = 4 + 8 * vai;
        const m1 = B.lerp(T, M, 0.12), m2 = B.lerp(T, M, 0.34);
        // mancha: vai sumindo a cada passada; volta quando a gota chega
        const limpa = B.kf([[0, 0], [ESF[0], 0], [ESF[1] - 0.04, 1], [1, 1]], u);
        const kSplash = B.clamp((u - GOTA.chega) / 0.05);
        const kMancha = u < GOTA.chega ? 1 - limpa : B.ease(kSplash);
        // expressão: esforço alegre esfregando, orgulho com o chão brilhando, "ah, não!" quando a gota cai
        const olhaGota = u > GOTA.nasce - 0.02 || u < ESF[0];   // a cara de "ah, não!" emenda o fim com o começo do ciclo
        const expr = esfregando ? { base: 'concentrado', olhar: [6, 8] }
          : olhaGota ? (u < GOTA.chega && u > 0.5 ? { base: 'surpreso', olhar: [6, -4] } : { base: 'surpreso', boca: 'oGrande', olhar: [6, 8] })
          : 'orgulho';
        const teo = teoLado({
          x: X, y: Y, s, lean, cabeca: B.kf([[0, -4], [0.05, -4], [0.1, 6], [0.56, 6], [0.62, 0], [0.7, 0], [0.76, -4], [1, -4]], u),
          expr, piscar: !esfregando && !olhaGota && B.piscando(t),
          pernaPerto: { a1: 14, a2: 2 }, pernaLonge: { a1: -12, a2: -2 },
          bracoPerto: { alvo: m2, dobra: 1 }, bracoLonge: { alvo: m1, dobra: 1 },
          itensMeio: () => {
            // cabo + cabeça do rodo com pano
            const ang = B.angulo(T, M);
            return `${st(`M ${r2(T[0])} ${r2(T[1])} L ${r2(M[0])} ${r2(M[1] - 8)}`, 16)}${st(`M ${r2(T[0])} ${r2(T[1])} L ${r2(M[0])} ${r2(M[1] - 8)}`, 8, '#3BA8E0')}
              <g transform="translate(${r2(M[0])} ${r2(M[1])})">
                <rect x="-34" y="-20" width="68" height="14" rx="4" fill="#E63946" stroke="${OL}" stroke-width="5"/>
                <path d="M -40 -8 L 40 -8 Q 44 6 36 8 L -36 8 Q -44 6 -40 -8 Z" fill="#F4F1EA" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
                ${st('M -26 -6 L -28 6 M -10 -6 L -11 6 M 6 -6 L 6 6 M 22 -6 L 24 6', 3, '#C9C2B4')}</g>`;
          },
        });
        // pingo: cresce na beirada, cai e espirra
        let pingo = '';
        const yBeira = MESA.topo + 30;
        if (u >= GOTA.nasce && u < GOTA.cai) pingo = gotaSuco(PINGO_X, yBeira + 8 * B.ease((u - GOTA.nasce) / (GOTA.cai - GOTA.nasce)), 0.9 + 0.9 * (u - GOTA.nasce) / (GOTA.cai - GOTA.nasce));
        else if (u >= GOTA.cai && u < GOTA.chega) { const k = (u - GOTA.cai) / (GOTA.chega - GOTA.cai); pingo = gotaSuco(PINGO_X, yBeira + 8 + (MANCHA[1] - yBeira - 10) * k * k, 1.8); }
        // escorrido no copo/mesa (fica sempre: é dali que pinga)
        const escorrido = `<path d="M ${MESA.x0 + 8} ${MESA.topo + 2} Q ${MESA.x0 + 30} ${MESA.topo - 6} ${MESA.x0 + 60} ${MESA.topo + 2} L ${PINGO_X + 4} ${MESA.topo + 30} Q ${PINGO_X} ${MESA.topo + 36} ${PINGO_X - 4} ${MESA.topo + 30} Z" fill="${SUCO}" stroke="#C9771A" stroke-width="3"/>`;
        // respingos da gota
        let resp = '';
        const kr = (u - GOTA.chega) / 0.07;
        if (kr >= 0 && kr <= 1) [-1, -0.4, 0.4, 1].forEach((dx, j) => {
          resp += gotaSuco(MANCHA[0] + dx * 90 * kr, MANCHA[1] - 70 * Math.sin(Math.PI * kr) * (1 - 0.3 * (j % 2)), 1.0 * (1 - kr * 0.4));
        });
        // brilho do chão limpo
        const kb = B.bump(u, ESF[1] - 0.03, 0.74);
        const brilhos = brilho(MANCHA[0] - 40, MANCHA[1] - 30, 60, kb, '#FFFFFF') + brilho(MANCHA[0] + 50, MANCHA[1] - 60, 40, B.bump(u, ESF[1], 0.72), '#FFF6B0') + brilho(MANCHA[0] + 5, MANCHA[1] - 95, 26, B.bump(u, ESF[1] + 0.03, 0.72), '#FFFFFF')
          + (kb > 0 ? `<ellipse cx="${MANCHA[0]}" cy="${MANCHA[1]}" rx="95" ry="20" fill="#FFFFFF" opacity="${r2(0.6 * kb)}"/>` : '');
        return B.quadro(cen.svg + mesa() + copo(MESA.x0 + 60, MESA.topo) + escorrido + mancha(kMancha, u >= GOTA.chega ? 0.4 + 0.6 * B.ease(kSplash) : 1 - 0.25 * limpa) + brilhos + teo.svg + pingo + resp);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'esfrega') S.colocar(fx, S.SOM.esfrega(0.16, 1800), e.t - 0.08, 0.4);
      if (e.tipo === 'plim') S.colocar(fx, S.SOM.ding(1980), e.t, 0.35);
      if (e.tipo === 'ploc') { S.colocar(fx, S.SOM.plop(), e.t, 0.6); S.colocar(fx, S.SOM.gotinha(), e.t + 0.05, 0.3); }
    }
    return { fx, amb: S.AMB.casa() };
  },
};
