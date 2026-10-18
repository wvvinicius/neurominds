// Trilha de som sintetizada para as cenas (sem arquivos de áudio externos), sincronizada pelos eventos de cenas.js.
// O áudio dá a volta no fim (o que passa de 6 s entra no começo), então o loop fica sem emenda.
// Uso: node sons.js  → video/som-<cena>.wav e video/teo-<cena>-som.mp4 (o vídeo sem som continua intacto)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const { CENAS, EVENTOS, DURACAO } = require('./cenas');

const SR = 44100, N = SR * DURACAO;
let seed = 12345;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const TAU = 2 * Math.PI;

// ---------- blocos de síntese ----------
const ruido = len => Float32Array.from({ length: Math.round(len * SR) }, () => rnd() * 2 - 1);
function passaBaixa(x, fc) {
  const a = Math.exp(-TAU * fc / SR), y = new Float32Array(x.length);
  let z = 0;
  for (let i = 0; i < x.length; i++) y[i] = z = (1 - a) * x[i] + a * z;
  return y;
}
function passaAlta(x, fc) { const lp = passaBaixa(x, fc); return x.map((v, i) => v - lp[i]); }
// passa-faixa (biquad RBJ) com frequência que pode variar no tempo: fc(t)
function passaFaixa(x, fc, Q = 1) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const f = typeof fc === 'function' ? fc(i / SR) : fc;
    const w = TAU * f / SR, al = Math.sin(w) / (2 * Q), a0 = 1 + al;
    const b0 = al / a0, b2 = -al / a0, a1 = -2 * Math.cos(w) / a0, a2 = (1 - al) / a0;
    y[i] = b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y[i];
  }
  return y;
}
const envelope = (x, fn) => x.map((v, i) => v * fn(i / SR));
// seno com frequência variável
function tom(len, freq, amp) {
  const y = new Float32Array(Math.round(len * SR));
  let ph = 0;
  for (let i = 0; i < y.length; i++) { const t = i / SR; ph += TAU * freq(t) / SR; y[i] = Math.sin(ph) * amp(t); }
  return y;
}
const somar = (...xs) => { const y = new Float32Array(Math.max(...xs.map(x => x.length))); xs.forEach(x => x.forEach((v, i) => { y[i] += v; })); return y; };
const rms = x => Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length);
// coloca um som na trilha, dando a volta no fim
function colocar(trilha, som, t0, ganho = 1) {
  const i0 = Math.round(t0 * SR);
  for (let i = 0; i < som.length; i++) trilha[(i0 + i) % N] += som[i] * ganho;
}
// ambiente em loop: gera um pouco a mais e funde o rabo no começo
function ambienteLoop(gerar, alvoRms) {
  const extra = SR, x = gerar(DURACAO + 1);
  const y = x.slice(0, N);
  for (let i = 0; i < extra; i++) { const k = i / extra; y[i] = y[i] * k + x[N + i] * (1 - k); }
  const g = alvoRms / rms(y);
  return y.map(v => v * g);
}
// eco curto de ambiente fechado (circular, para manter o loop)
function eco(x, atraso, fb, vezes = 3) {
  const d = Math.round(atraso * SR), y = Float32Array.from(x);
  for (let v = 0; v < vezes; v++) for (let i = 0; i < N; i++) y[(i + d) % N] += x[i] * fb ** (v + 1) * (v === 0 ? 1 : 0.8);
  return y;
}

// ---------- sons do karatê ----------
const vush = () => envelope(passaFaixa(ruido(0.3), t => 500 + 1600 * (t / 0.3), 1.4), t => Math.sin(Math.PI * t / 0.3) ** 2 * 1.6);
const impacto = () => somar(
  tom(0.35, t => 48 + 75 * Math.exp(-t / 0.035), t => Math.exp(-t / 0.11)),
  envelope(passaFaixa(ruido(0.12), 900, 0.9), t => 2.2 * Math.exp(-t / 0.035)),
  envelope(passaBaixa(ruido(0.05), 3000), t => 0.6 * Math.exp(-t / 0.008)),
);
function corrente() {
  const y = new Float32Array(Math.round(0.8 * SR));
  for (let c = 0; c < 7; c++) {
    const t0 = 0.03 + rnd() * 0.65, amp = 0.5 * (1 - t0 / 0.8);
    const clique = somar(...[3100, 4650, 6230, 7900].map(f => tom(0.06, () => f * (0.97 + rnd() * 0.06), t => amp * Math.exp(-t / 0.012))));
    clique.forEach((v, i) => { const j = Math.round(t0 * SR) + i; if (j < y.length) y[j] += v; });
  }
  return y;
}
const pisada = () => somar(tom(0.12, () => 72, t => Math.exp(-t / 0.035)), envelope(passaBaixa(ruido(0.06), 900), t => 0.8 * Math.exp(-t / 0.015)));

function trilhaKarate() {
  const fx = new Float32Array(N);
  for (const e of EVENTOS.karate) {
    if (e.tipo === 'vush') colocar(fx, vush(), e.t, 0.35);
    if (e.tipo === 'impacto') { colocar(fx, impacto(), e.t, 0.9); colocar(fx, corrente(), e.t + 0.02, 0.35); }
    if (e.tipo === 'pisada') colocar(fx, pisada(), e.t, 0.3);
  }
  const amb = ambienteLoop(d => passaBaixa(passaBaixa(ruido(d), 260), 260), 0.01);   // sala, bem baixo
  return { fx: eco(fx, 0.07, 0.18, 2), amb };
}

