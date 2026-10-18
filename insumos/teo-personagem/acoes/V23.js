// V23 — Comprar: escolher uma fruta e pôr na cestinha. De lado, no mercado, diante da banca de frutas.
// Cada repetição: estica o braço, pega uma maçã na caixa, olha para ela contente e põe na cestinha (opaca).
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { mercado, ret } = require('../lib/cenario');
const { OL, r2, tracoSvg: st } = B;

const s = 1.5, X = 975;
const MACA = '#E63946';
const maca = (x, y, k = 1, rot = 0) => `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${r2(k)})">
  <path d="M 0 -18 C -26 -30 -34 4 -20 20 C -12 30 -4 26 0 24 C 4 26 12 30 20 20 C 34 4 26 -30 0 -18 Z" fill="${MACA}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
  ${st('M 0 -16 Q 2 -26 6 -32', 5)}<path d="M 4 -26 Q 16 -36 24 -28 Q 14 -20 4 -26 Z" fill="#5DAE5B" stroke="${OL}" stroke-width="3.5"/>
  <ellipse cx="-11" cy="-6" rx="5" ry="8" fill="#fff" opacity="0.6" transform="rotate(20 -11 -6)"/></g>`;
const laranja = (x, y) => `<circle cx="${x}" cy="${y}" r="22" fill="#F28C28" stroke="${OL}" stroke-width="5"/><circle cx="${x - 7}" cy="${y - 8}" r="4" fill="#FFC28A"/>${st(`M ${x} ${y - 22} l 3 -6`, 4)}`;
const banana = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M -40 -6 Q 0 34 44 -8 Q 46 4 40 10 Q 0 44 -42 6 Z" fill="#FFD93C" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>${st('M 42 -8 l 6 -6', 6)}</g>`;
const pera = (x, y) => `<path transform="translate(${x} ${y})" d="M 0 -26 C -10 -26 -10 -8 -18 4 C -26 18 -14 28 0 28 C 14 28 26 18 18 4 C 10 -8 10 -26 0 -26 Z" fill="#A8D85A" stroke="${OL}" stroke-width="5"/>`;

// banca de frutas (cena). tampo das caixas da frente em y = TOPO
const TOPO = 700;
function bancaFundo(chao) {
  const postes = `${ret(1150, 260, 22, chao - 260, '#9C6B3F')}${ret(1880, 260, 22, chao - 260, '#9C6B3F')}`;
  const toldo = Array.from({ length: 8 }, (_, i) => `<path d="M ${1120 + i * 100} 230 L ${1220 + i * 100} 230 L ${1220 + i * 100} 300 Q ${1170 + i * 100} 340 ${1120 + i * 100} 300 Z" fill="${i % 2 ? '#fff' : '#E63946'}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>`).join('');
  // prateleira de trás (mais alta) com peras e laranjas
  const tras = `${ret(1190, TOPO - 120, 690, 26, '#C8915A')}${ret(1200, TOPO - 170, 330, 60, '#D9A86C')}${ret(1550, TOPO - 170, 320, 60, '#D9A86C')}`;
  const frutasTras = [0, 1, 2, 3, 4, 5].map(i => pera(1225 + i * 52, TOPO - 178)).join('') + [0, 1, 2, 3, 4, 5].map(i => laranja(1575 + i * 52, TOPO - 178)).join('');
  // fundo da caixa das maçãs (parede de trás)
  const fundoCaixa = `${ret(1180, TOPO - 40, 250, 60, '#B07D45')}${ret(1450, TOPO - 40, 220, 60, '#B07D45')}${ret(1690, TOPO - 40, 200, 60, '#B07D45')}`;
  return `${postes}${toldo}${frutasTras}${tras}${fundoCaixa}`;
}
function bancaFrente(chao) {
  const rnd = B.aleatorio(5);
  // monte de maçãs (fileira de trás e da frente)
  let macas = '';
  for (let i = 0; i < 6; i++) macas += maca(1205 + i * 40, TOPO - 18 + 4 * Math.sin(i * 2), 1, (rnd() - 0.5) * 30);
  for (let i = 0; i < 5; i++) macas += maca(1225 + i * 42, TOPO + 4, 1, (rnd() - 0.5) * 30);
  let lar = '';
  for (let i = 0; i < 5; i++) lar += laranja(1475 + i * 42, TOPO - 14);
  for (let i = 0; i < 4; i++) lar += laranja(1495 + i * 42, TOPO + 6);
  const ban = banana(1740, TOPO - 14, -10) + banana(1800, TOPO - 6, 8) + banana(1770, TOPO + 6, -4);
  const caixa = (x, w, cor) => `${ret(x, TOPO, w, 110, cor)}${st(`M ${x} ${TOPO + 36} L ${x + w} ${TOPO + 36} M ${x} ${TOPO + 72} L ${x + w} ${TOPO + 72}`, 4, '#9C6B3F')}`;
  const mesa = `${ret(1170, TOPO + 110, 730, 30, '#9C6B3F')}${ret(1190, TOPO + 140, 26, chao - TOPO - 140, '#9C6B3F')}${ret(1855, TOPO + 140, 26, chao - TOPO - 140, '#9C6B3F')}`;
  return `${mesa}${macas}${lar}${ban}${caixa(1170, 260, '#D9A86C')}${caixa(1440, 240, '#D9A86C')}${caixa(1680, 220, '#D9A86C')}`;
}

