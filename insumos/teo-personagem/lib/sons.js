// Banco de sons sintetizados (sem arquivos externos). Tudo dá a volta no fim de 6 s, para o loop ficar sem emenda.
// Uso numa cena:  som(S, eventos) { const fx = S.trilha(); S.colocar(fx, S.SOM.pof(), 0.76, 0.8); return { fx, amb: S.AMB.casa() }; }
const fs = require('fs');
const { DURACAO, aleatorio } = require('./base');

const SR = 44100, N = SR * DURACAO, TAU = 2 * Math.PI;
const rnd = aleatorio(12345);

// ---------- primitivas ----------
const ruido = len => Float32Array.from({ length: Math.round(len * SR) }, () => rnd() * 2 - 1);
function passaBaixa(x, fc) {
  const a = Math.exp(-TAU * fc / SR), y = new Float32Array(x.length); let z = 0;
  for (let i = 0; i < x.length; i++) y[i] = z = (1 - a) * x[i] + a * z;
  return y;
}
const passaAlta = (x, fc) => { const lp = passaBaixa(x, fc); return x.map((v, i) => v - lp[i]); };
function passaFaixa(x, fc, Q = 1) {
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const f = typeof fc === 'function' ? fc(i / SR) : fc;
    const w = TAU * f / SR, al = Math.sin(w) / (2 * Q), a0 = 1 + al;
    y[i] = (al / a0) * x[i] + (-al / a0) * x2 - (-2 * Math.cos(w) / a0) * y1 - ((1 - al) / a0) * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y[i];
  }
  return y;
}
const envelope = (x, fn) => x.map((v, i) => v * fn(i / SR));
// oscilador com frequência variável; forma: 'seno' | 'triangulo' | 'quadrada'
function tom(len, freq, amp, forma = 'seno') {
  const y = new Float32Array(Math.round(len * SR)); let ph = 0;
  for (let i = 0; i < y.length; i++) {
    const t = i / SR; ph += TAU * freq(t) / SR;
    const v = forma === 'seno' ? Math.sin(ph) : forma === 'triangulo' ? (2 / Math.PI) * Math.asin(Math.sin(ph)) : Math.sign(Math.sin(ph)) * 0.6;
    y[i] = v * amp(t);
  }
  return y;
}
const somar = (...xs) => { const y = new Float32Array(Math.max(...xs.map(x => x.length))); xs.forEach(x => x.forEach((v, i) => { y[i] += v; })); return y; };
const rms = x => { let s = 0; for (const v of x) s += v * v; return Math.sqrt(s / x.length); };
const dec = tau => t => Math.exp(-t / tau);
const ataque = (a, tau) => t => Math.min(1, t / a) * Math.exp(-t / tau);

// ---------- trilha ----------
const trilha = () => new Float32Array(N);
function colocar(tr, som, t0, ganho = 1) {
  const i0 = Math.round(((t0 % DURACAO) + DURACAO) % DURACAO * SR);
  for (let i = 0; i < som.length; i++) tr[(i0 + i) % N] += som[i] * ganho;
  return tr;
}
function eco(x, atraso = 0.08, fb = 0.2, vezes = 2) {
  const d = Math.round(atraso * SR), y = Float32Array.from(x);
  for (let v = 1; v <= vezes; v++) for (let i = 0; i < N; i++) y[(i + d * v) % N] += x[i] * fb ** v;
  return y;
}
function ambienteLoop(gerar, alvoRms) {
  const x = gerar(DURACAO + 1), y = x.slice(0, N);
  for (let i = 0; i < SR; i++) { const k = i / SR; y[i] = y[i] * k + x[N + i] * (1 - k); }
  const g = alvoRms / (rms(y) || 1);
  return y.map(v => v * g);
}

