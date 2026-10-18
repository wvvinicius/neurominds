// Teo poseável: de lado (teoLado) e de frente (teoFrente).
// Os dois devolvem { svg, info }: svg já posicionado na cena; info traz mãos, pés, boca etc. para encaixar objetos.
const { afro, eye, bigSmile } = require('../gerar');
const B = require('./base');
const { C, SW, OL, limb, r2, lerp, add, chain, ik, girar, tracoSvg: st, gota } = B;
const LAGRIMA = '#7CC8FF';

// ============================================================
// ROSTOS — cada expressão é uma combinação de sobrancelha + olho + boca (+ extras)
// ============================================================
const EXPRESSOES = {
  feliz: { sob: 'normal', olho: 'aberto', boca: 'sorriso', blush: true },
  calmo: { sob: 'normal', olho: 'aberto', boca: 'fechada' },
  orgulho: { sob: 'normal', olho: 'semi', boca: 'sorriso', blush: true },
  riso: { sob: 'alta', olho: 'feliz', boca: 'riso', blush: true },
  esforco: { sob: 'esforco', olho: 'apertado', boca: 'dentes', blush: true, suor: true },
  surpreso: { sob: 'alta', olho: 'grande', boca: 'o' },
  triste: { sob: 'triste', olho: 'aberto', olhar: [0, 5], boca: 'triste' },
  chorando: { sob: 'triste', olho: 'fechado', boca: 'chorando', lagrimas: true },
  concentrado: { sob: 'foco', olho: 'aberto', boca: 'lingua' },
  cantando: { sob: 'alta', olho: 'feliz', boca: 'oGrande', blush: true },
  mastigando: { sob: 'normal', olho: 'feliz', boca: 'mastigando', blush: true },
  impaciente: { sob: 'foco', olho: 'semi', boca: 'triste' },
};
// expr pode ser o nome ('feliz') ou um objeto ({ base: 'feliz', olho: 'fechado' })
function resolverExpr(expr, piscar) {
  const e = typeof expr === 'string' ? { ...EXPRESSOES[expr] } : { ...EXPRESSOES[expr.base || 'feliz'], ...expr };
  if (!e.sob) throw new Error('expressão desconhecida: ' + JSON.stringify(expr));
  if (piscar && ['aberto', 'semi', 'grande'].includes(e.olho)) e.olho = 'fechado';
  return e;
}

