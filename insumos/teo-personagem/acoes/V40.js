// V40 — Dançar. De frente, na sala, com um radinho tocando (120 bpm).
// Cada repetição = 4 tempos (2 s): 1) passo para a direita apontando para cima, 2) volta e bate palma,
// 3) passo para a esquerda apontando para cima, 4) pulinho com os braços para o alto.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { sala, ret } = require('../lib/cenario');
const { OL, r2, tracoSvg: st } = B;

const MELODIA = ['do', 'mi', 'sol', 'do2'];
const CORES = ['#E63946', '#2F6BDB', '#5DAE5B', '#B565D9'];

function notaMusical(x, y, cor, a, rot, sc = 1) {
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${r2(sc)})" opacity="${r2(a)}">
    <ellipse cx="0" cy="0" rx="16" ry="12" transform="rotate(-20)" fill="${cor}" stroke="${OL}" stroke-width="5"/>
    <path d="M 13 -4 L 13 -58 Q 30 -50 36 -34" fill="none" stroke="${OL}" stroke-width="6" stroke-linecap="round"/></g>`;
}
function radinho(x, chao, pulso) {
  const k = 1 + 0.08 * pulso;
  return `<g transform="translate(${x} ${chao})">
    <ellipse cx="0" cy="4" rx="120" ry="12" fill="#000" opacity="0.12"/>
    ${st('M -60 -150 L -30 -200', 7)}<circle cx="-30" cy="-200" r="8" fill="${OL}"/>
    <rect x="-110" y="-150" width="220" height="150" rx="22" fill="#F28C28" stroke="${OL}" stroke-width="6"/>
    <rect x="-90" y="-130" width="80" height="34" rx="6" fill="#BFE6FF" stroke="${OL}" stroke-width="5"/>
    <circle cx="-50" cy="-48" r="${r2(32 * k)}" fill="#3A3A3A" stroke="${OL}" stroke-width="6"/><circle cx="-50" cy="-48" r="${r2(12 * k)}" fill="#777"/>
    <circle cx="50" cy="-64" r="${r2(38 * k)}" fill="#3A3A3A" stroke="${OL}" stroke-width="6"/><circle cx="50" cy="-64" r="${r2(14 * k)}" fill="#777"/>
    <circle cx="20" cy="-118" r="9" fill="#FFE066" stroke="${OL}" stroke-width="4"/><circle cx="48" cy="-118" r="9" fill="#5DAE5B" stroke="${OL}" stroke-width="4"/></g>`;
}

module.exports = {
  id: 'V40', slug: 'dancar', acao: 'Dançar', contexto: 'Dançar',
  criar() {
    const cen = sala({ quadro: false });
    const s = 1.45, X = 1060, Y0 = teoFrente.emPe(cen.chao, s);
    const RX = 400;   // radinho
    // keyframes (u = posição no ciclo de 2 s; tempos em 0, .25, .5, .75)
    const HX = [[0, 0], [0.12, 26], [0.25, 26], [0.37, 0], [0.5, 0], [0.62, -26], [0.75, -26], [0.87, 0], [1, 0]];
    const PE_D = [[0, 0], [0.1, 54], [0.27, 54], [0.37, 0], [1, 0]];          // pé direito (da tela) sai para a direita
    const PE_E = [[0, 0], [0.5, 0], [0.6, -54], [0.77, -54], [0.87, 0], [1, 0]];
    // braços: 0 = solto, 1 = aponta para cima, 2 = palma, 3 = mão na cintura, 4 = para o alto (pulinho)
    const POSE_D = { solto: [24, 10], cima: [138, 156], cintura: [42, -62], palma: [-2, -132], alto: [146, 132] };
    const POSE_E = { solto: [-24, -10], cima: [-138, -156], cintura: [-42, 62], palma: [2, 132], alto: [-146, -132] };
    const seqD = [[0, 'solto'], [0.1, 'cima'], [0.24, 'cima'], [0.32, 'palma'], [0.44, 'palma'], [0.56, 'cintura'], [0.74, 'cintura'], [0.82, 'alto'], [0.94, 'alto'], [1, 'solto']];
    const seqE = [[0, 'solto'], [0.1, 'cintura'], [0.24, 'cintura'], [0.32, 'palma'], [0.44, 'palma'], [0.56, 'cima'], [0.74, 'cima'], [0.82, 'alto'], [0.94, 'alto'], [1, 'solto']];
    // cada pose vira a posição da mão (local); a mão é interpolada e o braço segue por IK
    const OMB_D = [58, -152], OMB_E = [-58, -152];
    const mao = (omb, [a1, a2]) => B.chain(omb, a1, 54, a2, 50)[1];
    const MAO_D = Object.fromEntries(Object.entries(POSE_D).map(([k, a]) => [k, mao(OMB_D, a)]));
    const MAO_E = Object.fromEntries(Object.entries(POSE_E).map(([k, a]) => [k, mao(OMB_E, a)]));
    MAO_D.palma = [16, -122]; MAO_E.palma = [-16, -122]; MAO_D.cintura = [74, -64]; MAO_E.cintura = [-74, -64];
    const ang = (seq, P, u) => B.kf(seq.map(([k, n]) => [k, P[n]]), u);
    return {
      eventos: [0, 1, 2].flatMap(i => [
        ...MELODIA.map((n, j) => ({ t: (i + j * 0.25) * B.CICLO, tipo: 'nota', nota: n })),
        { t: (i + 0.36) * B.CICLO, tipo: 'palma' },
        { t: (i + 0.93) * B.CICLO, tipo: 'pouso' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const hx = B.kf(HX, u);
        // joelhos dobram em cada tempo (a cada 0,5 s); no 4º tempo, pulinho
        const quica = 10 * (0.5 + 0.5 * Math.cos(2 * Math.PI * t / 0.5));
        const pulo = 34 * B.bump(u, 0.8, 0.93);
        const dy = quica * (1 - B.bump(u, 0.76, 0.97)) - pulo;
        const pd = B.kf(PE_D, u), pe = B.kf(PE_E, u);
        const liftD = 22 * B.bump(u, 0.0, 0.12) + 22 * B.bump(u, 0.27, 0.38);
        const liftE = 22 * B.bump(u, 0.5, 0.62) + 22 * B.bump(u, 0.77, 0.88);
        const yPe = 92 - dy;                                              // chão local, compensando o quique
        const md = ang(seqD, MAO_D, u), me = ang(seqE, MAO_E, u);
        const sway = 6 * Math.sin(2 * Math.PI * u);
        const abre = B.bump(u, 0.29, 0.36) + B.bump(u, 0.36, 0.44) * 0.7;   // mãos se afastam e batem (palma)
        const pulso = 0.5 + 0.5 * Math.cos(2 * Math.PI * t / 0.5);
        const teo = teoFrente({
          x: X + hx * s, y: Y0 + dy * s, s, lean: -sway * 0.8, cabeca: sway * 1.4,
          expr: u > 0.8 && u < 0.95 ? 'riso' : (u > 0.3 && u < 0.45 ? { base: 'riso', olho: 'feliz', boca: 'oGrande' } : { base: 'feliz', olho: 'feliz', boca: 'riso' }),
          pernaDir: { alvo: [31 + pd - hx, yPe - liftD - pulo * 0.4], dobra: -1 },
          pernaEsq: { alvo: [-31 + pe - hx, yPe - liftE - pulo * 0.4], dobra: 1 },
          bracoDir: { alvo: [md[0] + 22 * abre, md[1]], dobra: 1 }, bracoEsq: { alvo: [me[0] - 22 * abre, me[1]], dobra: -1 },
          sombraY: 124 - dy, sombraLarg: 95 - pulo,
        });
        // notinhas saem do radinho em cada tempo (inclui as do ciclo anterior para o loop)
        let notas = '';
        for (let c = -1; c < B.REPETICOES; c++) MELODIA.forEach((_, j) => {
          const idade = t - (c + j * 0.25) * B.CICLO;
          if (idade < 0 || idade > 1.4) return;
          const k = idade / 1.4;
          notas += notaMusical(RX + 40 + 120 * k + 40 * Math.sin(idade * 6 + j), cen.chao - 220 - 380 * k, CORES[j], 1 - k * k, 15 * Math.sin(idade * 5 + j), 1.1);
        });
        return B.quadro(cen.svg + radinho(RX, cen.chao - 10, pulso) + notas + teo.svg);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    const palma = () => S.envelope(S.passaFaixa(S.ruido(0.08), 1400, 0.7), t => 1.6 * Math.exp(-t / 0.018));
    for (let b = 0; b < 12; b++) {
      S.colocar(fx, S.SOM.bumbo(), b * 0.5, 0.55);
      S.colocar(fx, S.SOM.chimbal(), b * 0.5 + 0.25, 0.1);
    }
    for (const e of eventos) {
      if (e.tipo === 'nota') S.colocar(fx, S.SOM.nota(e.nota, 0.3), e.t, 0.4);
      if (e.tipo === 'palma') S.colocar(fx, palma(), e.t, 1.4);
      if (e.tipo === 'pouso') S.colocar(fx, S.SOM.pisadaFofa(), e.t, 0.35);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