// ---------- efeitos prontos ----------
const NOTAS = { do: 261.6, re: 293.7, mi: 329.6, fa: 349.2, sol: 392, la: 440, si: 493.9, do2: 523.3, re2: 587.3, mi2: 659.3, sol2: 784 };
const SOM = {
  passo: () => somar(tom(0.1, () => 85, dec(0.03)), envelope(passaBaixa(ruido(0.06), 1200), t => 0.7 * Math.exp(-t / 0.012))),
  pof: () => somar(tom(0.3, t => 55 + 70 * Math.exp(-t / 0.03), dec(0.08)), envelope(passaFaixa(ruido(0.1), 1000, 1), t => 1.8 * Math.exp(-t / 0.025))),
  toc: () => somar(tom(0.08, () => 520, dec(0.015)), envelope(passaFaixa(ruido(0.05), 2500, 2), t => Math.exp(-t / 0.008))),  // batidinha em madeira
  clique: () => envelope(passaFaixa(ruido(0.03), 4000, 2), t => 1.5 * Math.exp(-t / 0.004)),
  vush: (dur = 0.3) => envelope(passaFaixa(ruido(dur), t => 500 + 1600 * (t / dur), 1.4), t => Math.sin(Math.PI * t / dur) ** 2 * 1.6),
  esfrega: (dur = 0.4, centro = 2500) => envelope(passaFaixa(ruido(dur), t => centro * (1 + 0.15 * Math.sin(TAU * 12 * t)), 1.5), t => Math.sin(Math.PI * t / dur) * 1.4),
  rangido: (dur = 0.6) => tom(dur, t => 180 + 60 * Math.sin(TAU * 3 * t) + 40 * t, t => Math.sin(Math.PI * t / dur) * 0.5, 'quadrada'),
  papel: (dur = 0.25) => envelope(passaAlta(ruido(dur), 2500), t => Math.sin(Math.PI * t / dur) * (0.6 + 0.4 * Math.sin(TAU * 40 * t))),
  snip: () => somar(envelope(passaFaixa(ruido(0.05), 5000, 3), t => 1.6 * Math.exp(-t / 0.006)), tom(0.04, () => 2400, dec(0.006))),
  ding: (f = 1320) => somar(tom(1.0, () => f, dec(0.35)), tom(1.0, () => f * 2.76, t => 0.3 * Math.exp(-t / 0.15))),
  boing: () => tom(0.4, t => 220 + 420 * t + 25 * Math.sin(TAU * 18 * t), ataque(0.01, 0.16)),
  quique: () => somar(tom(0.12, t => 90 + 70 * Math.exp(-t / 0.02), dec(0.03)), envelope(passaBaixa(ruido(0.03), 1500), t => 0.6 * Math.exp(-t / 0.01))),
  splash: (forca = 1) => somar(envelope(passaAlta(passaFaixa(ruido(0.6), t => 2600 - 1200 * t, 0.7), 900), t => Math.min(1, t / 0.006) * Math.exp(-t / (0.07 + 0.05 * forca)) * 1.8),
    envelope(passaBaixa(ruido(0.15), 500), t => Math.exp(-t / 0.04) * 1.2)),
  plop: () => somar(tom(0.08, t => 1000 - 6500 * t, dec(0.03)), envelope(passaFaixa(ruido(0.06), 1500, 1), t => 0.6 * Math.exp(-t / 0.015))),
  gotinha: () => tom(0.04, t => 1900 - 18000 * t, dec(0.012)),
  gole: () => somar(tom(0.12, t => 300 + 500 * t, ataque(0.01, 0.05)), envelope(passaBaixa(ruido(0.1), 700), t => 0.4 * Math.exp(-t / 0.03))),
  crunch: () => envelope(passaFaixa(ruido(0.12), 3000, 0.8), t => (0.5 + 0.5 * Math.sign(Math.sin(TAU * 70 * t))) * Math.exp(-t / 0.04) * 1.4),
  dado: () => { const y = new Float32Array(Math.round(0.5 * SR)); [0, 0.09, 0.16, 0.22, 0.27].forEach((t0, k) => SOM.toc().forEach((v, i) => { const j = Math.round(t0 * SR) + i; if (j < y.length) y[j] += v * (1 - k * 0.15); })); return y; },
  encaixe: () => somar(SOM.clique(), tom(0.06, () => 900, dec(0.01))),
  pisadaFofa: () => somar(tom(0.12, () => 70, dec(0.035)), envelope(passaBaixa(ruido(0.06), 900), t => 0.8 * Math.exp(-t / 0.015))),
  soluco: () => tom(0.18, t => 420 - 500 * t, ataque(0.01, 0.06), 'triangulo'),      // "hic" de choro (sem voz)
  latido: () => somar(tom(0.14, t => 520 - 900 * t, ataque(0.005, 0.05), 'quadrada'), envelope(passaFaixa(ruido(0.12), 900, 1), t => 0.5 * Math.exp(-t / 0.04))),
  buzina: () => somar(tom(0.35, () => 420, t => Math.min(1, t / 0.02) * (t < 0.3 ? 0.5 : 0), 'quadrada'), tom(0.35, () => 530, t => Math.min(1, t / 0.02) * (t < 0.3 ? 0.4 : 0), 'quadrada')),
  caixaRegistradora: () => somar(SOM.ding(2100), SOM.clique()),
  // nota musical suave (para cantar/dançar). nota = nome em NOTAS ou Hz
  nota: (nota, dur = 0.3) => { const f = typeof nota === 'number' ? nota : NOTAS[nota]; return somar(tom(dur, () => f, ataque(0.02, dur * 0.6), 'triangulo'), tom(dur, () => f * 2, t => 0.2 * Math.exp(-t / (dur * 0.3)))); },
  bumbo: () => tom(0.25, t => 50 + 90 * Math.exp(-t / 0.02), dec(0.07)),
  chimbal: () => envelope(passaAlta(ruido(0.05), 7000), dec(0.012)),
};

