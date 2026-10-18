// Objetos e ajudantes do Lote 4 (V13, V35, V22, V23, V24, V31, V32, V41, V47, V48).
// - cachorro(): cachorro caramela fofo, de lado (em pé andando ou sentado), rabo que abana e boca aberta.
// - passada(): ciclo de caminhada para o teoLado (pernas por ângulo, com o quique do corpo).
// - vaiVolta(): posição e direção para "ida e volta" com câmera fixa.
// - mesaFrente() / bracoFrente(): mesa vista de frente (Teo sentado atrás) e braço do teoFrente redesenhado por cima da mesa.
const B = require('../lib/base');
const { C, OL, SW, limb, r2, add, girar, tracoSvg: st } = B;

// ============================================================
// CACHORRO — olhando para a direita (espelhar: true vira para a esquerda). Origem no chão, no meio do corpo.
// ============================================================
const CAO = { pelo: '#D99A4E', escuro: '#A8662B', creme: '#F8E3BA', coleira: '#2F9BE0', placa: '#FFC93C' };

// cabeça do cachorro, centro em (0,0), focinho para a direita
function cabecaCao(o, id) {
  const orelha = o.orelha || 0;
  const olho = o.olho === 'feliz'
    ? st('M 2 -10 Q 14 -24 26 -10', 6)
    : `<ellipse cx="14" cy="-12" rx="9" ry="12" fill="${OL}"/><circle cx="17" cy="-16" r="3.6" fill="#fff"/>`;
  const boca = o.boca === 'fechada'
    ? st('M 40 30 Q 58 40 80 26', 5)
    : `<path d="M 36 28 Q 60 36 82 22 Q 84 58 60 62 Q 40 60 36 28 Z" fill="${C.mouth}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M 48 52 Q 50 ${r2(78 + (o.lingua || 0))} 62 ${r2(78 + (o.lingua || 0))} Q 74 ${r2(78 + (o.lingua || 0))} 72 52 Z" fill="${C.tongue}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
       ${st(`M 60 56 L 60 ${r2(68 + (o.lingua || 0))}`, 3, '#C9445E')}`;
  return `<ellipse cx="-4" cy="-44" rx="15" ry="24" transform="rotate(-25 -4 -44)" fill="${CAO.escuro}" stroke="${OL}" stroke-width="${SW}"/>
    <ellipse cx="0" cy="0" rx="52" ry="47" fill="${CAO.pelo}" stroke="${OL}" stroke-width="${SW}"/>
    <path d="M -6 -46 Q 8 -30 2 -12" fill="none" stroke="${CAO.creme}" stroke-width="14" stroke-linecap="round" opacity="0.9"/>
    ${boca}
    <ellipse cx="48" cy="14" rx="38" ry="25" fill="${CAO.creme}" stroke="${OL}" stroke-width="${SW}"/>
    ${o.boca === 'fechada' ? '' : `<path d="M 36 28 Q 60 36 82 22" fill="none" stroke="${OL}" stroke-width="5"/>`}
    <ellipse cx="82" cy="4" rx="14" ry="11" fill="${OL}"/><ellipse cx="78" cy="0" rx="5" ry="3" fill="#fff" opacity="0.8"/>
    ${st('M 82 14 L 82 22', 4)}
    <ellipse cx="22" cy="16" rx="9" ry="6" fill="#E98B6D" opacity="0.8"/>
    ${olho}${st('M 4 -32 Q 14 -38 26 -32', 5)}
    <g transform="rotate(${r2(orelha)} -16 -38)"><path d="M -14 -46 Q -52 -52 -54 -8 Q -56 30 -38 36 Q -22 32 -20 2 Q -16 -28 -14 -46 Z" fill="${CAO.escuro}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
}

// rabo: base em (0,0); rabo = ângulo extra (abanar)
function raboCao(ang) {
  return `<g transform="rotate(${r2(ang)}) scale(1.25)"><path d="M 4 -10 C -30 -16 -48 -42 -52 -74 Q -50 -84 -42 -78 C -34 -44 -20 -10 6 10 Z" fill="${CAO.pelo}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M -50 -76 Q -50 -82 -44 -79 L -46 -66 Z" fill="${CAO.creme}"/></g>`;
}

// perna: quadril H, ângulos a1 (coxa) e a2 (canela), cor; devolve svg e ponto do pé
function pernaCao(H, a1, a2, cor, l1 = 52, l2 = 50) {
  const [K, F] = B.chain(H, a1, l1, a2, l2);
  return { F, svg: limb([H, K, F], cor, 30) + `<ellipse cx="${r2(F[0] + 8)}" cy="${r2(F[1] + 1)}" rx="19" ry="11" fill="${cor}" stroke="${OL}" stroke-width="${SW}"/>` };
}

function coleiraSvg(A, Bp) {
  // faixa perpendicular ao pescoço (de A para Bp), no meio
  const m = B.lerp(A, Bp, 0.42), ang = B.angulo(A, Bp);
  return `<g transform="translate(${r2(m[0])} ${r2(m[1])}) rotate(${r2(ang)})"><rect x="-9" y="-30" width="18" height="60" rx="8" fill="${CAO.coleira}" stroke="${OL}" stroke-width="5"/>
    <circle cx="4" cy="34" r="9" fill="${CAO.placa}" stroke="${OL}" stroke-width="4"/></g>`;
}

// p: { x, y (chão), s, espelhar, pose: 'empe' | 'sentado', fase (passo 0..1, só em pé), andando (0..1 amplitude),
//      rabo (graus), olho: 'aberto'|'feliz', boca: 'aberta'|'fechada', lingua, orelha, cabeca (graus), coleira: true, id }
function cachorro(p) {
  const s = p.s ?? 1, esp = p.espelhar ? -1 : 1, id = p.id || 'cao';
  const o = { olho: p.olho || 'aberto', boca: p.boca || 'aberta', lingua: p.lingua || 0, orelha: p.orelha || 0 };
  const info = { aCena: q => [p.x + esp * q[0] * s, p.y + q[1] * s] };
  let svg = '';
  if ((p.pose || 'empe') === 'empe') {
    const fase = p.fase || 0, amp = p.andando ?? 0;
    const leg = (H, psi, cor) => {
      const a1 = 24 * amp * Math.sin(2 * Math.PI * psi), b = 34 * amp * Math.max(0, Math.cos(2 * Math.PI * psi));
      return pernaCao(H, a1, a1 - b, cor);
    };
    // calcula as pernas para saber o quique (pé mais baixo no chão)
    const pernas = [
      leg([-66, -112], fase, CAO.escuro), leg([58, -112], fase + 0.5, CAO.escuro),        // longe (atrás)
      leg([-78, -110], fase + 0.5, CAO.pelo), leg([70, -110], fase, CAO.pelo),            // perto
    ];
    const desce = -10 - Math.max(...pernas.map(l => l.F[1]));
    const N0 = [72, -138], N1 = [114, -192], HC = [120, -200];
    const cab = `<g transform="translate(${HC[0]} ${HC[1]}) rotate(${r2(p.cabeca || 0)} -20 30)">${cabecaCao(o, id)}</g>`;
    const corpo = `<ellipse cx="-4" cy="-122" rx="104" ry="46" fill="${CAO.pelo}" stroke="${OL}" stroke-width="${SW}"/>
      <clipPath id="${id}c"><ellipse cx="-4" cy="-122" rx="101" ry="43"/></clipPath>
      <ellipse cx="0" cy="-80" rx="90" ry="20" fill="${CAO.creme}" clip-path="url(#${id}c)"/>
      <path d="M 50 -150 Q 70 -128 92 -136" fill="none" stroke="${CAO.creme}" stroke-width="0"/>`;
    svg = `<g transform="translate(0 ${r2(desce)})">
      ${pernas[0].svg}${pernas[1].svg}
      <g transform="translate(-100 -138)">${raboCao(-10 + (p.rabo || 0))}</g>
      ${limb([N0, N1], CAO.pelo, 46)}
      ${corpo}
      <path d="M ${N0[0]} ${N0[1]} L ${N1[0]} ${N1[1]}" stroke="${CAO.pelo}" stroke-width="46" stroke-linecap="round"/>
      ${pernas[2].svg}${pernas[3].svg}
      ${p.coleira === false ? '' : coleiraSvg(N0, N1)}
      ${cab}</g>`;
    const col = add(B.lerp(N0, N1, 0.42), [4, 30]);
    info.coleira = info.aCena(add(col, [0, desce]));
    info.desce = desce;
  } else {
    // sentado: tronco inclinado, coxa traseira grande, patas da frente retas
    const c = [-10, -122], rx = 100, ry = 52, a = -50;
    const u = [Math.cos(B.rad(a)), Math.sin(B.rad(a))], n = [Math.sin(B.rad(a)), -Math.cos(B.rad(a))];
    const costas = t => [c[0] + u[0] * rx * t + n[0] * ry * Math.sqrt(Math.max(0, 1 - t * t)), c[1] + u[1] * rx * t + n[1] * ry * Math.sqrt(Math.max(0, 1 - t * t))];
    const N0 = [36, -168], N1 = [70, -232], HC = [82, -250];
    const cab = `<g transform="translate(${HC[0]} ${HC[1]}) rotate(${r2(p.cabeca || 0)} -20 30)">${cabecaCao(o, id)}</g>`;
    svg = `<g transform="translate(-84 -18)">${raboCao(-62 + (p.rabo || 0))}</g>
      ${pernaCao([36, -120], 2, 2, CAO.escuro, 56, 52).svg}
      ${limb([N0, N1], CAO.pelo, 48)}
      <ellipse cx="${c[0]}" cy="${c[1]}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${c[0]} ${c[1]})" fill="${CAO.pelo}" stroke="${OL}" stroke-width="${SW}"/>
      <ellipse cx="${c[0] + 34}" cy="${c[1] - 10}" rx="44" ry="26" transform="rotate(${a} ${c[0] + 34} ${c[1] - 10})" fill="${CAO.creme}"/>
      <path d="M ${N0[0]} ${N0[1]} L ${N1[0]} ${N1[1]}" stroke="${CAO.pelo}" stroke-width="48" stroke-linecap="round"/>
      <ellipse cx="2" cy="-9" rx="34" ry="12" fill="${CAO.pelo}" stroke="${OL}" stroke-width="${SW}"/>
      <ellipse cx="-48" cy="-50" rx="58" ry="50" fill="${CAO.pelo}" stroke="${OL}" stroke-width="${SW}"/>
      ${st('M -70 -30 Q -50 -16 -24 -26', 5, CAO.escuro)}
      ${pernaCao([54, -120], -2, -2, CAO.pelo, 56, 52).svg}
      ${p.coleira === false ? '' : coleiraSvg(N0, N1)}
      ${cab}`;
    // costas(k): k = 0 perto do pescoço, 1 perto do rabo (ponto local) → cena
    info.costasLocal = k => costas(B.mix(0.72, -0.72, k));
    info.costas = k => info.aCena(info.costasLocal(k));
    info.coleira = info.aCena(add(B.lerp(N0, N1, 0.42), [0, 30]));
  }
  info.svg = svg;
  return { info, svg: `<g transform="translate(${r2(p.x)} ${r2(p.y)}) scale(${r2(esp * s)} ${r2(s)})">${svg}</g>` };
}

// tufinho de pelo (pequeno "cacho" caramelo)
const tufo = (x, y, rot = 0, a = 1, k = 1) => `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${r2(k)})" opacity="${r2(a)}">
  <path d="M -16 4 Q -10 -10 -2 2 Q 4 -12 10 0 Q 16 -10 20 4" fill="none" stroke="${OL}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M -16 4 Q -10 -10 -2 2 Q 4 -12 10 0 Q 16 -10 20 4" fill="none" stroke="${CAO.pelo}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`;