// ---------- de lado (olhando para a direita) ----------
const SOB_L = {
  normal: 'M 24 -42 Q 42 -52 60 -42', alta: 'M 24 -50 Q 42 -62 60 -50', esforco: 'M 20 -38 L 60 -24',
  triste: 'M 24 -38 Q 42 -42 60 -54', foco: 'M 22 -40 L 60 -32',
};
function olhoLado(tipo, [ox, oy] = [0, 0], id) {
  const aberto = (rx, ry, pr) => `<ellipse cx="40" cy="-4" rx="${rx}" ry="${ry}" fill="#fff" stroke="${OL}" stroke-width="5"/>
    <circle cx="${r2(45 + ox)}" cy="${r2(-1 + oy)}" r="${pr}" fill="${C.pupil}"/><circle cx="${r2(42 + ox)}" cy="${r2(-5 + oy)}" r="${pr * 0.37}" fill="#fff"/>`;
  switch (tipo) {
    case 'aberto': return aberto(14, 21, 9);
    case 'grande': return aberto(16, 24, 6);
    case 'semi': return aberto(14, 21, 9) + `<clipPath id="${id}l"><ellipse cx="40" cy="-4" rx="14" ry="21"/></clipPath>
      <rect x="20" y="-30" width="40" height="17" fill="${C.skin}" clip-path="url(#${id}l)"/>${st('M 26 -13 L 54 -13', 5)}
      <ellipse cx="40" cy="-4" rx="14" ry="21" fill="none" stroke="${OL}" stroke-width="5"/>`;
    case 'feliz': return st('M 26 -2 Q 41 -20 56 -2');
    case 'fechado': return st('M 27 -2 Q 41 7 55 -2');
    case 'apertado': return st('M 30 -16 L 52 -5 L 30 6');
  }
  throw new Error('olho? ' + tipo);
}
function bocaPreenchida(d, id, { dentes = true, lingua = null } = {}) {
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${C.mouth}"/>
    <g clip-path="url(#${id})">${dentes ? `<path d="M -60 -60 L 120 -60 L 120 ${dentes === true ? 0 : dentes} L -60 ${dentes === true ? 0 : dentes} Z" fill="#fff"/>` : ''}${lingua || ''}</g>
    <path d="${d}" fill="none" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>`;
}
function bocaLado(tipo, id, fase = 0) {
  switch (tipo) {
    case 'sorriso': return bocaPreenchida('M 22 38 Q 50 48 74 32 Q 70 62 46 62 Q 28 60 22 38 Z', id + 'b', { dentes: 47 });
    case 'riso': return bocaPreenchida('M 18 32 Q 50 44 80 24 Q 80 82 46 80 Q 20 76 18 32 Z', id + 'b', { dentes: 42, lingua: `<ellipse cx="50" cy="76" rx="18" ry="10" fill="${C.tongue}"/>` });
    case 'fechada': return st('M 30 44 Q 50 58 70 40');
    case 'o': return `<ellipse cx="52" cy="50" rx="10" ry="13" fill="${C.mouth}" stroke="${OL}" stroke-width="${SW}"/><ellipse cx="52" cy="57" rx="6" ry="4" fill="${C.tongue}"/>`;
    case 'oGrande': return `<ellipse cx="52" cy="52" rx="14" ry="18" fill="${C.mouth}" stroke="${OL}" stroke-width="${SW}"/><ellipse cx="52" cy="62" rx="9" ry="6" fill="${C.tongue}"/>`;
    case 'triste': return st('M 32 58 Q 50 44 68 54');
    case 'chorando': return bocaPreenchida('M 22 44 Q 48 30 74 40 Q 72 74 48 74 Q 26 72 22 44 Z', id + 'b', { dentes: false, lingua: `<ellipse cx="48" cy="72" rx="16" ry="8" fill="${C.tongue}"/>` });
    case 'dentes': return `<rect x="26" y="34" width="46" height="24" rx="11" fill="#fff" stroke="${OL}" stroke-width="${SW}"/>${st('M 26 46 L 72 46 M 38 34 L 38 58 M 50 34 L 50 58 M 61 34 L 61 58', 3)}`;
    case 'lingua': return st('M 32 46 Q 50 54 64 46') + `<ellipse cx="66" cy="53" rx="8" ry="6" fill="${C.tongue}" stroke="${OL}" stroke-width="4"/>`;
    case 'mastigando': return st('M 14 22 Q 2 40 18 56', 5, C.skinLine) + (fase % 1 < 0.5
      ? st('M 34 50 Q 50 46 66 50')
      : `<ellipse cx="50" cy="50" rx="9" ry="7" fill="${C.mouth}" stroke="${OL}" stroke-width="5"/>`);
  }
  throw new Error('boca? ' + tipo);
}
function lagrimasLado(fase) {
  const f = fase % 1;
  return st('M 36 16 Q 28 40 34 72', 8, LAGRIMA) + gota(30, 82 + 60 * f, 0.9, LAGRIMA) + gota(40, 60 + 70 * ((f + 0.5) % 1), 0.7, LAGRIMA);
}
function afroLado() {
  const cx = -25, cy = -45, d = 92, angs = [-90, -65, -115, -40, -140, -15, -165, 170, 148];
  const cs = [[cx, cy, 95], ...angs.map(a => [cx + d * Math.cos(B.rad(a)), cy + d * Math.sin(B.rad(a)), 40])];
  const curls = ['M -90 -110 q 10 -12 22 -4', 'M 10 -150 q 12 -8 22 2', 'M -50 -160 q 10 -10 22 -2', 'M -120 -40 q 6 -12 18 -10',
    'M -30 -115 q 8 -8 18 -2', 'M 30 -110 q 8 -8 18 0', 'M -110 -120 q 8 -8 18 -4'].map(p => st(p, 5, C.hairCurl)).join('');
  return cs.map(([x, y, r]) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r + SW / 2}" fill="${OL}"/>`).join('') +
    cs.map(([x, y, r]) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${C.hair}"/>`).join('') + curls;
}
// cabeça de lado, centro em (0,0); boca fica por volta de (50, 50)
function cabecaLado(expr, id, o = {}) {
  const e = resolverExpr(expr, o.piscar);
  const oculos = o.oculosNatacao ? [`${st('M 40 -62 Q -30 -100 -128 -58', 18)}${st('M 40 -62 Q -30 -100 -128 -58', 10, '#2E86DE')}`,
    `<ellipse cx="70" cy="-60" rx="11" ry="18" fill="#4FB3FF" stroke="${OL}" stroke-width="5"/><ellipse cx="44" cy="-62" rx="26" ry="21" fill="#4FB3FF" stroke="${OL}" stroke-width="6"/><ellipse cx="36" cy="-69" rx="8" ry="5" fill="#fff"/>`] : ['', ''];
  return `${afroLado()}${oculos[0]}
    <circle cx="76" cy="14" r="11" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
    <ellipse cx="6" cy="8" rx="68" ry="78" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
    <path d="M 54 -46 Q 30 -92 -30 -82 Q -78 -62 -70 30 Q -58 46 -44 30 Q -44 -30 0 -44 Q 30 -50 54 -46 Z" fill="${C.hair}"/>
    ${st('M -44 30 Q -44 -30 0 -44 Q 30 -50 54 -46', SW - 1)}
    <circle cx="-20" cy="16" r="16" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>${st('M -24 8 q 8 4 4 14', 4, C.skinLine)}
    ${e.blush ? `<ellipse cx="28" cy="28" rx="11" ry="7" fill="${C.blush}"/>` : ''}
    ${o.oculosNatacao ? '' : st(SOB_L[e.sob], e.sob === 'esforco' ? 8 : 7)}
    ${olhoLado(e.olho, o.olhar || e.olhar, id)}
    ${bocaLado(e.boca, id, o.fase || 0)}
    ${e.lagrimas ? lagrimasLado(o.fase || 0) : ''}
    ${e.suor ? gota(-120, -60, 1.2) + gota(-105, -125, 1) : ''}
    ${o.molhado ? gota(62, -22, 0.8) + gota(10, 30, 0.9) + gota(-6, -26, 0.7) + gota(70, 66, 0.8) : ''}
    ${oculos[1]}${o.extra || ''}`;
}

