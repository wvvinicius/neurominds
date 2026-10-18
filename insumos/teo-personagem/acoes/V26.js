// V26 — Pintar o papel com tinta e pincel, no cavalete. Teo em pé, de frente, com o cavalete ao lado (folha virada para a câmera).
// Cada repetição: molha o pincel no pote vermelho → pinta um arco vermelho → molha no pote azul → pinta um arco azul
// (um arco-íris) → admira → vira a folha por cima do cavalete (volta rápida) e aparece uma folha igual, em branco.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { quarto } = require('../lib/cenario');
const { tracoProgressivo, ret } = require('./obj-lote5');
const { OL, r2, tracoSvg: st } = B;

const VERM = '#E63946', AZUL = '#2F6BDB';
// folha: retângulo de frente para a câmera
const F = { x0: 986, y0: 392, w: 214, h: 218 };
const ARCO = { cx: F.x0 + 104, cy: F.y0 + 182 };
const arcoD = (r) => `M ${ARCO.cx - r} ${ARCO.cy} A ${r} ${r} 0 0 1 ${ARCO.cx + r} ${ARCO.cy}`;
const arcoPt = (r, k) => { const a = Math.PI * (1 + B.clamp(k)); return [ARCO.cx + r * Math.cos(a), ARCO.cy + r * Math.sin(a)]; };
const R1 = 80, R2 = 54;
const POTES = [[1018, VERM], [1080, AZUL]];
const BANDEJA = F.y0 + F.h + 34;

// fases (u)
const DIP1 = [0.02, 0.12], ARC1 = [0.15, 0.37], DIP2 = [0.4, 0.5], ARC2 = [0.53, 0.73], VIRA = [0.81, 0.93];

function pincel(h, ang, cor) {   // da mão (h) na direção ang (graus)
  return `<g transform="translate(${r2(h[0])} ${r2(h[1])}) rotate(${r2(ang)})">
    <rect x="-34" y="-6" width="70" height="12" rx="6" fill="#B07D45" stroke="${OL}" stroke-width="4"/>
    <rect x="34" y="-7" width="18" height="14" fill="#B9C3CC" stroke="${OL}" stroke-width="4"/>
    <path d="M 52 -8 Q 76 -6 86 0 Q 76 6 52 8 Z" fill="${cor}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/></g>`;
}
const PINCEL_L = 84;

