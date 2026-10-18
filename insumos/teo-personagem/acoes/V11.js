// V11 — Vestir a camiseta. De frente, no quarto.
// Começa sem camiseta, segurando a camiseta amarela. Levanta, a camiseta cobre a cabeça ("cadê o Teo?"),
// a cabeça sai pela gola, enfia os braços nas mangas, puxa a barra para baixo e fica orgulhoso.
// Volta rápida: tira a camiseta (o mesmo caminho ao contrário, depressa).
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { quarto } = require('../lib/cenario');
const { brilho } = require('./obj-lote1');
const { C, OL, SW, r2 } = B;

const TRONCO = 'M -58 -170 Q 0 -182 58 -170 Q 72 -164 70 -140 L 66 -44 Q 0 -36 -66 -44 L -70 -140 Q -72 -164 -58 -170 Z';
const AMARELO = C.shirt, DOBRA = '#E0A82A';

// camiseta esticada (de frente), centro em (cx, cy)
function camisaPlana(cx, cy, giro = 0) {
  return `<g transform="translate(${r2(cx)} ${r2(cy)}) rotate(${r2(giro)})">
    <path d="M -64 -62 L -26 -72 Q 0 -50 26 -72 L 64 -62 L 104 -22 L 80 6 L 64 -8 L 64 70 Q 0 78 -64 70 L -64 -8 L -80 6 L -104 -22 Z" fill="${AMARELO}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${B.tracoSvg('M -26 -72 Q 0 -50 26 -72', SW)}${B.tracoSvg('M -40 20 Q -30 34 -20 22 M 30 -20 Q 38 -6 46 -18', 4, DOBRA)}</g>`;
}
// camiseta enfiada na cabeça (coordenadas da cabeça, centro do rosto em 0,0)
function camisaNaCabeca(k, mexe) {
  return `<g transform="scale(${r2(k)}) rotate(${r2(mexe)} 0 40)">
    <path d="M -96 96 Q -150 40 -146 -40 Q -140 -170 0 -178 Q 140 -170 146 -40 Q 150 40 96 96 Q 0 112 -96 96 Z" fill="${AMARELO}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M -140 -10 L -176 30 L -150 54 L -128 32 Z" fill="${AMARELO}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M 140 -10 L 176 30 L 150 54 L 128 32 Z" fill="${AMARELO}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${B.tracoSvg('M -60 -120 Q -40 -80 -70 -40 M 50 -130 Q 30 -90 60 -50 M -20 20 Q 0 40 20 18', 5, DOBRA)}
    ${B.tracoSvg('M -96 96 Q 0 112 96 96', SW)}</g>`;
}
// camiseta enrolada em volta do pescoço/peito (rolinho)
function rolo(y, w = 150) {
  return `<rect x="${-w / 2}" y="${r2(y - 20)}" width="${w}" height="40" rx="20" fill="${AMARELO}" stroke="${OL}" stroke-width="${SW}"/>
    ${B.tracoSvg(`M ${-w / 2 + 24} ${r2(y - 6)} q 14 10 28 0 M ${-8} ${r2(y + 4)} q 14 -10 28 0 M ${w / 2 - 44} ${r2(y - 4)} q 10 8 22 0`, 4, DOBRA)}`;
}
// barriga aparecendo abaixo da barra enrolada (barra em y = barra)
function barriga(barra) {
  if (barra > -50) return '';
  return `<clipPath id="bar"><rect x="-90" y="${r2(barra)}" width="180" height="120"/></clipPath>
    <g clip-path="url(#bar)"><path d="${TRONCO}" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${barra < -86 ? B.tracoSvg('M -4 -80 q 4 4 8 0', 4, C.skinLine) : ''}</g>
    <rect x="-74" y="${r2(barra - 14)}" width="148" height="26" rx="13" fill="${AMARELO}" stroke="${OL}" stroke-width="${SW}"/>
    ${B.tracoSvg(`M -44 ${r2(barra - 2)} q 12 8 24 0 M 22 ${r2(barra)} q 12 -8 24 0`, 4, DOBRA)}`;
}

