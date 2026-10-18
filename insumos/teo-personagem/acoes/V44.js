// V44 — Guardar os brinquedos na caixa. De lado, no quarto, com uma caixa de brinquedos à direita.
// Cada repetição: agacha, pega a bola do chão, levanta e joga a bola dentro da caixa (ploft), comemora;
// no fim do ciclo a bola, sapeca, pula de volta para fora da caixa (boing) e quica até parar no mesmo lugar.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { quarto, OBJ, ret } = require('../lib/cenario');
const { urso } = require('./obj-lote2');
const { OL, r2, tracoSvg: st } = B;

const R = 42;                          // raio da bola
const BOLA0 = [1030, 905 - R];         // bola parada no chão
const CX = { x: 1350, w: 300, h: 210, chao: 910 };
const TOPO = CX.chao - CX.h;
const DENTRO = [CX.x, TOPO + 70];      // bola dentro da caixa (escondida pela frente)
const T = { pega: 0.18, joga: 0.42, cai: 0.56, pula: 0.76, quica1: 0.87, quica2: 0.93, para: 0.97 };

function caixaBrinquedos() {
  const { x, w, h, chao } = CX, x0 = x - w / 2;
  // brinquedos espiando por cima (atrás da frente)
  const dentro = urso(x - 70, TOPO + 60, 0.9, -12) +
    `<g transform="translate(${x + 70} ${TOPO + 10}) rotate(14)">${ret(-34, -34, 68, 68, '#4FB3FF')}<circle cx="0" cy="0" r="12" fill="#fff" stroke="${OL}" stroke-width="4"/></g>` +
    `<path d="M ${x + 10} ${TOPO + 30} L ${x + 30} ${TOPO - 70} L ${x + 50} ${TOPO + 30} Z" fill="#FFC93C" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>`;
  const frente = `<rect x="${x0}" y="${chao - h}" width="${w}" height="${h}" rx="10" fill="#5DAE5B" stroke="${OL}" stroke-width="6"/>
    <rect x="${x0 - 10}" y="${chao - h - 6}" width="${w + 20}" height="28" rx="8" fill="#3E8E3A" stroke="${OL}" stroke-width="6"/>
    <circle cx="${x - 70}" cy="${chao - 90}" r="26" fill="#FFC93C" stroke="${OL}" stroke-width="5"/>
    <path d="M ${x - 6} ${chao - 64} L ${x + 22} ${chao - 118} L ${x + 50} ${chao - 64} Z" fill="#E63946" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="${x + 74}" y="${chao - 116}" width="50" height="50" rx="6" fill="#4FB3FF" stroke="${OL}" stroke-width="5"/>`;
  return { dentro, frente };
}
// parábola de a até b com pico (y mínimo) pk; k = 0..1
function arco(a, b, pk, k) {
  const x = B.mix(a[0], b[0], k);
  const ym = Math.min(a[1], b[1]) - pk;
  // y(k) = parábola passando por a (k=0), b (k=1) e altura extra pk no meio
  const y = (1 - k) * a[1] + k * b[1] - 4 * pk * k * (1 - k) - 0 * ym;
  return [x, y];
}

