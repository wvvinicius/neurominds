// V28 — Correr no parque. De lado, câmera fixa: corre para a direita, vira e volta correndo para a esquerda.
// Cada repetição (2 s) é uma "ida e volta": começa e termina parado no mesmo lugar, virado para a direita.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { parque } = require('../lib/cenario');
const { r2 } = B;

const XC = 960, A = 380, L = 380, S = 1.45;   // centro, meia distância, comprimento de uma passada completa (px)

// posição, velocidade e distância acumulada (a fase da corrida segue a distância → pé não escorrega)
function trajeto(u) {
  const x = XC - A * Math.cos(2 * Math.PI * u);
  const v = Math.sin(2 * Math.PI * u);                               // -1..1 (relativo)
  const d = u <= 0.5 ? A * (1 - Math.cos(2 * Math.PI * u)) : 2 * A + A * (1 + Math.cos(2 * Math.PI * u));
  return { x, v, d, dir: u < 0.5 ? 1 : -1 };
}
function pose(u, chao) {
  const { x, v, d, dir } = trajeto(u);
  const amp = B.clamp(Math.abs(v) / 0.55);                           // perto da virada, o passo diminui até parar
  const p = 2 * Math.PI * d / L;
  const perna = (ph) => {
    const th = 38 * Math.sin(ph) * amp;
    const dobra = (12 + 80 * Math.max(0, Math.cos(ph)) ** 1.3) * amp;
    return { a1: th, a2: th - dobra };
  };
  const braco = (ph) => { const a = -42 * Math.sin(ph) * amp; return { a1: a + 4, a2: a + 4 + 95 * amp + 20 * (1 - amp) }; };
  const pp = perna(p), pl = perna(p + Math.PI);
  // altura do quadril: o pé mais baixo encosta no chão (com um pulinho entre as passadas)
  const pe = (H, m) => B.chain(H, m.a1, 55, m.a2, 60)[1][1];
  const baixo = Math.max(pe([0, 0], pp), pe([-4, -3], pl));
  const voo = 10 * amp * Math.abs(Math.cos(p));
  const y = chao - (baixo + 21) * S - voo * S;
  return { x, y, dir, amp, p, pp, pl, bp: braco(p + Math.PI), bl: braco(p), baixo, v };
}

module.exports = {
  id: 'V28', slug: 'correr-parque', acao: 'Correr', contexto: 'Correr no parque',
  criar() {
    const cen = parque();
    // passos: quando o pé que está mais baixo troca (som de pisada)
    const eventos = [];
    let ant = null;
    for (let i = -10; i < 720; i++) {
      const t = i / 120, u = ((t % B.CICLO) + B.CICLO) % B.CICLO / B.CICLO, q = pose(u, cen.chao);
      const qual = Math.sin(q.p) > 0 ? 'perto' : 'longe';
      if (ant && qual !== ant && q.amp > 0.25 && t >= 0) eventos.push({ t, tipo: 'passo', forca: q.amp });
      ant = qual;
    }
    [0, 1, 2].forEach(i => eventos.push({ t: (i + 0.5) * B.CICLO - 0.08, tipo: 'vira' }));
    return {
      eventos,
      frame(f) {
        const { t, u } = B.tempo(f);
        const q = pose(u, cen.chao);
        const teo = teoLado({
          x: q.x, y: q.y, s: S, espelhar: q.dir < 0,
          lean: 14 * q.amp, cabeca: -6 * q.amp,
          expr: q.amp > 0.4 ? { base: 'riso' } : 'feliz', piscar: q.amp < 0.4 && B.piscando(t),
          pernaPerto: q.pp, pernaLonge: q.pl, bracoPerto: q.bp, bracoLonge: q.bl,
          sombraY: (cen.chao - q.y) / S, sombraLarg: 70 - 10 * q.amp,
        });
        // poeirinha na virada (nos dois lados do trajeto)
        let po = '';
        for (const [uc, xp] of [[0.5, XC + A + 40], [0, XC - A - 40], [1, XC - A - 40]]) {
          const k = (u - uc + 0.04) / 0.2;
          if (k < 0 || k > 1) continue;
          for (let j = 0; j < 3; j++) {
            const r = (14 + 22 * k) * (1 - 0.2 * j), a = 0.55 * (1 - k);
            const dx = (xp > XC ? 1 : -1) * (j * 34 + 50 * k);
            po += `<circle cx="${r2(xp + dx)}" cy="${r2(cen.chao - r * 0.8 - j * 6)}" r="${r2(r)}" fill="#E8DCC4" stroke="#B8A888" stroke-width="4" opacity="${r2(a)}"/>`;
          }
        }
        return B.quadro(cen.svg + po + teo.svg);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'passo') S.colocar(fx, S.SOM.pisadaFofa(), e.t, 0.35 + 0.25 * e.forca);
      if (e.tipo === 'vira') S.colocar(fx, S.SOM.esfrega(0.25, 1800), e.t, 0.12);
    }
    return { fx, amb: S.AMB.parque() };
  },
};
