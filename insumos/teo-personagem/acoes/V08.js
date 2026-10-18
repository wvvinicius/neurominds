// V08 — Limpar as mãos com toalha. De frente, no banheiro.
// Cada repetição: mãos molhadas pingando, vai até a toalha pendurada, esfrega as mãos nela
// e mostra as mãos limpas (palmas abertas, com brilhinho). Volta rápida para a pose inicial.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { banheiro } = require('../lib/cenario');
const { brilho, maoAberta } = require('./obj-lote1');
const { OL, r2 } = B;

const TOALHA = '#FF8FA3', LISTRA = '#FFFFFF';
// argola na parede e toalha pendurada (coordenadas locais do Teo)
const ARG = [150, -250];
function toalhaPendurada(balanco) {
  const [ax, ay] = ARG, w = 120, h = 200;
  const t = `rotate(${r2(balanco)} ${ax} ${ay + 20})`;
  return `<rect x="${ax - 36}" y="${ay - 70}" width="72" height="22" rx="8" fill="#B9C3CC" stroke="${OL}" stroke-width="5"/>
    ${B.tracoSvg(`M ${ax} ${ay - 48} L ${ax} ${ay - 34}`, 8)}
    <g transform="${t}">
      <path d="M ${ax - w / 2} ${ay + 6} Q ${ax} ${ay - 14} ${ax + w / 2} ${ay + 6} L ${ax + w / 2 + 6} ${ay + h} Q ${ax} ${ay + h + 12} ${ax - w / 2 - 6} ${ay + h} Z" fill="${TOALHA}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      ${B.tracoSvg(`M ${ax - w / 2 + 2} ${ay + h - 40} Q ${ax} ${ay + h - 30} ${ax + w / 2 + 4} ${ay + h - 40} M ${ax - w / 2 + 3} ${ay + h - 24} Q ${ax} ${ay + h - 14} ${ax + w / 2 + 5} ${ay + h - 24}`, 6, LISTRA)}
    </g>
    <circle cx="${ax}" cy="${ay - 10}" r="30" fill="none" stroke="${OL}" stroke-width="14"/><circle cx="${ax}" cy="${ay - 10}" r="30" fill="none" stroke="#C9D3DB" stroke-width="7"/>
    <path d="M ${ax - 52} ${ay + 8} Q ${ax} ${ay - 34} ${ax + 52} ${ay + 8} L ${ax + 40} ${ay + 20} Q ${ax} ${ay - 6} ${ax - 40} ${ay + 20} Z" fill="${TOALHA}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>`;
}
// parte da toalha embolada nas mãos (na frente)
function toalhaNasMaos(m, k, giro) {
  if (k <= 0.01) return '';
  const w = 130 * k, h = 90 * k;
  return `<g transform="translate(${r2(m[0])} ${r2(m[1])}) rotate(${r2(giro)})">
    <path d="M ${-w / 2} ${-h * 0.2} Q ${-w * 0.3} ${-h * 0.62} ${w * 0.05} ${-h * 0.5} Q ${w * 0.4} ${-h * 0.7} ${w / 2} ${-h * 0.15} Q ${w * 0.6} ${h * 0.45} ${w * 0.1} ${h * 0.5} Q ${-w * 0.45} ${h * 0.6} ${-w / 2} ${-h * 0.2} Z" fill="${TOALHA}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    ${B.tracoSvg(`M ${-w * 0.3} ${h * 0.22} Q 0 ${h * 0.34} ${w * 0.35} ${h * 0.12}`, 6, LISTRA)}
    ${B.tracoSvg(`M ${-w * 0.2} ${-h * 0.25} Q ${-w * 0.05} ${-h * 0.05} ${w * 0.15} ${-h * 0.2}`, 4, '#E56F86')}</g>`;
}