module.exports = {
  id: 'V26', slug: 'pintar-tinta-pincel', acao: 'Pintar', contexto: 'Pintar o papel com tinta e pincel',
  criar() {
    const cen = quarto();
    const s = 1.5, X = 830, Y = teoFrente.emPe(cen.chao, s);
    const paraLocal = p => [(p[0] - X) / s, (p[1] - Y) / s];
    // cavalete: pernas em A, prancha, bandeja com potes
    const cav = `
      ${st(`M ${F.x0 + F.w / 2} ${F.y0 - 40} L ${F.x0 - 10} ${cen.chao} M ${F.x0 + F.w / 2} ${F.y0 - 40} L ${F.x0 + F.w + 10} ${cen.chao}`, 22)}
      ${st(`M ${F.x0 + F.w / 2} ${F.y0 - 40} L ${F.x0 - 10} ${cen.chao} M ${F.x0 + F.w / 2} ${F.y0 - 40} L ${F.x0 + F.w + 10} ${cen.chao}`, 12, '#C8915A')}
      ${st(`M ${F.x0 + F.w / 2} ${F.y0 - 40} L ${F.x0 + F.w / 2 + 40} ${cen.chao - 20}`, 18)}${st(`M ${F.x0 + F.w / 2} ${F.y0 - 40} L ${F.x0 + F.w / 2 + 40} ${cen.chao - 20}`, 9, '#B07D45')}
      ${ret(F.x0 - 22, F.y0 - 22, F.w + 44, F.h + 44, '#C8915A', 'rx="6"')}
      <ellipse cx="${F.x0 + F.w / 2 + 10}" cy="${cen.chao}" rx="${F.w / 2 + 50}" ry="12" fill="#000" opacity="0.12"/>`;
    const bandeja = `${ret(F.x0 - 34, BANDEJA - 4, F.w + 68, 18, '#B07D45', 'rx="5"')}`;
    const pote = (x, cor) => `<path d="M ${x - 24} ${BANDEJA - 40} L ${x - 20} ${BANDEJA - 4} L ${x + 20} ${BANDEJA - 4} L ${x + 24} ${BANDEJA - 40} Z" fill="#E9F4FF" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M ${x - 22} ${BANDEJA - 26} L ${x - 20} ${BANDEJA - 6} L ${x + 20} ${BANDEJA - 6} L ${x + 22} ${BANDEJA - 26} Z" fill="${cor}"/>
      <ellipse cx="${x}" cy="${BANDEJA - 40}" rx="24" ry="7" fill="${cor}" stroke="${OL}" stroke-width="5"/>`;
    const potes = POTES.map(([x, c]) => pote(x, c)).join('');
    // folha pintada até (k1, k2)
    const folha = (k1, k2) => `<rect x="${F.x0}" y="${F.y0}" width="${F.w}" height="${F.h}" fill="#fff" stroke="${OL}" stroke-width="5"/>
      ${tracoProgressivo(arcoD(R1), Math.PI * R1, k1, 26, VERM)}${tracoProgressivo(arcoD(R2), Math.PI * R2, k2, 26, AZUL)}
      <circle cx="${F.x0 + 14}" cy="${F.y0 + 14}" r="6" fill="#8A8F98" stroke="${OL}" stroke-width="3"/><circle cx="${F.x0 + F.w - 14}" cy="${F.y0 + 14}" r="6" fill="#8A8F98" stroke="${OL}" stroke-width="3"/>`;

    // ponta do pincel ao longo do ciclo
    const dentro = ([x]) => [x, BANDEJA - 30];        // ponta dentro do pote
    const acima = ([x]) => [x - 6, BANDEJA - 90];      // ponta logo acima do pote
    const ALTO = [ARCO.cx - 30, F.y0 + 60];            // pincel afastado, admirando
    const BORDA = [F.x0 + 120, F.y0 + F.h - 6];
    function ponta(u) {
      const p1 = POTES[0][0], p2 = POTES[1][0];
      const segs = [
        [0, acima([p1])], [DIP1[0], acima([p1])], [0.07, dentro([p1])], [DIP1[1], acima([p1])],
        [ARC1[0], arcoPt(R1, 0)], ['arco', R1, ARC1], [0.38, arcoPt(R1, 1)],
        [DIP2[0], acima([p2])], [0.45, dentro([p2])], [DIP2[1], acima([p2])],
        [ARC2[0], arcoPt(R2, 0)], ['arco', R2, ARC2], [0.74, arcoPt(R2, 1)],
        [0.76, ALTO], [0.79, ALTO], [VIRA[0], BORDA], ['folha'], [0.985, acima([p1])], [1, acima([p1])],
      ];
      // arcos
      if (u >= ARC1[0] && u <= ARC1[1]) return arcoPt(R1, (u - ARC1[0]) / (ARC1[1] - ARC1[0]));
      if (u >= ARC2[0] && u <= ARC2[1]) return arcoPt(R2, (u - ARC2[0]) / (ARC2[1] - ARC2[0]));
      const uS = B.mix(VIRA[0], VIRA[1], 0.35);
      if (u >= VIRA[0] && u < uS) { const p = B.ease((u - VIRA[0]) / (VIRA[1] - VIRA[0])); return [BORDA[0], F.y0 + F.h * (1 - 2 * p) - 6]; }
      const kk = segs.filter(e => typeof e[0] === 'number');
      if (u >= uS && u < 0.985) { const p = B.ease((uS - VIRA[0]) / (VIRA[1] - VIRA[0])); return B.lerp([BORDA[0], F.y0 + F.h * (1 - 2 * p) - 6], acima([p1]), B.ease((u - uS) / (0.985 - uS))); }
      // trechos simples entre chaves
      const keys = kk.map(e => [e[0], e[1]]);
      return B.kf(keys, u);
    }
    // ângulo do pincel: deitado para pintar, em pé para molhar
    const angPincel = u => {
      const molha = Math.max(B.kf([[0, 1], [DIP1[1], 1], [ARC1[0], 0], [0.38, 0], [DIP2[0], 1], [DIP2[1], 1], [ARC2[0], 0], [0.95, 0], [0.985, 1], [1, 1]], u), 0);
      return B.mix(-12, 80, molha);
    };
    const corPonta = u => (u >= 0.07 && u < 0.45) ? VERM : AZUL;

    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.07) * B.CICLO, tipo: 'plop' }, { t: (i + ARC1[0]) * B.CICLO, tipo: 'pinta', d: (ARC1[1] - ARC1[0]) * B.CICLO },
        { t: (i + 0.45) * B.CICLO, tipo: 'plop' }, { t: (i + ARC2[0]) * B.CICLO, tipo: 'pinta', d: (ARC2[1] - ARC2[0]) * B.CICLO },
        { t: (i + 0.755) * B.CICLO, tipo: 'ding' }, { t: (i + VIRA[0]) * B.CICLO, tipo: 'vira' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const k1 = B.clamp((u - ARC1[0]) / (ARC1[1] - ARC1[0])), k2 = B.clamp((u - ARC2[0]) / (ARC2[1] - ARC2[0]));
        const tip = ponta(u), ang = angPincel(u);
        const mao = [tip[0] - PINCEL_L * Math.cos(B.rad(ang)), tip[1] - PINCEL_L * Math.sin(B.rad(ang))];
        const admira = B.kf([[0, 0], [0.74, 0], [0.77, 1], [0.8, 1], [0.84, 0], [1, 0]], u);
        const pintando = (u > ARC1[0] && u < ARC1[1]) || (u > ARC2[0] && u < ARC2[1]);
        const molhando = (u > DIP1[0] && u < DIP1[1]) || (u > DIP2[0] && u < DIP2[1]);
        const expr = admira > 0.4 ? { base: 'riso' } : pintando ? { base: 'concentrado', olhar: [9, 0] } : molhando ? { base: 'feliz', olhar: [8, 7] } : { base: 'feliz', olhar: [7, 2] };
        const teo = teoFrente({
          x: X, y: Y, s, lean: 3 + 3 * (molhando ? 1 : 0) - 4 * admira, cabeca: molhando ? 6 : 4 - 8 * admira,
          bracoDir: { alvo: paraLocal(mao), dobra: 1 }, bracoEsq: { a1: -22, a2: -10 },
          expr, piscar: B.piscando(t),
          itensFrente: i => `<g transform="translate(${r2(-X / s)} ${r2(-Y / s)}) scale(${r2(1 / s)})">${pincel(i.aCena(i.maoDir), ang, corPonta(u))}</g>
            <circle cx="${r2(i.maoDir[0])}" cy="${r2(i.maoDir[1])}" r="16" fill="${B.C.skin}" stroke="${OL}" stroke-width="${B.SW}"/>`,
        });
        // folha que vira por cima do cavalete
        let papel;
        if (u < VIRA[0]) papel = folha(k1, k2);
        else {
          const p = B.ease(B.clamp((u - VIRA[0]) / (VIRA[1] - VIRA[0])));
          papel = folha(0, 0);
          if (p < 0.5) {
            const e = 1 - 2 * p;
            papel += `<g transform="translate(0 ${F.y0}) scale(1 ${r2(Math.max(0.02, e))}) translate(0 ${-F.y0})">${folha(1, 1)}</g>`;
          } else {
            const hgt = F.h * 0.45 * Math.sin(Math.PI * (p - 0.5) * 2) ;   // verso aparece por cima e cai para trás
            if (hgt > 1) papel += `<rect x="${F.x0}" y="${r2(F.y0 - hgt)}" width="${F.w}" height="${r2(hgt)}" fill="#F2F2F2" stroke="${OL}" stroke-width="5"/>`;
          }
        }
        return B.quadro(cen.svg + cav + papel + bandeja + potes + teo.svg);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'plop') S.colocar(fx, S.SOM.plop(), e.t, 0.5);
      if (e.tipo === 'pinta') S.colocar(fx, S.SOM.esfrega(e.d, 1400), e.t, 0.3);
      if (e.tipo === 'ding') S.colocar(fx, S.SOM.ding(1568), e.t, 0.15);
      if (e.tipo === 'vira') S.colocar(fx, S.SOM.papel(0.32), e.t, 0.5);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
