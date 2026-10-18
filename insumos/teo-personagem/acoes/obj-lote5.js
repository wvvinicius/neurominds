// Lote 5 (mesa, arte e emoções): peças reutilizáveis.
//  - sentado(): Teo de lado sentado numa cadeira, com (ou sem) mesa à frente, em "vista de cima leve"
//    (o tampo aparece como uma faixa, para os objetos sobre a mesa ficarem legíveis).
//  - mamae(): adulta simples de lado (não fala).
//  - utilidades de desenho (traço progressivo, panela, vapor).
const B = require('../lib/base');
const { OL, r2, tracoSvg: st } = B;
const { teoLado } = require('../lib/teo');

const ret = (x, y, w, h, cor, extra = '') => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" fill="${cor}" stroke="${OL}" stroke-width="6" ${extra}/>`;

// ============================================================
// TEO SENTADO À MESA
// o: { X (quadril na cena), s, chao, pesNoChao, mesaW (0 = sem mesa), D (profundidade do tampo na tela),
//      altura (altura do tampo em coordenadas locais, padrão -45), corMesa, corCadeira, encosto }
// Coordenadas: "local" = do Teo (quadril = 0,0). O tampo é uma faixa entre Tb (fundo) e Tf (frente);
// Tm é a linha do plano do Teo (meio da faixa), onde ficam as mãos apoiadas.
// ============================================================
function sentado(o = {}) {
  const s = o.s ?? 1.5, X = o.X ?? 700, chao = o.chao ?? 900;
  const pesNoChao = !!o.pesNoChao;
  const Y = chao - (pesNoChao ? 81 : 95) * s;
  const L = (x, y) => [X + x * s, Y + y * s];
  const paraLocal = (p) => [(p[0] - X) / s, (p[1] - Y) / s];
  const D = o.D ?? 120, mesaW = o.mesaW ?? 600;
  const alt = o.altura ?? -45;
  const Tm = Y + alt * s, Tf = Tm + D / 2, Tb = Tm - D / 2, esp = 22;
  const x0 = X + (o.mesaX0 ?? 54) * s, x1 = x0 + mesaW;
  const corMesa = o.corMesa || '#C8915A', corMesaEsc = o.corMesaEsc || '#B07D45', corTampo = o.corTampo || '#DDA86E';
  const corCad = o.corCadeira || '#E07A3F';

  // cadeira de lado (encosto à esquerda, atrás das costas do Teo), no plano do Teo
  const sx0 = X - 52 * s, sx1 = X + 46 * s, sy = Y + 25 * s;
  const cadeira = o.semCadeira ? '' : `
    ${ret(sx0 + 6, sy + 14, 20, chao - sy - 14, corCad)}${ret(sx1 - 30, sy + 14, 20, chao - sy - 14, corCad)}
    ${ret(sx0 - 4, Y - (o.encosto ?? 110) * s, 22, sy - Y + (o.encosto ?? 110) * s, corCad)}
    ${ret(sx0 - 10, Y - (o.encosto ?? 110) * s - 8, 34, 20, corCad, 'rx="8"')}
    ${ret(sx0 - 10, sy, sx1 - sx0 + 16, 18, corCad, 'rx="6"')}`;
  const sombraCad = o.semCadeira ? '' : `<ellipse cx="${r2((sx0 + sx1) / 2)}" cy="${chao}" rx="${r2((sx1 - sx0) / 2 + 30)}" ry="10" fill="#000" opacity="0.12"/>`;

  // mesa: pernas de trás, tampo (faixa), espessura e pernas da frente
  const pernaMesa = (x, yTopo, yChao) => ret(x - 13, yTopo, 26, yChao - yTopo, corMesa);
  const lx0 = Math.max(x0 + 40, X + 150 * s), lx1 = x1 - 40;
  const mesaAtras = mesaW ? `
    <ellipse cx="${r2((x0 + x1) / 2)}" cy="${r2(chao + D / 2 - 4)}" rx="${r2(mesaW / 2 + 20)}" ry="12" fill="#000" opacity="0.10"/>
    ${pernaMesa(lx0 + 20, Tb, chao - D / 2)}${pernaMesa(lx1 - 20, Tb, chao - D / 2)}
    <path d="M ${r2(x0)} ${r2(Tf)} L ${r2(x0)} ${r2(Tb)} L ${r2(x1)} ${r2(Tb)} L ${r2(x1)} ${r2(Tf)} Z" fill="${corTampo}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${st(`M ${r2(x0 + 30)} ${r2(Tb + D * 0.3)} L ${r2(x1 - 60)} ${r2(Tb + D * 0.3)} M ${r2(x0 + 90)} ${r2(Tb + D * 0.68)} L ${r2(x1 - 20)} ${r2(Tb + D * 0.68)}`, 3, corMesa)}` : '';
  const mesaFrente = mesaW ? `
    ${ret(x0, Tf, mesaW, esp, corMesaEsc)}
    ${pernaMesa(lx0, Tf + esp, chao + D / 2)}${pernaMesa(lx1, Tf + esp, chao + D / 2)}` : '';

  // pernas sentadas (alvo dos pés); balanço opcional (pés soltos)
  function pernas(bal = 0) {
    const a = bal * 14, b = -bal * 14;
    const pe = (dx) => pesNoChao ? [62 + dx, 60] : [60 + dx * 0.8, 62 - Math.abs(dx) * 0.15];
    return {
      pernaPerto: { alvo: pe(a), dobra: -1, giroPe: pesNoChao ? 0 : 8 + a * 0.6 },
      pernaLonge: { alvo: add2(pe(b), [-10, -2]), dobra: -1, giroPe: pesNoChao ? 0 : 8 + b * 0.6 },
    };
  }

  // monta a cena: fundo + cadeira + mesa + itens da mesa + Teo + frente da mesa + Teo de novo acima do tampo
  // (assim o joelho fica "embaixo" da mesa, mas mãos e braços continuam sobre ela)
  let nClip = 0;
  function montar({ fundo = '', itensMesa = '', teo, depois = '', itensFrenteMesa = '' }) {
    const id = 'cm5' + (nClip++);
    const t = typeof teo === 'string' ? teo : teo.svg;
    const sobre = mesaW ? `<clipPath id="${id}"><rect x="0" y="0" width="${B.W}" height="${r2(Tf)}"/><rect x="0" y="0" width="${r2(x0)}" height="${B.H}"/></clipPath><g clip-path="url(#${id})">${t}</g>` : '';
    return fundo + sombraCad + cadeira + mesaAtras + itensMesa + t + mesaFrente + itensFrenteMesa + sobre + depois;
  }
  // parâmetros base para teoLado (quem chama completa braços, expressão, etc.)
  const teoBase = (p = {}) => ({ x: X, y: Y, s, ...pernas(p.balanco || 0), sombra: false, ...p });
  const teo = (p) => teoLado(teoBase(p));

  return { s, X, Y, chao, L, paraLocal, Tm, Tf, Tb, D, x0, x1, esp, pernas, montar, teo, teoBase, cadeira, mesaAtras, mesaFrente, sy };
}
const add2 = (a, b) => [a[0] + b[0], a[1] + b[1]];

