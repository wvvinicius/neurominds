// V13 — Escovar o pelo do cachorro. De lado, na sala: o cachorro sentado e o Teo ajoelhado atrás dele.
// Cada repetição: encosta a escova no pescoço, faz uma passada longa pelas costas até o quadril
// (saem tufinhos de pelo), levanta a escova e volta rápido para o pescoço. O cachorro abana o rabo.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { sala } = require('../lib/cenario');
const { cachorro, tufo } = require('./obj-lote4');
const { OL, r2 } = B;

const s = 1.5, SC = 1.75;                 // escala do Teo e do cachorro
const XC = 1250;                         // cachorro (centro, no chão)
const K = [[0, 0], [0.1, 0], [0.62, 0.86], [0.78, 0.5], [0.92, 0], [1, 0]];        // posição ao longo das costas (0 = pescoço)
const ENCOSTA = [[0, 0], [0.06, 0], [0.12, 1], [0.6, 1], [0.68, 0], [1, 0]];       // 1 = escova encostada
const TUFOS = [0.2, 0.28, 0.36, 0.44, 0.52];                                        // u em que solta um tufinho

function escova() {
  // referencial da escova: origem na mão, +x = sentido da passada, +y = para dentro do pelo
  const cerdas = Array.from({ length: 9 }, (_, i) => `M ${-36 + i * 9} 34 L ${-36 + i * 9} 48`).join(' ');
  return `
    <path d="${cerdas}" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="${cerdas}" stroke="#F4F1EA" stroke-width="3" stroke-linecap="round"/>
    <rect x="-46" y="10" width="92" height="28" rx="13" fill="#E26D5A" stroke="${OL}" stroke-width="6"/>
    <rect x="-30" y="14" width="40" height="7" rx="3" fill="#F29A8A"/>`;
}

module.exports = {
  id: 'V13', slug: 'escovar-cachorro', acao: 'Escovar', contexto: 'Escovar o pelo do cachorro',
  criar() {
    const cen = sala({ quadro: true });
    const Y = teoLado.emPe(cen.chao, s);
    const X = 900;
    const cao0 = cachorro({ x: XC, y: cen.chao, s: SC, pose: 'sentado' }).info;
    // ponto das costas e normal (para fora), em cena
    const costa = k => {
      const p = cao0.costas(k), a = cao0.costas(k - 0.01), b = cao0.costas(k + 0.01);
      const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty);
      let n = [ty / l, -tx / l]; if (n[1] > 0) n = [-n[0], -n[1]];
      return { p, n };
    };
    const estado = u => {
      const k = B.kf(K, u), enc = B.kf(ENCOSTA, u);
      const { p, n } = costa(k);
      const afasta = 62 + 38 * (1 - enc);              // distância da mão até o pelo (cena)
      const mao = [p[0] + n[0] * afasta, p[1] + n[1] * afasta];
      const ang = B.deg(Math.atan2(n[0], -n[1]));
      return { k, enc, p, n, mao, ang };
    };
    return {
      eventos: [0, 1, 2].map(i => ({ t: (i + 0.12) * B.CICLO, tipo: 'escova', dur: 0.48 * B.CICLO })),
      frame(f) {
        const { t, u } = B.tempo(f);
        const e = estado(u);
        const loc = q => [(q[0] - X) / s, (q[1] - Y) / s];
        const lean = 8 + 26 * e.k;
        const contente = B.kf([[0, 0.3], [0.15, 1], [0.7, 1], [0.95, 0.3], [1, 0.3]], u);
        const cao = cachorro({
          x: XC, y: cen.chao, s: SC, pose: 'sentado',
          rabo: (8 + 16 * contente) * B.onda(t, 0.25), olho: e.enc > 0.5 ? 'feliz' : 'aberto',
          cabeca: -6 * contente + 2 * B.onda(t, 1), orelha: 4 * B.onda(t, 0.5), lingua: 3 * B.onda(t, 0.25),
        });
        const teo = teoLado({
          x: X, y: Y, s, lean, cabeca: 4 - 6 * e.k,
          pernaPerto: { alvo: [22, 114.7], dobra: -1 },
          pernaLonge: { alvo: [-24, 111.7], dobra: -1 },
          bracoPerto: { alvo: loc(e.mao), dobra: 1 },
          bracoLonge: { alvo: [40, -44], dobra: 1 },
          expr: e.enc > 0.5 ? { base: 'feliz', olhar: [3, 4] } : 'feliz', piscar: B.piscando(t),
          
          itensFrente: i => `<g transform="translate(${r2(i.maoPerto[0])} ${r2(i.maoPerto[1])}) rotate(${r2(e.ang)}) scale(${r2(1 / s * SC)})">${escova()}</g>
            <circle cx="${r2(i.maoPerto[0])}" cy="${r2(i.maoPerto[1])}" r="15" fill="${B.C.skin}" stroke="${OL}" stroke-width="6"/>`,
        });
        // tufinhos de pelo: nascem na escova durante a passada, sobem um pouco e caem flutuando
        let tufos = '';
        for (let c = -1; c < B.REPETICOES; c++) TUFOS.forEach((un, j) => {
          const idade = t - (c + un) * B.CICLO, vida = 1.5;
          if (idade < 0 || idade > vida) return;
          const q = estado(un), base = [q.p[0] + q.n[0] * 8, q.p[1] + q.n[1] * 8];
          const kk = idade / vida;
          const x = base[0] - 50 * kk + 22 * Math.sin(idade * 5 + j * 1.7);
          const y = base[1] - 50 * Math.sin(Math.min(1, kk * 2) * Math.PI / 2) + 260 * Math.max(0, kk - 0.3) ** 1.4;
          tufos += tufo(x, y, 30 * Math.sin(idade * 4 + j), Math.min(1, idade * 6) * (1 - kk ** 3), 1.3);
        });
        return B.quadro(cen.svg + cao.svg + teo.svg + tufos);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      S.colocar(fx, S.SOM.esfrega(e.dur, 1800), e.t, 0.35);
      S.colocar(fx, S.SOM.esfrega(e.dur * 0.6, 2600), e.t + e.dur * 0.3, 0.15);
    }
    // batidinhas do rabo no chão (o cachorro abana feliz)
    for (let k = 0; k < 24; k++) S.colocar(fx, S.SOM.pisadaFofa(), k * 0.25 + 0.06, 0.05);
    return { fx, amb: S.AMB.casa() };
  },
};
