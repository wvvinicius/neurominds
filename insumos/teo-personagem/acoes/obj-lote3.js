// Objetos e ajudantes compartilhados do Lote 3 (movimento e fora de casa).
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { C, OL, r2, limb, tracoSvg: st } = B;

// ============================================================
// RESPINGOS — gotas em balística, determinísticas e em loop (6 s)
// eventos: [{ t0, x, y, n, forca, vx }]; o sorteio de cada gota depende de t0 mod 6 s,
// então um evento em t0 e outro em t0 + 6 desenham igual (loop sem emenda).
// ============================================================
function gotasDe(e) {
  const seed = 1 + Math.round((((e.t0 % B.DURACAO) + B.DURACAO) % B.DURACAO) * 1000) + Math.round(e.x);
  const rnd = B.aleatorio(seed);
  for (let i = 0; i < 5; i++) rnd();
  const f = e.forca ?? 1, out = [];
  for (let i = 0; i < (e.n ?? 8); i++) out.push({
    vx: (e.vx ?? 0) + (rnd() - 0.5) * 520 * f, vy: -(260 + rnd() * 420) * f, r: (5 + rnd() * 7) * Math.sqrt(f),
  });
  return out;
}
// desenha as gotas vivas em t (s); sup = linha da água (as gotas somem ao voltar para ela)
function respingos(eventos, t, sup, g = 2600) {
  let svg = '';
  for (const e of eventos) {
    const a = t - e.t0;
    if (a < 0 || a > 1.2) continue;
    // coroa (lâmina de água) no ponto de entrada
    if (e.coroa && a < 0.3) {
      const k = a / 0.3, h = 55 * (e.forca ?? 1) * Math.sin(Math.PI * k), w = 34 * (e.forca ?? 1) * (0.6 + k), x = e.x, y = e.y;
      svg += `<path d="M ${r2(x - w)} ${r2(y)} L ${r2(x - w * 0.6)} ${r2(y - h * 0.7)} L ${r2(x - w * 0.3)} ${r2(y - h * 0.3)} L ${r2(x)} ${r2(y - h)} L ${r2(x + w * 0.3)} ${r2(y - h * 0.3)} L ${r2(x + w * 0.6)} ${r2(y - h * 0.7)} L ${r2(x + w)} ${r2(y)} Z" fill="#fff" stroke="#3FA0D8" stroke-width="4" stroke-linejoin="round" opacity="${r2(1 - k * 0.5)}"/>`;
    }
    if (e.anel && a < 0.6) {
      const k = a / 0.6;
      svg += `<ellipse cx="${r2(e.x)}" cy="${r2(e.y + 4)}" rx="${r2(20 + 70 * k)}" ry="${r2(5 + 12 * k)}" fill="none" stroke="#fff" stroke-width="5" opacity="${r2(1 - k)}"/>`;
    }
    for (const d of gotasDe(e)) {
      const x = e.x + d.vx * a, y = e.y + d.vy * a + 0.5 * g * a * a;
      if (d.vy + g * a > 0 && y > (typeof sup === 'function' ? sup(x) : sup) + 4) continue;
      svg += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(d.r)}" fill="#fff" stroke="#3FA0D8" stroke-width="3"/>`;
    }
  }
  return svg;
}

// ============================================================
// NADADOR — Teo de lado, deitado na água, crawl no lugar
// t = segundos; o = { x, y, s, oculos, molhado, periodo (s por braçada completa) }
// ============================================================
function nadador(t, o) {
  const s = o.s ?? 1.5, P = o.periodo ?? 1, L = o.lean ?? 62;
  const ph = t / P;                                         // fase da braçada (1 = volta completa de um braço)
  const A0 = o.aFrente ?? 100, A1 = o.aTras ?? -45;         // braço esticado à frente → fim da puxada (atrás)
  const braco = (fase) => {
    const f = ((fase % 1) + 1) % 1, pu = 0.55;
    // puxada dentro da água (55% do tempo), depois volta por cima, mais rápida
    const a1 = f < pu ? B.mix(A0, A1, B.ease(f / pu)) : B.mix(A1, A0 - 360, B.ease((f - pu) / (1 - pu)));
    const rec = f < pu ? 0 : Math.sin(Math.PI * (f - pu) / (1 - pu));
    return { a1, a2: a1 + 10 + (o.cotovelo ?? 35) * rec };
  };
  const chute = 12 * Math.sin(2 * Math.PI * t / 0.25);      // pernada rápida (4 por segundo)
  const u = (t % B.CICLO) / B.CICLO;
  const resp = B.bump(u, o.respA ?? 0.55, o.respB ?? 0.85);
  const balanco = 5 * Math.sin(2 * Math.PI * t / 0.5);
  const lean = L + (o.dLean || 0) + 3 * Math.sin(2 * Math.PI * t / P);
  const pernas = o.pernas ?? -(L + 22);
  const teo = teoLado({
    x: o.x, y: o.y + balanco * 0.6, s, lean,
    cabeca: (o.cabBase ?? -(L - 8)) - (o.cabResp ?? 0) * resp + 3 * Math.sin(2 * Math.PI * t / P),
    roupa: { camisa: null, baixo: 'sunga', pes: 'descalco' },
    oculosNatacao: o.oculos !== false, molhado: !!o.molhado,
    expr: o.expr ? o.expr(u, resp) : 'riso',
    pernaPerto: { a1: pernas + chute, a2: pernas + 4 + chute * 1.6 },
    pernaLonge: { a1: pernas - chute, a2: pernas + 4 - chute * 1.6 },
    bracoPerto: braco(ph),
    bracoLonge: braco(ph + 0.5),
    sombra: false,
  });
  return { teo, resp };
}
// instantes em que cada mão entra na água (fase em que o braço passa pela frente, descendo)
function entradasMao(P = 1, desloc = 0.03) {
  const out = [];
  for (let k = -2; k * P / 2 < B.DURACAO; k++) out.push({ t0: k * P / 2 + desloc * P, lado: k % 2 ? 'longe' : 'perto' });
  return out;
}

