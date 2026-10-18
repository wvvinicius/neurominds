// V17 — Abrir a porta. De lado, na sala, ao lado de uma porta que dá para o jardim.
// Cada repetição: segura a maçaneta, abaixa (clique), empurra; a porta gira em perspectiva (vai ficando estreita)
// e mostra o jardim; o Teo se encanta; no fim do ciclo a porta fecha rápido (toc) e ele volta à pose inicial.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { sala, ret, nuvem, sol, arvore, arbusto } = require('../lib/cenario');
const { brilho } = require('./obj-lote2');
const { OL, r2, tracoSvg: st } = B;

const P = { x0: 1100, x1: 1520, topo: 150, base: 786 };   // vão da porta (x1 = dobradiça)
const W = P.x1 - P.x0;
const COR_PORTA = '#3BA8E0';

function flor(x, y, cor) {
  return `${st(`M ${x} ${y} L ${x} ${y - 34}`, 5, '#3E8E3A')}${[0, 72, 144, 216, 288].map(a => { const [dx, dy] = B.dirv(a, 11); return `<circle cx="${r2(x + dx)}" cy="${r2(y - 40 + dy)}" r="8" fill="${cor}" stroke="${OL}" stroke-width="3"/>`; }).join('')}<circle cx="${x}" cy="${y - 40}" r="6" fill="#FFE066" stroke="${OL}" stroke-width="3"/>`;
}
function borboleta(x, y, bat) {
  const a = 0.35 + 0.65 * Math.abs(bat);
  return `<g transform="translate(${r2(x)} ${r2(y)})"><g transform="scale(${r2(a)} 1)">
    <ellipse cx="-12" cy="-6" rx="13" ry="10" fill="#FF8FB8" stroke="${OL}" stroke-width="3"/><ellipse cx="12" cy="-6" rx="13" ry="10" fill="#FF8FB8" stroke="${OL}" stroke-width="3"/>
    <ellipse cx="-9" cy="8" rx="9" ry="7" fill="#FFC93C" stroke="${OL}" stroke-width="3"/><ellipse cx="9" cy="8" rx="9" ry="7" fill="#FFC93C" stroke="${OL}" stroke-width="3"/></g>
    <ellipse cx="0" cy="0" rx="3.5" ry="13" fill="${OL}"/></g>`;
}
// jardim visto pelo vão da porta
function jardim(t) {
  const { x0, x1, topo, base } = P;
  const bx = x0 + 150 + 60 * B.onda(t, 2), by = 470 + 25 * B.onda(t, 1);
  return `<clipPath id="vao"><rect x="${x0}" y="${topo}" width="${W}" height="${base - topo}"/></clipPath>
    <g clip-path="url(#vao)"><rect x="${x0}" y="${topo}" width="${W}" height="${base - topo}" fill="#9ED8FF"/>
    ${sol(x1 - 70, topo + 90, 55)}${nuvem(x0 + 40, topo + 150, 0.55)}
    <rect x="${x0}" y="600" width="${W}" height="${base - 600}" fill="#67BF4A"/>${st(`M ${x0} 600 L ${x1} 600`, 6)}
    ${arvore(x1 - 110, 610, 0.7)}${arbusto(x0 + 90, 612, 0.7)}
    ${flor(x0 + 60, 720, '#E63946')}${flor(x0 + 150, 700, '#FFFFFF')}${flor(x0 + 250, 735, '#B565D9')}${flor(x0 + 340, 705, '#E63946')}
    ${borboleta(bx, by, B.onda(t, 0.25))}</g>`;
}
// porta: abre girando na dobradiça (direita), para fora. th = 0..1 (fração de 85°)
// projeção simples: x encolhe com cos; a borda livre, mais longe, fica um pouco menor em altura (em torno de YC)
const YC = 470;
function porta(th, alavanca) {
  const ang = B.rad(85 * th), c = Math.cos(ang), k = 0.16 * Math.sin(ang);
  const H = P.base - P.topo;
  const m = ([px, py]) => { const fr = -px / W; return [P.x1 + c * px, YC + (P.base + py - YC) * (1 - k * fr)]; };
  const poli = (x0, y0, w, h) => [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]].map(m).map(p => p.map(r2).join(' ')).join(' L ');
  const sw = r2(Math.max(4, 6 * Math.max(c, 0.6)));
  const sombra = 0.22 * Math.sin(ang);
  const mx = -W + 46, my = -300;
  const [hx, hy] = m([mx, my]);
  const esc = 1 - k * (-mx / W);
  const painel = `<path d="M ${poli(-W, -H, W, H)} Z" fill="${COR_PORTA}" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M ${poli(-W + 50, -H + 50, W - 100, H * 0.38)} Z" fill="#5DBBEA" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M ${poli(-W + 50, -H * 0.46, W - 100, H * 0.38)} Z" fill="#5DBBEA" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M ${poli(-W, -H, W, H)} Z" fill="#000" opacity="${r2(sombra)}"/>
    <g transform="translate(${r2(hx)} ${r2(hy)}) scale(${r2(Math.max(0.15, c) * esc)} ${r2(esc)})"><circle r="16" fill="#FFC93C" stroke="${OL}" stroke-width="5"/>
      <g transform="rotate(${r2(alavanca)})"><rect x="-6" y="-9" width="62" height="18" rx="9" fill="#FFC93C" stroke="${OL}" stroke-width="5"/></g></g>`;
  // espessura da folha na borda livre
  const [bx, b0] = m([-W, 0]), [, bt] = m([-W, -H]), e = 16 * Math.sin(ang);
  const borda = th > 0.02 ? `<path d="M ${r2(bx)} ${r2(b0)} L ${r2(bx - e)} ${r2(b0 - 2)} L ${r2(bx - e)} ${r2(bt + 2)} L ${r2(bx)} ${r2(bt)} Z" fill="#2B86B8" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>` : '';
  return { pos: [hx, hy], svg: borda + painel };
}