// p: 0 = segurando a camiseta, 1 = vestido
const E = { sobe: 0.24, saco: 0.4, pop: 0.44, enfia: 0.54, solta: 0.66, fim: 1 };
function estado(p) {
  const st = {};
  if (p < E.sobe + 0.02) {                                    // A/B: segura pela barra e levanta até o rosto
    const k = B.ease(p / E.sobe);
    st.plana = [0, B.mix(-84, -262, k)];
    st.maos = [[-62, st.plana[1] + 66], [62, st.plana[1] + 66]];
    st.saco = p > E.sobe - 0.03 ? B.clamp((p - (E.sobe - 0.03)) / 0.05) : 0;
  } else if (p < E.saco) {                                    // cabeça dentro da camiseta
    st.saco = 1;
    st.maos = [[-86, -184], [86, -184]];
  } else if (p < E.pop) {                                     // a cabeça sai pela gola
    st.pop = (p - E.saco) / (E.pop - E.saco);
    st.saco = 1 - st.pop;
    st.rolo = -150;
    st.maos = [[-60, -136], [60, -136]];
  } else if (p < E.enfia) {                                   // enfia os braços (mãos entram embaixo do rolinho)
    const k = B.ease((p - E.pop) / (E.enfia - E.pop));
    st.rolo = -150;
    st.maos = [B.lerp([-60, -136], [-24, -140], k), B.lerp([60, -136], [24, -140], k)];
    st.rolinhoNaFrente = k > 0.5;
  } else if (p < E.solta) {                                   // braços saem com as mangas, mãos vão para a barra
    const k = B.ease((p - E.enfia) / (E.solta - E.enfia));
    st.vestida = true; st.barra = -124;
    st.maos = [B.lerp([-30, -112], [-70, -116], k), B.lerp([30, -112], [70, -116], k)];
  } else {                                                    // puxa a barra para baixo
    const k = B.ease((p - E.solta) / (E.fim - E.solta));
    st.vestida = true; st.barra = B.mix(-124, -40, k);
    st.maos = [[-70, st.barra + 6], [70, st.barra + 6]];
    st.solta = B.clamp((p - 0.97) / 0.03);
  }
  return st;
}

