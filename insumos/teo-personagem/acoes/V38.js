// V38 — Cortar as unhas (cortador de unha). Teo sentado numa cadeira no quarto (de lado), corpo inteiro.
// Cada repetição: mira o cortador na unha do dedo → aperta ("snip") e o pedacinho voa para o lixinho →
// levanta a mão e confere as unhas, satisfeito → volta.
const B = require('../lib/base');
const { quarto } = require('../lib/cenario');
const { sentado } = require('./obj-lote5');
const { OL, r2, tracoSvg: st } = B;

const U_SNIP = 0.3, VOO = 0.22;

// mão aberta com dedos (local). h = centro, ang = direção dos dedos (graus SVG), unha = comprimento da unha do indicador
function maoAberta(h, ang, unha, brilho = 0) {
  const dedos = [[-36, 21], [-14, 24], [6, 24], [26, 22]];   // [desvio do ângulo, comprimento]; o último é o indicador
  let s = '';
  dedos.forEach(([da, len], k) => {
    const a = B.rad(ang + da), d = [Math.cos(a), Math.sin(a)];
    const p0 = [h[0] + d[0] * 9, h[1] + d[1] * 9], p1 = [h[0] + d[0] * (10 + len), h[1] + d[1] * (10 + len)];
    const path = `M ${r2(p0[0])} ${r2(p0[1])} L ${r2(p1[0])} ${r2(p1[1])}`;
    s += st(path, 17) + st(path, 10, B.C.skin);
    const u = k === 3 ? unha : 2;
    s += `<circle cx="${r2(p1[0] + d[0] * (1 + u * 0.3))}" cy="${r2(p1[1] + d[1] * (1 + u * 0.3))}" r="${r2(3.4 + u * 0.3)}" fill="#FFF4EC" stroke="${OL}" stroke-width="1.6"/>`;
    if (k === 3 && brilho > 0) s += `<path transform="translate(${r2(p1[0] + d[0] * 9)} ${r2(p1[1] + d[1] * 9 - 4)}) scale(${r2(brilho)})" d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="#FFF3A0" stroke="${OL}" stroke-width="1.5"/>`;
  });
  const a = B.rad(ang - 70), d = [Math.cos(a), Math.sin(a)];
  const pol = `M ${r2(h[0] + d[0] * 6)} ${r2(h[1] + d[1] * 6)} L ${r2(h[0] + d[0] * 18)} ${r2(h[1] + d[1] * 18)}`;
  s = st(pol, 14) + st(pol, 8, B.C.skin) + s;
  return s + `<circle cx="${r2(h[0])}" cy="${r2(h[1])}" r="14" fill="${B.C.skin}" stroke="${OL}" stroke-width="${B.SW}"/>`;
}
// ponta do indicador (onde o cortador encaixa)
function pontaIndicador(h, ang) { const a = B.rad(ang + 26); return [h[0] + Math.cos(a) * 35, h[1] + Math.sin(a) * 35]; }
// cortador de unha: origem = ponta (boca do cortador), corpo para baixo/direita; aperto 0..1
function cortador(aperto, giro) {
  const al = -18 + 14 * aperto;
  return `<g transform="rotate(${r2(giro)})">
    <rect x="-2" y="-4" width="34" height="9" rx="3" fill="#C9D2DA" stroke="${OL}" stroke-width="3"/>
    <rect x="-2" y="3" width="34" height="7" rx="3" fill="#AEB8C2" stroke="${OL}" stroke-width="3"/>
    <g transform="translate(26 -4) rotate(${r2(al)})"><rect x="-30" y="-5" width="34" height="6" rx="3" fill="#E63946" stroke="${OL}" stroke-width="3"/></g>
    <circle cx="26" cy="-4" r="3" fill="${OL}"/></g>`;
}

