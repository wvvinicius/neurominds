// Renderiza as cenas de ação (acoes/Vxx.js) em vídeo, seguindo REGRAS-VIDEO.md.
//   node render.js V04 V05            → vídeos (sem som e com som) + folha de contato + forma de onda
//   node render.js V04 --frame 30     → só um frame em video/acoes/folhas/V04-f30.png (para conferir rápido)
//   node render.js V04 V05 --paralelo 4
// Saída: video/acoes/<ID>-<slug>.mp4, video/acoes/<ID>-<slug>-som.mp4, video/acoes/folhas/<ID>.png e <ID>-onda.png
const fs = require('fs');
const path = require('path');
const { execFileSync, spawn } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const ffmpeg = require('ffmpeg-static');
const B = require('./lib/base');
const S = require('./lib/sons');

const OUT = path.join(__dirname, 'video', 'acoes');
const FOLHAS = path.join(OUT, 'folhas');
fs.mkdirSync(FOLHAS, { recursive: true });

const args = process.argv.slice(2);
const opt = (nome, padrao) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : padrao; };
const soFrame = opt('--frame', null);
const paralelo = +opt('--paralelo', 1);
const ids = args.filter((a, i) => !a.startsWith('--') && !['--frame', '--paralelo'].includes(args[i - 1]));

function carregar(id) {
  const arq = path.join(__dirname, 'acoes', id + '.js');
  delete require.cache[require.resolve(arq)];
  return require(arq);
}
const png = (svg) => new Resvg(svg, { fitTo: { mode: 'width', value: B.W } }).render().asPng();

function renderizar(id) {
  const cena = carregar(id);
  const inst = cena.criar();
  if (soFrame !== null) {
    const f = +soFrame, arq = path.join(FOLHAS, `${id}-f${f}.png`);
    fs.writeFileSync(arq, png(inst.frame(f)));
    console.log('frame:', arq);
    return;
  }
  const nome = `${id}-${cena.slug}`;
  const tmp = path.join(OUT, 'tmp-' + id);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const t0 = Date.now();
  for (let f = 0; f < B.N; f++) fs.writeFileSync(path.join(tmp, `f${String(f).padStart(4, '0')}.png`), png(inst.frame(f)));
  const mudo = path.join(OUT, nome + '.mp4');
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(B.FPS), '-i', path.join(tmp, 'f%04d.png'),
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', mudo]);
  // folha de contato (1 frame a cada 12) para revisão
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', mudo, '-vf', "select='not(mod(n\\,12))',scale=384:-1,tile=5x3", '-frames:v', '1', path.join(FOLHAS, id + '.png')]);
  fs.rmSync(tmp, { recursive: true, force: true });
  // som
  if (cena.som) {
    const { fx, amb } = cena.som(S, inst.eventos || []);
    const wav = path.join(tmp + '.wav');
    S.salvarWav(S.mixar(fx, amb), wav);
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', mudo, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', path.join(OUT, nome + '-som.mp4')]);
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', wav, '-filter_complex', 'showwavespic=s=1200x160:colors=0x333333', '-frames:v', '1', path.join(FOLHAS, id + '-onda.png')]);
    fs.rmSync(wav, { force: true });
  }
  console.log(`ok: ${nome} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}

if (paralelo > 1 && ids.length > 1 && soFrame === null) {
  // distribui os vídeos entre processos filhos
  const fila = [...ids];
  const proximo = () => {
    const id = fila.shift(); if (!id) return;
    const p = spawn(process.execPath, [__filename, id], { stdio: 'inherit' });
    p.on('exit', proximo);
  };
  for (let i = 0; i < Math.min(paralelo, ids.length); i++) proximo();
} else {
  for (const id of ids) {
    try { renderizar(id); } catch (e) { console.error(`ERRO em ${id}:`, e.stack || e); process.exitCode = 1; }
  }
}
