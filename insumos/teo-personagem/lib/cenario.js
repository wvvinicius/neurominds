// Cenários (fundo 1920x1080, cores chapadas, contorno grosso) e objetos comuns.
// Cada cenário devolve { svg, chao } — chao = y onde ficam os pés de quem está em pé.
const B = require('./base');
const { C, OL, W, H, r2, tracoSvg: st } = B;

const ret = (x, y, w, h, cor, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cor}" stroke="${OL}" stroke-width="6" ${extra}/>`;
const nuvem = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 0 q 0 -60 60 -60 q 20 -50 80 -40 q 50 -10 70 40 q 50 0 50 60 Z" fill="#fff" stroke="${OL}" stroke-width="8"/>`;
const sol = (x, y, r = 85) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFE066" stroke="${OL}" stroke-width="8"/>`;
const arvore = (x, chao, s = 1) => `<g transform="translate(${x} ${chao}) scale(${s})">
  <rect x="-22" y="-230" width="44" height="230" fill="#9C6B3F" stroke="${OL}" stroke-width="6"/>
  <circle cx="0" cy="-300" r="120" fill="#4FAE48" stroke="${OL}" stroke-width="6"/>
  <circle cx="-80" cy="-250" r="70" fill="#4FAE48" stroke="${OL}" stroke-width="6"/><circle cx="80" cy="-250" r="70" fill="#4FAE48" stroke="${OL}" stroke-width="6"/>
  <circle cx="0" cy="-300" r="112" fill="#4FAE48"/><circle cx="-80" cy="-250" r="62" fill="#4FAE48"/><circle cx="80" cy="-250" r="62" fill="#4FAE48"/></g>`;
const arbusto = (x, chao, s = 1) => `<g transform="translate(${x} ${chao}) scale(${s})"><path d="M -90 0 Q -100 -60 -50 -70 Q -30 -110 10 -90 Q 50 -110 70 -70 Q 110 -60 95 0 Z" fill="#5DB84F" stroke="${OL}" stroke-width="6"/></g>`;

