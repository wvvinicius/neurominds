// Renderiza um vídeo curto do Teo acenando e falando (lipsync pelo volume do áudio).
// Uso: node video.js  (precisa de video/fala.wav) → video/teo-acenando-falando.mp4
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const ffmpeg = require('ffmpeg-static');
const { parts } = require('./rig');

const W = 1920, H = 1080, FPS = 30;
const FALA_INICIO = 0.8;                 // segundos até o Teo começar a falar
const dir = path.join(__dirname, 'video');
const framesDir = path.join(dir, 'frames');
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const L = Object.fromEntries(parts.map(p => [p.nome, p.svg]));

// ---------- áudio: volume (RMS) por frame ----------
function lerWav(file) {
  const b = fs.readFileSync(file);
  let o = 12, rate = 44100, data = null;
  while (o < b.length) {
    const id = b.toString('ascii', o, o + 4), size = b.readUInt32LE(o + 4);
    if (id === 'fmt ') rate = b.readUInt32LE(o + 12);
    if (id === 'data') { data = b.subarray(o + 8, o + 8 + size); break; }
    o += 8 + size + (size % 2);
  }
  const n = data.length / 2, s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = data.readInt16LE(i * 2) / 32768;
  return { rate, s };
}
const { rate, s: amostras } = lerWav(path.join(dir, 'fala.wav'));
const DUR_FALA = amostras.length / rate;
const TOTAL = FALA_INICIO + DUR_FALA + 1.6;
const N = Math.ceil(TOTAL * FPS);

const rms = [];
for (let f = 0; f < N; f++) {
  const t0 = f / FPS - FALA_INICIO;
  const a = Math.floor(t0 * rate), b = Math.floor((t0 + 1 / FPS) * rate);
  let sum = 0, c = 0;
  for (let i = Math.max(0, a); i < Math.min(amostras.length, b); i++) { sum += amostras[i] ** 2; c++; }
  rms.push(c ? Math.sqrt(sum / c) : 0);
}
const maxRms = Math.max(...rms);

// ---------- curvas de animação ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const backOut = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; };
const FIM_FALA = FALA_INICIO + DUR_FALA;

function estado(f) {
  const t = f / FPS;
  // braço direito: levanta, acena, abaixa; no final, punho de herói
  const sobe = ease((t - 0.3) / 0.35), desce = ease((t - 3.8) / 0.4);
  const aceno = -122 + 20 * Math.sin(2 * Math.PI * 2.2 * (t - 0.3));
  let bracoDir = aceno * sobe * (1 - desce);
  const heroi = ease((t - (FIM_FALA + 0.1)) / 0.3);
  bracoDir = bracoDir * (1 - heroi) + -165 * heroi;
  const bracoEsq = 4 * Math.sin(2 * Math.PI * 0.6 * t) + 22 * ease((t - 3.9) / 0.4) * (1 - heroi);

  // boca: segue o volume da fala
  const v = rms[f] / maxRms;
  let boca = 'sorriso', olhos = 'aberto';
  if (t >= FALA_INICIO && t < FIM_FALA) boca = v < 0.08 ? 'fechada' : v < 0.4 ? 'meio-aberta' : 'sorriso';
  if (heroi > 0.5) { boca = 'gargalhada'; olhos = 'risada'; }
  // piscadas
  if ([2.1, 4.6].some(b => t >= b && t < b + 0.12)) olhos = 'piscando';

  return {
    entrada: backOut(t / 0.55),
    pulo: heroi > 0 ? 26 * Math.sin(Math.PI * clamp((t - FIM_FALA - 0.1) / 0.5)) : 0,
    bob: 5 * Math.sin(2 * Math.PI * 0.8 * t) + (t >= FALA_INICIO && t < FIM_FALA ? 4 * v : 0),
    cabeca: 3 * Math.sin(2 * Math.PI * 0.5 * t) + (sobe * (1 - desce)) * 4,
    bracoDir, bracoEsq, boca, olhos,
  };
}

// ---------- cenário ----------
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
function frameSvg(e) {
  const pe = 200, pf = 592; // pés: base da escala de entrada
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${cenario}
  <g transform="translate(${TX} ${TY}) scale(${S})">
    <ellipse cx="200" cy="596" rx="${95 * e.entrada}" ry="12" fill="#000" opacity="0.15"/>
    <g transform="translate(${pe} ${pf}) scale(${e.entrada}) translate(${-pe} ${-pf}) translate(0 ${-e.bob - e.pulo})">
      ${L['perna-esq']}${L['perna-dir']}${L['corpo']}
      <g transform="rotate(${e.bracoEsq.toFixed(2)} 142 318)">${L['braco-esq']}</g>
      <g transform="rotate(${e.cabeca.toFixed(2)} 200 262)">
        ${L['cabeca']}${L['bochechas']}${L['olhos-' + e.olhos]}${L['boca-' + e.boca]}
      </g>
      <!-- braço direito na frente da cabeça para a mão aparecer no aceno -->
      <g transform="rotate(${e.bracoDir.toFixed(2)} 258 318)">${L['braco-dir']}</g>
    </g>
  </g>
</svg>`;
}

console.log(`renderizando ${N} frames (${TOTAL.toFixed(1)}s)...`);
for (let f = 0; f < N; f++) {
  const png = new Resvg(frameSvg(estado(f)), { fitTo: { mode: 'width', value: W } }).render().asPng();
  fs.writeFileSync(path.join(framesDir, `f${String(f).padStart(4, '0')}.png`), png);
}

const saida = path.join(dir, 'teo-acenando-falando.mp4');
execFileSync(ffmpeg, ['-y', '-loglevel', 'error',
  '-framerate', String(FPS), '-i', path.join(framesDir, 'f%04d.png'),
  '-i', path.join(dir, 'fala.wav'),
  '-filter_complex', `[1:a]adelay=${FALA_INICIO * 1000}:all=1,apad[a]`,
  '-map', '0:v', '-map', '[a]', '-shortest',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-b:a', '160k',
  saida]);
console.log('ok:', saida);