// coração pequeno (carinho)
const coracao = (x, y, k = 1, a = 1, cor = '#FF6B8B') => `<path transform="translate(${r2(x)} ${r2(y)}) scale(${r2(k)})" opacity="${r2(a)}" d="M 0 10 C -26 -6 -18 -26 0 -14 C 18 -26 26 -6 0 10 Z" fill="${cor}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>`;

// ============================================================
// CAMINHADA do teoLado. fase avança 1 a cada passada completa (2 passos).
// Devolve pernas/braços por ângulo e "desce" (quanto o quadril baixa, em coordenadas locais).
// ============================================================
function passada(fase, { A = 24, dobra = 38, braco = 24, sola = 21 } = {}) {
  const TAU = 2 * Math.PI;
  const perna = psi => { const a1 = A * Math.sin(TAU * psi); return { a1, a2: a1 - dobra * Math.max(0, Math.cos(TAU * psi)) }; };
  const pp = perna(fase), pl = perna(fase + 0.5);
  const yPe = (m, h) => h[1] + 55 * Math.cos(B.rad(m.a1)) + 60 * Math.cos(B.rad(m.a2));
  const yp = yPe(pp, [0, 0]), yl = yPe(pl, [-4, -3]);
  const desce = 115 - Math.max(yp, yl);
  // pé de apoio fica reto no chão
  if (yp >= yl) pp.giroPe = 0; else pl.giroPe = 0;
  const bs = braco * Math.sin(TAU * fase);
  return {
    pernaPerto: pp, pernaLonge: pl, desce,
    bracoPerto: { a1: -bs, a2: -bs + 18 }, bracoLonge: { a1: bs, a2: bs + 18 },
    sombraY: 115 + sola - desce,
  };
}