// ---------- interiores ----------
function piso(y, cor = '#D9A86C', linha = '#C08E52', passo = 240) {
  return `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${cor}"/>` +
    st(Array.from({ length: Math.ceil(W / passo) + 1 }, (_, i) => `M ${i * passo} ${y} L ${i * passo - 60} ${H}`).join(' ') + ` M 0 ${y + 110} L ${W} ${y + 110}`, 4, linha) +
    st(`M 0 ${y} L ${W} ${y}`, 6);
}
function janelaParede(x, y, w = 300, h = 260) {
  return `${ret(x, y, w, h, '#BFE6FF')}${nuvem(x + 60, y + 150, 0.5)}${st(`M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h / 2} L ${x + w} ${y + h / 2}`, 8)}
    ${ret(x - 16, y + h, w + 32, 20, '#F7F2E8')}`;
}
function quadroParede(x, y) {
  return `${ret(x, y, 180, 140, '#fff')}<path d="M ${x + 20} ${y + 120} L ${x + 70} ${y + 60} L ${x + 110} ${y + 100} L ${x + 135} ${y + 75} L ${x + 165} ${y + 120} Z" fill="#7CC8FF" stroke="${OL}" stroke-width="4"/>
    <circle cx="${x + 140}" cy="${y + 40}" r="16" fill="#FFE066" stroke="${OL}" stroke-width="4"/>`;
}
function sala({ janela = true, quadro = true } = {}) {
  const chao = 900;
  return { chao, svg: `<rect width="${W}" height="${H}" fill="#FBEFD9"/>
    ${janela ? janelaParede(1380, 170) : ''}${quadro ? quadroParede(260, 200) : ''}
    ${ret(-10, 760, W + 20, 26, '#C89B6D')}${piso(786)}` };
}
function quarto() {
  const chao = 900;
  return { chao, svg: `<rect width="${W}" height="${H}" fill="#DCEBFA"/>
    ${st(Array.from({ length: 13 }, (_, i) => `M ${i * 160 + 80} 0 L ${i * 160 + 80} 760`).join(' '), 10, '#CFE0F4')}
    ${janelaParede(1420, 170, 260, 230)}
    ${ret(140, 260, 300, 24, '#C89B6D')}<circle cx="200" cy="232" r="26" fill="#E63946" stroke="${OL}" stroke-width="5"/>${ret(250, 200, 60, 60, '#4FB3FF')}${ret(330, 214, 80, 46, '#FFC93C')}
    ${ret(-10, 760, W + 20, 26, '#fff')}${piso(786, '#E8C9A0', '#D4B285')}` };
}
function cozinha() {
  const chao = 900;
  const azulejo = st(Array.from({ length: 25 }, (_, i) => `M ${i * 80} 0 L ${i * 80} 520`).join(' ') + Array.from({ length: 7 }, (_, i) => ` M 0 ${i * 80} L ${W} ${i * 80}`).join(''), 3, '#C9E8D8');
  return { chao, svg: `<rect width="${W}" height="${H}" fill="#E7F6EE"/>${azulejo}
    ${ret(1150, 500, 770, 300, '#F4F1EA')}${ret(1150, 470, 770, 40, '#B9C3CC')}
    ${[1190, 1450, 1710].map(x => `${ret(x, 540, 200, 220, '#fff')}<circle cx="${x + 170}" cy="${650}" r="8" fill="${OL}"/>`).join('')}
    ${ret(1250, 120, 300, 200, '#F4F1EA')}${ret(1570, 120, 300, 200, '#F4F1EA')}
    <rect x="0" y="786" width="${W}" height="${H - 786}" fill="#F2F2F2"/>
    ${Array.from({ length: 16 }, (_, i) => Array.from({ length: 3 }, (_, j) => (i + j) % 2 ? `<rect x="${i * 120}" y="${786 + j * 100}" width="120" height="100" fill="#D8DEE3"/>` : '').join('')).join('')}
    ${st(`M 0 786 L ${W} 786`, 6)}` };
}
function banheiro() {
  const chao = 900;
  const azulejo = st(Array.from({ length: 25 }, (_, i) => `M ${i * 80} 0 L ${i * 80} 786`).join(' ') + Array.from({ length: 10 }, (_, i) => ` M 0 ${i * 80} L ${W} ${i * 80}`).join(''), 3, '#BFDDEB');
  return { chao, svg: `<rect width="${W}" height="${H}" fill="#E3F2F8"/>${azulejo}
    <rect x="1480" y="150" width="220" height="280" rx="30" fill="#CDEBFA" stroke="${OL}" stroke-width="6"/>${st('M 1520 200 L 1560 170 M 1520 250 L 1600 180', 6, '#fff')}
    <rect x="0" y="786" width="${W}" height="${H - 786}" fill="#FFFFFF"/>
    ${st(Array.from({ length: 17 }, (_, i) => `M ${i * 120} 786 L ${i * 120} ${H}`).join(' ') + ` M 0 886 L ${W} 886 M 0 986 L ${W} 986`, 3, '#D5DEE3')}
    ${st(`M 0 786 L ${W} 786`, 6)}` };
}
function mercado() {
  const chao = 900;
  const prat = (x) => `${ret(x, 140, 420, 620, '#E9EEF2')}${[260, 420, 580].map(y => ret(x, y, 420, 20, '#B9C3CC')).join('')}
    ${[260, 420, 580].map((y, j) => Array.from({ length: 6 }, (_, i) => `<rect x="${x + 20 + i * 66}" y="${y - 70}" width="50" height="70" rx="6" fill="${['#E63946', '#FFC93C', '#2F6BDB', '#5DAE5B', '#F28C28', '#B565D9'][(i + j) % 6]}" stroke="${OL}" stroke-width="4"/>`).join('')).join('')}`;
  return { chao, svg: `<rect width="${W}" height="${H}" fill="#FFF6E5"/>${prat(80)}${prat(560)}
    <rect x="0" y="786" width="${W}" height="${H - 786}" fill="#EDE7DA"/>${st(Array.from({ length: 17 }, (_, i) => `M ${i * 120} 786 L ${i * 120} ${H}`).join(' '), 3, '#D9D0BF')}
    ${st(`M 0 786 L ${W} 786`, 6)}` };
}