// ============================================================
// CRIANÇA — outra criança, simples, de lado (olha para a direita). Não fala.
// p = { x, y (quadril), s, pernaPerto/pernaLonge/bracoPerto/bracoLonge { a1, a2 }, lean, espelhar, expr: 'feliz'|'riso' }
// medidas locais: coxa 42, canela 44, braço 36, antebraço 34, ombro (4,-92), cabeça (8,-150)
// ============================================================
const CRI = { coxa: 42, canela: 44, braco: 36, antebraco: 34, ombro: [4, -92], cabeca: [8, -150] };
const CORES_CRI = { pele: '#E7B48A', cabelo: '#C2502B', camisa: '#FF7BAC', baixo: '#7B4FCF', tenis: '#2FB5A7' };
function crianca(p) {
  const s = p.s ?? 1.4, lean = p.lean || 0, cor = { ...CORES_CRI, ...(p.cores || {}) };
  const ang = (m, d) => ({ ...d, ...(m || {}) });
  const pp = ang(p.pernaPerto, { a1: 4, a2: 0 }), pl = ang(p.pernaLonge, { a1: -4, a2: 0 });
  const bp = ang(p.bracoPerto, { a1: 10, a2: 20 }), bl = ang(p.bracoLonge, { a1: -10, a2: 6 });
  const ombro = B.girar(CRI.ombro, lean);
  const perna = (H, m) => {
    const [K, F] = B.chain(H, m.a1, CRI.coxa, m.a2, CRI.canela);
    const g = B.angulo(K, F) - 90;
    return limb([H, K, F], cor.pele, 17) + limb([H, B.lerp(H, K, 0.5)], cor.baixo, 28) +
      `<g transform="translate(${r2(F[0])} ${r2(F[1])}) rotate(${r2(m.giroPe ?? g)})"><path d="M -10 -8 L 12 -8 Q 30 -5 31 7 L -12 7 Q -14 -2 -10 -8 Z" fill="${cor.tenis}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/></g>`;
  };
  const braco = (m) => {
    const [E, Hh] = B.chain(ombro, m.a1, CRI.braco, m.a2, CRI.antebraco);
    return limb([ombro, E, Hh], cor.pele, 15) + limb([ombro, B.lerp(ombro, E, 0.5)], cor.camisa, 26) +
      `<circle cx="${r2(Hh[0])}" cy="${r2(Hh[1])}" r="11" fill="${cor.pele}" stroke="${OL}" stroke-width="5"/>`;
  };
  const riso = p.expr === 'riso';
  const cabeca = `<g transform="translate(${CRI.cabeca[0]} ${CRI.cabeca[1]}) rotate(${r2(p.cabeca || 0)} 0 50)">
      <circle cx="-34" cy="-18" r="26" fill="${cor.cabelo}" stroke="${OL}" stroke-width="5"/>
      <path d="M -52 -2 Q -78 20 -66 44" fill="none" stroke="${OL}" stroke-width="22" stroke-linecap="round"/>
      <path d="M -52 -2 Q -78 20 -66 44" fill="none" stroke="${cor.cabelo}" stroke-width="12" stroke-linecap="round"/>
      <ellipse cx="4" cy="4" rx="50" ry="54" fill="${cor.pele}" stroke="${OL}" stroke-width="6"/>
      <path d="M 46 -18 Q 30 -62 -14 -56 Q -54 -48 -52 6 Q -40 18 -30 4 Q -30 -26 4 -32 Q 28 -36 46 -18 Z" fill="${cor.cabelo}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="-14" cy="10" r="11" fill="${cor.pele}" stroke="${OL}" stroke-width="5"/>
      ${riso ? st('M 22 0 Q 31 -12 40 0', 5) : `<ellipse cx="31" cy="-2" rx="8" ry="12" fill="#fff" stroke="${OL}" stroke-width="4"/><circle cx="34" cy="0" r="5" fill="${C.pupil}"/>`}
      <ellipse cx="22" cy="20" rx="8" ry="5" fill="#F08A8A"/>
      ${riso ? `<path d="M 20 28 Q 38 34 52 22 Q 50 46 34 46 Q 22 44 20 28 Z" fill="${C.mouth}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>` : st('M 24 30 Q 38 38 50 26', 5)}
    </g>`;
  const corpo = `${braco(bl)}${perna([-3, -2], pl)}
    <path d="M -30 -10 Q 0 -14 32 -10 Q 38 6 32 18 Q 0 22 -32 18 Q -36 4 -30 -10 Z" fill="${cor.baixo}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${perna([0, 0], pp)}
    <g transform="rotate(${r2(lean)})">
      <path d="M -26 -100 Q 4 -110 26 -98 Q 36 -50 32 4 Q 0 12 -30 4 Q -34 -50 -26 -100 Z" fill="${cor.camisa}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      ${cabeca}
    </g>
    ${braco(bp)}`;
  const esp = p.espelhar ? -1 : 1;
  const sombra = p.sombra === false ? '' : `<ellipse cx="10" cy="${r2(p.sombraY ?? 102)}" rx="52" ry="8" fill="#000" opacity="0.13"/>`;
  return `<g transform="translate(${r2(p.x)} ${r2(p.y)}) scale(${r2(esp * s)} ${r2(s)})">${sombra}${corpo}</g>`;
}
// quadril → chão, em pé (canela+coxa ≈ 86, mais o tênis)
crianca.emPe = (chao, s = 1.4) => chao - 101 * s;

// ============================================================
// BALDE com bolas (cheio, nunca esvazia)
// ============================================================
function balde(x, chao, s = 1) {
  const bolinhas = [[-34, -112, '#2F6BDB'], [30, -114, '#5DAE5B'], [0, -124, '#FFC93C'], [-12, -100, '#E63946'], [24, -96, '#B565D9']]
    .map(([bx, by, c]) => `<circle cx="${bx}" cy="${by}" r="26" fill="${c}" stroke="${OL}" stroke-width="6"/>${st(`M ${bx - 26} ${by} Q ${bx} ${by + 13} ${bx + 26} ${by}`, 4, '#fff')}`).join('');
  return `<g transform="translate(${x} ${chao}) scale(${s})">
    <ellipse cx="0" cy="4" rx="80" ry="10" fill="#000" opacity="0.13"/>
    <path d="M -70 -96 Q 0 -140 70 -96" fill="none" stroke="${OL}" stroke-width="7"/>
    ${bolinhas}
    <path d="M -70 -100 L 70 -100 L 56 0 L -56 0 Z" fill="#4FB3FF" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="-76" y="-108" width="152" height="18" rx="6" fill="#2E86DE" stroke="${OL}" stroke-width="6"/>
    ${st('M -60 -56 L 60 -56', 5, '#2E86DE')}</g>`;
}
const corBola = ['#E63946', '#FFC93C', '#5DAE5B', '#B565D9', '#2F6BDB'];
function bolaColor(x, y, r, cor, rot = 0) {
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})"><circle r="${r}" fill="${cor}" stroke="${OL}" stroke-width="6"/>${st(`M ${-r} 0 Q 0 ${r * 0.5} ${r} 0`, 5, '#fff')}<circle cx="${r2(-r * 0.35)}" cy="${r2(-r * 0.4)}" r="${r2(r * 0.18)}" fill="#fff" opacity="0.7"/></g>`;
}