// ---------- sons da piscina ----------
const splash = forca => somar(
  envelope(passaAlta(passaFaixa(ruido(0.6), t => 2600 - 1200 * t, 0.7), 900), t => Math.min(1, t / 0.006) * Math.exp(-t / (0.07 + 0.05 * forca)) * 1.8),
  envelope(passaBaixa(ruido(0.15), 500), t => Math.exp(-t / 0.04) * 1.2),
);
const plop = () => somar(tom(0.08, t => 1000 - 6500 * t, t => Math.exp(-t / 0.03)), envelope(passaFaixa(ruido(0.06), 1500, 1), t => 0.6 * Math.exp(-t / 0.015)));
const gotinha = () => tom(0.04, t => 1900 - 18000 * t, t => Math.exp(-t / 0.012));

function trilhaPiscina() {
  const fx = new Float32Array(N);
  for (const e of EVENTOS.piscina) {
    if (e.tipo === 'sai') {
      colocar(fx, splash(e.forca), e.t, 0.32 * e.forca ** 0.8);
      const k = Math.round(3 * e.forca ** 2);
      for (let i = 0; i < k; i++) colocar(fx, gotinha(), e.t + 0.3 + rnd() * 0.4, 0.06 + rnd() * 0.06);
    }
    if (e.tipo === 'entra') colocar(fx, plop(), e.t, 0.2);
  }
  const amb = ambienteLoop(d => {
    const x = passaFaixa(ruido(d), 800, 0.5);
    return x.map((v, i) => v * (0.8 + 0.2 * Math.sin(TAU * i / SR / 3)));               // marolinha lenta (período 3 s)
  }, 0.012);
  return { fx: eco(fx, 0.11, 0.25, 3), amb };                                           // piscina coberta ecoa um pouco
}

// ---------- sons do futebol ----------
const chuteBola = () => somar(
  tom(0.25, t => 55 + 70 * Math.exp(-t / 0.03), t => Math.exp(-t / 0.07)),
  envelope(passaFaixa(ruido(0.08), 1200, 1), t => 2 * Math.exp(-t / 0.02)),
);
const rede = () => somar(
  envelope(passaFaixa(ruido(0.5), 3500, 0.6), t => Math.min(1, t / 0.01) * Math.exp(-t / 0.2) * 1.6),
  tom(0.15, () => 90, t => 0.5 * Math.exp(-t / 0.04)),
);
const quique = () => somar(tom(0.12, t => 90 + 70 * Math.exp(-t / 0.02), t => Math.exp(-t / 0.03)), envelope(passaBaixa(ruido(0.03), 1500), t => 0.6 * Math.exp(-t / 0.01)));
const boing = () => tom(0.4, t => 220 + 420 * t + 25 * Math.sin(TAU * 18 * t), t => Math.min(1, t / 0.01) * Math.exp(-t / 0.16));
const passarinho = () => somar(tom(0.07, t => 2600 + 16000 * t, t => Math.sin(Math.PI * t / 0.07)),
  tom(0.2, t => (t > 0.11 ? 2800 + 14000 * (t - 0.11) : 0), t => (t > 0.11 ? Math.sin(Math.PI * (t - 0.11) / 0.09) : 0)));

function trilhaFutebol() {
  const fx = new Float32Array(N);
  for (const e of EVENTOS.futebol) {
    if (e.tipo === 'chute') { colocar(fx, chuteBola(), e.t, 0.9); colocar(fx, vush(), e.t + 0.02, 0.15); }
    if (e.tipo === 'rede') colocar(fx, rede(), e.t, 0.45);
    if (e.tipo === 'quique') colocar(fx, quique(), e.t, 0.4 * e.forca);
    if (e.tipo === 'boing') colocar(fx, boing(), e.t - 0.02, 0.28);
  }
  const amb = ambienteLoop(d => {
    const x = passaBaixa(ruido(d), 350);
    return x.map((v, i) => v * (0.7 + 0.3 * Math.sin(TAU * i / SR / 6)));               // ventinho (período 6 s)
  }, 0.007);
  [0.5, 2.3, 4.1, 5.2].forEach(t => colocar(amb, passarinho(), t, 0.035));            // passarinhos ao longe
  return { fx, amb };
}

// ---------- mix e saída ----------
function wav(x, file) {
  const b = Buffer.alloc(44 + x.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + x.length * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(x.length * 2, 40);
  x.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  fs.writeFileSync(file, b);
}

const TRILHAS = { karate: trilhaKarate, piscina: trilhaPiscina, futebol: trilhaFutebol };
const dir = path.join(__dirname, 'video');
for (const nome of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TRILHAS)) {
  CENAS[nome]();                                   // preenche EVENTOS[nome]
  const { fx, amb } = TRILHAS[nome]();
  const pico = fx.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  const mix = fx.map((v, i) => v * (0.7 / pico) + amb[i]);   // efeitos a -3 dB; ambiente fixo e baixo
  const wavFile = path.join(dir, `som-${nome}.wav`);
  wav(mix, wavFile);
  const saida = path.join(dir, `teo-${nome}-som.mp4`);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', path.join(dir, `teo-${nome}.mp4`), '-i', wavFile,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', saida]);
  console.log('ok:', saida, `(${EVENTOS[nome].length} eventos)`);
}
