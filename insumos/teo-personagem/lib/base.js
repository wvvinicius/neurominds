// Base comum dos vídeos de ação: constantes, tempo, curvas e geometria.
const { C, SW, limb } = require('../gerar');

const W = 1920, H = 1080, FPS = 30, DURACAO = 6, REPETICOES = 3;
const N = DURACAO * FPS;              // 180 frames; o frame 180 seria igual ao 0 → loop perfeito
const CICLO = DURACAO / REPETICOES;   // 2 s por repetição
const OL = C.ol;

// ---------- tempo ----------
// t = segundos, u = posição dentro da repetição (0..1), rep = qual repetição (0, 1, 2)
function tempo(f) { const t = f / FPS; return { t, u: (t % CICLO) / CICLO, rep: Math.floor(t / CICLO) % REPETICOES }; }
// piscadas automáticas (sempre nos mesmos instantes, para o loop)
const PISCADAS = [1.1, 3.35, 5.3];
const piscando = t => PISCADAS.some(b => t >= b && t < b + 0.12);

// ---------- curvas ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const bump = (u, a, b) => Math.sin(Math.PI * clamp((u - a) / (b - a)));      // 0 → 1 → 0 entre a e b
const onda = (t, periodo, fase = 0) => Math.sin(2 * Math.PI * (t / periodo + fase)); // use períodos que dividem 6 s
const mix = (a, b, t) => a + (b - a) * t;
// keyframes [[u, valor], ...] com ease; valor pode ser número ou array
function kf(keys, u) {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (u <= keys[i][0]) {
      const [u0, v0] = keys[i - 1], [u1, v1] = keys[i];
      const k = ease((u - u0) / (u1 - u0 || 1));
      return Array.isArray(v0) ? v0.map((x, j) => mix(x, v1[j], k)) : mix(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------- geometria ----------
const rad = d => d * Math.PI / 180;
const deg = r => r * 180 / Math.PI;
const r2 = n => (+n).toFixed(2);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const add = (p, v) => [p[0] + v[0], p[1] + v[1]];
// ângulos medidos a partir de "reto para baixo"; positivo = para a direita da tela
const dirv = (a, l) => [l * Math.sin(rad(a)), l * Math.cos(rad(a))];
function chain(P, a1, l1, a2, l2) { const K = add(P, dirv(a1, l1)); return [K, add(K, dirv(a2, l2))]; }
// cinemática inversa de 2 ossos: devolve a junta do meio (cotovelo/joelho). dobra = 1 ou -1 escolhe o lado
function ik(S, T, l1, l2, dobra = 1) {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  const d = Math.max(1e-3, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01));
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const ang = Math.atan2(dy, dx) + dobra * A;
  return [S[0] + l1 * Math.cos(ang), S[1] + l1 * Math.sin(ang)];
}
// gira o ponto p em torno de c (graus, sentido horário da tela = positivo, como no SVG)
function girar(p, ang, c = [0, 0]) {
  const a = rad(ang), x = p[0] - c[0], y = p[1] - c[1];
  return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)];
}
// ângulo (graus SVG) da direção a→b, útil para girar objetos segurados
const angulo = (a, b) => deg(Math.atan2(b[1] - a[1], b[0] - a[0]));

// ---------- svg ----------
const tracoSvg = (d, w = 7, cor = OL, extra = '') => `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const gota = (x, y, s = 1, cor = '#9EDCFF') =>
  `<path transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s)})" d="M 0 -12 Q 9 0 7 5 Q 4 11 0 11 Q -4 11 -7 5 Q -9 0 0 -12 Z" fill="${cor}" stroke="${OL}" stroke-width="3"/>`;
const quadro = conteudo => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${conteudo}</svg>`;
// pseudo-aleatório determinístico (mesma sequência a cada render)
function aleatorio(seed = 7) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

module.exports = {
  C, SW, OL, limb, W, H, FPS, DURACAO, REPETICOES, N, CICLO,
  tempo, piscando, PISCADAS, clamp, ease, bump, onda, mix, kf,
  rad, deg, r2, lerp, add, dirv, chain, ik, girar, angulo,
  tracoSvg, gota, quadro, aleatorio,
};
