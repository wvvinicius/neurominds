// V37 — Cortar a comida no prato (garfo e faca sem ponta). Teo sentado à mesa da cozinha (de lado).
// Cada repetição: segura a panqueca com o garfo e corta com a faca, serrando (2 cortes → 3 pedaços) →
// sorri → com o garfo, pega uma panqueca nova da travessa e põe por cima (volta rápida). A travessa nunca acaba.
const B = require('../lib/base');
const { cozinha } = require('../lib/cenario');
const { sentado } = require('./obj-lote5');
const { OL, r2, tracoSvg: st } = B;

const CORTES = [[0.08, 0.32], [0.38, 0.62]];
const U_PEGA = 0.7, U_POE = 0.86;
const PAN = { rx: 88, ry: 28, cor: '#F2C46D', borda: '#C98A2E' };

function panqueca(cx, cy, esc = 1) {
  return `<g transform="translate(${r2(cx)} ${r2(cy)}) scale(${r2(esc)} ${r2(1 / Math.sqrt(esc))})">
    <ellipse cx="0" cy="6" rx="${PAN.rx}" ry="${PAN.ry}" fill="${PAN.borda}" stroke="${OL}" stroke-width="5"/>
    <ellipse cx="0" cy="0" rx="${PAN.rx}" ry="${PAN.ry}" fill="${PAN.cor}" stroke="${OL}" stroke-width="5"/>
    <ellipse cx="-20" cy="-6" rx="22" ry="7" fill="#F7D891"/>
    <rect x="6" y="-12" width="22" height="13" rx="3" fill="#FFF3B0" stroke="${OL}" stroke-width="3"/></g>`;
}
function faca() {   // origem = mão; aponta para a direita (gira por fora)
  return `<rect x="-14" y="-6" width="30" height="12" rx="6" fill="#2F6BDB" stroke="${OL}" stroke-width="3.5"/>
    <path d="M 16 -4 L 50 -5 Q 60 -2 58 4 L 16 4 Z" fill="#DDE3E8" stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"/>
    ${st('M 24 2 L 50 2', 2, '#9AA3AB')}`;
}
function garfo() {   // origem = mão; aponta para a direita
  return `<rect x="-14" y="-6" width="30" height="12" rx="6" fill="#2F6BDB" stroke="${OL}" stroke-width="3.5"/>
    ${st('M 16 0 L 40 0', 7)}${st('M 16 0 L 40 0', 3, '#DDE3E8')}
    <path d="M 38 -7 L 40 7" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>
    ${st('M 39 -6 L 54 -7 M 40 -2 L 56 -2 M 40 2 L 56 2 M 39 6 L 54 7', 3.5)}`;
}

