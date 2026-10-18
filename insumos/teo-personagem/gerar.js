// Gera o personagem Teo em SVG (poses + expressões) e a ficha de personagem (index.html).
// Uso: node gerar.js
const fs = require('fs');
const path = require('path');

const C = {
  ol: '#1A0F0A',      // contorno
  skin: '#6B3F2A',    // pele marrom-escura
  skinLine: '#4A2A1B',
  hair: '#2A1B15',
  hairCurl: '#3D2A21',
  shirt: '#FFC93C',
  shorts: '#2F6BDB',
  shoe: '#E63946',
  white: '#FFFFFF',
  mouth: '#7A1E2B',
  tongue: '#E8607A',
  blush: '#8E4630',
  pupil: '#24150E',
  ground: '#000000',
};
const SW = 6;

// ---------- cabeça ----------
function afro() {
  const cx = 0, cy = -40, d = 92;
  const angs = [-90, -65, -115, -40, -140, -15, -165, 10, 170, 32, 148];
  const circles = [[cx, cy, 95], ...angs.map(a => {
    const r = a * Math.PI / 180;
    return [cx + d * Math.cos(r), cy + d * Math.sin(r), 40];
  })];
  const f = n => n.toFixed(1);
  const outline = circles.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r + SW / 2}" fill="${C.ol}"/>`).join('');
  const fill = circles.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${C.hair}"/>`).join('');
  const curls = [
    'M -70 -110 q 10 -12 22 -4', 'M 40 -140 q 12 -8 22 2', 'M -20 -150 q 10 -10 22 -2',
    'M 80 -80 q 10 -4 14 8', 'M -105 -50 q 6 -12 18 -10', 'M 95 -20 q 8 -2 10 10',
    'M -10 -112 q 8 -8 18 -2', 'M 50 -100 q 8 -8 18 0', 'M -60 -150 q 8 -8 18 -4',
  ].map(p => `<path d="${p}" fill="none" stroke="${C.hairCurl}" stroke-width="5" stroke-linecap="round"/>`).join('');
  return outline + fill + curls;
}

function eye(x, y, o = {}) {
  const { px = 0, py = 2, pr = 12, lid = 0, id } = o;
  let s = `<ellipse cx="${x}" cy="${y}" rx="19" ry="23" fill="${C.white}" stroke="${C.ol}" stroke-width="${SW - 1}"/>`;
  s += `<circle cx="${x + px}" cy="${y + py}" r="${pr}" fill="${C.pupil}"/>`;
  s += `<circle cx="${x + px - pr * 0.35}" cy="${y + py - pr * 0.4}" r="${Math.max(2.5, pr * 0.36)}" fill="${C.white}"/>`;
  if (lid) {
    // pálpebra caída (olhar confiante)
    s += `<clipPath id="${id}"><ellipse cx="${x}" cy="${y}" rx="19" ry="23"/></clipPath>`;
    s += `<rect x="${x - 25}" y="${y - 30}" width="50" height="${lid + 7}" fill="${C.skin}" clip-path="url(#${id})"/>`;
    s += `<path d="M ${x - 20} ${y - 23 + lid} L ${x + 20} ${y - 23 + lid}" stroke="${C.ol}" stroke-width="${SW - 1}" stroke-linecap="round"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="19" ry="23" fill="none" stroke="${C.ol}" stroke-width="${SW - 1}"/>`;
  }
  return s;
}

function brow(d) {
  return `<path d="${d}" fill="none" stroke="${C.ol}" stroke-width="7" stroke-linecap="round"/>`;
}

function bigSmile(id, scale = 1) {
  const m = `M -36 38 Q 0 46 36 38 Q 32 ${38 + 40 * scale} 0 ${38 + 40 * scale} Q -32 ${38 + 40 * scale} -36 38 Z`;
  return `<clipPath id="${id}"><path d="${m}"/></clipPath>
    <path d="${m}" fill="${C.mouth}"/>
    <g clip-path="url(#${id})">
      <path d="M -40 30 L 40 30 L 40 50 Q 0 57 -40 50 Z" fill="${C.white}"/>
      <ellipse cx="0" cy="${36 + 40 * scale}" rx="20" ry="11" fill="${C.tongue}"/>
    </g>
    <path d="${m}" fill="none" stroke="${C.ol}" stroke-width="${SW}" stroke-linejoin="round"/>`;
}

