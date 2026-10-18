// Separa o Teo em partes para animação (rig).
// Uso: node rig.js  → gera rig/svg-alinhado, rig/svg-pivo, rig/rig.json e rig/demo.html
const fs = require('fs');
const path = require('path');
const { C, SW, afro, eye, brow, bigSmile, EXPR, limb, arm, sleeve, leg, POSES } = require('./gerar');

const HEAD = (inner) => `<g transform="translate(200 192)">${inner}</g>`;
const p = POSES.padrao;

// ---------- partes do corpo ----------
const cabecaBase = HEAD(`${afro()}
  <circle cx="-70" cy="14" r="17" fill="${C.skin}" stroke="${C.ol}" stroke-width="${SW}"/>
  <circle cx="70" cy="14" r="17" fill="${C.skin}" stroke="${C.ol}" stroke-width="${SW}"/>
  <path d="M -72 8 q 6 4 4 12 M 72 8 q -6 4 -4 12" fill="none" stroke="${C.skinLine}" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="0" cy="8" rx="72" ry="80" fill="${C.skin}" stroke="${C.ol}" stroke-width="${SW}"/>
  <path d="M -76 -6 Q -72 -78 0 -82 Q 72 -78 76 -6 Q 58 -50 0 -52 Q -58 -50 -76 -6 Z" fill="${C.hair}"/>
  <path d="M -74 -8 Q -58 -50 0 -52 Q 58 -50 74 -8" fill="none" stroke="${C.ol}" stroke-width="${SW - 1}" stroke-linecap="round"/>
  <path d="M -7 24 Q 0 31 7 24" fill="none" stroke="${C.skinLine}" stroke-width="5" stroke-linecap="round"/>`);

const corpo = `<rect x="184" y="250" width="32" height="56" fill="${C.skin}" stroke="${C.ol}" stroke-width="${SW}"/>
  <path d="M 136 416 L 264 416 L 272 494 L 210 494 L 200 462 L 190 494 L 128 494 Z" fill="${C.shorts}" stroke="${C.ol}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M 200 420 L 200 460" stroke="${C.ol}" stroke-width="4" stroke-linecap="round"/>
  <path d="M 142 300 Q 200 288 258 300 Q 272 306 270 330 L 266 426 Q 200 434 134 426 L 130 330 Q 128 306 142 300 Z" fill="${C.shirt}" stroke="${C.ol}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M 178 298 Q 200 316 222 298" fill="none" stroke="${C.ol}" stroke-width="${SW}" stroke-linecap="round"/>`;

// braços e pernas retos para baixo: giram bem em qualquer direção a partir do pivô
const armL = [[142, 318], [130, 368], [126, 418]];
const armR = [[258, 318], [270, 368], [274, 418]];
const legL = [[172, 470], [170, 520], [168, 560]];
const legR = [[228, 470], [230, 520], [232, 560]];

// ---------- olhos (com sobrancelhas) ----------
const take = (expr, idx) => idx.map(i => EXPR[expr]('r_' + expr)[i]).join('');
const OLHOS = {
  aberto: take('feliz', [0, 1, 2, 3]),
  piscando: [brow('M -44 -40 Q -28 -50 -12 -42'), brow('M 12 -42 Q 28 -50 44 -40'),
    `<path d="M -46 -2 Q -28 10 -10 -2 M 10 -2 Q 28 10 46 -2" fill="none" stroke="${C.ol}" stroke-width="7" stroke-linecap="round"/>`].join(''),
  risada: take('gargalhada', [0, 1, 2, 3]),
  surpreso: take('surpreso', [0, 1, 2, 3]),
  confiante: take('confiante', [0, 1, 2, 3]),
  ops: take('ops', [0, 1, 2, 3]),
  pensando: take('pensando', [0, 1, 2, 3]),
};

