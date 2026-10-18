// V30 — Chorar de saudade (abraçado a uma foto). No quarto, sentado na beirada da cama (de lado).
// Cada repetição: olha o porta-retrato com a vovó → abraça a foto no peito e chora baixinho (suspiro) →
// afasta a foto e olha de novo.
const B = require('../lib/base');
const { quarto } = require('../lib/cenario');
const { sentado, ret } = require('./obj-lote5');
const { OL, r2, tracoSvg: st } = B;

// porta-retrato em coordenadas locais do Teo; centro (cx, cy), larg = 0..1 (1 = de frente para a câmera, ~0 = de lado)
function foto(cx, cy, larg, rot) {
  const w = 30, h = 38;
  if (larg < 0) return `<g transform="translate(${r2(cx)} ${r2(cy)}) rotate(${r2(rot)}) scale(${r2(Math.max(0.12, -larg))} 1) scale(1.2)">
    <rect x="${-w}" y="${-h}" width="${2 * w}" height="${2 * h}" rx="4" fill="#B07D45" stroke="${OL}" stroke-width="4"/>
    <path d="M -6 -10 L 6 -10 L 14 ${h - 4} L -14 ${h - 4} Z" fill="#9C6B3F" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/></g>`;
  return `<g transform="translate(${r2(cx)} ${r2(cy)}) rotate(${r2(rot)}) scale(${r2(Math.max(0.12, larg))} 1) scale(1.2)">
    <rect x="${-w}" y="${-h}" width="${2 * w}" height="${2 * h}" rx="4" fill="#E0A84F" stroke="${OL}" stroke-width="4"/>
    <rect x="${-w + 7}" y="${-h + 7}" width="${2 * w - 14}" height="${2 * h - 14}" fill="#CFEAFF" stroke="${OL}" stroke-width="2.5"/>
    ${larg > 0.35 ? `
    <path d="M -18 31 Q -18 12 0 12 Q 18 12 18 31 Z" fill="#B565D9" stroke="${OL}" stroke-width="2.5"/>
    <circle cx="0" cy="-12" r="6" fill="#D9D9DE" stroke="${OL}" stroke-width="2"/>
    <circle cx="0" cy="-1" r="12" fill="#5A3424" stroke="${OL}" stroke-width="2.5"/>
    <path d="M -12 -3 Q -12 -14 0 -14 Q 12 -14 12 -3 Q 8 -9 0 -9 Q -8 -9 -12 -3 Z" fill="#D9D9DE"/>
    <circle cx="-5" cy="-1" r="3.6" fill="none" stroke="${OL}" stroke-width="1.6"/><circle cx="5" cy="-1" r="3.6" fill="none" stroke="${OL}" stroke-width="1.6"/>
    ${st('M -4 5 Q 0 8 4 5', 1.8)}
    <path d="M 14 -24 q 3 -4 6 0 q 3 -4 6 0 q 0 4 -6 8 q -6 -4 -6 -8 Z" fill="#E63946" transform="translate(-3 0) scale(0.8)"/>` : ''}
  </g>`;
}