// ---------- de frente ----------
const SOB_F = {
  normal: ['M -44 -40 Q -28 -50 -12 -42', 'M 12 -42 Q 28 -50 44 -40'],
  alta: ['M -44 -50 Q -28 -60 -12 -52', 'M 12 -52 Q 28 -60 44 -50'],
  esforco: ['M -44 -48 L -12 -38', 'M 12 -38 L 44 -48'],
  triste: ['M -44 -40 Q -28 -44 -12 -54', 'M 12 -54 Q 28 -44 44 -40'],
  foco: ['M -44 -44 L -12 -40', 'M 12 -40 L 44 -44'],
};
function olhosFrente(tipo, [ox, oy] = [0, 2], id) {
  switch (tipo) {
    case 'aberto': return eye(-28, -4, { px: ox, py: oy, id: id + 'a' }) + eye(28, -4, { px: ox, py: oy, id: id + 'b' });
    case 'grande': return eye(-28, -6, { px: ox, py: oy, pr: 8, id: id + 'a' }) + eye(28, -6, { px: ox, py: oy, pr: 8, id: id + 'b' });
    case 'semi': return eye(-28, -4, { px: ox, py: oy, lid: 10, id: id + 'a' }) + eye(28, -4, { px: ox, py: oy, lid: 10, id: id + 'b' });
    case 'feliz': return st('M -44 0 Q -28 -22 -12 0') + st('M 12 0 Q 28 -22 44 0');
    case 'fechado': return st('M -44 -2 Q -28 8 -12 -2') + st('M 12 -2 Q 28 8 44 -2');
    case 'apertado': return st('M -44 -14 L -16 -4 L -44 6') + st('M 44 -14 L 16 -4 L 44 6');
  }
  throw new Error('olho? ' + tipo);
}
function bocaFrente(tipo, id, fase = 0) {
  switch (tipo) {
    case 'sorriso': return bigSmile(id + 'm');
    case 'riso': return bigSmile(id + 'm', 1.25);
    case 'fechada': return st('M -28 44 Q 0 64 28 44');
    case 'o': return `<ellipse cx="0" cy="56" rx="15" ry="19" fill="${C.mouth}" stroke="${OL}" stroke-width="${SW}"/><ellipse cx="0" cy="66" rx="9" ry="6" fill="${C.tongue}"/>`;
    case 'oGrande': return `<ellipse cx="0" cy="58" rx="20" ry="25" fill="${C.mouth}" stroke="${OL}" stroke-width="${SW}"/><ellipse cx="0" cy="72" rx="12" ry="7" fill="${C.tongue}"/>`;
    case 'triste': return st('M -26 62 Q 0 46 26 62');
    case 'chorando': return bocaPreenchida('M -36 72 Q -30 40 0 40 Q 30 40 36 72 Q 0 62 -36 72 Z', id + 'm', { dentes: false, lingua: `<ellipse cx="0" cy="66" rx="16" ry="7" fill="${C.tongue}"/>` });
    case 'dentes': return `<rect x="-30" y="42" width="60" height="26" rx="12" fill="#fff" stroke="${OL}" stroke-width="${SW}"/>${st('M -30 55 L 30 55 M -15 42 L -15 68 M 0 42 L 0 68 M 15 42 L 15 68', 3)}`;
    case 'lingua': return st('M -24 46 Q 0 60 24 46') + `<ellipse cx="12" cy="58" rx="10" ry="8" fill="${C.tongue}" stroke="${OL}" stroke-width="4"/>`;
    case 'mastigando': return st('M -66 24 Q -74 42 -60 56', 5, C.skinLine) + st('M 66 24 Q 74 42 60 56', 5, C.skinLine) + (fase % 1 < 0.5
      ? st('M -20 52 Q 0 46 20 52') : `<ellipse cx="0" cy="52" rx="12" ry="9" fill="${C.mouth}" stroke="${OL}" stroke-width="5"/>`);
  }
  throw new Error('boca? ' + tipo);
}
function lagrimasFrente(fase) {
  const f = fase % 1;
  return st('M -30 18 Q -38 44 -34 74', 8, LAGRIMA) + st('M 30 18 Q 38 44 34 74', 8, LAGRIMA) +
    gota(-36, 86 + 60 * f, 0.9, LAGRIMA) + gota(36, 86 + 60 * ((f + 0.5) % 1), 0.9, LAGRIMA);
}
// cabeça de frente, centro em (0,0); boca por volta de (0, 56)
function cabecaFrente(expr, id, o = {}) {
  const e = resolverExpr(expr, o.piscar);
  return `${afro()}
    <circle cx="-70" cy="14" r="17" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
    <circle cx="70" cy="14" r="17" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
    ${st('M -72 8 q 6 4 4 12 M 72 8 q -6 4 -4 12', 4, C.skinLine)}
    <ellipse cx="0" cy="8" rx="72" ry="80" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
    <path d="M -76 -6 Q -72 -78 0 -82 Q 72 -78 76 -6 Q 58 -50 0 -52 Q -58 -50 -76 -6 Z" fill="${C.hair}"/>
    ${st('M -74 -8 Q -58 -50 0 -52 Q 58 -50 74 -8', SW - 1)}
    ${e.blush ? `<ellipse cx="-50" cy="30" rx="11" ry="7" fill="${C.blush}"/><ellipse cx="50" cy="30" rx="11" ry="7" fill="${C.blush}"/>` : ''}
    ${st('M -7 24 Q 0 31 7 24', 5, C.skinLine)}
    ${SOB_F[e.sob].map(d => st(d, e.sob === 'esforco' ? 8 : 7)).join('')}
    ${olhosFrente(e.olho, o.olhar || e.olhar, id)}
    ${bocaFrente(e.boca, id, o.fase || 0)}
    ${e.lagrimas ? lagrimasFrente(o.fase || 0) : ''}
    ${e.suor ? gota(80, -40, 1.1) + gota(-86, -60, 0.9) : ''}
    ${o.extra || ''}`;
}