module.exports = {
  id: 'V44', slug: 'guardar-brinquedos', acao: 'Guardar', contexto: 'Guardar os brinquedos na caixa',
  criar() {
    const cen = quarto();
    const cx = caixaBrinquedos();
    const s = 1.5, X = 870, Y0 = teoLado.emPe(cen.chao, s);
    const PE_PERTO = [5.75, 114.7], PE_LONGE = [-9.75, 111.7];
    const K_AG = [[0, 0], [0.04, 0], [0.16, 1], [0.21, 1], [0.32, 0], [1, 0]];
    // braços (local): repouso → bola no chão → peito → balanço para trás → arremesso para a frente-cima → comemora → repouso
    function pose(u, t) {
      const k = B.kf(K_AG, u), desce = 72 * k, atras = 14 * k;
      const comemora = B.kf([[0, 0], [0.54, 0], [0.6, 1], [0.72, 1], [0.78, 0], [1, 0]], u);
      const tx = X - atras * s, ty = Y0 + desce * s;
      const loc = ([x, y]) => [(x - tx) / s, (y - ty) / s];
      const chaoAlvo = loc([BOLA0[0] - 30, BOLA0[1]]);
      let alvo;
      if (u < T.pega) alvo = B.lerp([24, 8], chaoAlvo, B.kf([[0, 0], [0.04, 0], [0.16, 1], [1, 1]], u));
      else if (u < T.joga) alvo = B.kf([[T.pega, chaoAlvo], [0.21, chaoAlvo], [0.32, [56, -56]], [0.35, [50, -50]], [0.39, [24, 12]], [T.joga, [94, -74]]], u);
      else alvo = B.kf([[T.joga, [94, -74]], [0.5, [70, -80]], [0.56, [40, -10]], [1, [24, 8]]], u);
      const vaiJogar = u > 0.36 && u < 0.5;
      const olhaBola = u >= T.joga && u < T.cai;
      const expr = comemora > 0.4 ? { base: 'riso' }
        : u >= T.pula && u < T.para ? (u < 0.86 ? { base: 'surpreso', boca: 'oGrande', olhar: [5, -6] } : { base: 'riso' })
        : olhaBola ? { base: 'surpreso', olhar: [8, -4] }
        : vaiJogar ? { base: 'concentrado', olhar: [8, -2] }
        : u > T.pega - 0.12 && u < 0.32 ? { base: 'concentrado', olhar: [4, 8] } : 'feliz';
      const palma = 14 * Math.abs(Math.cos((u - 0.6) / 0.06 * Math.PI));
      const pulinho = comemora > 0.9 ? 10 * Math.abs(Math.sin((u - 0.6) / 0.12 * Math.PI)) : 0;
      const teo = teoLado({
        x: tx, y: ty - pulinho * s, s,
        lean: 46 * k + (vaiJogar ? 8 * B.bump(u, 0.38, 0.5) : 0) - 4 * comemora, cabeca: -10 * k - 6 * comemora - (olhaBola ? 6 : 0),
        pernaPerto: { alvo: [PE_PERTO[0] + atras, PE_PERTO[1] - desce + pulinho], dobra: -1 },
        pernaLonge: { alvo: [PE_LONGE[0] + atras, PE_LONGE[1] - desce + pulinho], dobra: -1 },
        // comemora batendo palminhas
        bracoPerto: { alvo: B.lerp(alvo, [66 - palma, -86], comemora), dobra: -1 },
        bracoLonge: { alvo: B.lerp(B.add(alvo, [14, -6]), [74 + palma, -90], comemora), dobra: -1 },
        expr, piscar: expr === 'feliz' && B.piscando(t),
        sombraY: 135.7 - desce + pulinho, sombraX: 15 + atras,
      });
      return teo;
    }
    // ponto de lançamento = bola nas mãos no instante do arremesso
    const naMao = teo => B.add(teo.info.aCena(teo.info.maoPerto), [34, -6]);
    const LANCA = naMao(pose(T.joga, 0));
    // na hora de pegar, a bola fica onde estava no chão e vai se ajeitando na mão (sem pulo)
    const MP0 = (te => te.info.aCena(te.info.maoPerto))(pose(T.pega, 0));
    const D0 = [BOLA0[0] - MP0[0], BOLA0[1] - MP0[1]];
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + T.pega) * B.CICLO, tipo: 'pega' }, { t: (i + T.joga) * B.CICLO, tipo: 'joga' }, { t: (i + T.cai) * B.CICLO, tipo: 'cai' },
        { t: (i + T.pula) * B.CICLO, tipo: 'pula' }, { t: (i + T.quica1) * B.CICLO, tipo: 'quica', g: 0.6 },
        { t: (i + T.quica2) * B.CICLO, tipo: 'quica', g: 0.35 }, { t: (i + T.para) * B.CICLO, tipo: 'quica', g: 0.15 }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const teo = pose(u, t);
        let bola, rot = 0, naMaoAgora = false;
        if (u < T.pega) bola = BOLA0;
        else if (u < T.joga) { const mp = teo.info.aCena(teo.info.maoPerto); bola = B.add(mp, B.lerp(D0, [34, -6], B.kf([[T.pega, 0], [0.3, 1]], u))); naMaoAgora = true; }
        else if (u < T.cai) { const k = (u - T.joga) / (T.cai - T.joga); bola = arco(LANCA, DENTRO, 300, k); rot = 400 * k; }
        else if (u < T.pula) bola = DENTRO;
        else if (u < T.quica1) { const k = (u - T.pula) / (T.quica1 - T.pula); bola = arco(DENTRO, BOLA0, 250, k); rot = -420 * k; }
        else if (u < T.quica2) { const k = (u - T.quica1) / (T.quica2 - T.quica1); bola = arco(BOLA0, BOLA0, 55, k); rot = -420 - 60 * k; }
        else if (u < T.para) { const k = (u - T.quica2) / (T.para - T.quica2); bola = arco(BOLA0, BOLA0, 18, k); rot = -480 - 20 * k; }
        else bola = BOLA0;
        // amassadinho ao quicar
        const amassa = [T.quica1, T.quica2].some(q => Math.abs(u - q) < 0.006) ? 0.9 : 1;
        const bolaSvg = `<g transform="translate(${r2(bola[0])} ${r2(bola[1] + R * (1 - amassa))}) scale(${r2(2 - amassa)} ${r2(amassa)}) translate(${r2(-bola[0])} ${r2(-bola[1])})">${OBJ.bola(bola[0], bola[1], R, rot)}</g>`;
        const sombraBola = bola[0] < CX.x - CX.w / 2 - 10 ? `<ellipse cx="${r2(bola[0])}" cy="${BOLA0[1] + R + 2}" rx="${r2(R * (0.6 + 0.4 * B.clamp(1 - (BOLA0[1] - bola[1]) / 300)))}" ry="7" fill="#000" opacity="0.12"/>` : '';
        let mao = '';
        if (naMaoAgora) { const mp = teo.info.aCena(teo.info.maoPerto); mao = `<circle cx="${r2(mp[0])}" cy="${r2(mp[1])}" r="${r2(15 * s)}" fill="${B.C.skin}" stroke="${OL}" stroke-width="${r2(6 * s)}"/>`; }
        // ploft: os brinquedos de dentro pulam um pouquinho quando a bola cai
        const pulo = 10 * B.bump(u, T.cai, T.cai + 0.06) + 8 * B.bump(u, T.pula - 0.02, T.pula + 0.04);
        const dentro = `<g transform="translate(0 ${r2(-pulo)})">${cx.dentro}</g>`;
        return B.quadro(cen.svg + sombraBola + teo.svg + dentro + bolaSvg + mao + cx.frente);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'pega') S.colocar(fx, S.SOM.quique(), e.t, 0.25);
      if (e.tipo === 'joga') S.colocar(fx, S.SOM.vush(0.3), e.t - 0.05, 0.3);
      if (e.tipo === 'cai') { S.colocar(fx, S.SOM.pof(), e.t, 0.6); S.colocar(fx, S.SOM.toc(), e.t + 0.03, 0.3); }
      if (e.tipo === 'cai') [0.14, 0.26].forEach(d => S.colocar(fx, S.SOM.toc(), e.t + d, 0.35));
      if (e.tipo === 'pula') S.colocar(fx, S.SOM.boing(), e.t, 0.6);
      if (e.tipo === 'quica') S.colocar(fx, S.SOM.quique(), e.t, e.g);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