module.exports = {
  id: 'V37', slug: 'cortar-comida-prato', acao: 'Cortar', contexto: 'Cortar a comida no prato',
  criar() {
    const cen = cozinha();
    const M = sentado({ X: 790, s: 1.7, chao: cen.chao, mesaW: 700, D: 190, mesaX0: 62, corTampo: '#E3B67E' });
    const L = (p) => M.L(p[0], p[1]);
    const P = [M.X + 200, M.Tm + 26];                    // centro da panqueca (cena)
    const PR = [M.X + 318, M.Tm - 44];                   // travessa
    const prato = `<ellipse cx="${P[0]}" cy="${P[1] + 12}" rx="130" ry="42" fill="#000" opacity="0.12"/>
      <ellipse cx="${P[0]}" cy="${P[1] + 6}" rx="126" ry="40" fill="#fff" stroke="${OL}" stroke-width="6"/>
      <ellipse cx="${P[0]}" cy="${P[1] + 6}" rx="96" ry="28" fill="#EEF4F8" stroke="#C9D6DF" stroke-width="3"/>`;
    const travessa = `<ellipse cx="${PR[0]}" cy="${PR[1] + 14}" rx="134" ry="38" fill="#000" opacity="0.10"/>
      <ellipse cx="${PR[0]}" cy="${PR[1] + 8}" rx="128" ry="36" fill="#7CC8FF" stroke="${OL}" stroke-width="6"/>
      ${[0, 1, 2].map(k => panqueca(PR[0], PR[1] - k * 11)).join('')}`;
    const TOPO_PR = [PR[0], PR[1] - 3 * 11];             // onde a panqueca nova está antes de ser pega
    const cx = [P[0] - 30, P[0] + 30];                   // x dos dois cortes
    const meiaAltura = x => PAN.ry * Math.sqrt(Math.max(0, 1 - ((x - P[0]) / PAN.rx) ** 2));
    const linhaCorte = (x, k) => {
      if (k <= 0) return '';
      const h = meiaAltura(x), y0 = P[1] - h, y1 = y0 + 2 * h * Math.min(1, k);
      return st(`M ${r2(x)} ${r2(y0)} L ${r2(x - 3)} ${r2(y1)}`, 8, OL) + st(`M ${r2(x)} ${r2(y0)} L ${r2(x - 3)} ${r2(y1)}`, 3, '#C98A2E') + (k >= 1 ? st(`M ${r2(x - 3)} ${r2(y1)} L ${r2(x - 4)} ${r2(y1 + 7)}`, 6, OL) : '');
    };
    const FACA_V = [32, 30], GARFO_V = [16, 44];          // vetor mão → ponta (cena / s)  — usados para mirar as mãos
    const angF = B.angulo([0, 0], FACA_V), angG = B.angulo([0, 0], GARFO_V);
    const lenF = 55, lenG = 53;
    const maoDaPonta = (ponta, ang, len) => M.paraLocal([ponta[0] - len * M.s * Math.cos(B.rad(ang)), ponta[1] - len * M.s * Math.sin(B.rad(ang))]);
    const GARFO_PONTA = [P[0] - 62, P[1] - 2];            // garfo segurando a panqueca (lado de perto do Teo)

    return {
      eventos: [0, 1, 2].flatMap(i => [
        ...CORTES.flatMap(([a, b]) => [0, 1, 2].map(j => ({ t: (i + a + (b - a) * (j + 0.2) / 3) * B.CICLO, tipo: 'serra', d: (b - a) / 3 * B.CICLO * 0.8 }))),
        { t: (i + 0.65) * B.CICLO, tipo: 'ding' },
        { t: (i + U_POE) * B.CICLO, tipo: 'plof' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        // faca: em cada corte desce pela linha serrando (vai e volta)
        let kc = [0, 0], facaPonta = [cx[0], P[1] - meiaAltura(cx[0]) - 6];
        CORTES.forEach(([a, b], j) => {
          const k = B.clamp((u - a) / (b - a)); kc[j] = k;
          if (u >= a - 0.04 && u <= b) {
            const h = meiaAltura(cx[j]);
            const serra = (u >= a ? Math.sin(k * Math.PI * 6) : 0) * 16;
            facaPonta = [cx[j] - 3 * k + serra * 0.8, P[1] - h + 2 * h * k + serra * 0.2];
            if (u < a) facaPonta = B.lerp([cx[j] + 4, P[1] - h - 30], [cx[j], P[1] - h], B.ease((u - a + 0.04) / 0.04));
          }
        });
        if (u > CORTES[0][1] && u < CORTES[1][0] - 0.04) facaPonta = B.lerp([cx[0] - 3, P[1] + meiaAltura(cx[0])], [cx[1] + 4, P[1] - meiaAltura(cx[1]) - 30], B.ease((u - CORTES[0][1]) / (CORTES[1][0] - 0.04 - CORTES[0][1])));
        const descanso = [cx[0] + 4, P[1] - meiaAltura(cx[0]) - 30];
        if (u < CORTES[0][0] - 0.04) facaPonta = descanso;
        if (u > CORTES[1][1]) facaPonta = B.lerp([cx[1] - 3, P[1] + meiaAltura(cx[1])], descanso, B.ease((u - CORTES[1][1]) / 0.3));
        // garfo: segura → pega a panqueca nova da travessa → põe no prato → volta
        let garfoPonta = GARFO_PONTA, carrega = false, poeK = 0;
        const sobe = [P[0] + 40, PR[1] - 120];
        if (u >= 0.64 && u < U_PEGA) garfoPonta = B.lerp(GARFO_PONTA, [TOPO_PR[0] - 62, TOPO_PR[1] - 2], B.ease((u - 0.64) / (U_PEGA - 0.64)));
        else if (u >= U_PEGA && u < U_POE) {
          carrega = true;
          const k = (u - U_PEGA) / (U_POE - U_PEGA);
          const a = [TOPO_PR[0] - 62, TOPO_PR[1] - 2], c = GARFO_PONTA;
          const q = B.ease(k);
          garfoPonta = [B.mix(a[0], c[0], q), B.mix(a[1], c[1], q) - 45 * Math.sin(Math.PI * q)];
        } else if (u >= U_POE) { poeK = (u - U_POE); garfoPonta = GARFO_PONTA; }
        const nova = u >= U_POE;   // a panqueca nova já cobre os pedaços
        const lean = 10 + 6 * B.bump(u, 0.64, U_POE);
        const pronto = u > 0.62 && u < 0.72;
        const teo = M.teo({
          lean, cabeca: 12 - 8 * (pronto ? 1 : 0),
          bracoPerto: { alvo: maoDaPonta(facaPonta, angF, lenF), dobra: 1 },
          bracoLonge: { alvo: maoDaPonta(garfoPonta, angG, lenG), dobra: 1 },
          expr: pronto ? { base: 'riso' } : (u > 0.05 && u < 0.64 ? { base: 'concentrado', olhar: [5, 7] } : { base: 'feliz', olhar: [5, 6] }),
          piscar: B.piscando(t),
          itensAtras: i => {
            const h = i.aCena(i.maoLonge);
            let s = `<g transform="translate(${r2(-M.X / M.s)} ${r2(-M.Y / M.s)}) scale(${r2(1 / M.s)})">`;
            if (carrega) s += panqueca(garfoPonta[0] + 62, garfoPonta[1] + 2);
            s += `<g transform="translate(${r2(h[0])} ${r2(h[1])}) rotate(${r2(B.angulo(h, garfoPonta))}) scale(1.6)">${garfo()}</g></g>`;
            return s;
          },
          itensFrente: i => {
            const h = i.aCena(i.maoPerto);
            return `<g transform="translate(${r2(-M.X / M.s)} ${r2(-M.Y / M.s)}) scale(${r2(1 / M.s)})"><g transform="translate(${r2(h[0])} ${r2(h[1])}) rotate(${r2(B.angulo(h, facaPonta))}) scale(1.6)">${faca()}</g></g>
              <circle cx="${r2(i.maoPerto[0])}" cy="${r2(i.maoPerto[1])}" r="15" fill="${B.C.skin}" stroke="${OL}" stroke-width="${B.SW}"/>`;
          },
        });
        // prato: panqueca (com os cortes) ou a nova por cima
        let mesa = travessa + prato;
        if (!nova) mesa += panqueca(P[0], P[1]) + linhaCorte(cx[0], kc[0]) + linhaCorte(cx[1], kc[1]);
        else {
          const squash = poeK < 0.06 ? 1 + 0.08 * Math.sin(Math.PI * poeK / 0.06) : 1;
          mesa += panqueca(P[0], P[1], squash);
        }
        return B.quadro(M.montar({ fundo: cen.svg, itensMesa: mesa, teo }));
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'serra') S.colocar(fx, S.SOM.esfrega(e.d, 1800), e.t, 0.3);
      if (e.tipo === 'ding') S.colocar(fx, S.SOM.ding(1568), e.t, 0.12);
      if (e.tipo === 'plof') S.colocar(fx, S.SOM.pisadaFofa(), e.t, 0.5);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
