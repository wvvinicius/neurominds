// V14 — Pentear o cabelo. De frente, no quarto, com um pente garfo no black power.
// Cada repetição: leva o pente ao cabelo, enfia e puxa devagar para cima e para fora; o afro dá uma "afofada".
const B = require('../lib/base');
const { teoFrente, cabecaFrente } = require('../lib/teo');
const { quarto } = require('../lib/cenario');
const { afro } = require('../gerar');
const { brilho } = require('./obj-lote1');
const { C, OL, SW, r2, limb } = B;

const AFRO = afro();
const COR_PENTE = '#B565D9';

// pente garfo em coordenadas locais: mão em H, apontando na direção ang (graus SVG) — cabo, barra e dentes
function pente(H, ang) {
  const dentes = [-20, -10, 0, 10, 20].map(y => `M 92 ${y} L 150 ${y}`).join(' ');
  return `<g transform="translate(${r2(H[0])} ${r2(H[1])}) rotate(${r2(ang)})">
    ${B.tracoSvg(dentes, 11)}${B.tracoSvg(dentes, 4.5, COR_PENTE)}
    <rect x="-12" y="-11" width="104" height="22" rx="11" fill="${COR_PENTE}" stroke="${OL}" stroke-width="5"/>
    <rect x="84" y="-28" width="14" height="56" rx="6" fill="${COR_PENTE}" stroke="${OL}" stroke-width="5"/>
    ${B.tracoSvg('M 4 -4 L 60 -4', 3.5, '#D9A6EE')}</g>`;
}
// braço de frente com manga curta (igual ao do lib/teo), para redesenhar por cima da cabeça
function braco(S, E, Hh) {
  const a = B.angulo(S, E);
  return limb([S, E, Hh], C.skin, 22) +
    `<g transform="translate(${r2(S[0])} ${r2(S[1])}) rotate(${r2(a)})"><path d="M -14 -24 L 34 -21 Q 42 0 34 21 L -14 24 Z" fill="${C.shirt}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
}

module.exports = {
  id: 'V14', slug: 'pentear-cabelo', acao: 'Pentear', contexto: 'Pentear o cabelo',
  criar() {
    const cen = quarto();
    const s = 1.5, X = 960, Y = teoFrente.emPe(cen.chao, s);
    const T_FOFA = 0.56;
    return {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + 0.16) * B.CICLO, tipo: 'puxa' }, { t: (i + T_FOFA) * B.CICLO, tipo: 'fofa' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        // vai = mão sobe até o cabelo; k = puxada (0 = pente enfiado, 1 = saiu do cabelo)
        const vai = B.kf([[0, 0], [0.04, 0], [0.15, 1], [T_FOFA + 0.02, 1], [0.72, 0], [1, 0]], u);
        const k = u < 0.15 ? 0 : u < T_FOFA ? B.ease((u - 0.15) / (T_FOFA - 0.15)) : 1;
        // afofada: mola que aumenta o afro e assenta até o fim do ciclo
        const d = u - T_FOFA;
        const fofa = d > 0 ? 0.11 * Math.exp(-d * 7) * Math.cos(d * 34) * (1 - B.ease((u - 0.86) / 0.14)) : 0;
        const afroEsc = 1 + Math.max(fofa, -0.03) + (d > 0 ? 0.02 * (1 - B.ease((u - 0.6) / 0.4)) : 0);
        const tilt = -7 * vai;
        const repouso = [92, -78], repAng = -60;
        const mao = B.lerp(repouso, B.lerp([74, -238], [104, -250], k), vai);
        const ang = B.mix(repAng, B.mix(-108, -66, k), vai);
        const feliz = u > T_FOFA && u < 0.9;
        const expr = feliz ? (u < 0.7 ? { base: 'riso', olhar: [0, -4] } : 'orgulho') : vai > 0.5 ? { base: 'concentrado', olhar: [6, -8] } : 'feliz';
        const piscar = !feliz && vai < 0.5 && B.piscando(t);
        const teo = teoFrente({
          x: X, y: Y, s, cabeca: tilt,
          expr, piscar,
          bracoDir: { alvo: mao, dobra: 1 },
                    itensFrente: i => {
            // cabeça redesenhada com o afro na escala da afofada (cobre a cabeça original)
            const rosto = cabecaFrente(expr, 'pt', { piscar }).replace(AFRO, '');
            const cab = `<g transform="translate(0 -278) rotate(${r2(tilt)} 0 70)">
              <g transform="translate(0 -40) scale(${r2(afroEsc * 1.0)} ${r2(afroEsc)}) translate(0 40)">${AFRO}</g>${rosto}</g>`;
            const H = i.maoDir;
            return cab + braco(i.ombroDir, i.cotoveloDir, H) + pente(H, ang) +
              `<circle cx="${r2(H[0])}" cy="${r2(H[1])}" r="16" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
          },
        });
        let br = '';
        const a = B.bump(u, T_FOFA, 0.85);
        if (a > 0.01) {
          const c = teo.info.aCena(teo.info.daCabeca([0, -40]));
          [[-200, -120, 28, 0], [190, -150, 24, 20], [0, -250, 20, 10], [230, 30, 16, 30]].forEach(([dx, dy, r, rot], j) =>
            br += brilho(c[0] + dx, c[1] + dy, r * B.clamp(a * 1.6 - j * 0.1), a, rot + 30 * a));
        }
        return B.quadro(cen.svg + teo.svg + br);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'puxa') S.colocar(fx, S.SOM.esfrega(0.75, 1800), e.t, 0.2);
      if (e.tipo === 'fofa') { S.colocar(fx, S.SOM.boing(), e.t, 0.18); S.colocar(fx, S.SOM.pisadaFofa(), e.t, 0.25); }
    }
    return { fx, amb: S.AMB.casa() };
  },
};