// ============================================================
// ESCADA — 3 degraus subindo para a direita até um patamar, com corrimão ao fundo.
// E = { x0, chao, h, d, n }: x0 = frente do 1º degrau, h = altura de cada degrau, d = profundidade
// ============================================================
const ESCADA = { x0: 700, chao: 975, h: 84, d: 170, n: 3 };
// altura (y) do piso em x
function pisoEscada(x, E = ESCADA) {
  if (x < E.x0) return E.chao;
  const k = Math.min(E.n, Math.floor((x - E.x0) / E.d) + 1);
  return E.chao - k * E.h;
}
// linha do corrimão (sobe na diagonal dos degraus e fica reta no patamar)
function corrimaoY(x, E = ESCADA, alt = 250) {
  const k = B.clamp((x - E.x0 + E.d * 0.5) / (E.d * E.n), 0, 1);
  return E.chao - alt - k * E.n * E.h;
}
function desenharEscada(E = ESCADA, W = 1920) {
  const madeira = '#C8915A', escura = '#A8733F';
  // silhueta da escada (madeira), depois o tampo claro de cada degrau e a frente (espelho) mais escura
  let contorno = `M ${E.x0} ${E.chao + 120}`;
  for (let k = 1; k <= E.n; k++) { const x = E.x0 + (k - 1) * E.d, y = E.chao - k * E.h; contorno += ` L ${x} ${y + E.h} L ${x} ${y} L ${k === E.n ? W + 20 : x + E.d} ${y}`; }
  contorno += ` L ${W + 20} ${E.chao + 120} Z`;
  let deg = `<path d="${contorno}" fill="${madeira}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>`;
  for (let k = 1; k <= E.n; k++) {
    const x = E.x0 + (k - 1) * E.d, y = E.chao - k * E.h, larg = k === E.n ? W + 20 - x : E.d;
    deg += `<rect x="${x - 8}" y="${y - 4}" width="${larg + 8}" height="20" rx="6" fill="#E3B57E" stroke="${OL}" stroke-width="5"/>`;
  }
  // corrimão (ao fundo): postes e barra
  let post = '';
  const xs = [E.x0 + 50, E.x0 + E.d + 50, E.x0 + 2 * E.d + 50, E.x0 + 2 * E.d + 280, E.x0 + 2 * E.d + 520, E.x0 + 2 * E.d + 760, E.x0 + 2 * E.d + 1000];
  for (const x of xs) if (x < W) post += `<rect x="${x - 9}" y="${r2(corrimaoY(x, E))}" width="18" height="${r2(pisoEscada(x, E) - corrimaoY(x, E))}" fill="#E9D3B0" stroke="${OL}" stroke-width="5"/>`;
  const x1 = E.x0 - 40, x2 = W + 20;
  let d = `M ${x1} ${r2(corrimaoY(x1, E))}`;
  for (let x = x1; x <= x2; x += 20) d += ` L ${x} ${r2(corrimaoY(x, E))}`;
  const barra = st(d, 26) + st(d, 14, '#9C6B3F');
  return { fundo: post + barra, degraus: deg };
}
// passos na escada: progresso k (0 = os dois pés no chão, antes do 1º degrau; 1 = os dois no patamar)
// devolve as posições (cena) dos tornozelos e do quadril. s = escala do Teo.
function passosEscada(k, s, E = ESCADA) {
  const sola = 21 * s, xA = (i) => E.x0 + (i - 1) * E.d + 46;   // tornozelo no degrau i (i = 0: chão)
  const P = [{ x: E.x0 - 64, i: 0 }, { x: E.x0 - 64, i: 0 }];     // [perto, longe]
  const fim = [];
  // sequência: perto → 1, longe → 2, perto → 3, longe → 3
  const mov = [[0, 1, xA(1)], [1, 2, xA(2)], [0, 3, xA(3)], [1, 3, xA(3) + 30]];
  const n = mov.length, f = B.clamp(k) * n;
  const pe = [{ ...P[0], y: E.chao - sola }, { ...P[1], y: E.chao - sola }];
  pe[1].x = E.x0 - 92;
  let alturaQ = E.chao, xQ = (pe[0].x + pe[1].x) / 2;
  for (let m = 0; m < n; m++) {
    const [qual, deg, x] = mov[m];
    const de = { ...pe[qual] }, para = { x, y: E.chao - deg * E.h - sola, i: deg };
    const a = B.clamp(f - m);
    if (a <= 0) break;
    const e = B.ease(a);
    // arco do pé: sobe acima do degrau e desce
    const topo = Math.min(de.y, para.y) - 34;
    pe[qual] = { x: B.mix(de.x, para.x, e), y: B.mix(de.y, para.y, e) - (topo < Math.min(de.y, para.y) ? (Math.min(de.y, para.y) - topo) * Math.sin(Math.PI * B.clamp(a * 1.15)) : 0), i: a >= 1 ? deg : de.i };
  }
  // quadril: acompanha os pés (mais perto do pé da frente/mais alto)
  const alto = Math.min(pe[0].y, pe[1].y), baixo = Math.max(pe[0].y, pe[1].y);
  const yQ = B.mix(baixo, alto, 0.62) + sola - 136 * s + 6 * s;
  xQ = B.mix(Math.min(pe[0].x, pe[1].x), Math.max(pe[0].x, pe[1].x), 0.55) - 8 * s;
  return { pe, xQ, yQ };
}

module.exports = {
  ESCADA, pisoEscada, corrimaoY, desenharEscada, passosEscada, respingos, gotasDe, nadador, entradasMao, crianca, CRI, balde, bolaColor, corBola };