// ---------- bocas (as 3 primeiras servem para fala/lipsync) ----------
const BOCAS = {
  fechada: `<path d="M -28 44 Q 0 64 28 44" fill="none" stroke="${C.ol}" stroke-width="7" stroke-linecap="round"/>`,
  'meio-aberta': bigSmile('b_meio', 0.55),
  sorriso: bigSmile('b_sorriso'),
  gargalhada: bigSmile('b_garg', 1.25),
  o: take('surpreso', [4, 5]),
  confiante: take('confiante', [4]),
  dentes: take('ops', [4, 5]),
  reta: take('pensando', [2]),
};

const EXTRAS = {
  bochechas: `<ellipse cx="-50" cy="30" rx="11" ry="7" fill="${C.blush}"/><ellipse cx="50" cy="30" rx="11" ry="7" fill="${C.blush}"/>`,
  suor: take('ops', [6]),
};

// ---------- definição do rig ----------
// pivo = ponto de giro no canvas alinhado (viewBox -30 0 460 620); r = meia-largura do canvas centrado no pivô
const PIV = { cabeca: [200, 262], corpo: [200, 494] };
const parts = [
  { nome: 'perna-esq', svg: leg(legL, -1, 0), pivo: legL[0], r: 140 },
  { nome: 'perna-dir', svg: leg(legR, 1, 0), pivo: legR[0], r: 140 },
  { nome: 'corpo', svg: corpo, pivo: PIV.corpo, r: 250 },
  { nome: 'braco-esq', svg: arm(armL) + sleeve(armL), pivo: armL[0], r: 130 },
  { nome: 'braco-dir', svg: arm(armR) + sleeve(armR), pivo: armR[0], r: 130 },
  { nome: 'cabeca', svg: cabecaBase, pivo: PIV.cabeca, r: 250 },
  ...Object.entries(EXTRAS).map(([k, s]) => ({ nome: k, svg: HEAD(s), pivo: PIV.cabeca, r: 250, segue: 'cabeca' })),
  ...Object.entries(OLHOS).map(([k, s]) => ({ nome: 'olhos-' + k, svg: HEAD(s), pivo: PIV.cabeca, r: 250, segue: 'cabeca' })),
  ...Object.entries(BOCAS).map(([k, s]) => ({ nome: 'boca-' + k, svg: HEAD(s), pivo: PIV.cabeca, r: 250, segue: 'cabeca' })),
];

module.exports = { parts, OLHOS, BOCAS };
if (require.main !== module) return;

const svgAlinhado = s => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 0 460 620" width="460" height="620">${s}</svg>`;
const svgPivo = (s, [x, y], r) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x - r} ${y - r} ${2 * r} ${2 * r}" width="${2 * r}" height="${2 * r}">${s}</svg>`;

const out = path.join(__dirname, 'rig');
for (const d of ['svg-alinhado', 'svg-pivo']) fs.mkdirSync(path.join(out, d), { recursive: true });
for (const pt of parts) {
  fs.writeFileSync(path.join(out, 'svg-alinhado', pt.nome + '.svg'), svgAlinhado(pt.svg));
  fs.writeFileSync(path.join(out, 'svg-pivo', pt.nome + '.svg'), svgPivo(pt.svg, pt.pivo, pt.r));
}

// ordem das camadas, de baixo para cima
const ordem = ['perna-esq', 'perna-dir', 'corpo', 'braco-esq', 'braco-dir', 'cabeca', 'bochechas', 'olhos-*', 'boca-*', 'suor'];
const ESCALA_PNG = 3;
const rig = {
  personagem: 'Teo',
  canvas_alinhado: { largura: 460, altura: 620, origem_x: -30, escala_png: ESCALA_PNG },
  ordem_camadas: ordem,
  partes: parts.map(pt => ({
    nome: pt.nome,
    segue: pt.segue || null,
    pivo_alinhado_px: [pt.pivo[0] + 30, pt.pivo[1]],
    pivo_alinhado_png_px: [(pt.pivo[0] + 30) * ESCALA_PNG, pt.pivo[1] * ESCALA_PNG],
    pivo_alinhado_pct: [+(((pt.pivo[0] + 30) / 460) * 100).toFixed(2), +((pt.pivo[1] / 620) * 100).toFixed(2)],
    canvas_pivo_png_px: 2 * pt.r * ESCALA_PNG,
  })),
};
fs.writeFileSync(path.join(out, 'rig.json'), JSON.stringify(rig, null, 2));