const EXPR = {
  feliz: id => [
    brow('M -44 -40 Q -28 -50 -12 -42'), brow('M 12 -42 Q 28 -50 44 -40'),
    eye(-28, -4, { id: id + 'a' }), eye(28, -4, { id: id + 'b' }),
    bigSmile(id + 'm'),
  ],
  gargalhada: id => [
    brow('M -44 -44 Q -28 -54 -12 -46'), brow('M 12 -46 Q 28 -54 44 -44'),
    `<path d="M -44 0 Q -28 -22 -12 0" fill="none" stroke="${C.ol}" stroke-width="7" stroke-linecap="round"/>`,
    `<path d="M 12 0 Q 28 -22 44 0" fill="none" stroke="${C.ol}" stroke-width="7" stroke-linecap="round"/>`,
    bigSmile(id + 'm', 1.25),
  ],
  surpreso: id => [
    brow('M -44 -50 Q -28 -62 -12 -52'), brow('M 12 -52 Q 28 -62 44 -50'),
    eye(-28, -6, { pr: 8, py: 0, id: id + 'a' }), eye(28, -6, { pr: 8, py: 0, id: id + 'b' }),
    `<ellipse cx="0" cy="56" rx="15" ry="19" fill="${C.mouth}" stroke="${C.ol}" stroke-width="${SW}"/>`,
    `<ellipse cx="0" cy="66" rx="9" ry="6" fill="${C.tongue}"/>`,
  ],
  confiante: id => [
    brow('M -44 -34 Q -28 -40 -12 -34'), brow('M 12 -44 Q 28 -56 44 -46'),
    eye(-28, -4, { px: 3, lid: 12, id: id + 'a' }), eye(28, -4, { px: 3, lid: 7, id: id + 'b' }),
    (() => {
      const m = 'M -32 42 Q 4 50 38 34 Q 34 70 4 72 Q -26 72 -32 42 Z';
      return `<clipPath id="${id}m"><path d="${m}"/></clipPath><path d="${m}" fill="${C.mouth}"/>
        <g clip-path="url(#${id}m)"><path d="M -40 30 L 44 26 L 44 46 Q 4 58 -40 52 Z" fill="${C.white}"/></g>
        <path d="${m}" fill="none" stroke="${C.ol}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    })(),
  ],
  ops: id => [
    brow('M -44 -46 Q -28 -40 -12 -50'), brow('M 12 -50 Q 28 -40 44 -46'),
    eye(-28, -4, { px: -7, py: -3, pr: 10, id: id + 'a' }), eye(28, -4, { px: -7, py: -3, pr: 10, id: id + 'b' }),
    `<rect x="-30" y="42" width="60" height="26" rx="12" fill="${C.white}" stroke="${C.ol}" stroke-width="${SW}"/>`,
    `<path d="M -30 55 L 30 55 M -15 42 L -15 68 M 0 42 L 0 68 M 15 42 L 15 68" stroke="${C.ol}" stroke-width="3"/>`,
    `<path d="M 74 -46 Q 86 -26 80 -18 Q 72 -12 66 -20 Q 64 -30 74 -46 Z" fill="#7CC8FF" stroke="${C.ol}" stroke-width="4"/>`,
  ],
  pensando: id => [
    brow('M -44 -40 Q -28 -46 -12 -40'), brow('M 12 -48 Q 28 -58 44 -48'),
    eye(-28, -4, { px: 6, py: -8, pr: 10, id: id + 'a' }), eye(28, -4, { px: 6, py: -8, pr: 10, id: id + 'b' }),
    `<path d="M -18 56 Q 4 48 26 52" fill="none" stroke="${C.ol}" stroke-width="7" stroke-linecap="round"/>`,
  ],
};

function head(expr, id) {
  const blush = expr === 'feliz' || expr === 'gargalhada'
    ? `<ellipse cx="-50" cy="30" rx="11" ry="7" fill="${C.blush}"/><ellipse cx="50" cy="30" rx="11" ry="7" fill="${C.blush}"/>` : '';
  return `<g class="cabeca">
    ${afro()}
    <circle cx="-70" cy="14" r="17" fill="${C.skin}" stroke="${C.ol}" stroke-width="${SW}"/>
    <circle cx="70" cy="14" r="17" fill="${C.skin}" stroke="${C.ol}" stroke-width="${SW}"/>
    <path d="M -72 8 q 6 4 4 12 M 72 8 q -6 4 -4 12" fill="none" stroke="${C.skinLine}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="0" cy="8" rx="72" ry="80" fill="${C.skin}" stroke="${C.ol}" stroke-width="${SW}"/>
    <path d="M -76 -6 Q -72 -78 0 -82 Q 72 -78 76 -6 Q 58 -50 0 -52 Q -58 -50 -76 -6 Z" fill="${C.hair}"/>
    <path d="M -74 -8 Q -58 -50 0 -52 Q 58 -50 74 -8" fill="none" stroke="${C.ol}" stroke-width="${SW - 1}" stroke-linecap="round"/>
    ${blush}
    <path d="M -7 24 Q 0 31 7 24" fill="none" stroke="${C.skinLine}" stroke-width="5" stroke-linecap="round"/>
    ${EXPR[expr](id).join('\n')}
  </g>`;
}

// ---------- corpo ----------
const deg = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;

function limb(pts, color, w) {
  const d = 'M ' + pts.map(p => p.join(' ')).join(' L ');
  return `<path d="${d}" fill="none" stroke="${C.ol}" stroke-width="${w + 12}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function arm([S, E, H]) {
  return limb([S, E, H], C.skin, 22) +
    `<circle cx="${H[0]}" cy="${H[1]}" r="16" fill="${C.skin}" stroke="${C.ol}" stroke-width="${SW}"/>`;
}

function sleeve([S, E]) {
  return `<g transform="translate(${S[0]} ${S[1]}) rotate(${deg(S, E).toFixed(1)})">
    <path d="M -14 -24 L 34 -21 Q 42 0 34 21 L -14 24 Z" fill="${C.shirt}" stroke="${C.ol}" stroke-width="${SW}" stroke-linejoin="round"/>
  </g>`;
}

function leg([Hp, K, F], dir, shoeRot = 0) {
  const sockTop = [F[0] + (K[0] - F[0]) * 0.3, F[1] + (K[1] - F[1]) * 0.3];
  return limb([Hp, K, F], C.skin, 24) +
    limb([sockTop, F], C.white, 24).replace(/stroke-width="36"/, 'stroke-width="34"') +
    `<g transform="translate(${F[0]} ${F[1] + 4}) rotate(${shoeRot}) scale(${dir} 1)">
      <path d="M -18 -10 L 12 -10 Q 40 -6 44 16 L -20 16 Z" fill="${C.shoe}" stroke="${C.ol}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M -2 -2 L 18 2" stroke="${C.white}" stroke-width="5" stroke-linecap="round"/>
      <path d="M -24 14 L 48 14 Q 50 28 40 28 L -20 28 Q -26 28 -24 14 Z" fill="${C.white}" stroke="${C.ol}" stroke-width="${SW}" stroke-linejoin="round"/>
    </g>`;
}

const POSES = {
  padrao: {
    expr: 'feliz', headRot: 0,
    arms: [[[142, 318], [120, 368], [114, 418]], [[258, 318], [280, 368], [286, 418]]],
    legs: [[[172, 470], [170, 520], [168, 560]], [[228, 470], [230, 520], [232, 560]]],
    shoes: [[-1, 0], [1, 0]],
  },
  acenando: {
    expr: 'feliz', headRot: 4,
    arms: [[[142, 318], [120, 368], [114, 418]], [[258, 318], [300, 300], [318, 240]]],
    legs: [[[172, 470], [170, 520], [168, 560]], [[228, 470], [230, 520], [232, 560]]],
    shoes: [[-1, 0], [1, 0]],
    extra: `<path d="M 340 220 q 14 10 12 28 M 352 206 q 20 16 18 42 M 296 222 q -12 8 -10 24" fill="none" stroke="${C.ol}" stroke-width="5" stroke-linecap="round"/>`,
  },
  heroi: {
    expr: 'confiante', headRot: -5,
    arms: [[[142, 318], [102, 360], [138, 408]], [[258, 318], [290, 262], [298, 200]]],
    legs: [[[172, 470], [150, 518], [136, 562]], [[228, 470], [250, 518], [264, 562]]],
    shoes: [[-1, 0], [1, 0]],
    extra: `<g stroke="${C.shoe}" stroke-width="6" stroke-linecap="round">
      <path d="M 298 160 L 298 140"/><path d="M 330 172 L 344 158"/><path d="M 266 172 L 252 158"/><path d="M 340 204 L 360 204"/>
    </g>`,
  },
  desequilibrio: {
    expr: 'ops', headRot: -10, bodyRot: 9,
    arms: [[[142, 318], [100, 292], [76, 248]], [[258, 318], [306, 326], [342, 294]]],
    legs: [[[172, 470], [132, 498], [118, 540]], [[228, 470], [230, 520], [232, 560]]],
    shoes: [[-1, -25], [1, 0]],
    extra: `<g fill="none" stroke="${C.ol}" stroke-width="5" stroke-linecap="round">
      <path d="M 40 250 q -14 20 0 40"/><path d="M 22 240 q -18 30 0 60"/><path d="M 372 290 q 14 18 0 36"/>
    </g>`,
  },
};

function body(p, id) {
  const shorts = `<path d="M 136 416 L 264 416 L 272 494 L 210 494 L 200 462 L 190 494 L 128 494 Z" fill="${C.shorts}" stroke="${C.ol}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M 200 420 L 200 460" stroke="${C.ol}" stroke-width="4" stroke-linecap="round"/>`;
  const torso = `<path d="M 142 300 Q 200 288 258 300 Q 272 306 270 330 L 266 426 Q 200 434 134 426 L 130 330 Q 128 306 142 300 Z" fill="${C.shirt}" stroke="${C.ol}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M 178 298 Q 200 316 222 298" fill="none" stroke="${C.ol}" stroke-width="${SW}" stroke-linecap="round"/>`;
  const neck = `<rect x="184" y="250" width="32" height="56" fill="${C.skin}" stroke="${C.ol}" stroke-width="${SW}"/>`;
  return `
    <g class="pernas">${p.legs.map((l, i) => leg(l, p.shoes[i][0], p.shoes[i][1])).join('')}</g>
    ${shorts}
    ${neck}
    ${torso}
    <g class="bracos">${p.arms.map(arm).join('')}</g>
    <g class="mangas">${p.arms.map(sleeve).join('')}</g>
    <g transform="translate(200 192) rotate(${p.headRot} 0 70)">${head(p.expr, id)}</g>
    ${p.extra || ''}`;
}

function svgPose(name, id = name) {
  const p = POSES[name];
  const rot = p.bodyRot ? `rotate(${p.bodyRot} 232 590)` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 0 460 620" width="460" height="620">
  <ellipse cx="200" cy="596" rx="${name === 'heroi' ? 110 : 90}" ry="12" fill="${C.ground}" opacity="0.12"/>
  <g transform="${rot}">${body(p, id)}</g>
</svg>`;
}

function svgHead(expr, id = 'h_' + expr) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-150 -190 300 300" width="300" height="300">${head(expr, id)}</svg>`;
}

module.exports = { C, SW, afro, eye, brow, bigSmile, EXPR, limb, arm, sleeve, leg, POSES };
if (require.main !== module) return;

// ---------- saída ----------
const out = __dirname;
const dirs = ['svg/poses', 'svg/expressoes'];
dirs.forEach(d => fs.mkdirSync(path.join(out, d), { recursive: true }));
for (const n of Object.keys(POSES)) fs.writeFileSync(path.join(out, 'svg/poses', `teo-${n}.svg`), svgPose(n));
for (const e of Object.keys(EXPR)) fs.writeFileSync(path.join(out, 'svg/expressoes', `teo-cara-${e}.svg`), svgHead(e));

const LABEL = {
  padrao: 'Pose padrão', acenando: 'Acenando', heroi: 'Pose de herói', desequilibrio: 'Quase caiu!',
  feliz: 'Feliz', gargalhada: 'Gargalhada', surpreso: 'Surpreso', confiante: 'Confiante', ops: 'Ops!', pensando: 'Pensando',
};
const PALETTE = [
  ['Pele', C.skin], ['Cabelo', C.hair], ['Contorno', C.ol], ['Camiseta', C.shirt],
  ['Bermuda', C.shorts], ['Tênis', C.shoe], ['Sola / meia', C.white], ['Boca', C.mouth],
];

const PROMPT = `Teo, a 7-year-old Black boy with dark brown skin, a big round voluminous afro, large shiny expressive eyes and a huge toothy smile. Funny and expressive, exaggerated faces. Outfit: plain yellow t-shirt (#FFC93C), blue shorts (#2F6BDB), red sneakers (#E63946) with white soles and white socks. Style: 2D cartoon for kids, clean thick dark outlines, bright flat colors, no realistic shading, simple background with few details.`;

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Teo — Ficha do Personagem</title>
<style>
  :root{--bg:#FFF8E7;--card:#fff;--ink:#1A0F0A;--muted:#6b5b50;--line:#f0e2c4}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,Segoe UI,sans-serif}
  main{max-width:1180px;margin:0 auto;padding:32px 16px 64px}
  h1{font-size:44px;margin:0;letter-spacing:-1px} h2{margin:40px 0 14px;font-size:22px}
  .sub{color:var(--muted);margin:4px 0 0}
  .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
  .card{background:var(--card);border:3px solid var(--ink);border-radius:18px;padding:12px;text-align:center;box-shadow:5px 5px 0 var(--ink)}
  .card svg{width:100%;height:auto;display:block} .card b{display:block;margin-top:6px}
  .card a{font-size:13px;color:var(--muted)}
  .heads{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
  .pal{display:flex;flex-wrap:wrap;gap:12px}
  .sw{display:flex;align-items:center;gap:10px;background:#fff;border:3px solid var(--ink);border-radius:14px;padding:8px 12px}
  .sw i{width:34px;height:34px;border-radius:50%;border:3px solid var(--ink)}
  .sw small{display:block;color:var(--muted);font-family:ui-monospace,monospace}
  pre{white-space:pre-wrap;background:#fff;border:3px solid var(--ink);border-radius:14px;padding:16px;font-size:14px}
  ul{padding-left:20px}
</style></head><body><main>
  <h1>Teo</h1>
  <p class="sub">7 anos · engraçado e expressivo · exagera as caras, faz pose de herói, quase perde o equilíbrio mas sempre acerta.</p>

  <h2>Poses</h2>
  <div class="grid">${Object.keys(POSES).map(n => `<div class="card">${svgPose(n, 'f_' + n)}<b>${LABEL[n]}</b><a href="svg/poses/teo-${n}.svg">teo-${n}.svg</a> · <a href="png/teo-${n}.png">png</a></div>`).join('')}</div>

  <h2>Expressões</h2>
  <div class="grid heads">${Object.keys(EXPR).map(e => `<div class="card">${svgHead(e, 'fh_' + e)}<b>${LABEL[e]}</b><a href="svg/expressoes/teo-cara-${e}.svg">svg</a> · <a href="png/teo-cara-${e}.png">png</a></div>`).join('')}</div>

  <h2>Paleta</h2>
  <div class="pal">${PALETTE.map(([n, c]) => `<div class="sw"><i style="background:${c}"></i><div>${n}<small>${c}</small></div></div>`).join('')}</div>

  <h2>Regras do personagem</h2>
  <ul>
    <li>Cabeça grande (~40% da altura), black power redondo sempre mais largo que os ombros.</li>
    <li>Contorno grosso e escuro em tudo; cores chapadas, sem gradiente nem sombra realista.</li>
    <li>Roupa padrão: camiseta amarela lisa, bermuda azul, meia branca, tênis vermelho de sola branca. Só muda se a cena pedir.</li>
    <li>Sempre com dentes aparecendo quando sorri; olhos grandes com brilho branco.</li>
    <li>Fundo simples, poucos detalhes, para o Teo ser o centro.</li>
  </ul>

  <h2>Prompt para IA de imagem/vídeo (consistência)</h2>
  <pre>${PROMPT}</pre>
</main></body></html>`;
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('ok:', Object.keys(POSES).length, 'poses,', Object.keys(EXPR).length, 'expressões');