// ============================================================
// ROUPA — padrão: camiseta amarela, bermuda azul, tênis vermelho
// ============================================================
const ROUPA_PADRAO = { camisa: C.shirt, manga: 'curta', baixo: 'bermuda', corBaixo: C.shorts, pes: 'tenis' };
const roupaDe = r => ({ ...ROUPA_PADRAO, ...(r || {}) });
const SOLA = { tenis: 21, chuteira: 21, descalco: 14, meia: 14 };

// membro: aceita { a1, a2 } (ângulos) ou { alvo: [x, y], dobra } (posição da mão/pé)
function membro(base, m, l1, l2, padrao) {
  const mm = { ...padrao, ...(m || {}) };
  if (mm.alvo) { const J = ik(base, mm.alvo, l1, l2, mm.dobra ?? 1); const d = Math.hypot(mm.alvo[0] - J[0], mm.alvo[1] - J[1]); return [J, add(J, [(mm.alvo[0] - J[0]) * l2 / d, (mm.alvo[1] - J[1]) * l2 / d])]; }
  return chain(base, mm.a1, l1, mm.a2, l2);
}
const anguloDe = (a, b) => B.angulo(a, b);

// ---------- pés ----------
function peLado(F, giro, pes) {
  const t = `translate(${r2(F[0])} ${r2(F[1])}) rotate(${r2(giro)})`;
  if (pes === 'descalco') return `<g transform="${t}"><path d="M -12 -10 L 18 -10 Q 36 -8 38 6 Q 36 14 20 14 L -12 14 Q -18 2 -12 -10 Z" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
  if (pes === 'meia') return `<g transform="${t}"><path d="M -12 -10 L 18 -10 Q 36 -8 38 6 Q 36 14 20 14 L -12 14 Q -18 2 -12 -10 Z" fill="#fff" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
  const travas = pes === 'chuteira' ? [-10, 6, 22, 34].map(x => `<rect x="${x}" y="15" width="5" height="6" fill="${OL}"/>`).join('') : '';
  return `<g transform="${t}">
    <path d="M -14 -10 L 16 -10 Q 38 -6 40 8 L -16 8 Q -18 -2 -14 -10 Z" fill="${C.shoe}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${st('M -2 -4 L 18 -1', 4, '#fff')}
    <path d="M -18 6 L 42 6 Q 44 ${pes === 'chuteira' ? 15 : 21} 36 ${pes === 'chuteira' ? 15 : 21} L -16 ${pes === 'chuteira' ? 15 : 21} Q -20 ${pes === 'chuteira' ? 13 : 19} -18 6 Z" fill="#fff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>${travas}</g>`;
}