// ============================================================
// MAMÃE de lado, olhando para a direita. (x, chao) = ponto entre os pés. k = escala.
// mao: [x, y] na cena (alvo da mão da frente), maoLonge: alvo da mão de trás (opcional)
// ============================================================
const MAE = { pele: '#5A3424', cabelo: '#24160F', vestido: '#8E5BD6', avental: '#FFF4E0', sapato: '#3B2A4A' };
function mamae({ x, chao, k = 1.45, mao, maoLonge, olhar = [0, 0], piscar = false, cabeca = 0, sorriso = true }) {
  const P = (lx, ly) => [x + lx * k, chao + ly * k];
  const limb = (pts, cor, w) => B.limb(pts.map(p => [+r2(p[0]), +r2(p[1])]), cor, w * k);
  const quadril = P(0, -250), ombro = P(8, -410);
  const braco = (alvo, dobra) => { const J = B.ik(ombro, alvo, 78 * k, 74 * k, dobra); return [ombro, J, alvo]; };
  const bPerto = braco(mao || P(40, -270), 1);
  const bLonge = braco(maoLonge || P(-14, -260), -1);
  const pe = (dx) => `<path d="M ${r2(P(dx - 14, -2)[0])} ${r2(P(0, -2)[1])} q 0 -18 18 -18 l 26 0 q 16 0 18 18 Z" fill="${MAE.sapato}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>`;
  const cab = P(18, -470);
  const cabT = `translate(${r2(cab[0])} ${r2(cab[1])}) scale(${k}) rotate(${r2(cabeca)} 0 50)`;
  const olho = piscar ? st('M 22 -6 Q 30 0 38 -6', 5) : `<ellipse cx="${r2(30 + olhar[0])}" cy="${r2(-6 + olhar[1])}" rx="6" ry="8" fill="${OL}"/><circle cx="${r2(28 + olhar[0])}" cy="${r2(-9 + olhar[1])}" r="2.2" fill="#fff"/>`;
  return `
    <ellipse cx="${r2(x + 10 * k)}" cy="${r2(chao)}" rx="${r2(70 * k)}" ry="10" fill="#000" opacity="0.12"/>
    ${limb(bLonge, MAE.pele, 20)}<circle cx="${r2(bLonge[2][0])}" cy="${r2(bLonge[2][1])}" r="${r2(14 * k)}" fill="${MAE.pele}" stroke="${OL}" stroke-width="6"/>
    ${limb([P(-12, -240), P(-10, -120), P(-8, -24)], MAE.pele, 22)}${pe(-8)}
    ${limb([P(10, -240), P(14, -120), P(16, -24)], MAE.pele, 22)}${pe(16)}
    <path d="M ${r2(P(-40, -300)[0])} ${r2(P(0, -300)[1])} L ${r2(P(46, -300)[0])} ${r2(P(0, -300)[1])} L ${r2(P(78, -120)[0])} ${r2(P(0, -120)[1])} Q ${r2(P(10, -108)[0])} ${r2(P(0, -108)[1])} ${r2(P(-62, -120)[0])} ${r2(P(0, -120)[1])} Z" fill="${MAE.vestido}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="${r2(P(-6, -440)[0])}" y="${r2(P(0, -440)[1])}" width="${r2(30 * k)}" height="${r2(40 * k)}" fill="${MAE.pele}" stroke="${OL}" stroke-width="6"/>
    <path d="M ${r2(P(-34, -418)[0])} ${r2(P(0, -418)[1])} Q ${r2(P(10, -432)[0])} ${r2(P(0, -432)[1])} ${r2(P(44, -414)[0])} ${r2(P(0, -414)[1])} Q ${r2(P(54, -350)[0])} ${r2(P(0, -350)[1])} ${r2(P(46, -296)[0])} ${r2(P(0, -296)[1])} L ${r2(P(-40, -296)[0])} ${r2(P(0, -296)[1])} Q ${r2(P(-46, -360)[0])} ${r2(P(0, -360)[1])} ${r2(P(-34, -418)[0])} ${r2(P(0, -418)[1])} Z" fill="${MAE.vestido}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M ${r2(P(26, -380)[0])} ${r2(P(0, -380)[1])} L ${r2(P(48, -380)[0])} ${r2(P(0, -380)[1])} Q ${r2(P(56, -330)[0])} ${r2(P(0, -330)[1])} ${r2(P(50, -300)[0])} ${r2(P(0, -300)[1])} L ${r2(P(70, -150)[0])} ${r2(P(0, -150)[1])} L ${r2(P(20, -150)[0])} ${r2(P(0, -150)[1])} Z" fill="${MAE.avental}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
    ${st(`M ${r2(P(-40, -302)[0])} ${r2(P(0, -302)[1])} L ${r2(P(50, -302)[0])} ${r2(P(0, -302)[1])}`, 6)}
    <g transform="${cabT}">
      <circle cx="-38" cy="-40" r="26" fill="${MAE.cabelo}" stroke="${OL}" stroke-width="5"/>
      <ellipse cx="0" cy="0" rx="46" ry="52" fill="${MAE.pele}" stroke="${OL}" stroke-width="5"/>
      <path d="M 44 -12 Q 56 4 44 12" fill="${MAE.pele}" stroke="${OL}" stroke-width="5"/>
      <path d="M 38 -26 Q 20 -62 -20 -56 Q -54 -46 -48 16 Q -40 26 -30 14 Q -32 -26 4 -32 Q 24 -34 38 -26 Z" fill="${MAE.cabelo}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="-12" cy="8" r="10" fill="${MAE.pele}" stroke="${OL}" stroke-width="4"/>
      <circle cx="-14" cy="24" r="4" fill="#FFC93C" stroke="${OL}" stroke-width="2"/>
      ${st('M 14 -22 Q 28 -30 42 -24', 5)}
      ${olho}
      ${sorriso ? st('M 22 26 Q 32 32 40 24', 5) : st('M 24 28 L 40 26', 5)}
      <ellipse cx="18" cy="14" rx="7" ry="4" fill="#8E4630" opacity="0.7"/>
    </g>
    ${limb(bPerto, MAE.pele, 20)}${limb([bPerto[0], B.lerp(bPerto[0], bPerto[1], 0.5)], MAE.vestido, 30)}
    <circle cx="${r2(bPerto[2][0])}" cy="${r2(bPerto[2][1])}" r="${r2(14 * k)}" fill="${MAE.pele}" stroke="${OL}" stroke-width="6"/>`;
}

// ============================================================
// utilidades
// ============================================================
// caminho com traço que "vai sendo desenhado" (k = 0..1). len = comprimento aproximado do caminho
function tracoProgressivo(d, len, k, w, cor, extra = '') {
  if (k <= 0) return '';
  const vis = Math.max(0.01, len * B.clamp(k));
  return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${r2(vis)} ${r2(len * 2)}" ${extra}/>`;
}
// vapor subindo (contínuo, período 2 s)
function vapor(x, y, t, n = 3, alt = 120) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const k = ((t / 2 + i / n) % 1), a = Math.sin(Math.PI * k) * 0.8;
    const yy = y - k * alt, xx = x + (i - (n - 1) / 2) * 30 + 10 * Math.sin(k * 8 + i);
    out += `<path d="M ${r2(xx)} ${r2(yy)} q 12 -14 0 -28 q -12 -14 0 -28" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity="${r2(a)}"/>`;
  }
  return out;
}

module.exports = { sentado, mamae, MAE, tracoProgressivo, vapor, ret };
