// V18 — Abrir a janela. De lado, no quarto, diante de uma janela de duas folhas.
// Cada repetição: alcança o trinco, gira (clique), empurra as duas folhas (abrem para fora, girando em perspectiva),
// recua e curte o ventinho de olhos fechados (cortinas e cabelo balançando, folhinhas entrando);
// na volta rápida puxa as folhas e fecha (toc).
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { quarto, ret, nuvem, sol, arvore } = require('../lib/cenario');
const { OL, r2, tracoSvg: st } = B;

const J = { x0: 1030, x1: 1310, topo: 250, base: 600 };   // vão da janela
const JW = J.x1 - J.x0, FOLHA = JW / 2, YC = (J.topo + J.base) / 2;
const TRINCO_Y = 440;

function fora(t) {
  return `<clipPath id="vjan"><rect x="${J.x0}" y="${J.topo}" width="${JW}" height="${J.base - J.topo}"/></clipPath>
    <g clip-path="url(#vjan)"><rect x="${J.x0}" y="${J.topo}" width="${JW}" height="${J.base - J.topo}" fill="#9ED8FF"/>
    ${sol(J.x1 - 60, J.topo + 70, 46)}${nuvem(J.x0 + 20 + 20 * B.onda(t, 6), J.topo + 120, 0.5)}
    ${arvore(J.x0 + 70, J.base + 210, 0.75)}
    <rect x="${J.x0}" y="${J.base - 40}" width="${JW}" height="40" fill="#67BF4A"/>${st(`M ${J.x0} ${J.base - 40} L ${J.x1} ${J.base - 40}`, 5)}</g>`;
}
// folha: hinge = x da dobradiça, lado = +1 (abre para a esquerda... a borda livre fica à direita) / -1
function folha(hinge, lado, th) {
  const ang = B.rad(80 * th), c = Math.cos(ang), k = 0.14 * Math.sin(ang);
  const m = ([fx, y]) => [hinge + lado * fx * c, YC + (y - YC) * (1 - k * fx / FOLHA)];   // fx = distância da dobradiça
  const quad = (a, b, y0, y1) => `M ${[[a, y0], [b, y0], [b, y1], [a, y1]].map(m).map(p => p.map(r2).join(' ')).join(' L ')} Z`;
  const sw = r2(Math.max(4, 6 * Math.max(c, 0.5)));
  const H = J.base - J.topo;
  const vidro = (y0, y1) => `<path d="${quad(14, FOLHA - 14, y0, y1)}" fill="#CFEFFF" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  const reflexo = `<path d="${[[30, J.topo + 40], [60, J.topo + 24]].map(m).map((p, i) => (i ? 'L ' : 'M ') + p.map(r2).join(' ')).join(' ')}" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  const [ex, ey0] = m([FOLHA, J.topo]), [, ey1] = m([FOLHA, J.base]), e = 12 * Math.sin(ang) * lado;
  const borda = th > 0.02 ? `<path d="M ${r2(ex)} ${r2(ey0)} L ${r2(ex + e)} ${r2(ey0 + 2)} L ${r2(ex + e)} ${r2(ey1 - 2)} L ${r2(ex)} ${r2(ey1)} Z" fill="#D8D2C4" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>` : '';
  return {
    svg: `<path d="${quad(0, FOLHA, J.topo, J.base)}" fill="#F7F2E8" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"/>
      ${vidro(J.topo + 14, J.topo + H / 2 - 6)}${vidro(J.topo + H / 2 + 6, J.base - 14)}${reflexo}
      <path d="${quad(0, FOLHA, J.topo, J.base)}" fill="#000" opacity="${r2(0.18 * Math.sin(ang))}"/>${borda}`,
    livre: m([FOLHA - 8, TRINCO_Y]),
  };
}
// cortina presa no varão; vento = 0..1 (balanço); fase muda o desenho
function cortina(x, lado, vento, t) {
  const top = J.topo - 50, bot = J.base + 70, w = 90;
  const sw = vento * (18 + 14 * Math.sin(2 * Math.PI * (t / 0.5) + (lado > 0 ? 0 : 1.3)));
  const lift = vento * (30 + 12 * Math.sin(2 * Math.PI * (t / 0.5 + 0.25)));
  const bx = x + lado * sw, by = bot - lift;
  const ond = n => B.r2(n);
  return `<path d="M ${x} ${top} L ${x + lado * w} ${top} Q ${ond(x + lado * (w + 10) + lado * sw * 0.8)} ${ond((top + by) / 2)} ${ond(bx + lado * w + lado * sw * 0.6)} ${ond(by + 6)}
      Q ${ond(bx + lado * w * 0.5)} ${ond(by + 20)} ${ond(bx)} ${ond(by)} Q ${ond(x + lado * sw * 0.4)} ${ond((top + by) / 2)} ${x} ${top} Z" fill="#FF8FB8" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${st(`M ${x + lado * 30} ${top + 10} Q ${ond(x + lado * 34 + lado * sw * 0.6)} ${ond((top + by) / 2)} ${ond(bx + lado * 32)} ${ond(by + 8)} M ${x + lado * 60} ${top + 10} Q ${ond(x + lado * 66 + lado * sw * 0.7)} ${ond((top + by) / 2)} ${ond(bx + lado * 62 + lado * sw * 0.3)} ${ond(by + 12)}`, 4, '#E86A9A')}`;
}
// linhas de vento + folhinhas voando para dentro (da janela para a esquerda)
function vento(t, k) {
  if (k <= 0.01) return '';
  let out = '';
  for (let i = 0; i < 4; i++) {
    const fase = ((t / 0.5) + i * 0.25) % 1;
    const x = J.x0 + 200 - fase * 900, y = 330 + i * 70 + 20 * Math.sin(fase * 6 + i);
    const a = Math.sin(Math.PI * fase) * k;
    out += `<path d="M ${r2(x)} ${r2(y)} q 60 -22 120 0 t 120 0" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round" opacity="${r2(a)}"/>`;
    out += `<path d="M ${r2(x)} ${r2(y)} q 60 -22 120 0 t 120 0" fill="none" stroke="#6FA8D6" stroke-width="4" stroke-linecap="round" opacity="${r2(a)}"/>`;
  }
  for (let i = 0; i < 2; i++) {
    const fase = ((t / 1) + i * 0.5) % 1;
    const x = J.x0 + 120 - fase * 800, y = 380 + i * 120 + 60 * Math.sin(fase * 7 + i * 2);
    out += `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(fase * 540)})" opacity="${r2(Math.sin(Math.PI * fase) * k)}"><path d="M -16 0 Q 0 -14 16 0 Q 0 14 -16 0 Z" fill="#5DB84F" stroke="${OL}" stroke-width="4"/>${st('M -12 0 L 12 0', 3, '#3E8E3A')}</g>`;
  }
  return out;
}
// mechas do black power balançando (coordenadas da cabeça de lado; nuca = x negativo)
function mechas(k, t) {
  if (k <= 0.01) return '';
  return [[-150, -70, 0], [-140, -10, 0.3], [-120, -130, 0.6]].map(([x, y, f]) => {
    const a = k * (14 * Math.sin(2 * Math.PI * (t / 0.5 + f)) - 18);
    return `<g transform="translate(${x} ${y}) rotate(${r2(a)})"><circle cx="-14" cy="0" r="24" fill="${OL}"/><circle cx="-14" cy="0" r="20" fill="${B.C.hair}"/></g>`;
  }).join('');
}