// ============================================================
// TEO DE LADO — olhando para a direita (use espelhar: true para olhar para a esquerda)
// Coordenadas locais: quadril em (0,0), y para baixo. Em pé, o chão fica em y = 115 + sola.
// ============================================================
const LADO = { coxa: 55, canela: 60, braco: 46, antebraco: 44, ombro: [6, -116], cabeca: [10, -212] };
function teoLado(p = {}) {
  const s = p.s ?? 1.45, lean = p.lean || 0, roupa = roupaDe(p.roupa), id = p.id || 'tl';
  const sola = SOLA[roupa.pes];
  // pernas
  const [Kp, Fp] = membro([0, 0], p.pernaPerto, LADO.coxa, LADO.canela, { a1: 6, a2: 0 });
  const [Kl, Fl] = membro([-4, -3], p.pernaLonge, LADO.coxa, LADO.canela, { a1: -6, a2: 0 });
  // pé plantado (perna por alvo) fica reto no chão; perna por ângulos gira o pé junto com a canela
  const giroPe = (K, F, m) => (m && m.giroPe != null) ? m.giroPe : (m && m.alvo) ? 0 : anguloDe(K, F) - 90;
  // tronco (gira com lean em torno do quadril)
  const ombro = girar(LADO.ombro, lean);
  const [Ep, Hp] = membro(ombro, p.bracoPerto, LADO.braco, LADO.antebraco, { a1: 10, a2: 25 });
  const [El, Hl] = membro(ombro, p.bracoLonge, LADO.braco, LADO.antebraco, { a1: -12, a2: 8 });
  const tiltCab = p.cabeca || 0;
  const doCorpo = q => girar(q, lean);                                   // ponto do tronco → local
  const daCabeca = q => doCorpo(add(LADO.cabeca, girar(q, tiltCab, [0, 70])));   // ponto da cabeça → local
  const info = {
    s, maoPerto: Hp, maoLonge: Hl, cotoveloPerto: Ep, cotoveloLonge: El, ombro,
    antebracoPerto: anguloDe(Ep, Hp), antebracoLonge: anguloDe(El, Hl),
    pePerto: Fp, peLonge: Fl, joelhoPerto: Kp, joelhoLonge: Kl,
    boca: daCabeca([52, 50]), olho: daCabeca([42, -4]), cabeca: daCabeca([0, 0]), daCabeca, doCorpo,
    chaoLocal: 115 + sola,
  };
  const esp = p.espelhar ? -1 : 1;
  info.aCena = q => [p.x + esp * q[0] * s, p.y + q[1] * s];

  const perna = (Hq, K, F, m) => {
    let out = limb([Hq, K, F], C.skin, 22);
    if (roupa.pes === 'tenis' || roupa.pes === 'chuteira') out += limb([lerp(K, F, 0.6), F], '#fff', 24);
    out += peLado(F, giroPe(K, F, m), roupa.pes);
    if (roupa.baixo === 'bermuda') out += limb([Hq, lerp(Hq, K, 0.45)], roupa.corBaixo, 36);
    if (roupa.baixo === 'calca') out += limb([Hq, K, lerp(K, F, 0.82)], roupa.corBaixo, 32);
    return out;
  };
  const braco = (S, E, Hh) => {
    let out = limb([S, E, Hh], C.skin, 20);
    if (roupa.camisa && roupa.manga === 'curta') out += limb([S, lerp(S, E, 0.5)], roupa.camisa, 34);
    if (roupa.camisa && roupa.manga === 'longa') out += limb([S, E, lerp(E, Hh, 0.75)], roupa.camisa, 32);
    return out + `<circle cx="${r2(Hh[0])}" cy="${r2(Hh[1])}" r="15" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
  };
  const corBaixo = roupa.baixo === 'sunga' ? (roupa.corBaixo === C.shorts ? '#E63946' : roupa.corBaixo) : roupa.corBaixo;
  const quadril = `<path d="M -40 -12 Q 0 -18 42 -12 Q 50 8 44 22 Q 0 28 -42 22 Q -48 6 -40 -12 Z" fill="${corBaixo}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  const item = v => typeof v === 'function' ? v(info) : (v || '');
  const corpo = `
    ${item(p.itensAtras)}
    ${p.semBracoLonge ? '' : braco(ombro, El, Hl)}
    ${perna([-4, -3], Kl, Fl, p.pernaLonge)}
    ${quadril}
    ${perna([0, 0], Kp, Fp, p.pernaPerto)}
    <g transform="rotate(${r2(lean)})">
      <rect x="-6" y="-152" width="24" height="34" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
      <path d="M -32 -128 Q 4 -140 30 -126 Q 44 -60 40 6 Q 2 16 -38 6 Q -42 -60 -32 -128 Z" fill="${roupa.camisa || C.skin}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      ${roupa.camisa ? st('M -8 -134 Q 6 -122 18 -132', 5) : st('M 30 -40 q 4 4 0 8', 4, C.skinLine)}
      ${item(p.itensTronco)}
      <g transform="translate(${LADO.cabeca[0]} ${LADO.cabeca[1]}) rotate(${r2(tiltCab)} 0 70)">${cabecaLado(p.expr || 'feliz', id, p)}</g>
    </g>
    ${item(p.itensMeio)}
    ${braco(ombro, Ep, Hp)}
    ${item(p.itensFrente)}`;
  const sombra = p.sombra === false ? '' : `<ellipse cx="${p.sombraX ?? 15}" cy="${r2(p.sombraY ?? info.chaoLocal)}" rx="${p.sombraLarg ?? 70}" ry="9" fill="#000" opacity="0.13"/>`;
  return { info, svg: `<g transform="translate(${r2(p.x)} ${r2(p.y)}) scale(${r2(esp * s)} ${r2(s)})">${sombra}${corpo}</g>` };
}
// y do quadril para o Teo de lado ficar em pé sobre o chão G
teoLado.emPe = (G, s = 1.45, pes = 'tenis') => G - (115 + SOLA[pes]) * s;

// ============================================================
// TEO DE FRENTE — quadril (centro) em (0,0). Esquerda/direita = da tela.
// Em pé, o chão fica em y = 122 (de tênis) ou 106 (descalço).
// ============================================================
const FRENTE = { coxa: 50, canela: 42, braco: 54, antebraco: 50, ombroEsq: [-58, -152], ombroDir: [58, -152], quadrilEsq: [-28, 0], quadrilDir: [28, 0], cabeca: [0, -278] };
function peFrente(F, dir, giro, pes) {
  const t = `translate(${r2(F[0])} ${r2(F[1] + 4)}) rotate(${r2(giro)}) scale(${dir} 1)`;
  if (pes === 'descalco' || pes === 'meia') {
    const cor = pes === 'meia' ? '#fff' : C.skin;
    return `<g transform="${t}"><path d="M -14 -6 Q 0 -12 24 -4 Q 34 4 26 12 L -14 12 Q -20 4 -14 -6 Z" fill="${cor}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
  }
  return `<g transform="${t}">
    <path d="M -18 -10 L 12 -10 Q 40 -6 44 16 L -20 16 Z" fill="${C.shoe}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${st('M -2 -2 L 18 2', 5, '#fff')}
    <path d="M -24 14 L 48 14 Q 50 28 40 28 L -20 28 Q -26 28 -24 14 Z" fill="#fff" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
}
function teoFrente(p = {}) {
  const s = p.s ?? 1.45, lean = p.lean || 0, roupa = roupaDe(p.roupa), id = p.id || 'tf';
  const [Ke, Fe] = membro(FRENTE.quadrilEsq, p.pernaEsq, FRENTE.coxa, FRENTE.canela, { a1: -2, a2: -2, dobra: 1 });
  const [Kd, Fd] = membro(FRENTE.quadrilDir, p.pernaDir, FRENTE.coxa, FRENTE.canela, { a1: 2, a2: 2, dobra: -1 });
  const oe = girar(FRENTE.ombroEsq, lean), od = girar(FRENTE.ombroDir, lean);
  const [Ee, He] = membro(oe, p.bracoEsq, FRENTE.braco, FRENTE.antebraco, { a1: -18, a2: -6, dobra: -1 });
  const [Ed, Hd] = membro(od, p.bracoDir, FRENTE.braco, FRENTE.antebraco, { a1: 18, a2: 6, dobra: 1 });
  const tiltCab = p.cabeca || 0;
  const doCorpo = q => girar(q, lean);
  const daCabeca = q => doCorpo(add(FRENTE.cabeca, girar(q, tiltCab, [0, 70])));
  const info = {
    s, maoEsq: He, maoDir: Hd, cotoveloEsq: Ee, cotoveloDir: Ed, ombroEsq: oe, ombroDir: od,
    antebracoEsq: anguloDe(Ee, He), antebracoDir: anguloDe(Ed, Hd), peEsq: Fe, peDir: Fd, joelhoEsq: Ke, joelhoDir: Kd,
    boca: daCabeca([0, 56]), cabeca: daCabeca([0, 0]), daCabeca, doCorpo,
    chaoLocal: 92 + (roupa.pes === 'tenis' ? 32 : 18),
  };
  info.aCena = q => [p.x + q[0] * s, p.y + q[1] * s];
  const giroPe = (m, d) => (m && m.giroPe != null ? m.giroPe : 0) * d;
  const perna = (Hq, K, F, dir, m) => {
    let out = limb([Hq, K, F], C.skin, 24);
    if (roupa.pes === 'tenis') out += limb([lerp(K, F, 0.55), F], '#fff', 24);
    out += peFrente(F, dir, giroPe(m, dir), roupa.pes);
    if (roupa.baixo === 'calca') out += limb([Hq, K, lerp(K, F, 0.8)], roupa.corBaixo, 34);
    return out;
  };
  const manga = (S, E, Hh) => {
    if (!roupa.camisa) return '';
    if (roupa.manga === 'longa') return limb([S, E, lerp(E, Hh, 0.75)], roupa.camisa, 32);
    const a = anguloDe(S, E);
    return `<g transform="translate(${r2(S[0])} ${r2(S[1])}) rotate(${r2(a)})"><path d="M -14 -24 L 34 -21 Q 42 0 34 21 L -14 24 Z" fill="${roupa.camisa}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
  };
  const braco = (S, E, Hh) => limb([S, E, Hh], C.skin, 22) + manga(S, E, Hh) + `<circle cx="${r2(Hh[0])}" cy="${r2(Hh[1])}" r="16" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
  const corBaixo = roupa.baixo === 'sunga' ? (roupa.corBaixo === C.shorts ? '#E63946' : roupa.corBaixo) : roupa.corBaixo;
  const baixo = roupa.baixo === 'sunga'
    ? `<path d="M -62 -50 L 62 -50 L 58 -18 Q 0 4 -58 -18 Z" fill="${corBaixo}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>`
    : `<path d="M -64 -54 L 64 -54 L 72 ${roupa.baixo === 'calca' ? -20 : 24} L 10 ${roupa.baixo === 'calca' ? -20 : 24} L 0 -8 L -10 ${roupa.baixo === 'calca' ? -20 : 24} L -72 ${roupa.baixo === 'calca' ? -20 : 24} Z" fill="${corBaixo}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
       ${st('M 0 -50 L 0 -10', 4)}`;
  const item = v => typeof v === 'function' ? v(info) : (v || '');
  const corpo = `
    ${item(p.itensAtras)}
    ${perna(FRENTE.quadrilEsq, Ke, Fe, -1, p.pernaEsq)}${perna(FRENTE.quadrilDir, Kd, Fd, 1, p.pernaDir)}
    <g transform="rotate(${r2(lean)})">
      ${baixo}
      <rect x="-16" y="-220" width="32" height="56" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
      <path d="M -58 -170 Q 0 -182 58 -170 Q 72 -164 70 -140 L 66 -44 Q 0 -36 -66 -44 L -70 -140 Q -72 -164 -58 -170 Z" fill="${roupa.camisa || C.skin}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      ${roupa.camisa ? st('M -22 -172 Q 0 -154 22 -172', SW) : st('M -4 -80 q 4 4 8 0', 4, C.skinLine)}
      ${item(p.itensTronco)}
    </g>
    ${braco(oe, Ee, He)}${braco(od, Ed, Hd)}
    ${item(p.itensMeio)}
    <g transform="rotate(${r2(lean)}) translate(${FRENTE.cabeca[0]} ${FRENTE.cabeca[1]}) rotate(${r2(tiltCab)} 0 70)">${cabecaFrente(p.expr || 'feliz', id, p)}</g>
    ${p.maosNaFrenteDaCabeca ? braco(oe, Ee, He) + braco(od, Ed, Hd) : ''}
    ${item(p.itensFrente)}`;
  const sombra = p.sombra === false ? '' : `<ellipse cx="0" cy="${r2(p.sombraY ?? info.chaoLocal)}" rx="${p.sombraLarg ?? 95}" ry="12" fill="#000" opacity="0.12"/>`;
  return { info, svg: `<g transform="translate(${r2(p.x)} ${r2(p.y)}) scale(${r2(s)})">${sombra}${corpo}</g>` };
}
// y do quadril para o Teo de frente ficar em pé sobre o chão G
teoFrente.emPe = (G, s = 1.45, pes = 'tenis') => G - (92 + (pes === 'tenis' ? 32 : 18)) * s;

module.exports = { teoLado, teoFrente, cabecaLado, cabecaFrente, EXPRESSOES, LADO, FRENTE, ROUPA_PADRAO, LAGRIMA };
