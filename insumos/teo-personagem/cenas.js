// Cenas do Teo visto de lado, seguindo REGRAS-VIDEO.md (6 s, 3 repetições, loop, 16:9, sem som, sem texto).
// Uso: node cenas.js              → renderiza todas
//      node cenas.js karate       → só uma (karate | piscina)
//      node cenas.js karate --frame 40   → salva só um frame em video/preview-karate.png (para conferir)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const ffmpeg = require('ffmpeg-static');
const { C, SW, limb } = require('./gerar');

const W = 1920, H = 1080, FPS = 30, DURACAO = 6, REPETICOES = 3;
const N = DURACAO * FPS, CICLO = DURACAO / REPETICOES;
const OL = C.ol;

// ---------- utilitários ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const bump = (u, a, b) => Math.sin(Math.PI * clamp((u - a) / (b - a)));
const rad = d => d * Math.PI / 180;
const r2 = n => (+n).toFixed(2);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const mix = (a, b, t) => a + (b - a) * t;
// ângulos medidos a partir de "reto para baixo"; positivo = para a frente (direita)
const dirv = (a, l) => [l * Math.sin(rad(a)), l * Math.cos(rad(a))];
const add = (p, v) => [p[0] + v[0], p[1] + v[1]];
function chain(P, a1, l1, a2, l2) { const K = add(P, dirv(a1, l1)); return [K, add(K, dirv(a2, l2))]; }
function ik(S, T, l1, l2, bend) {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const ang = Math.atan2(dy, dx) + bend * A;
  return [S[0] + l1 * Math.cos(ang), S[1] + l1 * Math.sin(ang)];
}
// interpola keyframes [[u, valor], ...] com ease
function kf(keys, u) {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (u <= keys[i][0]) {
      const [u0, v0] = keys[i - 1], [u1, v1] = keys[i];
      const t = ease((u - u0) / (u1 - u0));
      return Array.isArray(v0) ? v0.map((x, j) => mix(x, v1[j], t)) : mix(v0, v1, t);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------- Teo de perfil (olhando para a direita) ----------
function afroLado() {
  const cx = -25, cy = -45, d = 92;
  const angs = [-90, -65, -115, -40, -140, -15, -165, 170, 148];
  const circles = [[cx, cy, 95], ...angs.map(a => [cx + d * Math.cos(rad(a)), cy + d * Math.sin(rad(a)), 40])];
  const curls = ['M -90 -110 q 10 -12 22 -4', 'M 10 -150 q 12 -8 22 2', 'M -50 -160 q 10 -10 22 -2',
    'M -120 -40 q 6 -12 18 -10', 'M -30 -115 q 8 -8 18 -2', 'M 30 -110 q 8 -8 18 0', 'M -110 -120 q 8 -8 18 -4']
    .map(p => `<path d="${p}" fill="none" stroke="${C.hairCurl}" stroke-width="5" stroke-linecap="round"/>`).join('');
  return circles.map(([x, y, r]) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r + SW / 2}" fill="${OL}"/>`).join('') +
    circles.map(([x, y, r]) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${C.hair}"/>`).join('') + curls;
}

const gota = (x, y, s = 1, cor = '#9EDCFF') =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -12 Q 9 0 7 5 Q 4 11 0 11 Q -4 11 -7 5 Q -9 0 0 -12 Z" fill="${cor}" stroke="${OL}" stroke-width="3"/>`;

const ROSTO = {
  orgulho: id => `
    <path d="M 24 -42 Q 42 -52 60 -42" fill="none" stroke="${OL}" stroke-width="7" stroke-linecap="round"/>
    <clipPath id="${id}o"><ellipse cx="40" cy="-4" rx="14" ry="21"/></clipPath>
    <ellipse cx="40" cy="-4" rx="14" ry="21" fill="#fff"/>
    <circle cx="45" cy="-1" r="9" fill="${C.pupil}"/><circle cx="42" cy="-5" r="3.3" fill="#fff"/>
    <rect x="20" y="-30" width="40" height="17" fill="${C.skin}" clip-path="url(#${id}o)"/>
    <path d="M 26 -13 L 54 -13" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="40" cy="-4" rx="14" ry="21" fill="none" stroke="${OL}" stroke-width="5"/>
    <ellipse cx="30" cy="30" rx="11" ry="7" fill="${C.blush}"/>
    <clipPath id="${id}m"><path d="M 22 38 Q 50 48 74 32 Q 70 62 46 62 Q 28 60 22 38 Z"/></clipPath>
    <path d="M 22 38 Q 50 48 74 32 Q 70 62 46 62 Q 28 60 22 38 Z" fill="${C.mouth}"/>
    <path d="M 10 20 L 90 20 L 90 44 Q 50 56 10 48 Z" fill="#fff" clip-path="url(#${id}m)"/>
    <path d="M 22 38 Q 50 48 74 32 Q 70 62 46 62 Q 28 60 22 38 Z" fill="none" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>`,
  esforco: () => `
    <path d="M 20 -38 L 60 -24" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round"/>
    <path d="M 30 -16 L 52 -5 L 30 6" fill="none" stroke="${OL}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="26" cy="28" rx="16" ry="10" fill="${C.blush}"/>
    <rect x="26" y="34" width="46" height="24" rx="11" fill="#fff" stroke="${OL}" stroke-width="${SW}"/>
    <path d="M 26 46 L 72 46 M 38 34 L 38 58 M 50 34 L 50 58 M 61 34 L 61 58" stroke="${OL}" stroke-width="3"/>
    ${gota(-120, -60, 1.2)}${gota(-105, -125, 1)}${gota(95, -70, 0.9)}`,
  riso: id => `
    <path d="M 26 -2 Q 41 -20 56 -2" fill="none" stroke="${OL}" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="28" cy="26" rx="12" ry="8" fill="${C.blush}"/>
    <clipPath id="${id}m"><path d="M 18 32 Q 50 44 80 24 Q 80 82 46 80 Q 20 76 18 32 Z"/></clipPath>
    <path d="M 18 32 Q 50 44 80 24 Q 80 82 46 80 Q 20 76 18 32 Z" fill="${C.mouth}"/>
    <g clip-path="url(#${id}m)"><path d="M 10 18 L 90 14 L 90 38 Q 50 54 10 44 Z" fill="#fff"/><ellipse cx="50" cy="76" rx="18" ry="10" fill="${C.tongue}"/></g>
    <path d="M 18 32 Q 50 44 80 24 Q 80 82 46 80 Q 20 76 18 32 Z" fill="none" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>`,
};

function cabecaLado(expr, id, { oculos = false, molhado = false } = {}) {
  const alca = oculos ? `<path d="M 40 -62 Q -30 -100 -128 -58" fill="none" stroke="${OL}" stroke-width="18" stroke-linecap="round"/>
    <path d="M 40 -62 Q -30 -100 -128 -58" fill="none" stroke="#2E86DE" stroke-width="10" stroke-linecap="round"/>` : '';
  const lentes = oculos ? `
    <ellipse cx="70" cy="-60" rx="11" ry="18" fill="#4FB3FF" stroke="${OL}" stroke-width="5"/>
    <ellipse cx="44" cy="-62" rx="26" ry="21" fill="#4FB3FF" stroke="${OL}" stroke-width="6"/>
    <ellipse cx="36" cy="-69" rx="8" ry="5" fill="#fff"/>` : '';
  const gotas = molhado ? gota(62, -22, 0.8) + gota(10, 30, 0.9) + gota(-6, -26, 0.7) + gota(70, 66, 0.8) + gota(-40, 50, 0.7) : '';
  return `${afroLado()}${alca}
    <circle cx="76" cy="14" r="11" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
    <ellipse cx="6" cy="8" rx="68" ry="78" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
    <path d="M 54 -46 Q 30 -92 -30 -82 Q -78 -62 -70 30 Q -58 46 -44 30 Q -44 -30 0 -44 Q 30 -50 54 -46 Z" fill="${C.hair}"/>
    <path d="M -44 30 Q -44 -30 0 -44 Q 30 -50 54 -46" fill="none" stroke="${OL}" stroke-width="${SW - 1}" stroke-linecap="round"/>
    <circle cx="-20" cy="16" r="16" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>
    <path d="M -24 8 q 8 4 4 14" fill="none" stroke="${C.skinLine}" stroke-width="4" stroke-linecap="round"/>
    ${ROSTO[expr](id)}${lentes}${gotas}`;
}

function braco(S, E, Hn, manga) {
  let s = limb([S, E, Hn], C.skin, 20);
  if (manga) s += limb([S, E, lerp(E, Hn, 0.35)], manga, 34);
  return s + `<circle cx="${r2(Hn[0])}" cy="${r2(Hn[1])}" r="15" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
}

function perna(Hp, a1, a2, calca) {
  const [K, F] = chain(Hp, a1, 55, a2, 60);
  const pe = `<g transform="translate(${r2(F[0])} ${r2(F[1])}) rotate(${r2(-a2)})">
    <path d="M -12 -10 L 18 -10 Q 36 -8 38 6 Q 36 14 20 14 L -12 14 Q -18 2 -12 -10 Z" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
  let s = limb([Hp, K, F], C.skin, 22) + pe;
  if (calca) s += limb([Hp, K, lerp(K, F, 0.72)], calca, 32);
  return { svg: s, K, F };
}

const TORSO = 'M -32 -128 Q 4 -140 30 -126 Q 44 -60 40 6 Q 2 16 -38 6 Q -42 -60 -32 -128 Z';
const pescoco = `<rect x="-6" y="-152" width="24" height="34" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
const ombro = [6, -116];

// ---------- cena 1: karatê ----------
const QUIMONO = '#F8F6F0', FAIXA = '#2F6BDB';
function karate() {
  const S = 1.42, G = 905, HX = 860, HY = G - 125 * S;
  const ESTICA = [118, 124];                                           // coxa e canela no auge do chute
  const [, PE] = chain([0, 0], ESTICA[0], 55, ESTICA[1], 60);
  const BW = 170, BH = 360;
  const BX = HX + (PE[0] + 13) * S + BW / 2, BY = HY + PE[1] * S;     // saco: a borda encosta na sola do pé esticado
  const IMPACTO = 0.38;
  // momentos de cada repetição, para a trilha de som (sons.js)
  EVENTOS.karate = Array.from({ length: REPETICOES }, (_, i) => [
    { t: (i + 0.28) * CICLO, tipo: 'vush' }, { t: (i + IMPACTO) * CICLO, tipo: 'impacto' }, { t: (i + 0.72) * CICLO, tipo: 'pisada' },
  ]).flat();

  const fundo = `<rect width="${W}" height="${H}" fill="#F4EFE6"/>
    <rect x="0" y="0" width="${W}" height="40" fill="#C89B6D" stroke="${OL}" stroke-width="6"/>
    <rect x="0" y="770" width="${W}" height="30" fill="#C89B6D" stroke="${OL}" stroke-width="6"/>
    ${[0, 1].map(row => Array.from({ length: 8 }, (_, i) => {
      const w = 320, x = i * w - (row ? 160 : 0), y = row ? 930 : 800, h = row ? 150 : 130;
      const cor = (i + row) % 2 ? '#D64545' : '#5DAE5B';
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cor}" stroke="${OL}" stroke-width="6"/>`;
    }).join('')).join('')}`;

  function saco(ang) {
    return `<g transform="rotate(${r2(ang)} ${BX} 40)">
      <path d="M ${BX} 40 L ${BX} ${BY - BH / 2 - 30}" stroke="${OL}" stroke-width="10"/>
      <path d="M ${BX} 40 L ${BX} ${BY - BH / 2 - 30}" stroke="#8A8F98" stroke-width="5"/>
      <ellipse cx="${BX}" cy="${BY - BH / 2 - 6}" rx="60" ry="22" fill="#5B5F66" stroke="${OL}" stroke-width="6"/>
      <rect x="${BX - BW / 2}" y="${BY - BH / 2}" width="${BW}" height="${BH}" rx="44" fill="#D62828" stroke="${OL}" stroke-width="7"/>
      <rect x="${BX - BW / 2 + 4}" y="${BY - BH / 2 + 60}" width="${BW - 8}" height="18" fill="#A61E1E"/>
      <rect x="${BX - BW / 2 + 4}" y="${BY + BH / 2 - 78}" width="${BW - 8}" height="18" fill="#A61E1E"/>
      <rect x="${BX + 30}" y="${BY - BH / 2 + 100}" width="16" height="120" rx="8" fill="#E85A5A"/>
    </g>`;
  }

  // pose do chute (perna direita = perna do lado da câmera; a cena é espelhada no final)
  const CHUTE = [[0, [-22, -8]], [0.14, [-22, -8]], [0.28, [100, 10]], [IMPACTO, ESTICA], [0.48, ESTICA],
    [0.58, [100, 10]], [0.72, [-22, -8]], [1, [-22, -8]]];
  const intensidade = u => kf([[0, 0], [0.14, 0], [0.28, 1], [0.58, 1], [0.72, 0], [1, 0]], u);

  return function frame(f) {
    const t = f / FPS, u = (t % CICLO) / CICLO;
    const k = intensidade(u);
    const [a1, a2] = kf(CHUTE, u);
    const esforco = u > 0.12 && u < 0.64;
    const guarda = 4 * Math.sin(2 * Math.PI * 2 * t) * (1 - k);          // balanço da guarda (período 0,5 s)
    // saco: oscilação amortecida a partir do último impacto
    const tImp = (Math.floor(t / CICLO - IMPACTO) + IMPACTO) * CICLO;
    const tau = t - tImp;
    const ang = -10 * Math.exp(-2.6 * tau) * Math.sin(2 * Math.PI * tau / 0.9);

    const hip = [0, 0];
    const apoio = perna(hip, mix(20, 26, k), mix(4, 0, k), QUIMONO);
    const chute = perna(hip, a1, a2, QUIMONO);
    const sh = ombro;
    const [Ef, Hf] = chain(sh, mix(60, 72, k), 46, mix(140, 118, k), 44);   // braço da frente (longe)
    const [En, Hn] = chain(sh, mix(35, 10, k), 46, mix(170, 175, k), 44);  // braço de trás (perto)
    const inclina = -10 * k;
    const tronco = `
      <g transform="rotate(${r2(inclina)})">
        ${braco(sh, Ef, Hf, QUIMONO)}
        ${pescoco}
        <path d="${TORSO}" fill="${QUIMONO}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
        <path d="M -6 -132 Q 8 -70 34 -18" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>
        <path d="M -40 -16 L 42 -14 L 42 4 L -40 2 Z" fill="${FAIXA}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M 40 0 L 52 34 L 42 37 Z M 38 0 L 34 38 L 25 36 Z" fill="${FAIXA}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="32" y="-17" width="16" height="20" rx="5" fill="${FAIXA}" stroke="${OL}" stroke-width="4"/>
        <g transform="translate(10 -212) rotate(${esforco ? 4 : -6} 0 70)">${cabecaLado(esforco ? 'esforco' : 'orgulho', 'k')}</g>
        ${braco(sh, En, Hn, QUIMONO)}
      </g>`;
    // linhas de impacto (sem flash)
    const imp = u > IMPACTO - 0.01 && u < IMPACTO + 0.12
      ? `<g stroke="${OL}" stroke-width="6" stroke-linecap="round" opacity="${r2(1 - (u - IMPACTO) / 0.12)}">
          <path d="M ${BX - BW / 2 - 30} ${BY - 90} l -26 -24"/><path d="M ${BX - BW / 2 - 40} ${BY - 40} l -34 0"/><path d="M ${BX - BW / 2 - 30} ${BY + 10} l -26 22"/></g>` : '';

    const teo = `<g transform="translate(${HX} ${r2(HY - guarda)}) scale(${S})">
      <ellipse cx="0" cy="${125 + guarda / S}" rx="80" ry="10" fill="#000" opacity="0.13"/>
      ${apoio.svg}${tronco}${chute.svg}</g>`;
    // espelha a cena: Teo fica de frente para a esquerda e a perna do lado da câmera é a direita
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <g transform="translate(${W} 0) scale(-1 1)">${fundo}${saco(ang)}${teo}${imp}</g></svg>`;
  };
}

