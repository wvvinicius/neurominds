// V43 — Pegar um brinquedo do chão. De lado, no quarto, com um ursinho no chão.
// Cada repetição: vê o ursinho, agacha, pega, levanta e mostra o ursinho bem alto, rindo (coraçõezinhos);
// na volta rápida agacha e devolve o ursinho ao chão.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { quarto } = require('../lib/cenario');
const { urso } = require('./obj-lote2');
const { OL, r2 } = B;

const ESC = 1.45;                   // escala do ursinho na cena
const CHAO_URSO = 912;              // base do ursinho no chão (um pouco à frente do Teo)

function coracao(x, y, s, a) {
  if (a <= 0.01) return '';
  return `<path transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s)})" opacity="${r2(a)}" d="M 0 10 C -26 -8 -20 -30 -6 -26 Q 0 -24 0 -16 Q 0 -24 6 -26 C 20 -30 26 -8 0 10 Z" fill="#FF6B8A" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>`;
}

module.exports = {
  id: 'V43', slug: 'pegar-brinquedo', acao: 'Pegar', contexto: 'Pegar um brinquedo do chão',
  criar() {
    const cen = quarto();
    const s = 1.5, X = 880, Y0 = teoLado.emPe(cen.chao, s);
    const PE_PERTO = [5.75, 114.7], PE_LONGE = [-9.75, 111.7];
    const URSO_X = 1100;
    // 0 = em pé, 1 = agachado
    const K_AG = [[0, 0], [0.06, 0], [0.22, 1], [0.3, 1], [0.44, 0], [0.76, 0], [0.84, 1], [0.88, 1], [0.97, 0], [1, 0]];
    const NA_MAO = [0.27, 0.86];   // o ursinho está na mão entre esses instantes
    const cena = {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + 0.27) * B.CICLO, tipo: 'pega' }, { t: (i + 0.46) * B.CICLO, tipo: 'mostra' }, { t: (i + 0.86) * B.CICLO, tipo: 'solta' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        return montar(u, t).svg;
      },
    };
    // deslocamento ursinho ↔ mãos no instante em que pega (assim ele não "pula" ao ser pego nem ao ser solto)
    function montar(u, t, soMaos = false) {
        const k = B.kf(K_AG, u);
        const desce = 72 * k, atras = 14 * k;
        const mostra = B.kf([[0, 0], [0.36, 0], [0.48, 1], [0.74, 1], [0.8, 0], [1, 0]], u);
        const pulinho = mostra > 0.9 ? 8 * Math.abs(Math.sin((u - 0.48) / 0.26 * 2 * Math.PI)) : 0;
        const tx = X - atras * s, ty = Y0 + desce * s - pulinho * s;
        const loc = ([x, y]) => [(x - tx) / s, (y - ty) / s];
        // ponto de pega (barriga do ursinho) no chão, em cena
        const pegaChao = [URSO_X, CHAO_URSO - 48 * ESC];
        // alvo das mãos (local): repouso → ursinho no chão; depois de pegar, sobe e mostra bem alto
        const alcanca = B.kf([[0, 0], [0.06, 0], [0.22, 1], [0.3, 1], [0.44, 0.0], [0.76, 0], [0.84, 1], [0.88, 1], [0.97, 0], [1, 0]], u);
        const naMao = u >= NA_MAO[0] && u < NA_MAO[1];
        const peito = [62, -70], alto = [98, -112];
        let alvo;
        if (naMao) alvo = B.lerp(B.lerp(peito, alto, mostra), loc(pegaChao), alcanca);
        else alvo = B.lerp([24, 8], loc(pegaChao), alcanca);
        const expr = mostra > 0.6 ? { base: 'riso' } : alcanca > 0.4 ? { base: 'concentrado', olhar: [4, 8] }
          : u > 0.9 || u < 0.06 ? { base: 'feliz', olhar: [6, 6] } : 'feliz';
        const teo = teoLado({
          x: tx, y: ty, s,
          lean: 48 * k - 9 * mostra, cabeca: -10 * k - 8 * mostra,
          pernaPerto: { alvo: [PE_PERTO[0] + atras, PE_PERTO[1] - desce + pulinho], dobra: -1 },
          pernaLonge: { alvo: [PE_LONGE[0] + atras, PE_LONGE[1] - desce + pulinho], dobra: -1 },
          bracoPerto: { alvo: B.add(alvo, [-6, 6]), dobra: -1 }, bracoLonge: { alvo: B.add(alvo, [10, -4]), dobra: -1 },
          expr, piscar: mostra < 0.6 && alcanca < 0.4 && B.piscando(t),
          sombraY: 135.7 - desce + pulinho, sombraX: 15 + atras,
        });
        // ursinho: no chão ou preso às mãos (barriga entre as mãos)
        const m = B.lerp(teo.info.aCena(teo.info.maoPerto), teo.info.aCena(teo.info.maoLonge), 0.5);
        if (soMaos) return m;
        let ursoSvg;
        if (naMao) {
          const d = B.lerp(D0, [6 + 50, 48 * ESC], mostra);
          ursoSvg = urso(m[0] + d[0], m[1] + d[1], ESC, -8 * mostra + 4 * Math.sin(u * 30) * mostra);
        } else ursoSvg = urso(URSO_X, CHAO_URSO, ESC, 0);
        const mp = teo.info.aCena(teo.info.maoPerto);
        const mao = `<circle cx="${r2(mp[0])}" cy="${r2(mp[1])}" r="${r2(15 * s)}" fill="${B.C.skin}" stroke="${OL}" stroke-width="${r2(6 * s)}"/>`;
        // coraçõezinhos subindo enquanto mostra (inclui o ciclo anterior? não: somem antes do fim)
        let cor = '';
        if (mostra > 0.01) {
          const base = teo.info.aCena(alto);
          [0, 1, 2].forEach(j => {
            const ini = 0.48 + j * 0.06, id = (u - ini) / 0.22;
            if (id < 0 || id > 1) return;
            cor += coracao(base[0] + 40 + 60 * j - 20 * id, base[1] - 60 - 140 * id, 1.3, Math.sin(Math.PI * id));
          });
        }
        return { svg: B.quadro(cen.svg + teo.svg + ursoSvg + mao + cor) };
    }
    const M0 = montar(NA_MAO[0], 0, true);
    const D0 = [URSO_X - M0[0], CHAO_URSO - M0[1]];
    return cena;
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'pega') S.colocar(fx, S.SOM.pisadaFofa(), e.t, 0.5);
      if (e.tipo === 'mostra') { S.colocar(fx, S.SOM.vush(0.3), e.t - 0.25, 0.2); S.colocar(fx, S.SOM.ding(1568), e.t, 0.3); S.colocar(fx, S.SOM.ding(2093), e.t + 0.12, 0.25); }
      if (e.tipo === 'solta') S.colocar(fx, S.SOM.pisadaFofa(), e.t, 0.6);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
