// V19 — Abrir a caixa de presente. De lado, na sala, com a caixa no chão.
// Cada repetição: abaixa, segura a tampa, levanta; um ursinho pula da caixa numa molinha (boing) com brilhos;
// o Teo fica surpreso e depois ri feliz; na volta rápida tampa a caixa de novo (o ursinho volta para dentro).
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { sala } = require('../lib/cenario');
const { brilho, urso } = require('./obj-lote2');
const { OL, r2, tracoSvg: st } = B;

const CX = { x: 1280, w: 300, h: 210, chao: 905 };   // caixa
const COR = '#E63946', FITA = '#FFC93C';

function caixa() {
  const { x, w, h, chao } = CX, x0 = x - w / 2, y0 = chao - h;
  return `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${COR}" stroke="${OL}" stroke-width="6"/>
    <rect x="${x - 18}" y="${y0}" width="36" height="${h}" fill="${FITA}" stroke="${OL}" stroke-width="5"/>
    ${st(`M ${x0 + 20} ${y0 + 40} l 10 -10 M ${x0 + 40} ${y0 + 110} l 10 -10 M ${x + 60} ${y0 + 60} l 10 -10 M ${x + 80} ${y0 + 130} l 10 -10`, 5, '#FF8A94')}`;
}
// tampa: (x, y) = centro da borda de baixo; rot em graus
function tampa(x, y, rot) {
  const w = CX.w + 24;
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})">
    <path d="M -22 -40 Q -60 -78 -54 -44 Q -50 -24 -6 -34 Z" fill="${FITA}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M 22 -40 Q 60 -78 54 -44 Q 50 -24 6 -34 Z" fill="${FITA}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="${-w / 2}" y="-40" width="${w}" height="40" fill="${COR}" stroke="${OL}" stroke-width="6"/>
    <rect x="-20" y="-40" width="40" height="40" fill="${FITA}" stroke="${OL}" stroke-width="5"/>
    <circle cx="0" cy="-40" r="12" fill="${FITA}" stroke="${OL}" stroke-width="5"/></g>`;
}
function molinha(x, yBase, alt) {
  if (alt < 4) return '';
  const n = 6, pts = [];
  for (let i = 0; i <= n; i++) pts.push(`${r2(x + (i % 2 ? 18 : -18) * (i > 0 && i < n ? 1 : 0))} ${r2(yBase - alt * i / n)}`);
  const d = 'M ' + pts.join(' L ');
  return st(d, 10) + st(d, 5, '#B9C3CC');
}

module.exports = {
  id: 'V19', slug: 'abrir-caixa', acao: 'Abrir', contexto: 'Abrir a caixa',
  criar() {
    const cen = sala();
    const s = 1.5, X = 985, Y0 = teoLado.emPe(cen.chao, s);
    const PE_PERTO = [5.75, 114.7], PE_LONGE = [-9.75, 111.7];
    const TOPO = CX.chao - CX.h;
    // agachado (1) / em pé (0)
    const K_AG = [[0, 0], [0.05, 0], [0.18, 1], [0.24, 1], [0.38, 0.15], [0.8, 0.15], [0.88, 0.8], [0.92, 0.8], [1, 0]];
    // tampa: 0 = fechada, 1 = lá em cima
    const K_TAMPA = [[0, 0], [0.22, 0], [0.32, 0.2], [0.4, 1.08], [0.46, 0.96], [0.82, 1], [0.9, 0], [1, 0]];   // fração de 110°
    const POP = 0.38;
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.24) * B.CICLO, tipo: 'tampa' }, { t: (i + POP) * B.CICLO, tipo: 'boing' },
        { t: (i + 0.9) * B.CICLO, tipo: 'fecha' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const k = B.kf(K_AG, u), tp = B.kf(K_TAMPA, u);
        const desce = 50 * k, atras = 14 * k;
        // tampa sobe e vem um pouco para perto do Teo, inclinada
        // tampa articulada na ponta direita: a ponta esquerda sobe
        const WT = CX.w + 24, PIV = [CX.x + WT / 2, TOPO], trot = 110 * tp;
        const [tx, ty] = B.add(PIV, B.girar([-WT / 2, 0], trot));
        // ursinho: sai com molinha e balança (amortecido) depois do pop
        const ip = u - POP;
        let alt = 0, balanco = 0;
        if (ip > 0 && u < 0.86) {
          const tt = ip * B.CICLO;
          alt = 290 * (1 - Math.exp(-tt * 9) * Math.cos(tt * 22));
          balanco = 12 * Math.exp(-tt * 4) * Math.sin(tt * 16);
        }
        if (u >= 0.82) alt *= B.clamp(1 - (u - 0.82) / 0.04);
        const surpresa = u > POP - 0.01 && u < 0.5, alegria = u >= 0.5 && u < 0.84;
        const pulinho = alegria ? Math.abs(Math.sin((u - 0.5) / 0.34 * 2 * Math.PI)) * 14 : 0;
        // mãos na tampa (local)
        const loc = ([x, y]) => [(x - (X - atras * s)) / s, (y - (Y0 + desce * s - pulinho * s)) / s];
        const segura = B.kf([[0, 0], [0.05, 0], [0.18, 1], [0.32, 1], [0.4, 0], [0.84, 0], [0.88, 1], [0.92, 1], [1, 0]], u);
        const naTampa = q => B.add([tx, ty], B.girar(q, trot));
        const pertoNa = loc(naTampa([-WT / 2 + 14, -12])), longeNa = loc(naTampa([-WT / 2 + 40, -30]));
        const alto = B.kf([[0, 0], [0.4, 0], [0.5, 1], [0.8, 1], [0.86, 0], [1, 0]], u);
        const maoPerto = B.lerp(B.lerp([20, 10], [-34, -196], alto), pertoNa, segura), maoLonge = B.lerp(B.lerp([0, 12], [-60, -186], alto), longeNa, segura);
        const expr = surpresa ? { base: 'surpreso', boca: 'oGrande', olhar: [8, -6] }
          : alegria ? { base: 'riso' } : segura > 0.5 ? { base: 'concentrado', olhar: [6, 6] } : 'feliz';
        const teo = teoLado({
          x: X - atras * s, y: Y0 + desce * s - pulinho * s, s,
          lean: 26 * k - 6 * (surpresa ? 1 : 0), cabeca: -8 * k - (surpresa ? 8 : 0),
          pernaPerto: { alvo: [PE_PERTO[0] + atras, PE_PERTO[1] - desce + pulinho], dobra: -1 },
          pernaLonge: { alvo: [PE_LONGE[0] + atras, PE_LONGE[1] - desce + pulinho], dobra: -1 },
          bracoPerto: { alvo: maoPerto, dobra: -1 }, bracoLonge: { alvo: maoLonge, dobra: -1 },
          expr, piscar: !surpresa && !alegria && segura < 0.5 && B.piscando(t),
          sombraY: 135.7 - desce + pulinho, sombraX: 15 + atras,
        });
        // ursinho atrás da frente da caixa
        const ux = CX.x + balanco * 0.5, uy = TOPO + 190 - alt;
        const ursinho = molinha(CX.x, TOPO + 200, Math.max(0, alt - 8)) + urso(ux, uy, 1.15, balanco);
        const kb = B.bump(u, POP - 0.01, 0.62);
        let brilhos = '';
        [[-150, -120, 44, 0], [150, -160, 36, 0.02], [-60, -250, 30, 0.04], [110, -40, 26, 0.03], [0, -300, 40, 0.05]].forEach(([dx, dy, tam, dl], j) => {
          const kk = B.bump(u, POP - 0.01 + dl, 0.66 + dl);
          brilhos += brilho(CX.x + dx * (0.6 + 0.4 * kb), TOPO + dy * (0.6 + 0.4 * kk), tam, kk, j % 2 ? '#FFFFFF' : '#FFF6B0', 30 * u);
        });
        return B.quadro(cen.svg + ursinho + caixa() + tampa(tx, ty, trot) + teo.svg + brilhos);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'tampa') S.colocar(fx, S.SOM.papel(0.2), e.t, 0.3);
      if (e.tipo === 'boing') { S.colocar(fx, S.SOM.boing(), e.t, 0.7); S.colocar(fx, S.SOM.ding(2093), e.t + 0.05, 0.25); S.colocar(fx, S.SOM.ding(2637), e.t + 0.15, 0.2); }
      if (e.tipo === 'fecha') { S.colocar(fx, S.SOM.pof(), e.t, 0.5); }
    }
    return { fx, amb: S.AMB.casa() };
  },
};
