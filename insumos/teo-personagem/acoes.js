// Vídeos de ação do Teo, seguindo REGRAS-VIDEO.md:
// uma ação repetida 3x, 6 s, 16:9, câmera fixa, loop perfeito, sem texto e sem som.
// Uso: node acoes.js            → gera todas as ações
//      node acoes.js pular      → gera só uma
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const ffmpeg = require('ffmpeg-static');
const { parts } = require('./rig');

const W = 1920, H = 1080, FPS = 30, DURACAO = 6, REPETICOES = 3;
const N = DURACAO * FPS;                 // 180 frames; o frame 180 seria igual ao 0 → loop perfeito
const CICLO = DURACAO / REPETICOES;      // 2 s por repetição
const L = Object.fromEntries(parts.map(p => [p.nome, p.svg]));

// ---------- curvas ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const bump = (u, a, b) => Math.sin(Math.PI * clamp((u - a) / (b - a)));   // 0 → 1 → 0 entre a e b

// Cada ação recebe u ∈ [0,1) dentro de uma repetição e devolve a pose.
// Em u=0 e u→1 toda ação volta à pose neutra (tudo 0), garantindo o loop.
const ACOES = {
  acenar(u) {
    const w = ease(u / 0.2) * (1 - ease((u - 0.8) / 0.2));
    const p = clamp((u - 0.2) / 0.6);
    return { bracoDir: w * (-122 + 20 * Math.sin(2 * Math.PI * 2 * p)), cabeca: 4 * w };
  },
  pular(u) {
    const ar = bump(u, 0.2, 0.65);
    const agacha = 14 * (bump(u, 0, 0.25) + bump(u, 0.6, 0.85));
    const bracos = bump(u, 0.15, 0.7);
    return {
      y: 95 * ar - agacha,
      bracoDir: -150 * bracos, bracoEsq: 150 * bracos,
      pernaEsq: 12 * ar, pernaDir: -12 * ar,
      boca: ar > 0.5 ? 'gargalhada' : undefined,
    };
  },
  comemorar(u) {
    const w = ease(u / 0.25) * (1 - ease((u - 0.72) / 0.25));
    const balanco = 10 * Math.sin(2 * Math.PI * 3 * clamp((u - 0.25) / 0.47)) * w;
    return {
      y: 22 * bump(u, 0.3, 0.6),
      bracoDir: -145 * w + balanco, bracoEsq: 145 * w + balanco,
      cabeca: balanco * 0.4,
      olhos: w > 0.6 ? 'risada' : undefined, boca: w > 0.6 ? 'gargalhada' : undefined,
    };
  },
};

function pose(nome, f) {
  const t = f / FPS;
  const a = ACOES[nome]((t % CICLO) / CICLO);
  const e = {
    y: 0, bracoDir: 0, bracoEsq: 0, pernaEsq: 0, pernaDir: 0, cabeca: 0,
    olhos: 'aberto', boca: 'sorriso',
    ...Object.fromEntries(Object.entries(a).filter(([, v]) => v !== undefined)),
  };
  e.y += 3 * Math.sin(2 * Math.PI * t / CICLO);                // respiração leve, mesmo período do ciclo
  if (e.olhos === 'aberto' && [1.0, 4.3].some(b => t >= b && t < b + 0.12)) e.olhos = 'piscando';
  return e;
}

// ---------- cenário (cores chapadas, luz uniforme) ----------
const OL = '#1A0F0A';
const cenario = `
  <rect width="${W}" height="${H}" fill="#BFE6FF"/>
  <circle cx="1650" cy="190" r="90" fill="#FFE066" stroke="${OL}" stroke-width="8"/>
  <g fill="#fff" stroke="${OL}" stroke-width="8">
    <path d="M 260 260 q 0 -60 60 -60 q 20 -50 80 -40 q 50 -10 70 40 q 50 0 50 60 Z"/>
    <path d="M 1180 170 q 0 -45 45 -45 q 15 -38 60 -30 q 38 -8 52 30 q 38 0 38 45 Z"/>
  </g>
  <path d="M 0 900 Q 480 860 960 880 Q 1440 900 1920 870 L 1920 1080 L 0 1080 Z" fill="#8BD17C" stroke="${OL}" stroke-width="8"/>`;

const S = 1.45, TX = 960 - 200 * S, TY = 1010 - 592 * S;
const r = n => n.toFixed(2);
function frameSvg(e) {
  const sombra = 1 - clamp(e.y / 200) * 0.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${cenario}
  <g transform="translate(${TX} ${TY}) scale(${S})">
    <ellipse cx="200" cy="596" rx="${r(95 * sombra)}" ry="${r(12 * sombra)}" fill="#000" opacity="0.15"/>
    <g transform="translate(0 ${r(-e.y)})">
      <g transform="rotate(${r(e.pernaEsq)} 172 470)">${L['perna-esq']}</g>
      <g transform="rotate(${r(e.pernaDir)} 228 470)">${L['perna-dir']}</g>
      ${L['corpo']}
      <g transform="rotate(${r(e.bracoEsq)} 142 318)">${L['braco-esq']}</g>
      <g transform="rotate(${r(e.cabeca)} 200 262)">
        ${L['cabeca']}${L['bochechas']}${L['olhos-' + e.olhos]}${L['boca-' + e.boca]}
      </g>
      <g transform="rotate(${r(e.bracoDir)} 258 318)">${L['braco-dir']}</g>
    </g>
  </g>
</svg>`;
}

const dir = path.join(__dirname, 'video');
const pedidas = process.argv.slice(2);
for (const nome of pedidas.length ? pedidas : Object.keys(ACOES)) {
  if (!ACOES[nome]) { console.error('ação desconhecida:', nome); continue; }
  const framesDir = path.join(dir, 'frames-' + nome);
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  for (let f = 0; f < N; f++) {
    const png = new Resvg(frameSvg(pose(nome, f)), { fitTo: { mode: 'width', value: W } }).render().asPng();
    fs.writeFileSync(path.join(framesDir, `f${String(f).padStart(4, '0')}.png`), png);
  }
  const saida = path.join(dir, `teo-${nome}.mp4`);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(framesDir, 'f%04d.png'),
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', saida]);
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log('ok:', saida);
}