// ---------- exteriores ----------
function parque({ arvores = true } = {}) {
  const chao = 900;
  return { chao, svg: `<rect width="${W}" height="${H}" fill="#9ED8FF"/>${sol(1650, 170)}${nuvem(300, 230)}${nuvem(1050, 170, 0.75)}
    <rect x="0" y="760" width="${W}" height="${H - 760}" fill="#67BF4A"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${i * 320}" y="760" width="160" height="${H - 760}" fill="#74CB56"/>`).join('')}
    ${st(`M 0 760 L ${W} 760`, 6)}
    ${arvores ? arvore(180, 770, 0.9) + arvore(1760, 770, 0.8) + arbusto(520, 772, 0.8) + arbusto(1420, 772, 0.7) : ''}` };
}
function rua() {
  const chao = 880;
  const casa = (x, cor, tel) => `${ret(x, 400, 300, 380, cor)}<path d="M ${x - 20} 400 L ${x + 150} 270 L ${x + 320} 400 Z" fill="${tel}" stroke="${OL}" stroke-width="6"/>
    ${ret(x + 40, 470, 80, 80, '#BFE6FF')}${ret(x + 180, 470, 80, 80, '#BFE6FF')}${ret(x + 110, 610, 80, 170, '#9C6B3F')}`;
  return { chao, svg: `<rect width="${W}" height="${H}" fill="#9ED8FF"/>${sol(1700, 150, 70)}${nuvem(500, 200, 0.7)}
    ${casa(120, '#F7D9A8', '#D64545')}${casa(560, '#BFE3C5', '#8A5A3C')}${casa(1000, '#F4C2C2', '#2F6BDB')}${casa(1440, '#D7C9F2', '#D64545')}
    ${ret(-10, 780, W + 20, 150, '#D9DDE1')}${st(Array.from({ length: 13 }, (_, i) => `M ${i * 160} 780 L ${i * 160} 930`).join(' '), 4, '#BCC3C9')}
    ${ret(-10, 930, W + 20, 20, '#B5BCC2')}<rect x="0" y="950" width="${W}" height="${H - 950}" fill="#5E6670"/>
    ${st(Array.from({ length: 8 }, (_, i) => `M ${i * 260 + 40} 1020 L ${i * 260 + 160} 1020`).join(' '), 10, '#fff')}` };
}
function praia() {
  const chao = 900;
  return { chao, svg: `<rect width="${W}" height="${H}" fill="#9ED8FF"/>${sol(1650, 170)}${nuvem(400, 220, 0.8)}
    <rect x="0" y="520" width="${W}" height="${H - 520}" fill="#3FA9E0"/>${st(`M 0 520 L ${W} 520`, 6)}
    ${st(Array.from({ length: 10 }, (_, i) => `M ${i * 200 + 30} ${600 + (i % 3) * 60} q 30 -14 60 0`).join(' '), 6, '#E8F8FF')}` };
}
function piscinaFundo() {
  const chao = 900;
  const azulejo = st(Array.from({ length: 25 }, (_, i) => `M ${i * 80} 0 L ${i * 80} 560`).join(' ') + Array.from({ length: 7 }, (_, i) => ` M 0 ${i * 80} L ${W} ${i * 80}`).join(''), 4, '#CFE8F2');
  return { chao, svg: `<rect width="${W}" height="${H}" fill="#EAF6FB"/>${azulejo}<rect x="0" y="490" width="${W}" height="30" fill="#4FB3E8"/>
    ${ret(-10, 560, W + 20, 40, '#F2F4F6')}<rect x="0" y="600" width="${W}" height="${H - 600}" fill="#8FDBFA"/>` };
}

// ---------- objetos comuns ----------
const OBJ = {
  // mesa de lado: x = centro, y = tampo
  mesa: (x, y, w = 420, chao = 900, cor = '#C8915A') => `${ret(x - w / 2 + 30, y + 20, 26, chao - y - 20, cor)}${ret(x + w / 2 - 56, y + 20, 26, chao - y - 20, cor)}${ret(x - w / 2, y, w, 26, cor)}`,
  cadeira: (x, chao = 900, cor = '#E07A3F', assento = 640) => `${ret(x - 70, assento - 220, 24, 220, cor)}${ret(x - 70, assento, 150, 22, cor)}${ret(x - 64, assento + 22, 20, chao - assento - 22, cor)}${ret(x + 54, assento + 22, 20, chao - assento - 22, cor)}`,
  caixa: (x, chao, w = 220, h = 160, cor = '#D9A86C', tampa = 0) => `${ret(x - w / 2, chao - h, w, h, cor)}${st(`M ${x - w / 2 + 10} ${chao - h + 30} L ${x + w / 2 - 10} ${chao - h + 30}`, 4, '#B07D45')}
    <g transform="rotate(${-tampa} ${x - w / 2} ${chao - h})">${ret(x - w / 2 - 6, chao - h - 22, w + 12, 24, cor)}</g>`,
  bola: (x, y, r = 34, rot = 0) => `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})"><circle r="${r}" fill="#E63946" stroke="${OL}" stroke-width="6"/>${st(`M ${-r} 0 Q 0 ${r * 0.5} ${r} 0`, 5, '#fff')}<circle cx="${-r * 0.35}" cy="${-r * 0.4}" r="${r * 0.18}" fill="#fff" opacity="0.7"/></g>`,
};

module.exports = { sala, quarto, cozinha, banheiro, mercado, parque, rua, praia, piscinaFundo, OBJ, ret, nuvem, sol, arvore, arbusto, piso, janelaParede, quadroParede };
