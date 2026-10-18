// V25 — Pintar o papel com lápis de cor. Teo sentado à mesa (de lado) com um caderno de colorir aberto.
// Cada repetição: pinta o sol de amarelo (rabiscando de um lado para o outro) → olha satisfeito (brilhinho) →
// vira a página (volta rápida) e aparece uma página igual, em branco.
const B = require('../lib/base');
const { sala } = require('../lib/cenario');
const { sentado, tracoProgressivo } = require('./obj-lote5');
const { OL, r2, tracoSvg: st } = B;

const AMARELO = '#FFD43B';
const U_PINTA = [0.06, 0.68], U_VIRA = [0.8, 0.93];

module.exports = {
  id: 'V25', slug: 'pintar-lapis-de-cor', acao: 'Pintar', contexto: 'Pintar o papel com lápis de cor',
  criar() {
    const cen = sala({ quadro: false });
    const M = sentado({ X: 640, s: 1.7, chao: cen.chao, mesaW: 640, D: 220, mesaX0: 70, corTampo: '#E3B67E' });
    // caderno (espiral na horizontal): página de perto (a de pintar) e página de longe (verso das já viradas)
    const bx0 = 782, bx1 = 1042, bindY = M.Tm, Hn = 96;
    const SOL = { cx: 888, cy: bindY + 50, rx: 54, ry: 30 };
    // rabisco que preenche o sol: linhas indo e voltando, de cima para baixo
    const R = 6, pts = [];
    for (let j = 0; j < R; j++) {
      const y = SOL.cy - SOL.ry + (j + 0.5) * 2 * SOL.ry / R;
      const w = SOL.rx * Math.sqrt(Math.max(0, 1 - ((y - SOL.cy) / SOL.ry) ** 2)) + 6;
      const a = [SOL.cx - w, y], b = [SOL.cx + w, y];
      if (j % 2) pts.push(b, a); else pts.push(a, b);
    }
    const segs = []; let len = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push([len, l, pts[i - 1], pts[i]]); len += l; }
    const dRabisco = 'M ' + pts.map(p => `${r2(p[0])} ${r2(p[1])}`).join(' L ');
    const pontoEm = k => { const d = B.clamp(k) * len; for (const [l0, l, a, b] of segs) if (d <= l0 + l) return B.lerp(a, b, (d - l0) / l); return pts[pts.length - 1]; };

    // desenho da página (plana), com o sol pintado até k
    const raios = Array.from({ length: 10 }, (_, i) => {
      const a = i * Math.PI / 5, c = Math.cos(a), sn = Math.sin(a);
      return `M ${r2(SOL.cx + c * (SOL.rx + 10))} ${r2(SOL.cy + sn * (SOL.ry + 7))} L ${r2(SOL.cx + c * (SOL.rx + 26))} ${r2(SOL.cy + sn * (SOL.ry + 16))}`;
    }).join(' ');
    const pagina = (k, id) => `
      <rect x="${bx0}" y="${bindY}" width="${bx1 - bx0}" height="${Hn}" fill="#fff" stroke="${OL}" stroke-width="5"/>
      <clipPath id="${id}"><ellipse cx="${SOL.cx}" cy="${SOL.cy}" rx="${SOL.rx}" ry="${SOL.ry}"/></clipPath>
      <g clip-path="url(#${id})">${tracoProgressivo(dRabisco, len, k, 2 * SOL.ry / R * 1.7, AMARELO)}</g>
      <ellipse cx="${SOL.cx}" cy="${SOL.cy}" rx="${SOL.rx}" ry="${SOL.ry}" fill="none" stroke="${OL}" stroke-width="4"/>
      ${st(raios, 4)}
      ${st(`M ${bx1 - 70} ${bindY + 78} q 12 -16 24 0 q 12 -16 24 0`, 4)}`;   // passarinho para dar contexto de "desenho"
    const verso = (y0, h) => `<rect x="${bx0}" y="${r2(Math.min(y0, y0 + h))}" width="${bx1 - bx0}" height="${r2(Math.abs(h))}" fill="#F4F4F4" stroke="${OL}" stroke-width="5"/>`;
    const espiral = Array.from({ length: 11 }, (_, i) => `<ellipse cx="${bx0 + 14 + i * 23.4}" cy="${bindY}" rx="5" ry="11" fill="none" stroke="#8A8F98" stroke-width="4"/>`).join('');
    const sombraCad = `<rect x="${bx0 + 8}" y="${bindY - Hn + 8}" width="${bx1 - bx0}" height="${2 * Hn}" fill="#000" opacity="0.12"/>`;

    // lápis: da mão até a ponta
    const lapis = (h, tip) => {
      const ang = B.angulo(h, tip), L = Math.hypot(tip[0] - h[0], tip[1] - h[1]);
      return `<g transform="translate(${r2(h[0])} ${r2(h[1])}) rotate(${r2(ang)})">
        <rect x="-22" y="-8" width="${r2(L - 4)}" height="16" fill="${AMARELO}" stroke="${OL}" stroke-width="4"/>
        <rect x="-30" y="-8" width="10" height="16" fill="#F28CB1" stroke="${OL}" stroke-width="4"/>
        <path d="M ${r2(L - 26)} -8 L ${r2(L)} 0 L ${r2(L - 26)} 8 Z" fill="#F2C89B" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M ${r2(L - 9)} -3 L ${r2(L)} 0 L ${r2(L - 9)} 3 Z" fill="#E0A800"/></g>`;
    };
    const LAPIS = [44, 40];   // vetor mão → ponta, na cena
    const inicio = pontoEm(0);
    return {
      eventos: [
        ...[0, 1, 2].flatMap(i => [
          ...Array.from({ length: R }, (_, j) => ({ t: (i + B.mix(U_PINTA[0], U_PINTA[1], (j * 2 + 0.5) / (2 * R))) * B.CICLO, tipo: 'risca' })),
          { t: (i + 0.71) * B.CICLO, tipo: 'ding' },
          { t: (i + U_VIRA[0]) * B.CICLO, tipo: 'vira' },
        ]),
      ],
      frame(f) {
        const { t, u } = B.tempo(f);
        const k = B.clamp((u - U_PINTA[0]) / (U_PINTA[1] - U_PINTA[0]));
        const p = B.ease(B.clamp((u - U_VIRA[0]) / (U_VIRA[1] - U_VIRA[0])));
        const virando = u >= U_VIRA[0];
        // ponta do lápis: segue o rabisco; depois vai pegar a borda da página e acompanha até ela ficar em pé
        const Hv = Hn * 1.25;
        const yBorda = bindY + Hn * Math.cos(Math.PI * p) - Hv * Math.sin(Math.PI * p);
        const ALTO = [SOL.cx - 20, SOL.cy - 60], BORDA = [bx0 + 50, bindY + Hn + 4];
        const uSolta = B.mix(U_VIRA[0], U_VIRA[1], 0.3);
        const pS = B.ease(0.3), SOLTA0 = [bx0 + 50, bindY + Hn * Math.cos(Math.PI * pS) - Hv * Math.sin(Math.PI * pS) + 4];
        let tip;
        if (u < U_PINTA[0]) tip = inicio;
        else if (u < U_PINTA[1]) tip = pontoEm(k);
        else if (u < 0.77) tip = B.lerp(pontoEm(1), ALTO, B.ease((u - U_PINTA[1]) / 0.06));       // levanta o lápis e admira
        else if (u < U_VIRA[0]) tip = B.lerp(ALTO, BORDA, B.ease((u - 0.77) / (U_VIRA[0] - 0.77)));
        else if (u < uSolta) tip = [bx0 + 50, yBorda + 4];                                             // leva a borda da página
        else tip = B.lerp(SOLTA0, inicio, B.ease((u - uSolta) / (0.985 - uSolta)));
        const maoCena = [tip[0] - LAPIS[0], tip[1] - LAPIS[1]];
        const mao = M.paraLocal(maoCena);
        // rabiscando: a mão treme um pouquinho
        const admira = B.kf([[0, 0], [0.66, 0], [0.74, 1], [0.92, 1], [1, 0]], u);
        const expr = u > 0.69 && u < 0.8 ? { base: 'orgulho', olhar: [4, 6] } : (u > U_PINTA[0] && u < U_PINTA[1] ? { base: 'concentrado', olhar: [4, 8] } : { base: 'feliz', olhar: [4, 7] });
        const teo = M.teo({
          lean: 26 - 20 * admira, cabeca: 10 - 14 * admira,
          bracoPerto: { alvo: mao, dobra: 1 }, bracoLonge: { alvo: M.paraLocal([bx0 + 6, bindY - 20]), dobra: 1 },
          expr, piscar: B.piscando(t) && !(u > 0.69 && u < 0.8),
          itensFrente: i => {
            const h = i.maoPerto, tl = M.paraLocal(tip);
            const hc = [M.X + h[0] * M.s, M.Y + h[1] * M.s];
            // desenha em coordenadas da cena: desfaz a escala local
            return `<g transform="translate(${r2(-M.X / M.s)} ${r2(-M.Y / M.s)}) scale(${r2(1 / M.s)})">${lapis(hc, tip)}</g>
              <circle cx="${r2(h[0])}" cy="${r2(h[1])}" r="15" fill="${B.C.skin}" stroke="${OL}" stroke-width="${B.SW}"/>`;
          },
        });
        // página que vira: frente (pintada) até ficar em pé; depois o verso cai do outro lado
        let mesa = sombraCad + verso(bindY, -Hn);
        if (!virando) mesa += pagina(k, 'pg' + f);
        else {
          mesa += pagina(0, 'pb' + f);   // a página de baixo, igualzinha e em branco
          if (p < 1 - Math.atan(Hv / Hn) / Math.PI) {   // frente visível até a página ficar no ponto mais alto
            const esc = (yBorda - bindY) / Hn;
            mesa += `<g transform="translate(0 ${r2(bindY)}) scale(1 ${r2(Math.abs(esc) < 0.02 ? 0.02 : esc)}) translate(0 ${r2(-bindY)})">${pagina(1, 'pv' + f)}</g>`;
          } else mesa += verso(bindY, yBorda - bindY);
        }
        mesa += espiral;
        // brilhinho quando termina de pintar
        let brilho = '';
        if (u > 0.69 && u < 0.82) {
          const a = B.bump(u, 0.69, 0.82);
          const estrela = (x, y, r) => `<path d="M ${x} ${y - r} L ${x + r * 0.28} ${y - r * 0.28} L ${x + r} ${y} L ${x + r * 0.28} ${y + r * 0.28} L ${x} ${y + r} L ${x - r * 0.28} ${y + r * 0.28} L ${x - r} ${y} L ${x - r * 0.28} ${y - r * 0.28} Z" fill="#FFF3A0" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>`;
          brilho = `<g opacity="${r2(a)}">${estrela(SOL.cx + 70, SOL.cy - 50, 16 + 8 * a)}${estrela(SOL.cx - 66, SOL.cy - 40, 10 + 6 * a)}</g>`;
        }
        return B.quadro(M.montar({ fundo: cen.svg, itensMesa: mesa, teo, depois: brilho }));
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'risca') S.colocar(fx, S.SOM.esfrega(0.16, 3800), e.t - 0.08, 0.35);
      if (e.tipo === 'ding') S.colocar(fx, S.SOM.ding(1568), e.t, 0.18);
      if (e.tipo === 'vira') S.colocar(fx, S.SOM.papel(0.3), e.t, 0.5);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