module.exports = {
  id: 'V11', slug: 'vestir-camiseta', acao: 'Vestir', contexto: 'Vestir a camiseta',
  criar() {
    const cen = quarto();
    const s = 1.5, X = 960, Y = teoFrente.emPe(cen.chao, s);
    const U0 = 0.03, U1 = 0.8, U2 = 0.9;   // ação devagar em U0–U1, orgulho até U2, volta rápida até 1
    const pDe = u => u < U0 ? 0 : u < U1 ? (u - U0) / (U1 - U0) : u < U2 ? 1 : 1 - B.ease((u - U2) / (1 - U2));
    const uDe = p => U0 + p * (U1 - U0);
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + uDe(0.02)) * B.CICLO, tipo: 'vush' }, { t: (i + uDe(E.saco)) * B.CICLO, tipo: 'pop' },
        { t: (i + uDe(E.enfia)) * B.CICLO, tipo: 'manga' }, { t: (i + uDe(E.solta)) * B.CICLO, tipo: 'puxa' },
        { t: (i + U1) * B.CICLO, tipo: 'tchan' }, { t: (i + U2) * B.CICLO, tipo: 'tira' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const p = pDe(u);
        const st = estado(p);
        const orgulho = u >= U1 - 0.01 && u < U2;
        const mexe = st.saco === 1 ? 7 * B.onda(t, 0.25) : 0;
        const expr = orgulho ? (u < U1 + 0.05 ? 'riso' : 'orgulho') : p < 0.02 ? 'feliz'
          : st.pop !== undefined ? { base: 'surpreso', boca: 'riso' } : st.vestida && st.barra > -110 ? 'esforco' : 'concentrado';
        const maoSolta = st.solta || 0;
        const repouso = [[-76, -46], [76, -46]];
        const maos = st.maos.map((m, j) => B.lerp(m, repouso[j], orgulho ? 1 : maoSolta));
        const teo = teoFrente({
          x: X, y: Y, s, cabeca: mexe,
          roupa: { camisa: st.vestida ? AMARELO : null },
          expr, piscar: !orgulho && p < 0.02 && B.piscando(t),
          bracoEsq: { alvo: maos[0], dobra: maos[0][1] < -150 ? -1 : 1 }, bracoDir: { alvo: maos[1], dobra: maos[1][1] < -150 ? 1 : -1 },
          itensTronco: (st.rolo != null && !st.rolinhoNaFrente ? rolo(st.rolo) : '') + (st.vestida ? barriga(st.barra) : ''),
          itensFrente: i => {
            let out = '';
            const mao = q => `<circle cx="${r2(q[0])}" cy="${r2(q[1])}" r="16" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
            if (st.plana && st.saco < 1) out += `<g opacity="${r2(1 - st.saco)}">${camisaPlana(st.plana[0], st.plana[1])}</g>` + mao(i.maoEsq) + mao(i.maoDir);
            if (st.saco > 0) {
              const c = i.cabeca;
              out += `<g transform="translate(${r2(c[0])} ${r2(c[1])}) rotate(${r2(mexe)} 0 70)">${camisaNaCabeca(B.mix(0.85, 1, st.saco), 0)}</g>` + mao(i.maoEsq) + mao(i.maoDir);
            }
            if (st.rolinhoNaFrente) out += rolo(st.rolo);
            if (st.pop !== undefined && st.pop < 1) {   // tracinhos do "pop"
              const c = i.daCabeca([0, -40]), a = 1 - st.pop;
              out += B.tracoSvg([-150, -110, -70, -30, 30, 70, 110, 150].map(g => {
                const r = B.rad(g - 90), r1 = 170 + 60 * st.pop, r0 = r1 + 30;
                return `M ${r2(c[0] + r1 * Math.sin(B.rad(g)))} ${r2(c[1] - r1 * Math.cos(B.rad(g)))} L ${r2(c[0] + r0 * Math.sin(B.rad(g)))} ${r2(c[1] - r0 * Math.cos(B.rad(g)))}`;
              }).join(' '), 7, OL, `opacity="${r2(a)}"`);
            }
            return out;
          },
        });
        let br = '';
        const a = orgulho ? B.bump(u, U1 - 0.01, U2) : 0;
        if (a > 0.01) {
          const c = teo.info.aCena([0, -110]);
          [[-170, -80, 30, 0], [170, -110, 26, 20], [-140, 60, 18, 10], [150, 40, 20, 30]].forEach(([dx, dy, r, rot], j) =>
            br += brilho(c[0] + dx, c[1] + dy, r * B.clamp(a * 1.6 - j * 0.1), a, rot + 30 * a));
        }
        return B.quadro(cen.svg + teo.svg + br);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'vush') S.colocar(fx, S.SOM.papel(0.35), e.t, 0.18);
      if (e.tipo === 'pop') S.colocar(fx, S.SOM.pof(), e.t + 0.1, 0.5);
      if (e.tipo === 'manga') { S.colocar(fx, S.SOM.vush(0.15), e.t, 0.2); S.colocar(fx, S.SOM.vush(0.15), e.t + 0.08, 0.2); }
      if (e.tipo === 'puxa') S.colocar(fx, S.SOM.papel(0.4), e.t + 0.05, 0.15);
      if (e.tipo === 'tchan') S.colocar(fx, S.SOM.ding(1568), e.t, 0.14);
      if (e.tipo === 'tira') S.colocar(fx, S.SOM.vush(0.2), e.t, 0.2);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