module.exports = {
  id: 'V18', slug: 'abrir-janela', acao: 'Abrir', contexto: 'Abrir a janela',
  criar() {
    const cen = quarto();
    // o quarto já tem uma janela pintada à direita; cobrimos com parede e desenhamos a nossa
    const parede = `<rect x="1380" y="150" width="340" height="300" fill="#DCEBFA"/>${st('M 1440 150 L 1440 450 M 1600 150 L 1600 450', 10, '#CFE0F4')}`;
    const s = 1.5, Y0 = teoLado.emPe(cen.chao, s);
    // passinho: perto da janela (X 1000) para alcançar o trinco; longe (X 880) para curtir o vento sem tapar a janela
    const K_X = [[0, 880], [0.04, 880], [0.17, 1000], [0.44, 1000], [0.54, 880], [0.78, 880], [0.86, 1000], [0.92, 1000], [1, 880]];
    const PASSOS = [[0.04, 0.17], [0.44, 0.54], [0.78, 0.86], [0.92, 1]];
    const K_TH = [[0, 0], [0.25, 0], [0.45, 1], [0.84, 1], [0.93, 0], [1, 0]];
    const K_LEAN = [[0, 0], [0.06, 0], [0.2, 16], [0.4, 18], [0.52, -6], [0.8, -6], [0.86, 16], [0.93, 16], [1, 0]];
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.22) * B.CICLO, tipo: 'clique' }, { t: (i + 0.28) * B.CICLO, tipo: 'abre' },
        { t: (i + 0.46) * B.CICLO, tipo: 'vento' }, { t: (i + 0.93) * B.CICLO, tipo: 'fecha' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const X = B.kf(K_X, u);
        const loc = ([x, y]) => [(x - X) / s, (y - Y) / s];
        const passo = PASSOS.reduce((a, [a0, a1]) => a + (u > a0 && u < a1 ? Math.sin(Math.PI * (u - a0) / (a1 - a0)) : 0), 0);
        const Y = Y0 - 6 * s * passo;
        const th = B.kf(K_TH, u), lean = B.kf(K_LEAN, u);
        const fe = folha(J.x0, 1, th), fd = folha(J.x1, -1, th);
        const ventoK = B.kf([[0, 0], [0.4, 0], [0.5, 1], [0.84, 1], [0.92, 0], [1, 0]], u);
        // mãos: no trinco / acompanhando as folhas / descansando
        const naJanela = B.kf([[0, 0], [0.06, 0], [0.2, 1], [0.38, 1], [0.48, 0], [0.8, 0], [0.86, 1], [0.93, 1], [1, 0]], u);
        const pPerto = B.add(loc(fd.livre), [0, 4]), pLonge = B.add(loc(fe.livre), [-6, -6]);
        const curtir = B.kf([[0, 0], [0.46, 0], [0.54, 1], [0.8, 1], [0.86, 0], [1, 0]], u);
        const repPerto = B.lerp([20, 10], [30, -40], curtir), repLonge = B.lerp([0, 12], [-30, -40], curtir);
        const maoPerto = B.lerp(repPerto, pPerto, naJanela), maoLonge = B.lerp(repLonge, pLonge, naJanela);
        const expr = curtir > 0.5 ? { base: 'feliz', olho: 'fechado', boca: u < 0.62 ? 'o' : 'sorriso' }
          : naJanela > 0.5 ? { base: 'concentrado', olhar: [6, 0] } : 'feliz';
        const teo = teoLado({
          x: X, y: Y, s, lean, cabeca: -10 * curtir + 3 * ventoK * B.onda(t, 0.5),
          expr, piscar: curtir < 0.5 && naJanela < 0.5 && B.piscando(t),
          pernaPerto: { a1: 10 + 18 * passo, a2: -8 * passo }, pernaLonge: { a1: -8 - 16 * passo, a2: 10 * passo },
          bracoPerto: { alvo: maoPerto, dobra: -1 }, bracoLonge: { alvo: maoLonge, dobra: -1 },
          extra: mechas(ventoK, t),
        });
        const moldura = `${ret(J.x0 - 20, J.topo - 20, JW + 40, 20, '#fff')}${ret(J.x0 - 20, J.topo, 20, J.base - J.topo, '#fff')}${ret(J.x1, J.topo, 20, J.base - J.topo, '#fff')}${ret(J.x0 - 36, J.base, JW + 72, 22, '#fff')}`;
        const trinco = th < 0.02 ? `<rect x="${J.x0 + FOLHA - 7}" y="${TRINCO_Y - 26}" width="14" height="52" rx="7" fill="#FFC93C" stroke="${OL}" stroke-width="4" transform="rotate(${r2(90 * B.kf([[0, 0], [0.2, 0], [0.25, 1], [0.9, 1], [0.97, 0], [1, 0]], u))} ${J.x0 + FOLHA} ${TRINCO_Y})"/>` : '';
        const varao = st(`M ${J.x0 - 130} ${J.topo - 50} L ${J.x1 + 130} ${J.topo - 50}`, 10) + st(`M ${J.x0 - 130} ${J.topo - 50} L ${J.x1 + 130} ${J.topo - 50}`, 4, '#C89B6D');
        return B.quadro(cen.svg + parede + fora(t) + fe.svg + fd.svg + trinco + moldura + cortina(J.x0 - 20, -1, ventoK, t) + cortina(J.x1 + 20, 1, ventoK, t) + varao + teo.svg + vento(t, ventoK));
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    // ventinho: ruído suave que entra com a janela aberta
    const brisa = S.envelope(S.passaFaixa(S.ruido(0.8), t => 700 + 300 * Math.sin(2 * Math.PI * t * 2), 0.7), t => Math.sin(Math.PI * t / 0.8) ** 1.2 * 0.8);
    for (const e of eventos) {
      if (e.tipo === 'clique') S.colocar(fx, S.SOM.encaixe(), e.t, 0.5);
      if (e.tipo === 'abre') S.colocar(fx, S.SOM.rangido(0.4), e.t, 0.12);
      if (e.tipo === 'vento') S.colocar(fx, brisa, e.t, 1.2);
      if (e.tipo === 'fecha') { S.colocar(fx, S.SOM.toc(), e.t, 0.6); S.colocar(fx, S.SOM.toc(), e.t + 0.04, 0.4); }
    }
    return { fx, amb: S.AMB.casa() };
  },
};
