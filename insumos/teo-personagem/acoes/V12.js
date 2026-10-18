// V12 — Escovar os dentes. De frente, no banheiro.
// Cada repetição: leva a escova à boca, escova de um lado para o outro (espuma aparecendo),
// abaixa a escova e mostra o sorriso com brilho nos dentes.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { banheiro, ret } = require('../lib/cenario');
const { brilho } = require('./obj-lote1');
const { OL, r2 } = B;

// bolhas de espuma em volta da boca: [dx, dy, raio, quando aparece (u)]
const BOLHAS = [[-34, 6, 9, 0.16], [34, 4, 8, 0.2], [-20, 22, 10, 0.26], [18, 24, 9, 0.3], [-44, -6, 6, 0.34], [44, -8, 6, 0.38],
  [0, 30, 8, 0.42], [-30, 30, 6, 0.46], [30, 32, 6, 0.5], [50, 12, 5, 0.54]];

function escova(mao, cab, ang) {
  // cabo da mão até a cabeça da escova (cab), cerdas viradas para a boca
  const [hx, hy] = mao, [cx, cy] = cab;
  return `<path d="M ${r2(hx)} ${r2(hy)} L ${r2(cx)} ${r2(cy)}" stroke="${OL}" stroke-width="24" stroke-linecap="round"/>
    <path d="M ${r2(hx)} ${r2(hy)} L ${r2(cx)} ${r2(cy)}" stroke="#2F9BD6" stroke-width="12" stroke-linecap="round"/>
    <g transform="translate(${r2(cx)} ${r2(cy)}) rotate(${r2(ang)}) scale(1.35)">
      <rect x="-10" y="-16" width="34" height="14" rx="4" fill="#fff" stroke="${OL}" stroke-width="4"/>
      ${B.tracoSvg('M -4 -14 L -4 -4 M 4 -14 L 4 -4 M 12 -14 L 12 -4 M 20 -14 L 20 -4', 2.5, '#BFDDEB')}</g>`;
}

module.exports = {
  id: 'V12', slug: 'escovar-dentes', acao: 'Escovar', contexto: 'Escovar os dentes',
  criar() {
    const cen = banheiro();
    // prateleira com copinho embaixo do espelho
    const prat = `${ret(1450, 470, 280, 18, '#fff')}<path d="M 1500 470 L 1494 410 L 1546 410 L 1540 470 Z" fill="#7CC8FF" stroke="${OL}" stroke-width="5"/>
      ${B.tracoSvg('M 1512 412 L 1500 360', 10)}${B.tracoSvg('M 1512 412 L 1500 360', 5, '#E63946')}<rect x="1490" y="346" width="18" height="12" rx="3" fill="#fff" stroke="${OL}" stroke-width="3"/>
      <rect x="1600" y="436" width="80" height="34" rx="8" fill="#fff" stroke="${OL}" stroke-width="5"/><rect x="1680" y="444" width="16" height="18" rx="3" fill="#5DAE5B" stroke="${OL}" stroke-width="4"/>`;
    const s = 1.5, X = 900, Y = teoFrente.emPe(cen.chao, s);
    return {
      eventos: [0, 1, 2].flatMap(i => [
        ...Array.from({ length: 8 }, (_, j) => ({ t: (i + 0.12 + j * 0.0625) * B.CICLO, tipo: 'esfrega' })),
        { t: (i + 0.68) * B.CICLO, tipo: 'brilho' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const naBoca = B.kf([[0, 0], [0.02, 0], [0.11, 1], [0.6, 1], [0.69, 0], [1, 0]], u);
        const escovando = u > 0.11 && u < 0.6;
        const vai = escovando ? 20 * B.onda(t, 0.25) : 0;      // 4 escovadas por segundo
        const sorriso = B.bump(u, 0.64, 0.98);
        const espuma = u < 0.6 ? 1 : B.clamp(1 - (u - 0.6) / 0.06);   // some quando a escova sai
        const cab = escovando ? 3 * B.onda(t, 0.25, 0.25) : 0;
        const expr = escovando ? { base: 'feliz', boca: 'dentes', olho: 'feliz' }
          : sorriso > 0.3 ? { base: 'riso', olho: 'aberto', blush: true } : 'feliz';
        const teo = teoFrente({
          x: X, y: Y, s, cabeca: cab,
          expr, piscar: !escovando && sorriso < 0.3 && B.piscando(t),
          bracoDir: { alvo: B.lerp([92, -88], [86 + vai, -214], naBoca), dobra: 1 },
          bracoEsq: { a1: -18, a2: -6 },
          itensFrente: i => {
            const mao = i.maoDir;
            const cabEsc = B.lerp([mao[0] - 70, mao[1] - 8], [i.boca[0] - 8 + vai * 0.6, i.boca[1] + 2], naBoca);
            const ang = B.angulo(mao, cabEsc) - 180 + 180;
            let out = escova(mao, cabEsc, B.mix(180, 180, naBoca));
            out += `<circle cx="${r2(mao[0])}" cy="${r2(mao[1])}" r="16" fill="${B.C.skin}" stroke="${OL}" stroke-width="${B.SW}"/>`;
            // espuma
            if (u < 0.66) BOLHAS.forEach(([dx, dy, r, un], j) => {
              const k = B.clamp((u - un) / 0.06) * espuma;
              if (k <= 0) return;
              const w = 2 * B.onda(t, 0.5, j * 0.13);
              out += `<circle cx="${r2(i.boca[0] + dx + w)}" cy="${r2(i.boca[1] + dy)}" r="${r2(r * k)}" fill="#fff" stroke="${OL}" stroke-width="3"/>`;
            });
            return out;
          },
        });
        // brilho nos dentes no sorriso
        let br = '';
        if (sorriso > 0.05) {
          const b = teo.info.aCena(B.add(teo.info.boca, [18, -8]));
          const a = B.bump(u, 0.66, 0.95);
          br += brilho(b[0], b[1], 30 * a, a, 30 * a) + brilho(b[0] - 100, b[1] + 10, 16 * a, a, 10) + brilho(b[0] + 60, b[1] - 50, 12 * a, a, 20);
        }
        return B.quadro(cen.svg + prat + teo.svg + br);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'esfrega') S.colocar(fx, S.SOM.esfrega(0.12, 3800), e.t, 0.3);
      if (e.tipo === 'brilho') S.colocar(fx, S.SOM.ding(2093), e.t, 0.09);
    }
    return { fx, amb: S.AMB.banheiro() };
  },
};