// ============================================================
// IDA E VOLTA com câmera fixa, dentro de um ciclo (u 0..1):
// anda para a direita, vira (espelhar), volta para a esquerda e vira de novo no fim.
// ============================================================
function vaiVolta(u, { xa, xb, ida = [0.04, 0.44], volta = [0.54, 0.94] }) {
  let x, dir, andando;
  if (u < ida[0]) { x = xa; andando = 0; }
  else if (u < ida[1]) { x = B.mix(xa, xb, ease2((u - ida[0]) / (ida[1] - ida[0]))); andando = 1; }
  else if (u < volta[0]) { x = xb; andando = 0; }
  else if (u < volta[1]) { x = B.mix(xb, xa, ease2((u - volta[0]) / (volta[1] - volta[0]))); andando = 1; }
  else { x = xa; andando = 0; }
  // vira no meio das pausas
  const meio1 = (ida[1] + volta[0]) / 2, meio2 = ((volta[1] + 1 + ida[0]) / 2) % 1;
  dir = meio2 > meio1 ? (u >= meio1 && u < meio2 ? -1 : 1) : (u >= meio1 || u < meio2 ? -1 : 1);
  return { x, dir, andando };
}
// aceleração suave só nas pontas (anda em velocidade quase constante no meio)
function ease2(k) { k = B.clamp(k); const e = 0.18; if (k < e) return (k * k) / (2 * e * (1 - e)); if (k > 1 - e) return 1 - ((1 - k) * (1 - k)) / (2 * e * (1 - e)); return (k - e / 2) / (1 - e); }

