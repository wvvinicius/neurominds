// V35 — Passear no parque com o cachorro. De lado, câmera fixa.
// Cada repetição: os dois andam para a direita (cachorro na coleira, um pouco à frente), viram juntos e voltam.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { parque } = require('../lib/cenario');
const { cachorro, passada, vaiVolta } = require('./obj-lote4');
const { OL, r2 } = B;

const s = 1.45, SC = 1.2;
const XA = 720, XB = 1200;                       // quadril do Teo nas pontas
const IDA = [0.05, 0.43], VOLTA = [0.55, 0.93];
const PASSO = 0.5, PASSO_CAO = 0.4;              // períodos (dividem 2 s)
const AMP = [[0, 0.45], [0.06, 1], [0.42, 1], [0.49, 0.45], [0.56, 1], [0.92, 1], [1, 0.45]];

module.exports = {
  id: 'V35', slug: 'passear-cachorro', acao: 'Passear', contexto: 'Passear no parque com o cachorro',
  criar() {
    const cen = parque();
    const Y0 = teoLado.emPe(cen.chao, s);
    // passos: quando cada pé encosta (máximo de a1 = pé à frente), 2 por passada
    const eventos = [];
    for (let k = 0; k < 6 / (PASSO / 2); k++) eventos.push({ t: (k + 0.5) * PASSO / 2 - PASSO / 4 + 0.125, tipo: 'passo' });
    return {
      eventos,
      frame(f) {
        const { t, u } = B.tempo(f);
        const vv = vaiVolta(u, { xa: XA, xb: XB, ida: IDA, volta: VOLTA });
        const amp = B.kf(AMP, u);
        const pa = passada(t / PASSO, { A: 22 * amp, dobra: 36 * amp, braco: 22 * amp });
        const esp = vv.dir < 0;
        // cachorro: sempre um pouco à frente; na virada passa para o outro lado andando
        const xc = vv.x + 225 * B.kf([[0, 1], [0.44, 1], [0.54, -1], [0.94, -1], [1, 1]], u);
        const espCao = u >= 0.44 && u < 0.94;   // vira para o lado em que está andando
        const cao = cachorro({
          x: xc, y: cen.chao + 40, s: SC, pose: 'empe', espelhar: espCao, id: 'cao35',
          fase: t / PASSO_CAO, andando: 0.55 + 0.45 * amp,
          rabo: 14 * B.onda(t, 0.25), lingua: 3 * B.onda(t, 0.2), orelha: 8 * B.onda(t, PASSO_CAO), cabeca: 3 * B.onda(t, PASSO_CAO),
        });
        const teo = teoLado({
          x: vv.x, y: Y0 + pa.desce * s, s, espelhar: esp, lean: 4,
          pernaPerto: pa.pernaPerto, pernaLonge: pa.pernaLonge,
          bracoPerto: { alvo: [46, -36 + 3 * B.onda(t, PASSO / 2)], dobra: 1 }, bracoLonge: pa.bracoLonge,
          expr: 'feliz', piscar: B.piscando(t), cabeca: 2 * B.onda(t, PASSO / 2),
          sombraY: pa.sombraY,
        });
        // guia: da mão do Teo até a coleira, com uma barriguinha
        const m = teo.info.aCena(teo.info.maoPerto), c = cao.info.coleira;
        const meio = [(m[0] + c[0]) / 2, (m[1] + c[1]) / 2 + 18];
        const guia = `<path d="M ${r2(m[0])} ${r2(m[1])} Q ${r2(meio[0])} ${r2(meio[1])} ${r2(c[0])} ${r2(c[1])}" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round"/>
          <path d="M ${r2(m[0])} ${r2(m[1])} Q ${r2(meio[0])} ${r2(meio[1])} ${r2(c[0])} ${r2(c[1])}" fill="none" stroke="#E63946" stroke-width="6" stroke-linecap="round"/>
          <circle cx="${r2(m[0])}" cy="${r2(m[1])}" r="${r2(15 * s)}" fill="${B.C.skin}" stroke="${OL}" stroke-width="${r2(6 * s)}"/>`;
        return B.quadro(cen.svg + teo.svg + cao.svg + guia);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (let k = 0; k < 24; k++) {
      const t = k * 0.25 + 0.06, u = (t % 2) / 2;
      const andando = (u > 0.05 && u < 0.45) || (u > 0.55 && u < 0.95);
      S.colocar(fx, S.SOM.passo(), t, andando ? 0.5 : 0.25);
    }
    for (let k = 0; k < 30; k++) S.colocar(fx, S.SOM.pisadaFofa(), k * 0.2 + 0.03, 0.12);
    return { fx, amb: S.AMB.parque() };
  },
};
