// Objetos compartilhados do Lote 1 (casa e higiene): vaso sanitário com tampa articulada,
// tênis solto, brilhinhos e mão aberta.
const B = require('../lib/base');
const { C, OL, SW, r2, tracoSvg: st } = B;

const LOUCA = '#FFFFFF', LOUCA_SOMBRA = '#DCE8EF', TAMPA = '#4FB3E8';

// ---------- vaso sanitário de lado (frente da bacia para a esquerda) ----------
// hx = x da dobradiça da tampa, chao = y do chão, ang = abertura da tampa em graus (0 = fechada, ~95 = aberta)
const VASO = { assento: 160, tampa: 150, k: 1.22 };   // desenhado na escala k em torno de (hx, chao)
function vaso(hx, chao, ang = 0) {
  const y = chao - VASO.assento, L = VASO.tampa;
  const caixa = `<rect x="${hx + 14}" y="${y - 190}" width="84" height="200" rx="14" fill="${LOUCA}" stroke="${OL}" stroke-width="${SW}"/>
    <rect x="${hx + 6}" y="${y - 206}" width="100" height="24" rx="8" fill="${LOUCA}" stroke="${OL}" stroke-width="${SW}"/>
    <rect x="${hx + 46}" y="${y - 218}" width="26" height="14" rx="5" fill="#B9C3CC" stroke="${OL}" stroke-width="5"/>
    ${st(`M ${hx + 84} ${y - 160} L ${hx + 84} ${y - 40}`, 6, LOUCA_SOMBRA)}`;
  const bacia = `<path d="M ${hx + 24} ${y + 4} L ${hx - 158} ${y + 4} Q ${hx - 160} ${y + 70} ${hx - 96} ${y + 92}
      L ${hx - 86} ${chao - 18} L ${hx - 110} ${chao - 18} Q ${hx - 116} ${chao} ${hx - 100} ${chao} L ${hx + 18} ${chao} Q ${hx + 30} ${chao} ${hx + 26} ${chao - 18}
      L ${hx + 24} ${y + 4} Z" fill="${LOUCA}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${st(`M ${hx - 130} ${y + 30} Q ${hx - 120} ${y + 62} ${hx - 84} ${y + 74}`, 6, LOUCA_SOMBRA)}`;
  const assento = `<rect x="${hx - 166}" y="${y - 6}" width="${178}" height="14" rx="7" fill="${LOUCA}" stroke="${OL}" stroke-width="5"/>`;
  // tampa: gira em torno da dobradiça (hx, y - 6); retângulo de comprimento L apontando para a esquerda
  const tampa = `<g transform="rotate(${r2(ang)} ${hx} ${y - 6})">
    <path d="M ${hx + 6} ${y - 6} L ${hx - L + 10} ${y - 6} Q ${hx - L} ${y - 6} ${hx - L} ${y - 15} Q ${hx - L} ${y - 24} ${hx - L + 10} ${y - 24} L ${hx + 6} ${y - 24} Z" fill="${TAMPA}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${st(`M ${hx - L + 20} ${y - 17} L ${hx - 24} ${y - 17}`, 4, '#9ED8F5')}</g>
    <circle cx="${hx}" cy="${y - 8}" r="7" fill="#B9C3CC" stroke="${OL}" stroke-width="4"/>`;
  return { svg: `<g transform="translate(${hx} ${chao}) scale(${VASO.k}) translate(${-hx} ${-chao})">${caixa + bacia + assento + tampa}</g>`, assentoY: chao - VASO.assento * VASO.k };
}
// ponto da face de cima da tampa a uma distância c da dobradiça (para a mão do Teo)
function pontoTampa(hx, chao, ang, c) {
  const y = chao - VASO.assento;
  const q = B.girar([hx - c, y - 26], ang, [hx, y - 6]);
  return [hx + (q[0] - hx) * VASO.k, chao + (q[1] - chao) * VASO.k];
}

// ---------- tênis solto (mesmo desenho do tênis do Teo de lado, em coordenadas do pé) ----------
// desenhado com a origem no "ponto do pé" do Teo (F), apontando para a direita
function tenis() {
  return `<path d="M -14 -10 L 16 -10 Q 38 -6 40 8 L -16 8 Q -18 -2 -14 -10 Z" fill="${C.shoe}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${st('M -2 -4 L 18 -1', 4, '#fff')}
    <path d="M -18 6 L 42 6 Q 44 21 36 21 L -16 21 Q -20 19 -18 6 Z" fill="#fff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>`;
}
// tênis vazio (visto de lado), com a boca aberta em cima — usado na mão
function tenisSolto() {
  return `<path d="M -16 -10 L -4 -10 Q 4 -2 14 -6 L 16 -10 Q 38 -6 40 8 L -16 8 Q -20 -2 -16 -10 Z" fill="${C.shoe}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M -10 -10 Q 4 -4 14 -9" fill="none" stroke="${OL}" stroke-width="4"/>
    ${st('M 20 -2 L 30 2', 4, '#fff')}
    <path d="M -18 6 L 42 6 Q 44 21 36 21 L -16 21 Q -20 19 -18 6 Z" fill="#fff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>`;
}