module.exports = {
  id: 'V08', slug: 'limpar-maos-toalha', acao: 'Limpar', contexto: 'Limpar as mãos com toalha',
  criar() {
    const cen = banheiro();
    const s = 1.5, X = 880, Y = teoFrente.emPe(cen.chao, s);
    const MOLHADO = [[-28, -72], [28, -72]], NA_TOALHA = [[70, -112], [112, -106]];
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.03) * B.CICLO, tipo: 'pinga' }, { t: (i + 0.1) * B.CICLO, tipo: 'pinga' },
        ...Array.from({ length: 6 }, (_, j) => ({ t: (i + 0.2 + j * 0.0625) * B.CICLO, tipo: 'esfrega' })),
        { t: (i + 0.62) * B.CICLO, tipo: 'mostra' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const vai = B.kf([[0, 0], [0.07, 0], [0.18, 1], [0.55, 1], [0.6, 0], [1, 0]], u);          // mãos na toalha
        const mostra = B.kf([[0, 0], [0.55, 0], [0.64, 1], [0.86, 1], [0.97, 0], [1, 0]], u);     // mãos para cima
        const esfregando = u > 0.18 && u < 0.55;
        const amp = esfregando ? 12 * B.bump(u, 0.18, 0.55) ** 0.3 : 0;
        const ph = 2 * Math.PI * t / 0.25;
        const lean = 11 * vai;
        const maos = [0, 1].map(j => {
          const p = B.lerp(MOLHADO[j], NA_TOALHA[j], vai);
          const sg = j ? -1 : 1;
          return [p[0] + amp * Math.cos(ph) * sg, p[1] + amp * Math.sin(ph) * sg * 0.6];
        });
        const bracoEsq = mostra > 0.01 ? { a1: B.mix(-25, -128, mostra), a2: B.mix(30, -150, mostra) } : { alvo: maos[0], dobra: 1 };
        const bracoDir = mostra > 0.01 ? { a1: B.mix(25, 128, mostra), a2: B.mix(-30, 150, mostra) } : { alvo: maos[1], dobra: -1 };
        const balanco = 6 * Math.exp(-Math.max(0, u - 0.56) * 8) * Math.sin(Math.max(0, u - 0.56) * 30) * (u > 0.56 ? 1 : 0) + (esfregando ? 1.5 * Math.sin(ph) : 0);
        const expr = mostra > 0.5 ? (u < 0.76 ? 'riso' : 'orgulho') : esfregando ? { base: 'concentrado', olhar: [8, 6] } : { base: 'surpreso', olhar: [0, 8] };
        const teo = teoFrente({
          x: X, y: Y, s, lean, cabeca: esfregando ? 4 * Math.sin(ph / 2) : 0,
          expr, piscar: mostra < 0.5 && !esfregando && B.piscando(t),
          bracoEsq, bracoDir, maosNaFrenteDaCabeca: false,
          itensAtras: toalhaPendurada(balanco),
          itensFrente: i => {
            let out = '';
            if (vai > 0.3 && mostra < 0.01) {
              const m = B.lerp(i.maoEsq, i.maoDir, 0.5);
              out += toalhaNasMaos([m[0] + 4, m[1] + 6], B.clamp((vai - 0.3) / 0.5), -10 + 6 * Math.sin(ph));
            }
            if (mostra > 0.4) {
              const a = B.clamp((mostra - 0.4) / 0.4);
              const mex = 6 * Math.sin(2 * Math.PI * t / 0.5);
              out += maoAberta(i.maoEsq[0], i.maoEsq[1], -30 + mex, 1).replace('<g ', `<g opacity="${r2(a)}" `);
              out += maoAberta(i.maoDir[0], i.maoDir[1], 30 - mex, -1).replace('<g ', `<g opacity="${r2(a)}" `);
            }
            return out;
          },
        });
        let extra = '';
        // gotas pingando das mãos molhadas (nascem perto do fim do ciclo anterior e no começo)
        const NASC = [[0.93, 0], [0.97, 1], [0.02, 0], [0.06, 1]];
        NASC.forEach(([un, j], q) => {
          const idade = ((u - un) % 1 + 1) % 1;
          if (idade > 0.22) return;
          const m = teo.info.aCena(teo.info[j ? 'maoDir' : 'maoEsq']);
          const cresce = B.clamp(idade / 0.05), cai = Math.max(0, idade - 0.05);
          extra += B.gota(m[0] + (q % 2 ? 8 : -8), m[1] + 26 + 2600 * cai * cai, 1.4 * cresce);
        });
        const a = B.bump(u, 0.6, 0.9);
        if (a > 0.01) for (const k of ['maoEsq', 'maoDir']) {
          const m = teo.info.aCena(teo.info[k]), d = k === 'maoEsq' ? -1 : 1;
          [[50, -60, 30, 0], [-10, -110, 22, 20], [80, 20, 18, 10]].forEach(([dx, dy, r, rot], j) =>
            extra += brilho(m[0] + d * dx, m[1] + dy, r * B.clamp(a * 1.6 - j * 0.1), a, d * (rot + 30 * a)));
        }
        return B.quadro(cen.svg + teo.svg + extra);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'pinga') S.colocar(fx, S.SOM.gotinha(), e.t + 0.12, 0.35);
      if (e.tipo === 'esfrega') S.colocar(fx, S.SOM.esfrega(0.12, 1400), e.t, 0.35);
      if (e.tipo === 'mostra') { S.colocar(fx, S.SOM.ding(1568), e.t, 0.08); S.colocar(fx, S.SOM.ding(2093), e.t + 0.1, 0.06); }
    }
    return { fx, amb: S.AMB.banheiro() };
  },
};
