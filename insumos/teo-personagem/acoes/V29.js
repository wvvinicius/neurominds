// V29 — Chorar de dor (bateu o joelho). No parque, sentado na grama (de lado), com a perna machucada esticada.
// Cada repetição: soluça (o corpo dá um pulinho, "hic") → chora com lágrimas, balançando devagar, com a mão perto do joelho →
// funga, olha o joelho e faz carinho nele → volta.  Triste, mas fofo: sem exagero.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { parque, OBJ } = require('../lib/cenario');
const { OL, r2, tracoSvg: st } = B;

const HIC = 0.1;

module.exports = {
  id: 'V29', slug: 'chorar-de-dor', acao: 'Chorar', contexto: 'Chorar de dor (bateu o joelho)',
  criar() {
    const cen = parque();
    const s = 1.8, X = 800, Y = cen.chao - 24 * s;
    const PE = [114, 4], PE_L = [62, 6];
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + HIC) * B.CICLO, tipo: 'hic' },
        { t: (i + 0.72) * B.CICLO, tipo: 'funga' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const hic = B.bump(u, HIC - 0.03, HIC + 0.09);          // pulinho do soluço
        const olha = B.kf([[0, 0], [0.64, 0], [0.72, 1], [0.92, 1], [1, 0]], u);
        const balanco = (1 - olha) * B.onda(t, 1);              // balança devagar enquanto chora
        const carinho = olha * B.onda(t, 0.25);                  // mão esfrega o joelho
        let expr;
        if (hic > 0.3) expr = { base: 'chorando', boca: 'o', olho: 'apertado' };
        else if (olha > 0.5) expr = { base: 'triste', boca: 'triste', lagrimas: true, olhar: [4, 10] };
        else expr = { base: 'chorando' };
        const dy = 9 * hic;
        const pe = [PE[0], PE[1] + dy], peL = [PE_L[0], PE_L[1] + dy];
        const K = B.ik([0, 0], pe, 55, 60, -1), KL = B.ik([-4, -3], peL, 55, 60, -1);
        const maoP = B.lerp([K[0] - 24, K[1] - 16], [K[0] - 14 + 7 * carinho, K[1] - 22], olha);
        const teo = teoLado({
          x: X, y: Y - dy * s, s, lean: 20 + 3 * balanco - 5 * hic + 6 * olha, cabeca: 4 * balanco - 10 * hic + 8 * olha,
          pernaPerto: { alvo: pe, dobra: -1, giroPe: -10 },
          pernaLonge: { alvo: peL, dobra: -1, giroPe: 0 },
          bracoPerto: { alvo: maoP, dobra: 1 }, bracoLonge: { alvo: [KL[0] + 6, KL[1] - 8], dobra: 1 },
          expr, fase: t * 1.5, sombraY: 24 + dy, sombraLarg: 120, sombraX: 50,
          // perna machucada redesenhada por cima do tronco, com o vermelhinho no joelho
          itensMeio: i => {
            const Kk = i.joelhoPerto, Fp = i.pePerto;
            const a = B.lerp([0, 0], Kk, 0.55), b = B.lerp(Kk, Fp, 0.5);
            const dor = olha < 0.5 ? 0.5 + 0.5 * Math.abs(B.onda(t, 1)) : 0.35;
            const linhas = olha < 0.5 ? `<g opacity="${r2(dor)}">${st(`M ${r2(Kk[0] + 4)} ${r2(Kk[1] - 32)} l 2 -14 M ${r2(Kk[0] + 20)} ${r2(Kk[1] - 26)} l 10 -10 M ${r2(Kk[0] + 30)} ${r2(Kk[1] - 10)} l 14 -3`, 4, '#E63946')}</g>` : '';
            return B.limb([a, Kk, b].map(p => [+r2(p[0]), +r2(p[1])]), B.C.skin, 22) +
              `<ellipse cx="${r2(Kk[0] + 4)}" cy="${r2(Kk[1] - 9)}" rx="14" ry="8" fill="#E8607A"/>
               <ellipse cx="${r2(Kk[0] + 3)}" cy="${r2(Kk[1] - 11)}" rx="5" ry="2.5" fill="#F7A1B0"/>` + linhas;
          },
        });
        const bola = OBJ.bola(X + 560, cen.chao - 34, 34, 20);
        return B.quadro(cen.svg + bola + teo.svg);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    const funga = () => S.envelope(S.passaFaixa(S.ruido(0.28), 1800, 1.2), t => (t < 0.12 ? Math.sin(Math.PI * t / 0.12) : 0.7 * Math.sin(Math.PI * Math.min(1, (t - 0.14) / 0.12))) * 0.9);
    for (const e of eventos) {
      if (e.tipo === 'hic') S.colocar(fx, S.SOM.soluco(), e.t, 0.5);
      if (e.tipo === 'funga') S.colocar(fx, funga(), e.t, 0.35);
    }
    return { fx, amb: S.AMB.parque() };
  },
};