// caminho da mão perto (na cena) ao longo do ciclo
const P_REPOUSO = 'repouso';
const KMAO = [
  [0, P_REPOUSO], [0.08, P_REPOUSO], [0.3, [1150, 640]], [0.38, [1160, 712]], [0.44, [1160, 712]],
  [0.54, [1120, 596]], [0.66, [1117, 600]], [0.8, 'cesta'], [0.86, 'cesta'], [0.97, P_REPOUSO], [1, P_REPOUSO],
];

module.exports = {
  id: 'V23', slug: 'comprar-fruta', acao: 'Comprar', contexto: 'Escolher uma fruta e pôr na cestinha (mercado)',
  criar() {
    const cen = mercado();
    const Y = teoLado.emPe(cen.chao, s);
    const fundo = cen.svg + `<g transform="translate(-60 0)">${bancaFundo(cen.chao)}</g>`, frente = `<g transform="translate(-60 0)">${bancaFrente(cen.chao)}</g>`;
    const REPOUSO = [14, 4];                       // mão perto parada (local)
    const CESTA_MAO = [22, -12];                   // mão longe segurando a alça (local)
    const loc = q => [(q[0] - X) / s, (q[1] - Y) / s];
    const ponto = (v, alca) => v === P_REPOUSO ? REPOUSO : v === 'cesta' ? [alca[0] + 6, alca[1] + 2] : loc(v);
    return {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + 0.4) * B.CICLO, tipo: 'pega' }, { t: (i + 0.84) * B.CICLO, tipo: 'cai' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const alcanca = B.kf([[0, 0], [0.08, 0], [0.3, 0.85], [0.38, 1], [0.44, 1], [0.54, 0.12], [0.66, 0.12], [0.82, 0.08], [0.86, 0.08], [1, 0]], u);
        const lean = 2 + 43 * alcanca;
        // alça da cesta acompanha a mão longe (fixa no local)
        const alca = CESTA_MAO;
        // mão perto: interpola entre os pontos-chave
        let i = 1; while (i < KMAO.length - 1 && u > KMAO[i][0]) i++;
        const [u0, v0] = KMAO[i - 1], [u1, v1] = KMAO[i];
        const k = B.ease((u - u0) / (u1 - u0 || 1));
        const mao = B.lerp(ponto(v0, alca), ponto(v1, alca), k);
        const naMao = u >= 0.4 && u < 0.8;
        // maçã caindo dentro da cesta depois de solta
        const caindo = u >= 0.8 && u < 0.88 ? (u - 0.8) / 0.08 : null;
        const olhando = u > 0.5 && u < 0.7;
        const cestaSvg = info => {
          const h = info.maoLonge, rim = h[1] + 44, cx = h[0];
          const ma = caindo !== null ? maca(cx + 4, rim - 10 + 50 * caindo * caindo, 0.62, 10) : '';
          return `${st(`M ${cx - 44} ${rim} Q ${cx - 40} ${h[1] - 34} ${cx} ${h[1] - 10} Q ${cx + 40} ${h[1] - 34} ${cx + 44} ${rim}`, 13)}
            ${st(`M ${cx - 44} ${rim} Q ${cx - 40} ${h[1] - 34} ${cx} ${h[1] - 10} Q ${cx + 40} ${h[1] - 34} ${cx + 44} ${rim}`, 5, '#C8915A')}
            <ellipse cx="${cx}" cy="${rim}" rx="52" ry="11" fill="#7A4E26" stroke="${OL}" stroke-width="5"/>
            ${ma}
            <path d="M ${cx - 54} ${rim} L ${cx + 54} ${rim} L ${cx + 42} ${rim + 58} Q ${cx} ${rim + 66} ${cx - 42} ${rim + 58} Z" fill="#D9A15A" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
            ${st(`M ${cx - 50} ${rim + 18} L ${cx + 50} ${rim + 18} M ${cx - 46} ${rim + 38} L ${cx + 46} ${rim + 38}`, 4, '#A8743A')}
            ${st(`M ${cx - 30} ${rim + 2} L ${cx - 24} ${rim + 60} M ${cx} ${rim + 2} L ${cx} ${rim + 64} M ${cx + 30} ${rim + 2} L ${cx + 24} ${rim + 60}`, 4, '#A8743A')}
            <path d="M ${cx - 54} ${rim} L ${cx + 54} ${rim}" stroke="${OL}" stroke-width="6" stroke-linecap="round"/>
            <circle cx="${r2(h[0])}" cy="${r2(h[1])}" r="15" fill="${B.C.skin}" stroke="${OL}" stroke-width="6"/>`;
        };
        const teo = teoLado({
          x: X, y: Y, s, lean, cabeca: olhando ? -4 : 6 * alcanca,
          pernaPerto: { alvo: [12 + 10 * alcanca, 114.7], dobra: -1 }, pernaLonge: { alvo: [-14 - 8 * alcanca, 111.7], dobra: -1 },
          bracoPerto: { alvo: mao, dobra: 1 },
          bracoLonge: { alvo: alca, dobra: 1 },
          expr: olhando ? { base: "riso", olho: "aberto", olhar: [3, 7] } : alcanca > 0.6 ? { base: 'concentrado', olhar: [4, 4] } : 'feliz',
          piscar: B.piscando(t),
          itensMeio: cestaSvg,
          itensFrente: info => naMao ? maca(info.maoPerto[0] + 4, info.maoPerto[1] - 16, 0.62, -10) + `<circle cx="${r2(info.maoPerto[0])}" cy="${r2(info.maoPerto[1])}" r="15" fill="${B.C.skin}" stroke="${OL}" stroke-width="6"/>` : '',
        });
        // brilho na maçã quando ele olha para ela
        let brilho = '';
        if (olhando) {
          const p = teo.info.aCena(teo.info.maoPerto), a = B.bump(u, 0.5, 0.72);
          brilho = [[-40, -70], [34, -84], [50, -40]].map(([dx, dy], j) => `<path transform="translate(${r2(p[0] + dx)} ${r2(p[1] + dy - 20)}) scale(${r2(a * (0.8 + 0.2 * j))})" d="M 0 -16 Q 3 -3 16 0 Q 3 3 0 16 Q -3 3 -16 0 Q -3 -3 0 -16 Z" fill="#FFE066" stroke="${OL}" stroke-width="3"/>`).join('');
        }
        return B.quadro(fundo + teo.svg + frente + brilho);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'pega') S.colocar(fx, S.SOM.papel(0.15), e.t, 0.25);
      if (e.tipo === 'cai') { S.colocar(fx, S.SOM.pof(), e.t, 0.45); S.colocar(fx, S.SOM.ding(1760), e.t + 0.05, 0.08); }
    }
    for (const e of eventos) if (e.tipo === 'pega') S.colocar(fx, S.SOM.nota('mi2', 0.15), e.t + 0.3, 0.12);
    return { fx, amb: S.AMB.mercado() };
  },
};
