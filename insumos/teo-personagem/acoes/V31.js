// V31 — Carregar objetos: uma caixa de brinquedos pesada. De lado, no quarto, câmera fixa.
// Cada repetição: dá uma ajeitada na caixa ("upa!"), anda com passinhos pesados para a direita,
// vira, ajeita de novo e volta. Corpo para trás, língua de fora e gotinhas de suor: esforço engraçado.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { quarto } = require('../lib/cenario');
const { passada, vaiVolta } = require('./obj-lote4');
const { OL, r2, tracoSvg: st } = B;

const s = 1.5;
const XA = 700, XB = 1110;
const IDA = [0.1, 0.44], VOLTA = [0.6, 0.94];
const PASSO = 0.5;
const AMP = [[0, 0.3], [0.1, 1], [0.43, 1], [0.5, 0.3], [0.6, 1], [0.93, 1], [1, 0.3]];

// caixa de brinquedos em coordenadas locais do Teo; (cx, cy) = centro da face lateral
function caixa(cx, cy, rot) {
  return `<g transform="translate(${r2(cx)} ${r2(cy)}) rotate(${r2(rot)}) scale(1.15)">
    <circle cx="-30" cy="-52" r="22" fill="#2F6BDB" stroke="${OL}" stroke-width="5"/>${st('M -50 -56 Q -30 -44 -10 -56', 4, '#fff')}
    <circle cx="22" cy="-58" r="13" fill="#B07A4A" stroke="${OL}" stroke-width="5"/><circle cx="44" cy="-58" r="13" fill="#B07A4A" stroke="${OL}" stroke-width="5"/>
    <circle cx="33" cy="-44" r="22" fill="#B07A4A" stroke="${OL}" stroke-width="5"/>
    <rect x="-8" y="-66" width="24" height="24" rx="3" fill="#FFC93C" stroke="${OL}" stroke-width="4" transform="rotate(15 4 -54)"/>
    <rect x="-70" y="-42" width="140" height="96" rx="8" fill="#E63946" stroke="${OL}" stroke-width="6"/>
    <rect x="-70" y="-42" width="140" height="20" rx="6" fill="#C92F3B" stroke="${OL}" stroke-width="5"/>
    <path d="M -14 8 L -4 -2 L 6 8 L -4 18 Z" fill="#FFE066" stroke="${OL}" stroke-width="4"/>
    <circle cx="36" cy="14" r="10" fill="#7CC8FF" stroke="${OL}" stroke-width="4"/>
    <circle cx="-44" cy="20" r="8" fill="#5DAE5B" stroke="${OL}" stroke-width="4"/></g>`;
}

module.exports = {
  id: 'V31', slug: 'carregar-caixa', acao: 'Carregar', contexto: 'Carregar objetos (caixa de brinquedos)',
  criar() {
    const cen = quarto();
    const Y0 = teoLado.emPe(cen.chao, s);
    const eventos = [];
    for (let i = 0; i < 3; i++) {
      eventos.push({ t: (i + 0.04) * B.CICLO, tipo: 'upa' }, { t: (i + 0.53) * B.CICLO, tipo: 'upa' });
    }
    return {
      eventos,
      frame(f) {
        const { t, u } = B.tempo(f);
        const vv = vaiVolta(u, { xa: XA, xb: XB, ida: IDA, volta: VOLTA });
        const amp = B.kf(AMP, u);
        const pa = passada(t / PASSO, { A: 17 * amp, dobra: 30 * amp, braco: 0 });
        // "upa!": ajeita a caixa nas pausas (0.0–0.1 e 0.5–0.6)
        const upa = B.bump(u, 0.0, 0.1) + B.bump(u, 0.49, 0.6);
        const balanco = Math.sin(2 * Math.PI * t / PASSO) * amp;      // ginga de um lado para o outro
        const lean = -10 + 3 * balanco - 4 * upa;
        const cx = 100, cy = -42 - 26 * upa;
        const rot = 4 * balanco;
        const maoP = [cx - 10, cy + 8], maoL = [cx + 12, cy + 4];
        const agacha = 6 * upa;
        const teo = teoLado({
          x: vv.x, y: Y0 + (pa.desce + agacha) * s, s, espelhar: vv.dir < 0, lean,
          cabeca: -6 + 4 * balanco,
          pernaPerto: pa.pernaPerto, pernaLonge: pa.pernaLonge,
          bracoPerto: { alvo: maoP, dobra: 1 }, bracoLonge: { alvo: maoL, dobra: 1 },
          expr: upa > 0.3 ? 'esforco' : { base: 'esforco', olho: 'aberto', boca: 'lingua', suor: true, olhar: [4, -2] },
          sombraY: pa.sombraY - agacha,
          itensMeio: caixa(cx, cy, rot),
        });
        // gotinhas de suor que pulam da cabeça a cada "upa"
        let gotas = '';
        for (let c = -1; c < B.REPETICOES; c++) [0.04, 0.53].forEach((un, j) => {
          const idade = t - (c + un) * B.CICLO;
          if (idade < 0 || idade > 0.7) return;
          const k = idade / 0.7, h = teo.info.aCena(teo.info.daCabeca([-60, -120]));
          const dir = (un < 0.5 ? 1 : -1);
          gotas += [-1, 1].map(lr => B.gota(h[0] + lr * 70 * k * dir - 20 * dir, h[1] - 90 * Math.sin(Math.PI * k) + 120 * k * k, 1.6, '#9EDCFF')).join('');
          void j;
        });
        return B.quadro(cen.svg + teo.svg + gotas);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) { S.colocar(fx, S.SOM.vush(0.3), e.t, 0.25); S.colocar(fx, S.SOM.dado(), e.t + 0.12, 0.2); }
    for (let k = 0; k < 24; k++) {
      const t = k * 0.25 + 0.06, u = (t % 2) / 2;
      const andando = (u > 0.1 && u < 0.44) || (u > 0.6 && u < 0.94);
      if (andando) { S.colocar(fx, S.SOM.pisadaFofa(), t, 0.6); S.colocar(fx, S.SOM.passo(), t, 0.25); }
    }
    return { fx, amb: S.AMB.casa() };
  },
};
