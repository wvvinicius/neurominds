// V32 — Carregar uma criança: o irmãozinho no colo. De frente, no quarto.
// Cada repetição: o Teo levanta o bebê até o rosto (abracinho), desce de volta para o colo e embala
// de um lado para o outro; saem coraçõezinhos. O bebê não fala, só sorri.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { quarto } = require('../lib/cenario');
const { coracao, bracoFrente } = require('./obj-lote4');
const { OL, r2, tracoSvg: st } = B;

const s = 1.5;
const PELE_BB = '#7A4A33', MANTA = '#9ED3F5', MANTA2 = '#7CBCE8';

// bebê deitado no colo, em coordenadas locais do Teo (antes da rotação do tronco). (bx, by) = centro da manta
function bebe(bx, by, rot, riso, fase) {
  const olhos = st('M -22 -2 Q -14 -10 -6 -2', 5) + st('M 6 -2 Q 14 -10 22 -2', 5);
  const boca = riso
    ? `<path d="M -12 14 Q 0 16 12 14 Q 10 30 0 30 Q -10 30 -12 14 Z" fill="${B.C.mouth}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="0" cy="26" rx="6" ry="3" fill="${B.C.tongue}"/>`
    : st('M -8 16 Q 0 22 8 16', 4);
  const pe = 4 * Math.sin(2 * Math.PI * fase);
  return `<g transform="translate(${r2(bx)} ${r2(by)}) rotate(${r2(rot)}) scale(1.45)">
    <ellipse cx="78" cy="${r2(-6 + pe)}" rx="16" ry="12" fill="${PELE_BB}" stroke="${OL}" stroke-width="5"/>
    <path d="M -50 -30 Q 20 -46 76 -24 Q 96 0 76 26 Q 20 44 -50 30 Z" fill="${MANTA}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${st('M -20 -32 Q -8 0 -20 32 M 20 -36 Q 32 0 20 36', 4, MANTA2)}
    <circle cx="10" cy="-30" r="11" fill="${PELE_BB}" stroke="${OL}" stroke-width="5"/>
    <g transform="translate(-62 -6) rotate(${r2(-rot * 0.6 - 8)})">
      <circle cx="-34" cy="0" r="9" fill="${PELE_BB}" stroke="${OL}" stroke-width="4"/><circle cx="34" cy="0" r="9" fill="${PELE_BB}" stroke="${OL}" stroke-width="4"/>
      <ellipse cx="0" cy="2" rx="38" ry="36" fill="${PELE_BB}" stroke="${OL}" stroke-width="6"/>
      <path d="M -4 -34 Q 4 -50 16 -42 Q 6 -40 8 -32" fill="none" stroke="${B.C.hair}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="-22" cy="12" rx="7" ry="4" fill="#C2665A" opacity="0.8"/><ellipse cx="22" cy="12" rx="7" ry="4" fill="#C2665A" opacity="0.8"/>
      ${olhos}${boca}${st('M -3 8 Q 0 11 3 8', 3, B.C.skinLine)}</g></g>`;
}

module.exports = {
  id: 'V32', slug: 'carregar-irmaozinho', acao: 'Carregar', contexto: 'Carregar uma criança (irmãozinho no colo)',
  criar() {
    const cen = quarto();
    const X = 960, Y = teoFrente.emPe(cen.chao, s);
    const CORACOES = [0.18, 0.55, 0.75];
    return {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + 0.05) * B.CICLO, tipo: 'upa' }, { t: (i + 0.45) * B.CICLO, tipo: 'nina', nota: 'mi' }, { t: (i + 0.59) * B.CICLO, tipo: 'nina', nota: 're' },
        { t: (i + 0.72) * B.CICLO, tipo: 'nina', nota: 'mi' }, { t: (i + 0.86) * B.CICLO, tipo: 'nina', nota: 'do' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const sobe = B.kf([[0, 0], [0.04, 0], [0.18, 1], [0.28, 1], [0.4, 0], [1, 0]], u);
        const env = u > 0.4 && u < 0.95 ? Math.sin(Math.PI * (u - 0.4) / 0.55) : 0;
        const embala = env * Math.sin(2 * Math.PI * (u - 0.4) / 0.275);
        const lean = 7 * embala;
        const bx = 10 - 8 * sobe, by = -70 - 48 * sobe;
        const rot = -6 * embala - 14 * sobe;
        // mãos: esquerda (tela) sob a cabeça do bebê, direita sob o corpo
        const pt = q => B.girar(B.add([bx, by], B.girar(q, rot)), 0);
        const maoE = pt([-70, 40]), maoD = pt([16, 18]);
        const teo = teoFrente({
          x: X, y: Y, s, lean, cabeca: -8 * sobe + 5 * embala,
          bracoEsq: { alvo: B.girar(maoE, lean), dobra: -1 }, bracoDir: { alvo: B.girar(maoD, lean), dobra: 1 },
          pernaEsq: { a1: -2 - 2 * embala, a2: -2 }, pernaDir: { a1: 2 - 2 * embala, a2: 2 },
          expr: sobe > 0.4 ? { base: 'riso', olho: 'fechado' } : env > 0.1 ? { base: 'feliz', olho: 'feliz', boca: 'sorriso' } : 'feliz',
          piscar: B.piscando(t),
          itensMeio: i => `<g transform="rotate(${r2(lean)})">${bebe(bx, by, rot, sobe > 0.4 || (u > 0.55 && u < 0.7), t / 0.5)}</g>` + bracoFrente(i.ombroDir, i.cotoveloDir, i.maoDir),
        });
        // coraçõezinhos subindo (inclui os do ciclo anterior)
        let cor = '';
        for (let c = -1; c < B.REPETICOES; c++) CORACOES.forEach((un, j) => {
          const idade = t - (c + un) * B.CICLO, vida = 1.2;
          if (idade < 0 || idade > vida) return;
          const k = idade / vida, lado = j % 2 ? 1 : -1, base = teo.info.aCena([lado * 110, -150]);
          cor += coracao(base[0] + lado * 160 * k + 14 * Math.sin(idade * 6 + j), base[1] - 230 * k, 1.5 * Math.min(1, idade * 5), 1 - k * k);
        });
        return B.quadro(cen.svg + teo.svg + cor);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'upa') { S.colocar(fx, S.SOM.nota('do', 0.18), e.t, 0.25); S.colocar(fx, S.SOM.nota('mi', 0.18), e.t + 0.12, 0.25); S.colocar(fx, S.SOM.nota('sol', 0.3), e.t + 0.24, 0.25); }
      if (e.tipo === 'nina') S.colocar(fx, S.SOM.nota(e.nota, 0.35), e.t, 0.3);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
