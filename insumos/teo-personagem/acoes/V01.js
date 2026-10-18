// V01 — Esperar o carro chegar. De frente, na calçada da rua. O carro não chega.
// Cada repetição (2 s): olha para o lado da rua com a mão na testa, bate o pé (2 batidas) e suspira.
const B = require('../lib/base');
const { teoFrente } = require('../lib/teo');
const { rua } = require('../lib/cenario');
const { OL, r2 } = B;

function bafo(x, y, k) {
  // nuvenzinha do suspiro: sai da boca, cresce e some
  const s = 0.8 + 1.0 * k, a = k < 0.12 ? k / 0.12 : 1 - Math.pow((k - 0.12) / 0.88, 2);
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s)})" opacity="${r2(0.9 * a)}">
    <path d="M -30 10 Q -44 -6 -26 -16 Q -22 -34 0 -28 Q 18 -40 30 -22 Q 48 -16 38 4 Q 40 18 20 16 Q 0 26 -14 16 Q -32 24 -30 10 Z" fill="#fff" stroke="#8FA0AC" stroke-width="5"/></g>`;
}
function placa(x, chao) {
  // poste com placa de ponto de embarque (só desenho, sem texto)
  return `<rect x="${x - 8}" y="${chao - 420}" width="16" height="420" fill="#8A8F98" stroke="${OL}" stroke-width="5"/>
    <rect x="${x - 60}" y="${chao - 520}" width="120" height="110" rx="14" fill="#2F6BDB" stroke="${OL}" stroke-width="6"/>
    <rect x="${x - 34}" y="${chao - 490}" width="68" height="34" rx="8" fill="#fff" stroke="${OL}" stroke-width="4"/>
    <circle cx="${x - 20}" cy="${chao - 450}" r="9" fill="${OL}"/><circle cx="${x + 20}" cy="${chao - 450}" r="9" fill="${OL}"/>`;
}

module.exports = {
  id: 'V01', slug: 'esperar-carro', acao: 'Esperar', contexto: 'Esperar o carro chegar, na calçada',
  criar() {
    const cen = rua();
    const s = 1.4, X = 1000, Y0 = teoFrente.emPe(cen.chao, s);
    // 0 = em pé, solto | olha: 0..1 vira para a rua (esquerda da tela) com a mão na testa
    const OLHA = [[0, 0], [0.08, 0], [0.18, 1], [0.36, 1], [0.44, 0], [1, 0]];
    const CINT = [[0, 0], [0.36, 0], [0.44, 1], [0.62, 1], [0.7, 0], [1, 0]];         // mãos na cintura
    const INSP = [[0, 0], [0.62, 0], [0.71, 1], [0.74, 1], [0.86, -1], [0.93, -1], [1, 0]];   // 1 = enche o peito, -1 = murcha
    const TAPS = [0.47, 0.57];
    return {
      eventos: [0, 1, 2].flatMap(i => [
        ...TAPS.map(u => ({ t: (i + u) * B.CICLO, tipo: 'tap' })),
        { t: (i + 0.73) * B.CICLO, tipo: 'suspiro' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const olha = B.kf(OLHA, u), cint = B.kf(CINT, u), insp = B.kf(INSP, u);
        const tap = TAPS.reduce((a, tu) => a + B.bump(u, tu - 0.05, tu + 0.005), 0);
        const murcha = Math.max(0, -insp), enche = Math.max(0, insp);
        // braço direito (da tela): solto → mão na testa (olhar) → cintura
        const soltoD = [70, -60 + 120], soltoE = [-70, 60];
        const testaD = [92, -40], cintD = [76, -62], cintE = [-76, -62];
        const mD = B.lerp(B.lerp(soltoD, testaD, olha), cintD, cint);
        const mE = B.lerp(B.lerp(soltoE, [-96, -30], olha), cintE, cint);
        // suspiro: os ombros sobem e depois caem; braços acompanham um pouco
        mD[1] += -14 * enche + 10 * murcha; mE[1] += -14 * enche + 10 * murcha;
        const expr = olha > 0.5 ? { base: 'impaciente', olhar: [-10, 1], sob: 'foco' }
          : murcha > 0.3 ? { base: 'impaciente', olho: 'fechado', boca: 'o' }
          : enche > 0.3 ? { base: 'impaciente', olho: 'aberto', boca: 'fechada', olhar: [0, -6] }
          : 'impaciente';
        const teo = teoFrente({
          x: X - 14 * olha * s, y: Y0 - 8 * enche * s + 6 * murcha * s, s,
          lean: -8 * olha + 3 * murcha, cabeca: -12 * olha + 8 * murcha - 4 * enche,
          expr, piscar: olha < 0.5 && murcha < 0.3 && B.piscando(t),
          bracoDir: { alvo: mD, dobra: 1 }, bracoEsq: { alvo: mE, dobra: -1 },
          pernaDir: { alvo: [31 + 14 * olha, 92 - 8 * enche + 6 * murcha - 22 * tap], dobra: -1 },
          pernaEsq: { alvo: [-31 + 14 * olha, 92 - 8 * enche + 6 * murcha], dobra: 1 },
        });
        // nuvenzinha do suspiro (de cada ciclo; só existe dentro do próprio ciclo)
        let fx = '';
        const idade = u - 0.74;
        if (idade > 0 && idade < 0.24) {
          const b = teo.info.aCena(teo.info.boca);
          fx = bafo(b[0] + 40 + 500 * idade, b[1] + 30 - 120 * idade, idade / 0.24);
        }
        return B.quadro(cen.svg + placa(1560, cen.chao - 40) + teo.svg + fx);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    const suspiro = () => S.envelope(S.passaFaixa(S.ruido(0.7), t => 900 - 500 * t, 0.8), t => Math.sin(Math.PI * t / 0.7) ** 1.5 * 1.2);
    for (const e of eventos) {
      if (e.tipo === 'tap') S.colocar(fx, S.SOM.passo(), e.t, 0.6);
      if (e.tipo === 'suspiro') S.colocar(fx, suspiro(), e.t, 0.4);
    }
    return { fx, amb: S.AMB.rua() };
  },
};