module.exports = {
  id: 'V30', slug: 'chorar-de-saudade', acao: 'Chorar', contexto: 'Chorar de saudade (abraçado a uma foto)',
  criar() {
    const cen = quarto();
    const M = sentado({ X: 1080, s: 1.75, chao: cen.chao, mesaW: 0, semCadeira: true });
    // cama: cabeceira à esquerda, Teo sentado na beirada dos pés
    const yC = M.sy, xC0 = 330, xC1 = M.X + 34 * M.s;
    const cama = `
      <ellipse cx="${(xC0 + xC1) / 2}" cy="${cen.chao}" rx="${(xC1 - xC0) / 2 + 30}" ry="12" fill="#000" opacity="0.12"/>
      ${ret(xC0 - 40, 560, 34, cen.chao - 560, '#9C6B3F', 'rx="8"')}
      ${ret(xC0, yC + 62, xC1 - xC0, 36, '#9C6B3F')}
      ${ret(xC0 + 10, yC + 98, 26, cen.chao - yC - 98, '#9C6B3F')}${ret(xC1 - 36, yC + 98, 26, cen.chao - yC - 98, '#9C6B3F')}
      ${ret(xC0, yC, xC1 - xC0, 64, '#FFFFFF', 'rx="14"')}
      <path d="M ${xC0} ${yC - 8} L ${xC1 - 210} ${yC - 8} Q ${xC1 - 190} ${yC + 40} ${xC1 - 210} ${yC + 70} L ${xC0} ${yC + 70} Z" fill="#8FC9F5" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      ${[0, 1, 2, 3].map(i => `<circle cx="${xC0 + 70 + i * 120}" cy="${yC + 30}" r="12" fill="#FFE066" stroke="${OL}" stroke-width="3"/>`).join('')}
      <path d="M ${xC0 + 20} ${yC - 6} Q ${xC0 + 10} ${yC - 64} ${xC0 + 80} ${yC - 66} L ${xC0 + 190} ${yC - 60} Q ${xC0 + 220} ${yC - 30} ${xC0 + 200} ${yC - 4} Z" fill="#fff" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>`;
    // urso de pelúcia na cama
    const urso = (x, y) => `<g transform="translate(${x} ${y})">
      <circle cx="-26" cy="-78" r="14" fill="#C08E52" stroke="${OL}" stroke-width="5"/><circle cx="26" cy="-78" r="14" fill="#C08E52" stroke="${OL}" stroke-width="5"/>
      <ellipse cx="0" cy="-20" rx="36" ry="34" fill="#C08E52" stroke="${OL}" stroke-width="6"/>
      <circle cx="0" cy="-64" r="30" fill="#C08E52" stroke="${OL}" stroke-width="6"/><ellipse cx="0" cy="-56" rx="12" ry="9" fill="#F1D3A8"/>
      <circle cx="-10" cy="-70" r="4" fill="${OL}"/><circle cx="10" cy="-70" r="4" fill="${OL}"/><circle cx="0" cy="-58" r="3.5" fill="${OL}"/></g>`;

    const K_ABRACO = [[0, 0], [0.12, 0], [0.28, 1], [0.7, 1], [0.86, 0], [1, 0]];
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.24) * B.CICLO, tipo: 'hic' },
        { t: (i + 0.4) * B.CICLO, tipo: 'suspiro' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const ab = B.kf(K_ABRACO, u);
        const resp = B.kf([[0, 0], [0.36, 0], [0.48, 1], [0.64, 0], [1, 0]], u);   // respiração funda do suspiro
        const hic = B.bump(u, 0.22, 0.3);
        // foto: na frente do rosto (olhando) → encostada no peito (abraço)
        const fc = B.lerp([92, -80], [50, -80], ab);
        const larg = Math.cos(Math.PI * 0.78 * ab), rot = -8 + 12 * ab;
        const expr = ab > 0.5
          ? { base: 'chorando', boca: 'triste', olho: 'fechado', blush: true }
          : { base: 'triste', lagrimas: true, olhar: [4, 3], boca: 'triste' };
        const teo = M.teo({
          lean: 4 + 12 * ab - 3 * resp, cabeca: 4 + 16 * ab - 6 * resp - 4 * hic,
          y: M.Y - 4 * M.s * resp - 3 * M.s * hic,
          bracoPerto: { alvo: B.lerp([fc[0] + 4, fc[1] + 34], [fc[0] + 14, fc[1] + 10], ab), dobra: 1 },
          bracoLonge: { alvo: B.lerp([fc[0] - 6, fc[1] + 30], [fc[0] + 10, fc[1] - 14], ab), dobra: 1 },
          expr, fase: t * 1.2, piscar: ab < 0.5 && B.piscando(t), balanco: 0.25 * B.onda(t, 2),
          itensMeio: () => foto(fc[0], fc[1], larg, rot),
        });
        return B.quadro(M.montar({ fundo: cen.svg + cama + urso(xC0 + 330, yC + 4), teo }));
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    const suspiro = () => S.envelope(S.passaBaixa(S.ruido(0.9), 800), t => (t < 0.35 ? Math.sin(Math.PI * t / 0.7) : Math.sin(Math.PI * (t + 0.25) / 1.3)) ** 2 * 1.1);
    for (const e of eventos) {
      if (e.tipo === 'hic') S.colocar(fx, S.SOM.soluco(), e.t, 0.22);
      if (e.tipo === 'suspiro') S.colocar(fx, suspiro(), e.t, 0.5);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
