// Objetos compartilhados do Lote 2 (objetos e brincadeiras). Mesmo estilo: contorno escuro grosso, cores chapadas.
const B = require('../lib/base');
const { OL, r2, tracoSvg: st } = B;

// brilho de 4 pontas (estrelinha). a = opacidade/tamanho (0..1)
function brilho(x, y, tam = 30, a = 1, cor = '#FFF6B0', rot = 0) {
  if (a <= 0.01) return '';
  const s = tam * (0.4 + 0.6 * a), k = s * 0.28;
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})" opacity="${r2(Math.min(1, a * 1.3))}">
    <path d="M 0 ${r2(-s)} Q ${r2(k)} ${r2(-k)} ${r2(s)} 0 Q ${r2(k)} ${r2(k)} 0 ${r2(s)} Q ${r2(-k)} ${r2(k)} ${r2(-s)} 0 Q ${r2(-k)} ${r2(-k)} 0 ${r2(-s)} Z" fill="${cor}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/></g>`;
}

// nuvenzinha de vapor/poeira (3 bolinhas). a = opacidade
function nuvenzinha(x, y, s = 1, a = 1, cor = '#FFFFFF') {
  if (a <= 0.01) return '';
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s)})" opacity="${r2(a)}">
    <circle cx="-12" cy="2" r="11" fill="${cor}" stroke="#9FB3C2" stroke-width="3"/>
    <circle cx="10" cy="3" r="10" fill="${cor}" stroke="#9FB3C2" stroke-width="3"/>
    <circle cx="0" cy="-6" r="13" fill="${cor}" stroke="#9FB3C2" stroke-width="3"/>
    <circle cx="-12" cy="2" r="9" fill="${cor}"/><circle cx="10" cy="3" r="8" fill="${cor}"/></g>`;
}

// óculos vistos de frente. (x, y) = centro da ponte; esc = escala; rot = graus; emb = embaçado 0..1
function oculos(x, y, esc = 1, rot = 0, emb = 0, cor = '#B565D9') {
  const lente = cx => `<circle cx="${cx}" cy="0" r="24" fill="#BFE6FF" fill-opacity="0.9" stroke="${OL}" stroke-width="11"/>
    <circle cx="${cx}" cy="0" r="24" fill="none" stroke="${cor}" stroke-width="5"/>
    ${emb > 0.01 ? `<circle cx="${cx}" cy="0" r="21" fill="#F4F6F8" opacity="${r2(0.95 * emb)}"/>${st(`M ${cx - 10} 4 q 6 -8 12 0 q 6 8 10 -2`, 3, "#B8C4CC", `opacity="${r2(emb)}"`)}` : ''}
    ${st(`M ${cx - 12} -8 Q ${cx - 8} -14 ${cx - 2} -15`, 4, '#fff')}`;
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${r2(esc)})">
    ${st('M -51 -6 L -66 -12 M 51 -6 L 66 -12', 11)}${st('M -51 -6 L -66 -12 M 51 -6 L 66 -12', 5, cor)}
    ${st('M -6 -4 Q 0 -10 6 -4', 11)}${st('M -6 -4 Q 0 -10 6 -4', 5, cor)}
    ${lente(-29)}${lente(29)}</g>`;
}

// paninho xadrez preso pela ponta (x, y); balanço em graus
function pano(x, y, esc = 1, rot = 0, cor = '#5FB8F0') {
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${r2(esc)})">
    <path d="M -14 -6 Q 10 -12 30 -2 Q 38 30 30 58 Q 6 66 -16 58 Q -24 26 -14 -6 Z" fill="${cor}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
    ${st('M -8 16 Q 8 12 32 18 M -12 38 Q 8 34 32 40 M 6 -6 Q 2 28 6 62', 4, '#FFFFFF')}</g>`;
}

// ursinho de pelúcia sentado; (x, y) = base (chão), esc, rot em torno da base
function urso(x, y, esc = 1, rot = 0, cor = '#C98B4F') {
  const cl = '#E9C08F';
  return `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${r2(esc)})">
    <ellipse cx="-30" cy="-14" rx="18" ry="14" fill="${cor}" stroke="${OL}" stroke-width="5"/>
    <ellipse cx="30" cy="-14" rx="18" ry="14" fill="${cor}" stroke="${OL}" stroke-width="5"/>
    <ellipse cx="0" cy="-48" rx="36" ry="40" fill="${cor}" stroke="${OL}" stroke-width="6"/>
    <ellipse cx="0" cy="-42" rx="20" ry="22" fill="${cl}"/>
    <ellipse cx="-36" cy="-60" rx="11" ry="20" transform="rotate(25 -36 -60)" fill="${cor}" stroke="${OL}" stroke-width="5"/>
    <ellipse cx="36" cy="-60" rx="11" ry="20" transform="rotate(-25 36 -60)" fill="${cor}" stroke="${OL}" stroke-width="5"/>
    <circle cx="-24" cy="-138" r="13" fill="${cor}" stroke="${OL}" stroke-width="5"/><circle cx="24" cy="-138" r="13" fill="${cor}" stroke="${OL}" stroke-width="5"/>
    <circle cx="-24" cy="-138" r="6" fill="${cl}"/><circle cx="24" cy="-138" r="6" fill="${cl}"/>
    <circle cx="0" cy="-110" r="32" fill="${cor}" stroke="${OL}" stroke-width="6"/>
    <ellipse cx="0" cy="-100" rx="14" ry="11" fill="${cl}"/>
    <ellipse cx="0" cy="-104" rx="6" ry="4.5" fill="${OL}"/>${st('M 0 -100 L 0 -94 M -6 -92 Q 0 -88 6 -92', 3)}
    <circle cx="-12" cy="-118" r="4.5" fill="${OL}"/><circle cx="12" cy="-118" r="4.5" fill="${OL}"/>
    
    <path d="M -14 -76 L 0 -68 L 14 -76 L 14 -62 L 0 -68 L -14 -62 Z" fill="#E63946" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/></g>`;
}

module.exports = { brilho, nuvenzinha, oculos, pano, urso };
