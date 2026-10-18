// V22 — Empurrar um carrinho de brinquedo. De lado, na sala.
// Cada repetição: o Teo empurra o carrinho de bebê de brinquedo (com um ursinho dentro) com força,
// o carrinho rola, bate numa almofadona, volta rolando sozinho e o Teo segura de novo.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { sala } = require('../lib/cenario');
const { OL, r2, tracoSvg: st } = B;

const s = 1.5, SCAR = 1.3;
const X = 560;
const P0 = 905, D = 500;                      // carrinho: posição inicial e quanto anda
const R = 28;                                 // raio da roda (local do carrinho)

// deslocamento do carrinho (0..1): empurrão (acelera), rola e freia, bate e volta freando
function g(u) {
  if (u < 0.1) return 0;
  if (u < 0.3) { const k = (u - 0.1) / 0.2; return 0.22 * k * k; }
  if (u < 0.56) { const k = (u - 0.3) / 0.26; return 0.22 + 0.78 * (1 - (1 - k) ** 2); }
  if (u < 0.9) { const k = (u - 0.56) / 0.34; return (1 - k) ** 2; }
  return 0;
}

function ursinho(bob) {
  return `<g transform="translate(20 ${r2(-232 + bob)})">
    <circle cx="-30" cy="-34" r="16" fill="#B07A4A" stroke="${OL}" stroke-width="6"/><circle cx="26" cy="-34" r="16" fill="#B07A4A" stroke="${OL}" stroke-width="6"/>
    <circle cx="-30" cy="-34" r="7" fill="#E8B98A"/><circle cx="26" cy="-34" r="7" fill="#E8B98A"/>
    <circle cx="0" cy="0" r="44" fill="#B07A4A" stroke="${OL}" stroke-width="6"/>
    <ellipse cx="18" cy="12" rx="20" ry="15" fill="#E8B98A" stroke="${OL}" stroke-width="5"/>
    <circle cx="26" cy="5" r="6" fill="${OL}"/><circle cx="2" cy="-12" r="5" fill="${OL}"/><circle cx="26" cy="-12" r="5" fill="${OL}"/>
    ${st('M 18 16 Q 26 24 34 16', 4)}</g>`;
}
// carrinho de bebê de brinquedo, olhando para a direita; origem no chão, no meio
function carrinho(rot, bob) {
  const roda = (x) => `<g transform="translate(${x} ${-R}) rotate(${r2(rot)})"><circle r="${R}" fill="#3B3F46" stroke="${OL}" stroke-width="6"/>
    <circle r="${R - 12}" fill="#DDE3E8" stroke="${OL}" stroke-width="4"/>${st(`M ${-R + 12} 0 L ${R - 12} 0 M 0 ${-R + 12} L 0 ${R - 12}`, 4)}<circle r="5" fill="${OL}"/></g>`;
  return `${st('M -60 -28 L -40 -110 M 66 -28 L 40 -110', 10)}${st('M -60 -28 L -40 -110 M 66 -28 L 40 -110', 4, '#B9C3CC')}
    ${roda(-60)}${roda(66)}
    ${st('M -84 -150 L -176 -232', 14)}${st('M -84 -150 L -176 -232', 7, '#B9C3CC')}
    <rect x="-200" y="-246" width="48" height="26" rx="13" transform="rotate(-42 -176 -232)" fill="#2F6BDB" stroke="${OL}" stroke-width="6"/>
    ${ursinho(bob)}
    <path d="M -100 -210 L 100 -210 Q 104 -120 40 -104 L -40 -104 Q -104 -120 -100 -210 Z" fill="#FF8FB1" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${st('M -90 -180 L 92 -180', 5, '#FFC2D4')}
    <path d="M -100 -210 Q -104 -300 -10 -300 L -10 -210 Z" fill="#B565D9" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${st('M -56 -292 L -56 -210 M -86 -270 L -76 -210', 4, '#8E44B5')}
    <circle cx="-34" cy="-150" r="12" fill="#FFE066" stroke="${OL}" stroke-width="4"/>`;
}
function almofada(x, chao, amassa) {
  const sx = 1 - 0.18 * amassa, sy = 1 + 0.1 * amassa;
  return `<g transform="translate(${x} ${chao}) scale(${r2(sx)} ${r2(sy)})">
    <path d="M 0 0 Q -14 -100 6 -190 Q 120 -214 240 -190 Q 262 -100 250 0 Z" fill="#5DAE5B" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${st('M 40 -150 Q 120 -160 200 -150 M 30 -90 Q 120 -100 214 -90', 5, '#7FCB7C')}
    <circle cx="124" cy="-118" r="12" fill="#3F8E3D" stroke="${OL}" stroke-width="4"/></g>`;
}