// ---------- ambientes (já no volume baixo da regra) ----------
const AMB = {
  silencio: () => trilha(),
  casa: () => ambienteLoop(d => passaBaixa(passaBaixa(ruido(d), 220), 220), 0.006),
  banheiro: () => ambienteLoop(d => passaFaixa(ruido(d), 500, 0.4), 0.004),
  parque: () => { const a = ambienteLoop(d => passaBaixa(ruido(d), 350).map((v, i) => v * (0.7 + 0.3 * Math.sin(TAU * i / SR / 6))), 0.007);
    const piu = () => somar(tom(0.07, t => 2600 + 16000 * t, t => Math.sin(Math.PI * t / 0.07)), tom(0.2, t => (t > 0.11 ? 2800 + 14000 * (t - 0.11) : 0), t => (t > 0.11 ? Math.sin(Math.PI * (t - 0.11) / 0.09) : 0)));
    [0.5, 2.3, 4.1, 5.2].forEach(t => colocar(a, piu(), t, 0.035)); return a; },
  rua: () => ambienteLoop(d => passaBaixa(ruido(d), 180).map((v, i) => v * (0.75 + 0.25 * Math.sin(TAU * i / SR / 3))), 0.01),
  mar: () => ambienteLoop(d => passaFaixa(ruido(d), 700, 0.5).map((v, i) => v * (0.35 + 0.65 * Math.sin(Math.PI * ((i / SR) % 3) / 3) ** 2)), 0.018),
  piscina: () => ambienteLoop(d => passaFaixa(ruido(d), 800, 0.5).map((v, i) => v * (0.8 + 0.2 * Math.sin(TAU * i / SR / 3))), 0.012),
  mercado: () => ambienteLoop(d => passaFaixa(ruido(d), 600, 0.6).map((v, i) => v * (0.7 + 0.3 * Math.sin(TAU * i / SR / 2) * Math.sin(TAU * i / SR / 1.5))), 0.009),
};

// ---------- saída ----------
function mixar(fx, amb) {
  let pico = 0; for (const v of fx) pico = Math.max(pico, Math.abs(v));
  const g = pico > 0 ? 0.7 / pico : 0;
  return fx.map((v, i) => v * g + (amb ? amb[i] : 0));
}
function salvarWav(x, file) {
  const b = Buffer.alloc(44 + x.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + x.length * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(x.length * 2, 40);
  for (let i = 0; i < x.length; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), 44 + i * 2);
  fs.writeFileSync(file, b);
}

module.exports = { SR, N, TAU, rnd, ruido, passaBaixa, passaAlta, passaFaixa, envelope, tom, somar, rms, dec, ataque,
  trilha, colocar, eco, ambienteLoop, SOM, AMB, NOTAS, mixar, salvarWav };