module.exports = {
  id: 'V17', slug: 'abrir-porta', acao: 'Abrir', contexto: 'Abrir a porta',
  criar() {
    const cen = sala({ janela: false });
    const s = 1.5, X = 985, Y = teoLado.emPe(cen.chao, s);
    const loc = ([x, y]) => [(x - X) / s, (y - Y) / s];
    const K_PORTA = [[0, 0], [0.28, 0], [0.42, 0.3], [0.62, 1], [0.84, 1], [0.95, 0], [1, 0]];
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.22) * B.CICLO, tipo: 'clique' }, { t: (i + 0.3) * B.CICLO, tipo: 'rangido' },
        { t: (i + 0.62) * B.CICLO, tipo: 'uau' }, { t: (i + 0.95) * B.CICLO, tipo: 'fecha' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const th = B.kf(K_PORTA, u);
        const alav = 32 * B.kf([[0, 0], [0.18, 0], [0.24, 1], [0.42, 1], [0.48, 0], [1, 0]], u);
        const pt = porta(th, alav);
        // mão perto: vai até a maçaneta, acompanha enquanto empurra e solta
        const segura = B.kf([[0, 0], [0.06, 0], [0.18, 1], [0.42, 1], [0.54, 0], [1, 0]], u);
        const REP = [20, 10];   // mão em repouso (local)
        const encanto0 = B.kf([[0, 0], [0.5, 0], [0.6, 1], [0.86, 1], [0.94, 0], [1, 0]], u);
        const mao = B.lerp(B.lerp(REP, B.add(loc(pt.pos), [-4, 6]), segura), [92, -132], encanto0);
        const encanto = B.kf([[0, 0], [0.5, 0], [0.6, 1], [0.86, 1], [0.94, 0], [1, 0]], u);
        const lean = 14 * B.kf([[0, 0], [0.1, 0], [0.2, 0.4], [0.42, 1], [0.54, 0], [1, 0]], u) - 4 * encanto;
        const expr = encanto > 0.3 ? (u < 0.68 ? { base: 'surpreso', olhar: [5, -2] } : { base: 'riso' })
          : segura > 0.5 ? { base: 'concentrado', olhar: [6, 2] } : 'feliz';
        const teo = teoLado({
          x: X, y: Y, s, lean, cabeca: -6 * encanto,
          expr, piscar: encanto < 0.3 && segura < 0.5 && B.piscando(t),
          pernaPerto: { a1: 10, a2: 0 }, pernaLonge: { a1: -8, a2: 0 },
          bracoPerto: { alvo: mao, dobra: -1 },
          bracoLonge: { a1: B.mix(-12, 20, encanto), a2: B.mix(8, 60, encanto) },
        });
        const brilhos = brilho(P.x0 + 120, 330, 34, B.bump(u, 0.58, 0.8), '#FFF6B0') + brilho(P.x0 + 260, 260, 24, B.bump(u, 0.62, 0.84), '#FFFFFF');
        const batente = `${ret(P.x0 - 26, P.topo - 26, 26, P.base - P.topo + 26, '#F7F2E8')}${ret(P.x1, P.topo - 26, 26, P.base - P.topo + 26, '#F7F2E8')}${ret(P.x0 - 26, P.topo - 26, W + 52, 26, '#F7F2E8')}`;
        return B.quadro(cen.svg + jardim(t) + pt.svg + batente + brilhos + teo.svg);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'clique') S.colocar(fx, S.SOM.encaixe(), e.t, 0.6);
      if (e.tipo === 'rangido') S.colocar(fx, S.SOM.rangido(0.6), e.t, 0.18);
      if (e.tipo === 'uau') S.colocar(fx, S.SOM.ding(1568), e.t, 0.25);
      if (e.tipo === 'fecha') { S.colocar(fx, S.SOM.vush(0.2), e.t - 0.2, 0.15); S.colocar(fx, S.SOM.toc(), e.t, 0.7); S.colocar(fx, S.SOM.pof(), e.t, 0.3); }
    }
    // passarinhos do jardim entram quando a porta está aberta
    const amb = S.AMB.parque().map((v, i) => { const t = (i / S.SR) % 2 / 2; return v * (0.25 + 0.75 * B.bump(t, 0.32, 1)); });
    const casa = S.AMB.casa();
    return { fx, amb: amb.map((v, i) => v + casa[i]) };
  },
};
