// V09 — Limpar os óculos. De frente, na sala.
// Cada repetição: leva os óculos à boca e bafeja (lente embaça), esfrega com o paninho (embaçado some),
// levanta os óculos ao lado da cabeça para conferir (brilhinho + "plim") e volta rápido à pose inicial.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { sala } = require('../lib/cenario');
const { oculos, pano, brilho, nuvenzinha } = require('./obj-lote2');
const { r2 } = B;

// pose da mão esquerda (segura os óculos pela haste esquerda) e giro dos óculos
const NEUTRO = [-22, -84], BAFO = [-2, -146], ESFREGA = [0, -88], CONFERE = [-132, -214];
const K_MAO = [[0, NEUTRO], [0.08, NEUTRO], [0.2, BAFO], [0.34, BAFO], [0.42, ESFREGA], [0.64, ESFREGA], [0.74, CONFERE], [0.88, CONFERE], [0.98, NEUTRO], [1, NEUTRO]];
const K_ROT = [[0, 0], [0.64, 0], [0.74, -10], [0.88, -10], [0.98, 0], [1, 0]];
const BAFEJA = [0.22, 0.34];   // janela do bafo
const RUB = [0.43, 0.63];      // janela da esfregação
const PLIM = 0.76;

module.exports = {
  id: 'V09', slug: 'limpar-oculos', acao: 'Limpar', contexto: 'Limpar os óculos',
  criar() {
    const cen = sala();
    const s = 1.5, X = 960, Y = teoFrente.emPe(cen.chao, s);
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + BAFEJA[0]) * B.CICLO, tipo: 'bafo' },
        ...[0, 1, 2, 3].map(j => ({ t: (i + RUB[0] + j * (RUB[1] - RUB[0]) / 4) * B.CICLO, tipo: 'esfrega' })),
        { t: (i + PLIM) * B.CICLO, tipo: 'plim' },
        { t: (i + 0.88) * B.CICLO, tipo: 'volta' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const mao = B.kf(K_MAO, u), rot = B.kf(K_ROT, u);
        // embaçado: sobe durante o bafo, some durante a esfregação
        const emb = B.kf([[0, 0], [BAFEJA[0] + 0.02, 0], [BAFEJA[1], 1], [RUB[0], 1], [RUB[1], 0], [1, 0]], u);
        const bafejando = u >= BAFEJA[0] && u < BAFEJA[1];
        const esfregando = u >= RUB[0] && u < RUB[1];
        const conferindo = u >= 0.72 && u < 0.9;
        // centro dos óculos: preso à mão pela haste esquerda
        const dir = B.dirv(90 + rot, 1);   // direção "para a direita" girada
        const pega = B.kf([[0, 0], [0.64, 0], [0.74, 1], [0.9, 1], [0.98, 0], [1, 0]], u);   // 0 = pela ponte, 1 = pela lente direita
        const cx = mao[0] + B.mix(4, -36, pega), cy = mao[1] - B.mix(24, 30, pega);
        // mão direita: paninho. Em repouso ao lado do corpo; na esfregação faz círculos sobre as lentes
        const fr = (u - RUB[0]) / (RUB[1] - RUB[0]);
        const ang = fr * 4 * 2 * Math.PI;
        const lenteX = cx + B.mix(-32, 32, B.ease((fr - 0.42) / 0.16));   // passa de uma lente para a outra
        const amp = Math.min(1, fr * 8, (1 - fr) * 8);
        const ESF = [lenteX + 12 * amp * Math.cos(ang), cy + 10 * amp * Math.sin(ang) - 4];
        const REP = [70, -78];
        const pesoEsf = B.kf([[0, 0], [0.36, 0], [0.43, 1], [0.63, 1], [0.7, 0], [1, 0]], u);
        const maoDir = esfregando ? ESF : B.lerp(REP, [cx + (u < 0.5 ? -32 : 32), cy - 4], pesoEsf);
        const cab = 0;
        const expr = bafejando ? { base: 'surpreso', boca: 'oGrande', olhar: [4, 6] }
          : esfregando ? { base: 'concentrado', olhar: [0, 9] }
          : conferindo ? { base: 'feliz', olho: u > PLIM ? 'feliz' : 'aberto', olhar: [-8, -2] }
          : 'feliz';
        const teo = teoFrente({
          x: X, y: Y, s, cabeca: cab + 8 * pega, lean: 5 * pega,
          expr, piscar: !bafejando && !esfregando && !conferindo && B.piscando(t),
          bracoEsq: { alvo: mao, dobra: 1 },
          bracoDir: { alvo: maoDir, dobra: 1 },
          maosNaFrenteDaCabeca: true,
          itensFrente: i => {
            const [ex, ey] = i.maoEsq, [dx, dy] = i.maoDir;
            const balanco = esfregando ? 8 * Math.sin(ang) : 6 * B.onda(t, 1);
            return oculos(cx, cy, 1.1, rot, emb) +
              `<circle cx="${r2(ex)}" cy="${r2(ey)}" r="16" fill="${B.C.skin}" stroke="${B.OL}" stroke-width="6"/>` +
              pano(dx - 6, dy + 2, 0.9, balanco) +
              `<circle cx="${r2(dx)}" cy="${r2(dy)}" r="16" fill="${B.C.skin}" stroke="${B.OL}" stroke-width="6"/>`;
          },
        });
        // vapor: nuvenzinhas saem da boca e vão até a lente
        const boca = teo.info.aCena(teo.info.boca);
        const lente = teo.info.aCena([cx, cy]);
        let extra = '';
        for (let k = 0; k < 3; k++) {
          const ini = BAFEJA[0] + k * 0.03, idade = (u - ini) / 0.14;
          if (idade < 0 || idade > 1) continue;
          const p = B.lerp([boca[0], boca[1] + 30], lente, idade);
          extra += nuvenzinha(p[0] + 10 * Math.sin(k * 2 + idade * 6), p[1], 1.3 + 1.0 * idade, Math.sin(Math.PI * idade) * 0.95);
        }
        // brilhinho quando confere
        const kb = B.bump(u, PLIM - 0.02, 0.92);
        if (kb > 0) {
          const L = teo.info.aCena([cx + 29 * Math.cos(B.rad(rot)), cy + 29 * Math.sin(B.rad(rot)) - 6]);
          const L2 = teo.info.aCena([cx - 29 * Math.cos(B.rad(rot)) - 12, cy - 29 * Math.sin(B.rad(rot)) - 34]);
          extra += brilho(L[0] + 6, L[1] - 10, 46, kb, '#FFF6B0', 20 * u) + brilho(L2[0], L2[1] - 20, 28, B.bump(u, PLIM + 0.02, 0.9), '#FFF6B0');
          extra += brilho(L[0] + 70, L[1] - 70, 22, B.bump(u, PLIM + 0.04, 0.88), '#FFFFFF');
        }
        return B.quadro(cen.svg + teo.svg + extra);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    // bafo "háá": ruído grave e soprado
    const bafo = S.envelope(S.passaFaixa(S.ruido(0.4), 900, 0.6), t => Math.sin(Math.PI * t / 0.4) ** 1.5 * 1.2);
    for (const e of eventos) {
      if (e.tipo === 'bafo') S.colocar(fx, bafo, e.t, 0.9);
      if (e.tipo === 'esfrega') S.colocar(fx, S.SOM.esfrega(0.09, 3200), e.t, 0.6);
      if (e.tipo === 'plim') S.colocar(fx, S.SOM.ding(1760), e.t, 0.22);
      if (e.tipo === 'volta') S.colocar(fx, S.SOM.vush(0.25), e.t, 0.15);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
