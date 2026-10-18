// V39 — Cantar. De frente, no quarto, com um microfone de brinquedo.
// Cada repetição: respira, canta a mesma frase (notinhas saindo da boca) e abre o braço na nota longa.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { quarto } = require('../lib/cenario');
const { OL, r2 } = B;

const FRASE = [[0.15, 'sol'], [0.27, 'sol'], [0.39, 'la'], [0.51, 'sol'], [0.63, 'do2']];   // [u, nota]
const CORES = ['#E63946', '#2F6BDB', '#5DAE5B', '#B565D9', '#F28C28'];

function notaMusical(x, y, cor, a, rot) {
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})" opacity="${r2(a)}">
    <ellipse cx="0" cy="0" rx="16" ry="12" transform="rotate(-20)" fill="${cor}" stroke="${OL}" stroke-width="5"/>
    <path d="M 13 -4 L 13 -58 Q 30 -50 36 -34" fill="none" stroke="${OL}" stroke-width="6" stroke-linecap="round"/></g>`;
}

module.exports = {
  id: 'V39', slug: 'cantar', acao: 'Cantar', contexto: 'Cantar',
  criar() {
    const cen = quarto();
    const s = 1.5, X = 960, Y = teoFrente.emPe(cen.chao, s);
    return {
      eventos: [0, 1, 2].flatMap(i => FRASE.map(([u, nota], j) => ({ t: (i + u) * B.CICLO, tipo: 'nota', nota, longa: j === FRASE.length - 1 }))),
      frame(f) {
        const { t, u } = B.tempo(f);
        const cantando = u > 0.13 && u < 0.86;
        const respira = B.bump(u, 0, 0.14);
        const braco = B.kf([[0, 0], [0.58, 0], [0.68, 1], [0.84, 1], [0.95, 0], [1, 0]], u);
        const balanco = cantando ? 5 * B.onda(t, 0.5) : 0;
        // boca abre em cada nota
        const abre = FRASE.some(([un]) => u >= un && u < un + 0.09) || (u >= 0.63 && u < 0.84);
        const teo = teoFrente({
          x: X, y: Y - 6 * respira, s, cabeca: balanco - 6 * braco, lean: balanco * 0.4,
          expr: cantando ? (abre ? 'cantando' : { base: 'cantando', boca: 'o' }) : 'feliz', piscar: !cantando && B.piscando(t),
          bracoDir: { alvo: [50, -205], dobra: 1 },
          bracoEsq: { a1: B.mix(-18, -112, braco), a2: B.mix(-6, -150, braco) },
          itensFrente: i => {
            // microfone: cabo na mão, cabeça perto da boca
            const [hx, hy] = i.maoDir, [bx, by] = [i.boca[0] + 26, i.boca[1] + 6];
            return `<path d="M ${r2(hx)} ${r2(hy)} L ${r2(bx)} ${r2(by)}" stroke="${OL}" stroke-width="18" stroke-linecap="round"/>
              <path d="M ${r2(hx)} ${r2(hy)} L ${r2(bx)} ${r2(by)}" stroke="#E63946" stroke-width="9" stroke-linecap="round"/>
              <circle cx="${r2(bx)}" cy="${r2(by)}" r="17" fill="#8A8F98" stroke="${OL}" stroke-width="5"/>
              <path d="M ${r2(bx - 10)} ${r2(by - 6)} L ${r2(bx + 10)} ${r2(by - 6)} M ${r2(bx - 12)} ${r2(by + 2)} L ${r2(bx + 12)} ${r2(by + 2)} M ${r2(bx - 6)} ${r2(by - 14)} L ${r2(bx - 6)} ${r2(by + 12)} M ${r2(bx + 4)} ${r2(by - 14)} L ${r2(bx + 4)} ${r2(by + 12)}" stroke="${OL}" stroke-width="2.5"/>
              <circle cx="${r2(hx)}" cy="${r2(hy)}" r="16" fill="${B.C.skin}" stroke="${OL}" stroke-width="6"/>`;
          },
        });
        // notinhas: nascem na boca em cada nota e sobem; inclui as do ciclo anterior para o loop fechar
        const boca = teo.info.aCena(teo.info.boca);
        let notas = '';
        for (let c = -1; c < B.REPETICOES; c++) FRASE.forEach(([un], j) => {
          const idade = t - (c + un) * B.CICLO;
          if (idade < 0 || idade > 1.3) return;
          const k = idade / 1.3;
          notas += notaMusical(boca[0] + 90 + 260 * k + 30 * Math.sin(idade * 7 + j), boca[1] - 30 - 300 * k, CORES[j], 1 - k * k, 15 * Math.sin(idade * 6 + j));
        });
        return B.quadro(cen.svg + teo.svg + notas);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) S.colocar(fx, S.SOM.nota(e.nota, e.longa ? 0.45 : 0.22), e.t, e.longa ? 0.55 : 0.45);
    for (let b = 0; b < 12; b++) S.colocar(fx, S.SOM.chimbal(), b * 0.5 + 0.25, 0.06);   // marcação leve (120 bpm)
    return { fx, amb: S.AMB.casa() };
  },
};