// ============================================================
// MESA DE FRENTE (Teo sentado atrás). topo = y da borda da frente do tampo.
// ============================================================
function mesaFrente({ x = 960, topo = 640, w = 820, prof = 70, chao = 900, cor = '#C8915A', toalha = null }) {
  const x0 = x - w / 2, x1 = x + w / 2, ins = 50;
  const tampo = `<path d="M ${x0} ${topo} L ${x0 + ins} ${topo - prof} L ${x1 - ins} ${topo - prof} L ${x1} ${topo} Z" fill="${toalha ? toalha.cor : '#D9A56E'}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>`;
  let frente;
  if (toalha) {
    const hT = toalha.altura || 180, q = 60, n = Math.round(w / 82), dx = w / n;
    let xadrez = "";
    if (toalha.cor2) for (let i = 0; i * q < w; i++) for (let j = 0; j * q < hT + 30; j++) if ((i + j) % 2 === 0) xadrez += `<rect x="${x0 + i * q}" y="${topo + j * q}" width="${q}" height="${q}" fill="${toalha.cor2}"/>`;
    let barra = "";
    for (let i = n - 1; i >= 0; i--) barra += ` Q ${r2(x0 + (i + 0.5) * dx)} ${topo + hT + 26} ${r2(x0 + i * dx)} ${topo + hT}`;
    const d = `M ${x0} ${topo} L ${x1} ${topo} L ${x1} ${topo + hT}${barra} Z`;
    const pe = xx => `<rect x="${xx}" y="${topo + hT}" width="24" height="${chao - topo - hT}" fill="${cor}" stroke="${OL}" stroke-width="6"/>`;
    frente = `${pe(x0 + 40)}${pe(x1 - 64)}<clipPath id="toalha${x}"><path d="${d}"/></clipPath>
      <path d="${d}" fill="${toalha.cor}"/><g clip-path="url(#toalha${x})">${xadrez}</g>
      <path d="${d}" fill="none" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>`;
  } else {
    frente = `<rect x="${x0 + 30}" y="${topo + 30}" width="30" height="${chao - topo - 30}" fill="${cor}" stroke="${OL}" stroke-width="6"/>
      <rect x="${x1 - 60}" y="${topo + 30}" width="30" height="${chao - topo - 30}" fill="${cor}" stroke="${OL}" stroke-width="6"/>
      <rect x="${x0}" y="${topo}" width="${w}" height="36" fill="${cor}" stroke="${OL}" stroke-width="6"/>`;
  }
  return { tampo, frente, fundo: topo - prof, topo };
}