module.exports = {
  id: 'V22', slug: 'empurrar-carrinho', acao: 'Empurrar', contexto: 'Empurrar um carrinho de brinquedo',
  criar() {
    const cen = sala({ janela: true, quadro: true });
    const Y = teoLado.emPe(cen.chao, s);
    const XAL = P0 + D + 100 * SCAR + 16;     // onde fica a almofada (encosta na frente do carrinho)
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.12) * B.CICLO, tipo: 'empurra' }, { t: (i + 0.3) * B.CICLO, tipo: 'rola', dur: 0.55 * B.CICLO },
        { t: (i + 0.56) * B.CICLO, tipo: 'bate' }, { t: (i + 0.9) * B.CICLO, tipo: 'pega' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const gx = g(u), cx = P0 + D * gx;
        const rot = B.deg((cx - P0) / (R * SCAR));
        const rolando = u > 0.1 && u < 0.9;
        const bob = rolando ? 4 * B.onda(t, 0.25) : 0;
        const amassa = B.bump(u, 0.53, 0.64);
        // pega (0..1): mãos no carrinho
        const pega = B.kf([[0, 1], [0.3, 1], [0.38, 0], [0.84, 0], [0.9, 1], [1, 1]], u);
        const vibra = B.kf([[0, 0], [0.36, 0], [0.42, 1], [0.66, 1], [0.74, 0], [1, 0]], u);   // comemorando
        const empurra = B.kf([[0, 0], [0.1, 0], [0.3, 1], [0.42, 0.2], [0.8, 0.2], [0.9, 0], [1, 0]], u);
        const lean = 6 + 22 * empurra;
        const pulo = vibra * Math.abs(B.onda(t, 0.5)) * 26;
        // alvo das mãos: o cabo do carrinho (na cena) → local do Teo
        const cabo = [cx + (-176 - 14) * SCAR, cen.chao - 238 * SCAR];
        const naMao = [(cabo[0] - X) / s, (cabo[1] - (Y - pulo)) / s];
        const ombro = B.girar([6, -116], lean);
        const cima = (a1, a2) => B.chain(ombro, a1, 46, a2, 44)[1];
        const livre = B.lerp([46, -40], cima(62 + 14 * B.onda(t, 0.5), 92 + 14 * B.onda(t, 0.5)), vibra);
        const alvoP = B.lerp(livre, naMao, pega), alvoL = B.lerp(B.lerp([40, -30], cima(-62 - 14 * B.onda(t, 0.5), -88 - 14 * B.onda(t, 0.5)), vibra), B.add(naMao, [-6, 4]), pega);
        const pe = empurra * 26;
        const teo = teoLado({
          x: X, y: Y - pulo, s, lean,
          pernaPerto: { alvo: [6 + pe, 114.7 + pulo / s], dobra: -1 }, pernaLonge: { alvo: [-12 - pe * 0.6, 111.7 + pulo / s], dobra: -1 },
          bracoPerto: { alvo: alvoP, dobra: 1 }, bracoLonge: { alvo: alvoL, dobra: 1 },
          expr: empurra > 0.6 && u < 0.32 ? 'esforco' : vibra > 0.3 ? 'riso' : 'feliz', piscar: B.piscando(t),
          sombraY: 135.7 + pulo / s,
        });
        const car = `<g transform="translate(${r2(cx)} ${cen.chao}) scale(${SCAR})">
          <ellipse cx="0" cy="0" rx="120" ry="9" fill="#000" opacity="0.13"/>${carrinho(rot, bob)}</g>`;
        // risquinhos de velocidade logo depois do empurrão e da batida
        const vel = B.bump(u, 0.3, 0.46), vel2 = B.bump(u, 0.58, 0.72);
        const rastro = (vel > 0.05 ? st(`M ${r2(cx - 260)} ${cen.chao - 200} l -90 0 M ${r2(cx - 250)} ${cen.chao - 140} l -120 0 M ${r2(cx - 270)} ${cen.chao - 80} l -70 0`, 8, OL, `opacity="${r2(vel)}"`) : '')
          + (vel2 > 0.05 ? st(`M ${r2(cx + 150)} ${cen.chao - 200} l 80 0 M ${r2(cx + 160)} ${cen.chao - 140} l 100 0`, 8, OL, `opacity="${r2(vel2 * 0.8)}"`) : '');
        return B.quadro(cen.svg + almofada(XAL, cen.chao, amassa) + car + teo.svg + rastro);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'empurra') S.colocar(fx, S.SOM.vush(0.4), e.t, 0.35);
      if (e.tipo === 'rola') S.colocar(fx, S.SOM.esfrega(e.dur, 420), e.t, 0.25);
      if (e.tipo === 'bate') { S.colocar(fx, S.SOM.pof(), e.t, 0.6); S.colocar(fx, S.SOM.boing(), e.t + 0.02, 0.3); }
      if (e.tipo === 'pega') S.colocar(fx, S.SOM.toc(), e.t, 0.4);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