// ---------- cena 2: piscina ----------
function piscina() {
  const S = 1.6, BORDA_X = 860, BORDA_Y = 790, SUP = 852;
  const HX = 790, HY = BORDA_Y - 20 * S;
  const INT = [1, 1.4, 1.9];                     // cada repetição chuta mais forte
  const G = 2600;

  // pseudo-aleatório determinístico
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function pernas(t) {
    const u = (t % CICLO) / CICLO, rep = Math.floor(t / CICLO) % REPETICOES;
    const env = bump(u, 0.04, 0.62);
    const amp = 45 * INT[rep] * env;
    const fase = 2 * Math.PI * 2.4 * (u * CICLO);
    return {
      perto: 12 + amp * (1 - Math.cos(fase)) / 2,
      longe: 12 + amp * (1 + Math.cos(fase)) / 2 * (env > 0.02 ? 1 : 0) + (env > 0.02 ? 0 : 0),
      env, rep, u,
    };
  }
  // meio do pé em coordenadas da cena
  function pePos(a2) {
    const [, F] = chain([0, 0], 85, 55, a2, 60);
    const toe = add(F, [14 * Math.cos(rad(-a2)), 14 * Math.sin(rad(-a2))]);   // meio do pé
    return [HX + toe[0] * S, HY + toe[1] * S];
  }

  // simula os respingos frame a frame (determinístico)
  const gotas = [], coroas = [], aneis = [];
  const eventos = EVENTOS.piscina = [];          // para a trilha de som (sons.js)
  const porFrame = [];
  let prev = null;
  for (let f = 0; f < N; f++) {
    const t = f / FPS, p = pernas(t);
    const pes = { perto: pePos(p.perto), longe: pePos(p.longe) };
    if (prev) for (const lado of ['perto', 'longe']) {
      const [x, y] = pes[lado], y0 = prev[lado][1];
      if (y0 > SUP && y <= SUP) {                  // pé saindo da água → respingo grande
        const n = Math.round(8 * INT[p.rep] ** 2);
        for (let i = 0; i < n; i++) gotas.push({ x: x + (rnd() - 0.5) * 30, y: SUP, vx: -260 + rnd() * 620, vy: -520 - rnd() * 430 * INT[p.rep] / 1.9, r: 6 + rnd() * 8 * INT[p.rep] / 1.4, t0: t });
        coroas.push({ x, t0: t, s: INT[p.rep] });
        eventos.push({ t, tipo: 'sai', forca: INT[p.rep] });
      }
      if (y0 <= SUP && y > SUP) {                  // pé entrando → anel e respingo pequeno
        aneis.push({ x, t0: t });
        eventos.push({ t, tipo: 'entra', forca: INT[p.rep] });
        for (let i = 0; i < Math.round(3 * INT[p.rep]); i++) gotas.push({ x, y: SUP, vx: -150 + rnd() * 300, vy: -250 - rnd() * 250, r: 5 + rnd() * 4, t0: t });
      }
    }
    prev = pes;
    for (const g of gotas) if (!g.morto) {
      if (g.t0 < t) { g.vy += G / FPS; g.x += g.vx / FPS; g.y += g.vy / FPS; }
      if (g.vy > 0 && g.y > SUP + 6) g.morto = true;
    }
    porFrame.push({
      gotas: gotas.filter(g => !g.morto).map(g => [g.x, g.y, g.r]),
      coroas: coroas.filter(c => t - c.t0 < 0.3).map(c => [c.x, (t - c.t0) / 0.3, c.s]),
      aneis: aneis.filter(a => t - a.t0 < 0.6).map(a => [a.x, (t - a.t0) / 0.6]),
    });
  }

  const azulejo = Array.from({ length: 25 }, (_, i) => `M ${i * 80} 0 L ${i * 80} 560`).join(' ') +
    Array.from({ length: 7 }, (_, i) => ` M 0 ${i * 80} L ${W} ${i * 80}`).join('');
  const fundo = `<rect width="${W}" height="${H}" fill="#EAF6FB"/>
    <path d="${azulejo}" stroke="#CFE8F2" stroke-width="4"/>
    <rect x="0" y="490" width="${W}" height="30" fill="#4FB3E8"/>
    <rect x="0" y="560" width="${W}" height="40" fill="#F2F4F6" stroke="${OL}" stroke-width="6"/>
    <rect x="0" y="600" width="${W}" height="480" fill="#8FDBFA"/>
    <path d="M 1000 680 q 40 -12 80 0 M 1300 650 q 40 -12 80 0 M 1600 700 q 40 -12 80 0 M 300 660 q 40 -12 80 0" fill="none" stroke="#E8F8FF" stroke-width="6" stroke-linecap="round"/>`;
  const deck = `<rect x="-20" y="${BORDA_Y}" width="${BORDA_X + 20}" height="${H}" fill="#E3E8EC" stroke="${OL}" stroke-width="6"/>
    <rect x="-20" y="${BORDA_Y}" width="${BORDA_X + 20}" height="26" fill="#F7F9FA" stroke="${OL}" stroke-width="6"/>
    <path d="${Array.from({ length: 11 }, (_, i) => `M ${i * 80} ${BORDA_Y + 26} L ${i * 80} ${H}`).join(' ')} M 0 ${BORDA_Y + 110} L ${BORDA_X} ${BORDA_Y + 110} M 0 ${BORDA_Y + 200} L ${BORDA_X} ${BORDA_Y + 200}" stroke="#CCD3D9" stroke-width="4"/>`;

  function boia(t) {
    const y = SUP - 6 + 6 * Math.sin(2 * Math.PI * t / 2), a = 3 * Math.sin(2 * Math.PI * t / 3);
    const c = 2 * Math.PI * 70;
    return `<g transform="translate(1480 ${r2(y)}) rotate(${r2(a)}) scale(1.35 0.55)">
      <circle r="70" fill="none" stroke="${OL}" stroke-width="54"/>
      <circle r="70" fill="none" stroke="#fff" stroke-width="40"/>
      <circle r="70" fill="none" stroke="#E63946" stroke-width="40" stroke-dasharray="${r2(c / 8)} ${r2(c / 8)}"/>
    </g>`;
  }

  return function frame(f) {
    const t = f / FPS, p = pernas(t);
    const riso = 3 * Math.sin(2 * Math.PI * 6 * t);                 // cabeça chacoalhando de rir
    const barriga = 2 * Math.sin(2 * Math.PI * 6 * t);
    const hip = [0, 0];
    const longe = perna([-4, -3], 85, p.longe, null);
    const perto = perna(hip, 85, p.perto, null);
    const sh = ombro;
    const Tn = [34, -62 + barriga], Tf = [44, -52 + barriga];
    const En = ik(sh, Tn, 46, 44, 1), Ef = ik(sh, Tf, 46, 44, 1);
    const sunga = `<path d="M -40 -8 Q 0 -2 40 -6 Q 52 2 50 22 Q 0 30 -42 22 Z" fill="#E63946" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M -38 -2 Q 0 4 40 0" fill="none" stroke="#fff" stroke-width="5"/>`;
    const teo = `<g transform="translate(${HX} ${HY}) scale(${S})">
      ${longe.svg}
      <g transform="rotate(-8)">
        ${braco(sh, Ef, Tf, null)}
        ${pescoco}
        <path d="${TORSO}" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
        <path d="M 30 -40 q 4 4 0 8" fill="none" stroke="${C.skinLine}" stroke-width="4" stroke-linecap="round"/>
        <g transform="translate(10 -212) rotate(${r2(-8 + riso)} 0 70)">${cabecaLado('riso', 'p', { oculos: true, molhado: true })}</g>
        ${braco(sh, En, Tn, null)}
      </g>
      ${perto.svg}${sunga}
    </g>`;
    const agua = `<rect x="${BORDA_X}" y="${SUP}" width="${W - BORDA_X}" height="${H - SUP}" fill="#3FAEE6" opacity="0.4"/>
      <clipPath id="cw"><rect x="${BORDA_X}" y="0" width="${W - BORDA_X}" height="${H}"/></clipPath>
      <g clip-path="url(#cw)"><path d="M ${BORDA_X - 160} ${SUP} ${Array.from({ length: 18 }, (_, i) => `q 40 ${i % 2 ? 6 : -6} 80 0`).join(' ')}" fill="none" stroke="#E8F8FF" stroke-width="6"
        transform="translate(${r2(-((t * 160 / DURACAO) % 160))} 0)"/></g>`;
    const fx = porFrame[f];
    const respingos = fx.gotas.map(([x, y, r]) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="#fff" stroke="#3FA0D8" stroke-width="3"/>`).join('') +
      fx.coroas.map(([x, k, s]) => {
        const h = 70 * s * Math.sin(Math.PI * k), w = 50 * s * (0.6 + k);
        return `<path d="M ${r2(x - w)} ${SUP} L ${r2(x - w * 0.6)} ${r2(SUP - h * 0.7)} L ${r2(x - w * 0.3)} ${r2(SUP - h * 0.3)} L ${r2(x)} ${r2(SUP - h)} L ${r2(x + w * 0.3)} ${r2(SUP - h * 0.3)} L ${r2(x + w * 0.6)} ${r2(SUP - h * 0.7)} L ${r2(x + w)} ${SUP} Z"
          fill="#fff" stroke="#3FA0D8" stroke-width="4" stroke-linejoin="round" opacity="${r2(1 - k * 0.4)}"/>`;
      }).join('') +
      fx.aneis.map(([x, k]) => `<ellipse cx="${r2(x)}" cy="${SUP + 4}" rx="${r2(20 + 70 * k)}" ry="${r2(5 + 12 * k)}" fill="none" stroke="#fff" stroke-width="5" opacity="${r2(1 - k)}"/>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${fundo}${boia(t)}
      <rect x="${BORDA_X}" y="${SUP}" width="${W - BORDA_X}" height="${H - SUP}" fill="#8FDBFA"/>
      ${deck}${teo}${agua}${respingos}</svg>`;
  };
}

// ---------- cena 3: futebol ----------
function futebol() {
  const S = 1.45, G = 900, HX = 520, HY = G - 135.5 * S, R = 34;
  const P0 = [HX + 113, G - R];                           // bola parada no pé
  const POSTE = 1600, TRAVE_Y = 640, FUNDO_T = [1760, 660], FUNDO_C = [1800, G];
  const PG = [1748, 790];                                 // onde a bola bate na rede
  const PIN = [1715, G - R];                              // bola parada dentro do gol
  const CONTATO = 0.29, REDE = 0.45, CAI = 0.52, VOLTA = 0.6, CHEGA = 0.94;
  const HOPS = 3;
  // rotação do rolar ajustada para fechar em volta inteira (a bola começa cada ciclo igual)
  const giroRolar = -Math.round(((PIN[0] - P0[0]) / R) * 180 / Math.PI / 360) * 360;

  EVENTOS.futebol = Array.from({ length: REPETICOES }, (_, i) => [
    { t: (i + CONTATO) * CICLO, tipo: 'chute' }, { t: (i + REDE) * CICLO, tipo: 'rede' }, { t: (i + CAI) * CICLO, tipo: 'quique', forca: 1 },
    ...Array.from({ length: HOPS }, (_, k) => ({ t: (i + VOLTA + (CHEGA - VOLTA) * (k + 1) / HOPS) * CICLO, tipo: 'quique', forca: 0.7 - 0.2 * k })),
    { t: (i + CHEGA) * CICLO, tipo: 'boing' },
  ]).flat();

  function bola(u) {
    let x = P0[0], y = P0[1], rot = 0, sx = 1, sy = 1;
    if (u >= CONTATO && u < REDE) {
      const p = (u - CONTATO) / (REDE - CONTATO);
      x = mix(P0[0], PG[0], p); y = mix(P0[1], PG[1], p) - 180 * 4 * p * (1 - p); rot = 720 * p;
      sx = 1.12; sy = 0.9;                                  // esticada pela velocidade
    } else if (u >= REDE && u < CAI) {
      const p = (u - REDE) / (CAI - REDE);
      x = mix(PG[0], PIN[0], p); y = mix(PG[1], PIN[1], p * p); rot = 720;
    } else if (u >= CAI && u < VOLTA) {
      x = PIN[0]; y = PIN[1] - 26 * bump(u, CAI, VOLTA - 0.02); rot = 720;
    } else if (u >= VOLTA && u < CHEGA) {
      const p = (u - VOLTA) / (CHEGA - VOLTA), e = ease(p);
      x = mix(PIN[0], P0[0], e);
      const pulo = Math.abs(Math.sin(HOPS * Math.PI * p));
      y = PIN[1] - 48 * (1 - p * 0.7) * pulo;
      const amassa = pulo < 0.15 ? (0.15 - pulo) / 0.15 : 0;  // achata ao tocar o chão
      sx = 1 + 0.18 * amassa; sy = 1 - 0.18 * amassa;
      rot = 720 + giroRolar * e + 25 * Math.sin(2 * Math.PI * 3 * p);   // gingado engraçado
    } else if (u >= CHEGA) {
      const p = (u - CHEGA) / (1 - CHEGA);
      const b = Math.exp(-p * 4) * Math.cos(2 * Math.PI * p * 2.5) * (1 - p);
      sx = 1 + 0.16 * b; sy = 1 - 0.16 * b; rot = 720 + giroRolar;
    }
    // apoia a bola no chão quando achatada
    const yy = y + R * (1 - sy);
    return `<g transform="translate(${r2(x)} ${r2(yy)}) rotate(${r2(rot % 360)}) scale(${r2(sx)} ${r2(sy)})">
      <clipPath id="cb"><circle r="${R}"/></clipPath>
      <circle r="${R}" fill="#fff"/>
      <g clip-path="url(#cb)" fill="${OL}">
        <path d="M 0 -11 L 10.5 -3.4 L 6.5 8.9 L -6.5 8.9 L -10.5 -3.4 Z"/>
        ${[0, 72, 144, 216, 288].map(a => `<path transform="rotate(${a}) translate(0 -${R})" d="M -9 -4 L 9 -4 L 12 9 L 0 16 L -12 9 Z"/>`).join('')}
      </g>
      <path d="M 0 -11 L 0 -${R} M 10.5 -3.4 L 30 -10 M 6.5 8.9 L 19 27 M -6.5 8.9 L -19 27 M -10.5 -3.4 L -30 -10" stroke="${OL}" stroke-width="2.5"/>
      <circle r="${R}" fill="none" stroke="${OL}" stroke-width="6"/>
    </g>`;
  }

  function gol(u) {
    const tau = (u - REDE) * CICLO;
    const b = tau >= 0 ? 48 * Math.exp(-tau / 0.18) * Math.cos(2 * Math.PI * tau / 0.28) : 0;
    // borda de trás da rede, empurrada pela bola (curva quadrática)
    const ctrl = [mix(FUNDO_T[0], FUNDO_C[0], 0.55) + b, mix(FUNDO_T[1], FUNDO_C[1], 0.55)];
    const fundo = s => { const a = lerp(FUNDO_T, ctrl, s), c = lerp(ctrl, FUNDO_C, s); return lerp(a, c, s); };
    const frente = s => [POSTE, mix(TRAVE_Y, G, s)];
    let malha = '';
    for (let i = 1; i < 8; i++) { const s = i / 8, A = frente(s), B = fundo(s); malha += `M ${A[0]} ${r2(A[1])} L ${r2(B[0])} ${r2(B[1])} `; }
    for (let j = 1; j < 6; j++) {
      const k = j / 6; let pts = [];
      for (let i = 0; i <= 8; i++) { const s = i / 8; pts.push(lerp(frente(s), fundo(s), k)); }
      malha += 'M ' + pts.map(p => `${r2(p[0])} ${r2(p[1])}`).join(' L ') + ' ';
    }
    const borda = `M ${FUNDO_T[0]} ${FUNDO_T[1]} Q ${r2(ctrl[0])} ${r2(ctrl[1])} ${FUNDO_C[0]} ${FUNDO_C[1]}`;
    return {
      fundo: `<path d="${malha}" fill="none" stroke="#fff" stroke-width="3" opacity="0.9"/>
        <path d="${borda}" fill="none" stroke="#fff" stroke-width="5"/>
        <path d="M ${POSTE} ${G} L ${FUNDO_C[0]} ${G}" stroke="${OL}" stroke-width="12" stroke-linecap="round"/>
        <path d="M ${POSTE} ${G} L ${FUNDO_C[0]} ${G}" stroke="#E9EEF2" stroke-width="6" stroke-linecap="round"/>`,
      frente: `<path d="M ${POSTE} ${G} L ${POSTE} ${TRAVE_Y} L ${FUNDO_T[0]} ${FUNDO_T[1]}" fill="none" stroke="${OL}" stroke-width="24" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M ${POSTE} ${G} L ${POSTE} ${TRAVE_Y} L ${FUNDO_T[0]} ${FUNDO_T[1]}" fill="none" stroke="#fff" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>`,
    };
  }

  const fundo = `<rect width="${W}" height="${H}" fill="#9ED8FF"/>
    <circle cx="1180" cy="160" r="85" fill="#FFE066" stroke="${OL}" stroke-width="8"/>
    <g fill="#fff" stroke="${OL}" stroke-width="8">
      <path d="M 760 280 q 0 -60 60 -60 q 20 -50 80 -40 q 50 -10 70 40 q 50 0 50 60 Z"/>
      <path d="M 1300 190 q 0 -45 45 -45 q 15 -38 60 -30 q 38 -8 52 30 q 38 0 38 45 Z"/>
    </g>
    <rect x="0" y="760" width="${W}" height="${H - 760}" fill="#67BF4A"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${i * 320}" y="760" width="160" height="${H - 760}" fill="#74CB56"/>`).join('')}
    <path d="M 0 760 L ${W} 760" stroke="${OL}" stroke-width="6"/>`;

  function chuteira(F, a2) {
    return `<g transform="translate(${r2(F[0])} ${r2(F[1])}) rotate(${r2(-a2)})">
      <path d="M -14 -10 L 16 -10 Q 38 -6 40 8 L -16 8 Q -18 -2 -14 -10 Z" fill="${C.shoe}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M -2 -4 L 18 -1" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M -18 6 L 42 6 Q 44 15 36 15 L -16 15 Q -20 13 -18 6 Z" fill="#fff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
      ${[-10, 6, 22, 34].map(x => `<rect x="${x}" y="15" width="5" height="6" fill="${OL}"/>`).join('')}
    </g>`;
  }
  function pernaF(Hp, a1, a2) {
    const [K, F] = chain(Hp, a1, 55, a2, 60);
    return limb([Hp, K, F], C.skin, 22) + limb([lerp(K, F, 0.55), F], '#fff', 24) + chuteira(F, a2) +
      limb([Hp, lerp(Hp, K, 0.45)], C.shorts, 36);
  }
  function bracoF(sh, a1, a2) {
    const [E, Hn] = chain(sh, a1, 46, a2, 44);
    return limb([sh, E, Hn], C.skin, 20) + limb([sh, lerp(sh, E, 0.5)], C.shirt, 34) +
      `<circle cx="${r2(Hn[0])}" cy="${r2(Hn[1])}" r="15" fill="${C.skin}" stroke="${OL}" stroke-width="${SW}"/>`;
  }

  const CHUTE = [[0, [-6, -4]], [0.12, [-6, -4]], [0.24, [-40, -85]], [CONTATO, [22, 6]], [0.36, [80, 72]], [0.44, [68, 40]], [0.56, [-6, -4]], [1, [-6, -4]]];
  const forca = u => kf([[0, 0], [0.12, 0], [0.24, 0.6], [CONTATO, 1], [0.4, 1], [0.56, 0], [1, 0]], u);

  return function frame(f) {
    const t = f / FPS, u = (t % CICLO) / CICLO;
    const k = forca(u);
    const [a1, a2] = kf(CHUTE, u);
    const expr = u > 0.18 && u < 0.42 ? 'esforco' : u >= 0.42 && u < 0.66 ? 'riso' : 'orgulho';
    const balanco = 3 * Math.sin(2 * Math.PI * 2 * t) * (1 - k);
    const inclina = kf([[0, 0], [0.24, 6], [0.36, -10], [0.5, 0], [1, 0]], u);
    const bPerto = kf([[0, 8], [0.24, -40], [0.36, 75], [0.56, 8], [1, 8]], u);    // braço esquerdo (lado da câmera)
    const bLonge = kf([[0, -8], [0.24, 40], [0.36, -55], [0.56, -8], [1, -8]], u);
    const g = gol(u);
    const teo = `<g transform="translate(${HX} ${r2(HY - balanco)}) scale(${S})">
      <ellipse cx="20" cy="${r2(135.5 + balanco / S)}" rx="70" ry="9" fill="#000" opacity="0.13"/>
      <g transform="rotate(${r2(inclina)})">${bracoF(ombro, bLonge, bLonge + 25)}</g>
      ${pernaF([0, 0], a1, a2)}
      <path d="M -40 -12 Q 0 -18 42 -12 Q 50 8 44 22 Q 0 28 -42 22 Q -48 6 -40 -12 Z" fill="${C.shorts}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      ${pernaF([0, 0], mix(8, 14, k), mix(2, -4, k))}
      <g transform="rotate(${r2(inclina)})">
        ${pescoco}
        <path d="${TORSO}" fill="${C.shirt}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
        <path d="M -8 -134 Q 6 -122 18 -132" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>
        <g transform="translate(10 -212) rotate(${expr === 'riso' ? -8 : expr === 'esforco' ? 5 : -3} 0 70)">${cabecaLado(expr, 'f')}</g>
        ${bracoF(ombro, bPerto, bPerto + 25)}
      </g>
    </g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${fundo}${bola(u)}${g.fundo}${g.frente}${teo}</svg>`;
  };
}

const CENAS = { karate, piscina, futebol };
const EVENTOS = {};
module.exports = { CENAS, EVENTOS, DURACAO };
if (require.main !== module) return;

// ---------- render ----------
const dir = path.join(__dirname, 'video');
const args = process.argv.slice(2);
const fi = args.indexOf('--frame');
const soFrame = fi >= 0 ? +args[fi + 1] : null;
const nomes = args.filter((a, i) => !a.startsWith('--') && (fi < 0 || i !== fi + 1));
for (const nome of nomes.length ? nomes : Object.keys(CENAS)) {
  const frame = CENAS[nome]();
  const png = f => new Resvg(frame(f), { fitTo: { mode: 'width', value: W } }).render().asPng();
  if (soFrame !== null) { fs.writeFileSync(path.join(dir, `preview-${nome}.png`), png(soFrame)); console.log('preview', nome, soFrame); continue; }
  const framesDir = path.join(dir, 'frames-' + nome);
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  for (let f = 0; f < N; f++) fs.writeFileSync(path.join(framesDir, `f${String(f).padStart(4, '0')}.png`), png(f));
  const saida = path.join(dir, `teo-${nome}.mp4`);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(framesDir, 'f%04d.png'),
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', saida]);
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log('ok:', saida);
}