// ---------- demo animada ----------
const pct = pt => `${(((pt.pivo[0] + 30) / 460) * 100).toFixed(2)}% ${((pt.pivo[1] / 620) * 100).toFixed(2)}%`;
const byName = Object.fromEntries(parts.map(pt => [pt.nome, pt]));
// camadas embutidas (mesmo conteúdo dos arquivos em svg-alinhado/) para a demo abrir em qualquer lugar
const layer = (n, extra = '') => `<svg class="L ${n}" ${extra} viewBox="-30 0 460 620" style="transform-origin:${pct(byName[n])}">${byName[n].svg}</svg>`;
const demo = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Teo — Rig de Animação</title>
<style>
  :root{--bg:#FFF8E7;--ink:#1A0F0A;--muted:#6b5b50}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,Segoe UI,sans-serif}
  main{max-width:900px;margin:0 auto;padding:28px 16px 60px}
  h1{margin:0;font-size:36px} p{color:var(--muted);margin:4px 0 18px}
  .wrap{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}
  .stage{width:min(100%,380px);aspect-ratio:460/620;position:relative;background:#fff;border:3px solid var(--ink);border-radius:18px;box-shadow:5px 5px 0 var(--ink);overflow:hidden}
  .teo{position:absolute;inset:0}
  .L{position:absolute;inset:0;width:100%;height:100%}
  .ctrl{flex:1;min-width:240px}
  .ctrl h3{margin:10px 0 6px;font-size:15px}
  button{font:inherit;font-size:14px;padding:6px 12px;margin:0 6px 6px 0;border:2px solid var(--ink);border-radius:10px;background:#fff;cursor:pointer}
  button.on{background:#FFC93C}
  .hide{display:none}
  /* animações */
  @keyframes bob{50%{transform:translateY(-8px)}}
  @keyframes wave{0%,100%{transform:rotate(-125deg)}50%{transform:rotate(-155deg)}}
  @keyframes sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
  @keyframes swayInv{0%,100%{transform:rotate(4deg)}50%{transform:rotate(-4deg)}}
  @keyframes tilt{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
  @keyframes legA{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(18deg)}}
  @keyframes legB{0%,100%{transform:rotate(18deg)}50%{transform:rotate(-18deg)}}
  @keyframes armA{0%,100%{transform:rotate(25deg)}50%{transform:rotate(-25deg)}}
  @keyframes armB{0%,100%{transform:rotate(-25deg)}50%{transform:rotate(25deg)}}
  @keyframes hero{0%,40%{transform:rotate(0)}60%,100%{transform:rotate(-165deg)}}
  .a-parado .teo{animation:bob 2.4s ease-in-out infinite}
  .a-parado .braco-esq{animation:swayInv 2.4s ease-in-out infinite}
  .a-parado .braco-dir{animation:sway 2.4s ease-in-out infinite}
  .a-acenar .braco-dir{animation:wave .5s ease-in-out infinite}
  .a-acenar .cab{animation:tilt 1s ease-in-out infinite}
  .a-andar .teo{animation:bob .4s ease-in-out infinite}
  .a-andar .perna-esq{animation:legA .8s ease-in-out infinite}
  .a-andar .perna-dir{animation:legB .8s ease-in-out infinite}
  .a-andar .braco-esq{animation:armA .8s ease-in-out infinite}
  .a-andar .braco-dir{animation:armB .8s ease-in-out infinite}
  .a-heroi .braco-dir{animation:hero 1.6s ease-out infinite alternate}
  .cab{position:absolute;inset:0;transform-origin:${pct(byName.cabeca)}}
</style></head><body><main>
  <h1>Teo — rig de animação</h1>
  <p>Cada parte é uma camada alinhada; os giros acontecem no pivô (ombro, quadril, pescoço). É assim que você monta no editor de vídeo.</p>
  <div class="wrap">
    <div class="stage a-parado" id="stage"><div class="teo">
      ${layer('perna-esq')}${layer('perna-dir')}${layer('corpo')}${layer('braco-esq')}${layer('braco-dir')}
      <div class="cab">
        ${layer('cabeca')}${layer('bochechas')}
        ${Object.keys(OLHOS).map(k => layer('olhos-' + k, `data-olhos="${k}"`)).join('')}
        ${Object.keys(BOCAS).map(k => layer('boca-' + k, `data-boca="${k}"`)).join('')}
        ${layer('suor')}
      </div>
    </div></div>
    <div class="ctrl">
      <h3>Movimento</h3>
      <div id="mov">${['parado', 'acenar', 'andar', 'heroi'].map(m => `<button data-m="${m}">${{ parado: 'Parado', acenar: 'Acenar', andar: 'Andar', heroi: 'Herói' }[m]}</button>`).join('')}</div>
      <h3>Olhos</h3><div id="olh">${Object.keys(OLHOS).map(k => `<button data-v="${k}">${k}</button>`).join('')}</div>
      <h3>Boca</h3><div id="boc">${Object.keys(BOCAS).map(k => `<button data-v="${k}">${k}</button>`).join('')}</div>
      <h3>Extras</h3><button id="falar">Falar (lipsync)</button><button id="piscar" class="on">Piscar sozinho</button><button id="suorBtn">Suor</button><button id="bochBtn" class="on">Bochechas</button>
    </div>
  </div>
</main>
<script>
  const st = document.getElementById('stage');
  let olhos = 'aberto', boca = 'sorriso', falando = false, piscar = true, piscou = false;
  function render(){
    document.querySelectorAll('[data-olhos]').forEach(e => e.classList.toggle('hide', e.dataset.olhos !== (piscou ? 'piscando' : olhos)));
    document.querySelectorAll('[data-boca]').forEach(e => e.classList.toggle('hide', e.dataset.boca !== boca));
    document.querySelectorAll('#olh button').forEach(b => b.classList.toggle('on', b.dataset.v === olhos));
    document.querySelectorAll('#boc button').forEach(b => b.classList.toggle('on', b.dataset.v === boca));
  }
  document.querySelectorAll('#mov button').forEach(b => b.onclick = () => {
    st.className = 'stage a-' + b.dataset.m;
    document.querySelectorAll('#mov button').forEach(x => x.classList.toggle('on', x === b));
  });
  document.querySelector('#mov button').classList.add('on');
  document.querySelectorAll('#olh button').forEach(b => b.onclick = () => { olhos = b.dataset.v; render(); });
  document.querySelectorAll('#boc button').forEach(b => b.onclick = () => { boca = b.dataset.v; falando = false; document.getElementById('falar').classList.remove('on'); render(); });
  document.getElementById('falar').onclick = e => { falando = !falando; e.target.classList.toggle('on', falando); };
  document.getElementById('piscar').onclick = e => { piscar = !piscar; e.target.classList.toggle('on', piscar); };
  const suor = document.querySelector('.L.suor'); suor.classList.add('hide');
  document.getElementById('suorBtn').onclick = e => e.target.classList.toggle('on', !suor.classList.toggle('hide'));
  const boch = document.querySelector('.L.bochechas');
  document.getElementById('bochBtn').onclick = e => e.target.classList.toggle('on', !boch.classList.toggle('hide'));
  const fala =['fechada', 'meio-aberta', 'sorriso', 'meio-aberta'];
  let i = 0;
  setInterval(() => { if (falando) { boca = fala[i++ % fala.length]; render(); } }, 130);
  (function blink(){ setTimeout(() => { if (piscar) { piscou = true; render(); setTimeout(() => { piscou = false; render(); }, 140); } blink(); }, 1800 + Math.random() * 2200); })();
  render();
</script></body></html>`;
fs.writeFileSync(path.join(out, 'demo.html'), demo);
console.log('ok:', parts.length, 'camadas');