// ---------- brilhinho de 4 pontas ----------
function brilho(x, y, r, a = 1, rot = 0, cor = '#FFE066') {
  if (r <= 0.5 || a <= 0.01) return '';
  const k = r * 0.28;
  return `<path transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})" opacity="${r2(a)}"
    d="M 0 ${-r} Q ${k} ${-k} ${r} 0 Q ${k} ${k} 0 ${r} Q ${-k} ${k} ${-r} 0 Q ${-k} ${-k} 0 ${-r} Z" fill="${cor}" stroke="${OL}" stroke-width="${Math.min(5, r * 0.25).toFixed(1)}" stroke-linejoin="round"/>`;
}

// ---------- mão aberta (palma de frente), centro em (0,0), escala ~ igual à mão do Teo (raio 16) ----------
function maoAberta(x, y, rot = 0, esp = 1) {
  const dedos = [[-15, -20, -18], [-5, -26, -6], [6, -26, 6], [16, -21, 18]].map(([dx, dy, a]) =>
    `<rect x="-5.5" y="-14" width="11" height="22" rx="5.5" transform="translate(${dx} ${dy}) rotate(${a})" fill="${C.skin}" stroke="${OL}" stroke-width="5"/>`).join('');
  const polegar = `<rect x="-5.5" y="-12" width="11" height="22" rx="5.5" transform="translate(-24 2) rotate(-62)" fill="${C.skin}" stroke="${OL}" stroke-width="5"/>`;
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${esp} 1)">${dedos}${polegar}
    <ellipse cx="0" cy="0" rx="20" ry="19" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
    <ellipse cx="0" cy="-15" rx="16" ry="6" fill="${C.skin}"/>${st('M -8 4 Q 0 10 9 3', 3.5, C.skinLine)}</g>`;
}

// ---------- cena do vaso com o Teo de lado (V05 e V07) ----------
// ang = abertura da tampa; naTampa 0..1 = mão na tampa; contato = ponto da tampa (distância da dobradiça);
// lean/desce = inclinação e quanto o quadril desce (unidades locais); pulinho = sobe o corpo (px locais)
const X0 = 760, S_TEO = 1.5, HX = X0 + 285;
const PE_PERTO = [5.75, 114.7], PE_LONGE = [-9.75, 111.7];
function cenaVaso(o) {
  const { teoLado } = require('../lib/teo');
  const chao = o.cen.chao, s = S_TEO, Y0 = teoLado.emPe(chao, s);
  const desce = o.desce || 0, atras = desce * 0.7, pul = o.pulinho || 0;
  const x = X0 - atras * s, y = Y0 + (desce - pul) * s;
  const lean = o.lean || 0;
  const ombro = B.girar([6, -116], lean);
  const repouso = B.chain(ombro, 10, 46, 25, 44)[1];
  const P = pontoTampa(HX, chao, o.ang, o.contato);
  const alvoLocal = [(P[0] - x) / s, (P[1] - y) / s];
  const mao = B.lerp(repouso, alvoLocal, o.naTampa);
  const k = B.clamp(lean / 35);
  const teo = teoLado({
    x, y, s, lean, cabeca: -6 * k,
    pernaPerto: { alvo: [PE_PERTO[0] + atras, PE_PERTO[1] - desce + pul], dobra: -1 },
    pernaLonge: { alvo: [PE_LONGE[0] + atras, PE_LONGE[1] - desce + pul], dobra: -1 },
    bracoPerto: { alvo: mao, dobra: o.dobra ?? -1 },
    bracoLonge: { a1: B.mix(-12, 8, k), a2: B.mix(8, 34, k) },
    expr: o.expr || 'feliz', piscar: B.piscando(o.t),
    sombraY: 135.7 - desce + pul, sombraX: 15 + atras,
  });
  const v = vaso(HX, chao, o.ang);
  let br = '';
  if (o.brilho > 0.01) {
    const yA = chao - VASO.assento * VASO.k - 20;
    [[HX - 160, yA - 40, 30, 0], [HX - 70, yA - 80, 24, 20], [HX + 10, yA - 40, 18, 40]].forEach(([bx, by, r, rot], i) =>
      br += brilho(bx, by - 20 * o.brilho, r * B.clamp(o.brilho * 1.6 - i * 0.15), B.clamp(o.brilho * 2), rot));
  }
  return v.svg + teo.svg + br;
}

// ---------- cena do sapato: Teo sentado num banquinho, de lado, de meia (V15 e V16) ----------
// q: 0 = tênis na mão e pé de meia no chão; 1 = tênis calçado e pé no chão
//   0–0.2 levanta o pé e leva o tênis à ponta do pé; 0.2–0.55 enfia o pé; 0.55–0.75 puxa o calcanhar; 0.75–1 põe o pé no chão
const XS = 900, S_SAP = 1.5;
function banquinho(x, chao, topo) {
  const cor = '#E07A3F', esc = '#B85E2A';
  const perna = (px, c) => `<rect x="${px}" y="${topo + 16}" width="18" height="${chao - topo - 16}" rx="4" fill="${c}" stroke="${OL}" stroke-width="${SW}"/>`;
  return perna(x - 30, esc) + perna(x - 82, cor) + perna(x + 50, cor) +
    st(`M ${x - 76} ${chao - 50} L ${x + 58} ${chao - 50}`, 12) + st(`M ${x - 76} ${chao - 50} L ${x + 58} ${chao - 50}`, 5, esc) +
    `<rect x="${x - 100}" y="${topo}" width="190" height="26" rx="10" fill="${cor}" stroke="${OL}" stroke-width="${SW}"/>`;
}
function cenaSapato(o) {
  const { teoLado } = require('../lib/teo');
  const q = o.q, chao = o.cen.chao, s = S_SAP;
  const y = chao - 96 * s, x = XS;
  const PE_CHAO = [60, 82], PE_ALTO = [98, -6];
  const sobe = q < 0.2 ? B.ease(q / 0.2) : q < 0.75 ? 1 : 1 - B.ease((q - 0.75) / 0.25);
  const enfia = q < 0.2 ? 0 : q < 0.55 ? B.ease((q - 0.2) / 0.35) : 1;      // 0 = tênis na frente dos dedos, 1 = pé dentro
  const puxa = q < 0.55 ? 0 : q < 0.75 ? B.ease((q - 0.55) / 0.2) : 1;
  const mexe = q > 0.22 && q < 0.53 ? Math.sin(q * 90) : 0;                 // sacudidinha enquanto enfia
  const lean = B.mix(4, 30, sobe) + 3 * mexe;
  const F = B.lerp(PE_CHAO, PE_ALTO, sobe);
  const giro = -10 * sobe;
  const d = B.mix(70, 16, enfia) * (1 - puxa) + 4 * mexe * (1 - puxa);
  const dir = [Math.cos(B.rad(giro)), Math.sin(B.rad(giro))];
  const noPe = [F[0] + dir[0] * d, F[1] + dir[1] * d];
  const colo = [52, -38];
  const vaiAoPe = q < 0.2 ? B.ease(q / 0.2) : 1;
  const calcado = q >= 0.75;
  const tenisPos = calcado ? F : B.lerp(colo, noPe, vaiAoPe);
  const tenisAng = calcado ? giro : B.mix(-25, giro, vaiAoPe);
  // mãos: perto segura o calcanhar do tênis, longe segura a ponta; no fim, mãos nos joelhos
  const pTen = p => B.add(tenisPos, B.girar(p, tenisAng));
  let maoP = pTen([-14, -10]), maoL = pTen([26, -14]);
  if (puxa > 0) maoP = B.lerp(maoP, pTen([-24, -26]), B.bump(puxa, 0, 1));
  const solta = q < 0.75 ? 0 : B.ease((q - 0.75) / 0.2);
  const joelho = [B.mix(54, 70, sobe), B.mix(-4, -40, sobe)];
  maoP = B.lerp(maoP, B.add(joelho, [6, -14]), solta);
  maoL = B.lerp(maoL, B.add(joelho, [-6, -16]), solta);
  const teo = teoLado({
    x, y, s, lean, cabeca: 6 * sobe,
    roupa: { pes: 'meia' },
    pernaPerto: { alvo: F, dobra: -1, giroPe: giro },
    pernaLonge: { alvo: [44, 82], dobra: -1 },
    bracoPerto: { alvo: maoP, dobra: o.dobra ?? 1 },
    bracoLonge: { alvo: maoL, dobra: o.dobra ?? 1 },
    expr: o.expr, piscar: o.piscar,
    sombraY: 96, sombraX: 30, sombraLarg: 110,
    // perna levantada redesenhada na frente do tronco (o lib desenha as pernas atrás do tronco)
    itensMeio: i => {
      if (sobe < 0.05) return '';
      const K = i.joelhoPerto, P = i.pePerto;
      const meia = `<g transform="translate(${r2(P[0])} ${r2(P[1])}) rotate(${r2(giro)})"><path d="M -12 -10 L 18 -10 Q 36 -8 38 6 Q 36 14 20 14 L -12 14 Q -18 2 -12 -10 Z" fill="#fff" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
      return B.limb([[0, 0], K, P], C.skin, 22) + meia + B.limb([[0, 0], B.lerp([0, 0], K, 0.45)], C.shorts, 36);
    },
    itensFrente: i => {
      const t = `<g transform="translate(${r2(tenisPos[0])} ${r2(tenisPos[1])}) rotate(${r2(tenisAng)})">${calcado ? tenis() : tenisSolto()}</g>`;
      const m = i.maoPerto;
      return t + `<circle cx="${r2(m[0])}" cy="${r2(m[1])}" r="15" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
    },
  });
  return { svg: banquinho(x - 10, chao, y + 16 * s) + teo.svg, info: teo.info, tenisCena: teo.info.aCena(tenisPos) };
}

module.exports = { cenaSapato, cenaVaso, vaso, pontoTampa, VASO, tenis, tenisSolto, brilho, maoAberta, TAMPA };
