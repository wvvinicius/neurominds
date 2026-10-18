// V02 — Esperar a mamãe terminar o almoço. Teo sentado à mesa (de lado), prato vazio e garfo.
// A mamãe mexe a panela no fogão ao fundo (não fala).
// Cada repetição: tamborila os dedos na mesa → olha para a mamãe (esperançoso; a barriga ronca) →
// apoia o queixo na mão (suspiro) → volta rápido à pose inicial.
const B = require('../lib/base');
const { cozinha } = require('../lib/cenario');
const { sentado, mamae, vapor, ret } = require('./obj-lote5');
const { OL, r2, tracoSvg: st } = B;

// fogão sobre a bancada da cozinha
function fogao(x0) {
  return `${ret(x0, 470, 300, 330, '#F7F7F7')}${ret(x0 + 30, 560, 240, 170, '#DDE3E8')}${ret(x0 + 60, 590, 180, 80, '#3A4148')}
    ${st(`M ${x0 + 80} 545 L ${x0 + 220} 545`, 8, '#9AA3AB')}
    ${[0, 1, 2, 3].map(i => `<circle cx="${x0 + 50 + i * 66}" cy="510" r="11" fill="#B9C3CC" stroke="${OL}" stroke-width="4"/>`).join('')}
    ${ret(x0 - 6, 452, 312, 22, '#4A5058')}`;
}
function panela(cx, topo) {   // [boca da panela, corpo da frente]
  return [
    `<ellipse cx="${cx}" cy="${topo}" rx="86" ry="18" fill="#E89A3C" stroke="${OL}" stroke-width="6"/>`,
    `<path d="M ${cx - 86} ${topo} L ${cx - 80} ${topo + 78} Q ${cx} ${topo + 92} ${cx + 80} ${topo + 78} L ${cx + 86} ${topo} Q ${cx} ${topo + 18} ${cx - 86} ${topo} Z" fill="#D64545" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
     ${st(`M ${cx + 84} ${topo + 18} L ${cx + 140} ${topo + 10}`, 18)}${st(`M ${cx + 84} ${topo + 18} L ${cx + 140} ${topo + 10}`, 8, '#3A4148')}
     ${st(`M ${cx - 70} ${topo + 30} Q ${cx - 20} ${topo + 40} ${cx + 20} ${topo + 36}`, 6, '#F08080')}`,
  ];
}
// prato vazio (visto de cima, levemente achatado) e garfo deitado ao lado
function prato(cx, cy) {
  return `<ellipse cx="${cx}" cy="${cy + 6}" rx="92" ry="30" fill="#000" opacity="0.12"/>
    <ellipse cx="${cx}" cy="${cy}" rx="88" ry="28" fill="#fff" stroke="${OL}" stroke-width="6"/>
    <ellipse cx="${cx}" cy="${cy}" rx="56" ry="16" fill="#EEF4F8" stroke="#C9D6DF" stroke-width="4"/>`;
}
function garfo(x, y) {   // deitado, cabo para a esquerda
  return `${st(`M ${x} ${y} L ${x + 90} ${y - 4}`, 14)}${st(`M ${x} ${y} L ${x + 90} ${y - 4}`, 6, '#C9D2DA')}
    ${st(`M ${x + 90} ${y - 12} L ${x + 120} ${y - 14} M ${x + 92} ${y - 4} L ${x + 124} ${y - 5} M ${x + 92} ${y + 4} L ${x + 120} ${y + 4}`, 6)}`;
}

// batidinhas dos dedos: duas "rodadas" de 4 dedos
const TAPS = [0.07, 0.1, 0.13, 0.16, 0.22, 0.25, 0.28, 0.31];
const K_OLHA = [[0, 0], [0.34, 0], [0.4, 1], [0.54, 1], [0.6, 0], [1, 0]];
const K_QUEIXO = [[0, 0], [0.55, 0], [0.64, 1], [0.86, 1], [0.95, 0], [1, 0]];