module.exports = {
  id: 'V38', slug: 'cortar-unhas', acao: 'Cortar', contexto: 'Cortar as unhas',
  criar() {
    const cen = quarto();
    const M = sentado({ X: 800, s: 2.0, chao: 1030, mesaW: 0, pesNoChao: true, corCadeira: '#5DAE5B' });
    const LIXO = [M.X + 420, 1030];
    const lixo = `<ellipse cx="${LIXO[0]}" cy="${LIXO[1]}" rx="56" ry="10" fill="#000" opacity="0.12"/>
      <path d="M ${LIXO[0] - 50} ${LIXO[1] - 110} L ${LIXO[0] - 40} ${LIXO[1]} L ${LIXO[0] + 40} ${LIXO[1]} L ${LIXO[0] + 50} ${LIXO[1] - 110} Z" fill="#7CC8FF" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      ${st(`M ${LIXO[0] - 30} ${LIXO[1] - 90} L ${LIXO[0] - 24} ${LIXO[1] - 14} M ${LIXO[0]} ${LIXO[1] - 92} L ${LIXO[0]} ${LIXO[1] - 14} M ${LIXO[0] + 30} ${LIXO[1] - 90} L ${LIXO[0] + 24} ${LIXO[1] - 14}`, 4, '#4FA3E0')}`;
    const lixoBoca = `<ellipse cx="${LIXO[0]}" cy="${LIXO[1] - 110}" rx="50" ry="12" fill="#3B6E99" stroke="${OL}" stroke-width="5"/>`;
    // poses (local): mão de trás (a que tem as unhas) e ângulo dos dedos
    const MAO_CORTE = [60, -78], ANG_CORTE = -82;
    const MAO_OLHA = [94, -94], ANG_OLHA = -92;
    const K_OLHA = [[0, 0], [0.42, 0], [0.56, 1], [0.78, 1], [0.92, 0], [1, 0]];
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + U_SNIP) * B.CICLO, tipo: 'snip' },
        { t: (i + U_SNIP + VOO) * B.CICLO, tipo: 'cai' },
        { t: (i + 0.62) * B.CICLO, tipo: 'ding' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const olha = B.kf(K_OLHA, u);
        const maoT = B.lerp(MAO_CORTE, MAO_OLHA, olha), ang = B.mix(ANG_CORTE, ANG_OLHA, olha) + 8 * olha * B.onda(t, 0.5);
        const ponta = pontaIndicador(maoT, ang);
        // cortador: encaixa na ponta, aperta devagar, snip, e desce
        const aperto = B.kf([[0, 0], [0.1, 0], [U_SNIP - 0.01, 0.75], [U_SNIP, 1], [U_SNIP + 0.06, 1], [U_SNIP + 0.12, 0], [1, 0]], u);
        const afasta = B.kf([[0, 0], [U_SNIP + 0.04, 0], [0.48, 1], [0.86, 1], [0.98, 0], [1, 0]], u);
        const PONTA_CORTE = pontaIndicador(MAO_CORTE, ANG_CORTE);
        const giroCort = 45 - 60 * afasta;
        const hCorte = [PONTA_CORTE[0] + 46 * Math.cos(B.rad(45)), PONTA_CORTE[1] + 46 * Math.sin(B.rad(45))];
        const maoCort = B.lerp(hCorte, [66, -44], afasta);
        const bocaCort = [maoCort[0] - 46 * Math.cos(B.rad(giroCort)), maoCort[1] - 46 * Math.sin(B.rad(giroCort))];
        const unha = u < U_SNIP ? 6 : 1;
        const brilho = B.bump(u, 0.56, 0.8);
        const cortando = u > 0.08 && u < U_SNIP + 0.04;
        const expr = olha > 0.5 ? { base: 'orgulho', olhar: [7, 4] } : cortando ? { base: 'concentrado', olhar: [5, 5] } : { base: 'feliz', olhar: [5, 5] };
        const teo = M.teo({
          lean: 12 - 2 * olha, cabeca: 14 - 4 * olha,
          bracoPerto: { alvo: maoT, dobra: 1 }, bracoLonge: { alvo: maoCort, dobra: 1 },
          expr, piscar: B.piscando(t) && olha < 0.5,
          itensMeio: i => `<circle cx="${r2(i.maoLonge[0])}" cy="${r2(i.maoLonge[1])}" r="15" fill="${B.C.skin}" stroke="${OL}" stroke-width="${B.SW}"/>
            <g transform="translate(${r2(bocaCort[0])} ${r2(bocaCort[1])}) scale(1.45)">${cortador(aperto, giroCort)}</g>`,
          itensFrente: () => maoAberta(maoT, ang, unha, brilho),
        });
        // pedacinho de unha voando até o lixinho (inclui o do ciclo anterior)
        let voo = '';
        const p0 = M.L(PONTA_CORTE[0] + 4, PONTA_CORTE[1] - 4), p1 = [LIXO[0], LIXO[1] - 104];
        for (let c = -1; c <= B.REPETICOES; c++) {
          const idade = t / B.CICLO - (c + U_SNIP);
          if (idade < 0 || idade > VOO) continue;
          const q = idade / VOO;
          const x = B.mix(p0[0], p1[0], q), y = B.mix(p0[1], p1[1], q) - 160 * Math.sin(Math.PI * q);
          voo += `<path transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(720 * q)})" d="M -8 0 Q 0 -8 8 0 Q 0 -3 -8 0 Z" fill="#FFF4EC" stroke="${OL}" stroke-width="2.5"/>`;
          if (q < 0.3) voo += st(`M ${r2(p0[0] + 10)} ${r2(p0[1] - 14)} l 8 -10 M ${r2(p0[0] + 18)} ${r2(p0[1] - 2)} l 12 -4`, 3, OL, `opacity="${r2(1 - q / 0.3)}"`);
        }
        return B.quadro(M.montar({ fundo: cen.svg + lixo + lixoBoca, teo, depois: voo }));
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'snip') { S.colocar(fx, S.SOM.snip(), e.t, 0.9); S.colocar(fx, S.SOM.clique(), e.t, 0.5); }
      if (e.tipo === 'cai') S.colocar(fx, S.SOM.gotinha(), e.t, 0.25);
      if (e.tipo === 'ding') S.colocar(fx, S.SOM.ding(1760), e.t, 0.12);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