// encosto de cadeira visto de frente (fica atrás do Teo)
const encostoFrente = (x, y, w = 260, h = 230, cor = '#E07A3F') =>
  `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="22" fill="${cor}" stroke="${OL}" stroke-width="6"/>
   <rect x="${x - w / 2 + 34}" y="${y + 34}" width="${w - 68}" height="${h * 0.35}" rx="12" fill="#C9632C" stroke="${OL}" stroke-width="5"/>`;

// braço do teoFrente (igual ao da base) para redesenhar por cima da mesa; coordenadas locais do Teo
function bracoFrente(S, E, Hh, camisa = C.shirt) {
  const a = B.angulo(S, E);
  return limb([S, E, Hh], C.skin, 22) +
    `<g transform="translate(${r2(S[0])} ${r2(S[1])}) rotate(${r2(a)})"><path d="M -14 -24 L 34 -21 Q 42 0 34 21 L -14 24 Z" fill="${camisa}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>` +
    `<circle cx="${r2(Hh[0])}" cy="${r2(Hh[1])}" r="16" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
}
// envolve svg em coordenadas locais do Teo (de frente) na transformação da cena
const naCenaFrente = (p, svg) => `<g transform="translate(${r2(p.x)} ${r2(p.y)}) scale(${r2(p.s)})">${svg}</g>`;
const naCenaLado = (p, svg) => `<g transform="translate(${r2(p.x)} ${r2(p.y)}) scale(${r2((p.espelhar ? -1 : 1) * p.s)} ${r2(p.s)})">${svg}</g>`;

// braço do teoLado (igual ao da base), coordenadas locais
function bracoLado(S, E, Hh, camisa = C.shirt) {
  return limb([S, E, Hh], C.skin, 20) + limb([S, B.lerp(S, E, 0.5)], camisa, 34) +
    `<circle cx="${r2(Hh[0])}" cy="${r2(Hh[1])}" r="15" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
}

module.exports = { CAO, cachorro, cabecaCao, tufo, coracao, passada, vaiVolta, ease2, mesaFrente, encostoFrente, bracoFrente, bracoLado, naCenaFrente, naCenaLado };