module.exports = {
  id: 'V02', slug: 'esperar-almoco', acao: 'Esperar', contexto: 'Esperar a mamãe terminar o almoço, sentado à mesa',
  criar() {
    const cen = cozinha();
    const M = sentado({ X: 520, s: 1.5, chao: cen.chao, mesaW: 600, D: 130, mesaX0: 72 });
    const PAN = [1640, 434];
    const [panFundo, panFrente] = panela(PAN[0], PAN[1]);
    const PRATO = [M.X + 190 * M.s, M.Tm + 4];
    const mesa = prato(PRATO[0], PRATO[1]) + garfo(PRATO[0] + 100, PRATO[1] + 26);
    const MAO = [96, -50];          // mão da frente apoiada na mesa (local)
    // pose "queixo na mão": calcula onde fica o queixo para mirar a mão
    const poseQ = { lean: 30, cabeca: -10 };
    const queixo = M.teo({ ...poseQ }).info.daCabeca([52, 92]);
    return {
      eventos: [
        ...[0, 1, 2].flatMap(i => [
          ...TAPS.map(u => ({ t: (i + u) * B.CICLO, tipo: 'tap' })),
          { t: (i + 0.42) * B.CICLO, tipo: 'barriga' },
          { t: (i + 0.62) * B.CICLO, tipo: 'suspiro' },
        ]),
      ],
      frame(f) {
        const { t, u } = B.tempo(f);
        const olha = B.kf(K_OLHA, u), q = B.kf(K_QUEIXO, u);
        const tamborila = u > 0.05 && u < 0.34;
        const alvo = B.lerp(MAO, queixo, q);
        let expr;
        if (q > 0.5) expr = { base: 'impaciente', sob: 'triste', olho: 'semi', boca: 'triste', olhar: [4, 2] };
        else if (olha > 0.3) expr = { base: 'surpreso', sob: 'alta', olho: 'aberto', boca: 'fechada', olhar: [6, -7] };
        else expr = { base: 'impaciente', olhar: [3, 7] };
        const teo = M.teo({
          lean: 6 + (poseQ.lean - 6) * q - 4 * olha, cabeca: 4 + (poseQ.cabeca - 4) * q - 12 * olha,
          bracoPerto: { alvo, dobra: 1 }, bracoLonge: { alvo: B.lerp([80, -56], B.add(queixo, [-8, 4]), q), dobra: 1 },
          expr, piscar: B.piscando(t) && q < 0.5, balanco: 0.8 * B.onda(t, 1),
          itensFrente: i => {
            if (q > 0.05) return '';
            // dedinhos sobre a mesa; no tamborilar cada um levanta na sua vez
            const [hx, hy] = i.maoPerto;
            let dedos = '';
            for (let d = 0; d < 4; d++) {
              let lev = 0;
              if (tamborila) TAPS.forEach(tu => { if ((TAPS.indexOf(tu) % 4) === d) lev = Math.max(lev, B.bump(u, tu - 0.035, tu + 0.005)); });
              const bx = hx + 8 + d * 4, by = hy + 6 - d * 2;
              const tip = [bx + 16 - 6 * lev, by + 6 - 17 * lev];
              const dd = `M ${r2(bx)} ${r2(by)} L ${r2(tip[0])} ${r2(tip[1])}`; dedos += st(dd, 14) + st(dd, 7, B.C.skin);
            }
            const linhas = tamborila ? st(`M ${r2(hx + 10)} ${r2(hy - 26)} l 4 -10 M ${r2(hx + 24)} ${r2(hy - 22)} l 8 -8 M ${r2(hx + 34)} ${r2(hy - 12)} l 10 -4`, 4) : '';
            return dedos + linhas;
          },
        });
        // mamãe mexendo a panela (uma volta por segundo)
        const ang = 2 * Math.PI * t;
        const mao = [PAN[0] - 40 + 22 * Math.cos(ang), PAN[1] - 70 + 8 * Math.sin(ang)];
        const colher = st(`M ${r2(mao[0])} ${r2(mao[1])} L ${r2(mao[0] + 10 + 20 * Math.cos(ang))} ${r2(PAN[1] + 30)}`, 10, '#9C6B3F');
        const fundo = cen.svg + fogao(1500) + vapor(PAN[0] + 10, PAN[1] - 20, t) +
          mamae({ x: 1390, chao: 850, k: 1.45, mao, maoLonge: [1470, 660], olhar: [4, 2], piscar: (t % 2) > 1.55 && (t % 2) < 1.67 });
        return B.quadro(M.montar({ fundo: fundo + panFundo + colher + panFrente, itensMesa: mesa, teo }));
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    const ronco = () => S.tom(0.55, t => 90 + 25 * Math.sin(2 * Math.PI * 9 * t), t => Math.sin(Math.PI * t / 0.55) * 0.8, 'triangulo');
    const suspiro = () => S.envelope(S.passaBaixa(S.ruido(0.7), 900), t => Math.sin(Math.PI * t / 0.7) ** 2 * 1.2);
    for (const e of eventos) {
      if (e.tipo === 'tap') S.colocar(fx, S.SOM.toc(), e.t, 0.35);
      if (e.tipo === 'barriga') S.colocar(fx, ronco(), e.t, 0.35);
      if (e.tipo === 'suspiro') S.colocar(fx, suspiro(), e.t, 0.35);
    }
    for (let i = 0; i < 6; i++) S.colocar(fx, S.SOM.esfrega(0.5, 1200), i + 0.2, 0.05);   // colher na panela, bem baixinho
    return { fx, amb: S.AMB.casa() };
  },
};
