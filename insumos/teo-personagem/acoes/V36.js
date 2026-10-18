// V36 — Cortar papel com tesoura sem ponta. Teo sentado à mesa (de lado).
// Cada repetição: segura uma tira de papel colorido pendurada e corta 3 pedaços de baixo para cima ("snip, snip, snip"),
// que caem num cestinho → solta o último pedacinho no cesto → pega uma tira nova da pilha (volta rápida).
// Cores das tiras: vermelha → azul → verde (a pilha mostra sempre a próxima).
const B = require('../lib/base');
const { sala } = require('../lib/cenario');
const { sentado } = require('./obj-lote5');
const { OL, r2, tracoSvg: st } = B;

const CORES = ['#E63946', '#2F6BDB', '#5DAE5B'];
const cor = i => CORES[((i % 3) + 3) % 3];
const SNIPS = [0.2, 0.37, 0.54];
const PECA = 26, XT = 86, Y0 = -152;                 // tira vertical (local): x = XT, de Y0 até Y0 + 4 pedaços
const QUEDA = 0.2;                                    // duração da queda (fração do ciclo)
const U_SOLTA = 0.66, U_PEGA = 0.8;

function tesoura(abre) {   // origem = mão; aponta para a direita
  const a = 4 + 30 * abre;
  const lamina = (sg) => `<g transform="translate(14 0) rotate(${r2(sg * a / 2)})">
      <path d="M 0 -5 L 28 -4 Q 35 0 28 4 L 0 5 Z" fill="#C9D2DA" stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"/></g>`;
  const cabo = (sg) => `<g transform="translate(14 0) rotate(${r2(-sg * a / 2)})">
      <ellipse cx="-16" cy="${sg * 6}" rx="10" ry="7" fill="none" stroke="${OL}" stroke-width="8"/><ellipse cx="-16" cy="${sg * 6}" rx="10" ry="7" fill="none" stroke="#F28C28" stroke-width="4"/></g>`;
  return cabo(1) + cabo(-1) + lamina(-1) + lamina(1) + `<circle cx="14" cy="0" r="3" fill="${OL}"/>`;
}
function tira(n, c) {   // n pedaços pendurados a partir de Y0 (com linhas tracejadas de corte)
  if (n <= 0) return '';
  let tr = '';
  for (let k = 1; k < n; k++) tr += `M ${XT - 12} ${Y0 + k * PECA} L ${XT + 12} ${Y0 + k * PECA} `;
  return `<rect x="${XT - 13}" y="${Y0}" width="26" height="${n * PECA}" fill="${c}" stroke="${OL}" stroke-width="3"/>` +
    (tr ? `<path d="${tr}" stroke="#fff" stroke-width="2" stroke-dasharray="3 3" opacity="0.85"/>` : '');
}

module.exports = {
  id: 'V36', slug: 'cortar-papel-tesoura', acao: 'Cortar', contexto: 'Cortar papel com tesoura sem ponta',
  criar() {
    const cen = sala();
    const M = sentado({ X: 820, s: 1.7, chao: cen.chao, mesaW: 620, D: 170, mesaX0: 62, corTampo: '#E3B67E' });
    const L = (p) => M.L(p[0], p[1]);
    // cesto bem embaixo da tira; pilha de tiras novas mais ao fundo
    const bx = L([XT, 0])[0];
    const CESTO = { cx: bx, y: M.Tm + 64, rx: 62, h: 62 };
    const boca = CESTO.y - CESTO.h;
    const cestoAtras = `<ellipse cx="${CESTO.cx}" cy="${boca}" rx="${CESTO.rx}" ry="15" fill="#7A4A22" stroke="${OL}" stroke-width="5"/>`;
    const cestoFrente = `<ellipse cx="${CESTO.cx}" cy="${CESTO.y + 4}" rx="${CESTO.rx}" ry="10" fill="#000" opacity="0.12"/>
      <path d="M ${CESTO.cx - CESTO.rx} ${boca} L ${CESTO.cx - CESTO.rx + 10} ${CESTO.y} Q ${CESTO.cx} ${CESTO.y + 14} ${CESTO.cx + CESTO.rx - 10} ${CESTO.y} L ${CESTO.cx + CESTO.rx} ${boca} Q ${CESTO.cx} ${boca + 15} ${CESTO.cx - CESTO.rx} ${boca} Z" fill="#E0A84F" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
      ${st(`M ${CESTO.cx - CESTO.rx + 6} ${boca + 22} Q ${CESTO.cx} ${boca + 36} ${CESTO.cx + CESTO.rx - 6} ${boca + 22} M ${CESTO.cx - CESTO.rx + 8} ${CESTO.y - 20} Q ${CESTO.cx} ${CESTO.y - 6} ${CESTO.cx + CESTO.rx - 8} ${CESTO.y - 20}`, 4, '#B07D45')}`;
    const PILHA = [M.X + 150 * M.s, M.Tm - 40];
    const pilha = (topo) => [2, 1, 0].map(k => `<g transform="translate(${PILHA[0] + k * 5} ${PILHA[1] + k * 8}) skewX(-30)"><rect x="-60" y="-9" width="120" height="16" fill="${cor(topo + k)}" stroke="${OL}" stroke-width="3"/></g>`).join('');
    const clip = `<clipPath id="cc"><rect x="0" y="0" width="${B.W}" height="${r2(boca + 6)}"/></clipPath>`;
    // posições da mão de trás (local)
    const SEGURA = [XT - 6, Y0 - 4];
    const SOLTA = [XT - 6, -60];
    const PEGA = [(PILHA[0] - M.X) / M.s - 18, (PILHA[1] - M.Y) / M.s - 4];

    return {
      eventos: [0, 1, 2].flatMap(i => [
        ...SNIPS.map(su => ({ t: (i + su) * B.CICLO, tipo: 'snip' })),
        { t: (i + U_SOLTA) * B.CICLO, tipo: 'solta' },
        { t: (i + U_PEGA) * B.CICLO, tipo: 'pega' },
      ]),
      frame(f) {
        const { t, u, rep } = B.tempo(f);
        const nCort = SNIPS.filter(su => u >= su).length;
        // tesoura: sobe até o próximo ponto de corte (aberta) e fecha no snip
        const yCorte = k => Y0 + PECA * (3 - k);
        let yT = yCorte(0), abre = 1;
        if (u < SNIPS[0]) { yT = yCorte(0); abre = B.clamp((u - 0.06) / 0.06) * (1 - B.clamp((u - SNIPS[0] + 0.04) / 0.04)); }
        for (let k = 1; k < 3; k++) if (u >= SNIPS[k - 1] && u < SNIPS[k]) {
          yT = B.mix(yCorte(k - 1), yCorte(k), B.ease((u - SNIPS[k - 1]) / 0.07));
          abre = B.clamp((u - SNIPS[k - 1] - 0.02) / 0.05) * (1 - B.clamp((u - SNIPS[k] + 0.04) / 0.04));
        }
        if (u >= SNIPS[2]) { yT = B.mix(yCorte(2), yCorte(0), B.ease((u - 0.62) / 0.3)); abre = B.clamp((u - 0.9) / 0.08); }
        const maoTes = [XT - 30, yT + 2];
        // mão de trás: segura a tira → desce e solta o último pedaço no cesto → pega tira nova na pilha → sobe
        let maoT = SEGURA, nTira = 4 - nCort, dTira = [0, 0];
        if (u >= 0.58 && u < U_SOLTA) maoT = B.lerp(SEGURA, SOLTA, B.ease((u - 0.58) / (U_SOLTA - 0.58)));
        else if (u >= U_SOLTA && u < U_PEGA) { maoT = B.lerp(SOLTA, PEGA, B.ease((u - U_SOLTA - 0.02) / (U_PEGA - U_SOLTA - 0.02))); nTira = 0; }
        else if (u >= U_PEGA) { const k = B.ease((u - U_PEGA - 0.01) / (0.96 - U_PEGA)); maoT = [B.mix(PEGA[0], SEGURA[0], k), B.mix(PEGA[1], SEGURA[1], Math.sqrt(k))]; nTira = 4; }
        dTira = [maoT[0] - SEGURA[0], maoT[1] - SEGURA[1]];
        const corT = u >= U_PEGA ? cor(rep + 1) : cor(rep);
        // tira nova: sai deitada da pilha e vai ficando pendurada
        let tiraSvg = '';
        if (nTira > 0) {
          const deitada = u >= U_PEGA ? 1 - B.ease((u - U_PEGA - 0.05) / 0.1) : 0;
          tiraSvg = `<g transform="translate(${r2(dTira[0])} ${r2(dTira[1])}) rotate(${r2(-88 * deitada)} ${SEGURA[0] + 6} ${SEGURA[1] + 4})">${tira(nTira, corT)}</g>`;
        }
        const cortando = u > 0.06 && u < 0.58;
        const teo = M.teo({
          lean: 6 + 14 * B.bump(u, U_SOLTA, U_PEGA + 0.08), cabeca: 6,
          bracoPerto: { alvo: maoTes, dobra: 1 }, bracoLonge: { alvo: maoT, dobra: 1 },
          expr: cortando ? { base: 'concentrado', olhar: [6, 0] } : { base: 'feliz', olhar: [6, 3] }, piscar: B.piscando(t),
          itensMeio: tiraSvg,
          itensFrente: i => `<g transform="translate(${r2(i.maoPerto[0])} ${r2(i.maoPerto[1])}) rotate(-6)">${tesoura(abre)}</g>
            <circle cx="${r2(i.maoPerto[0])}" cy="${r2(i.maoPerto[1])}" r="15" fill="${B.C.skin}" stroke="${OL}" stroke-width="${B.SW}"/>`,
        });
        // pedaços caindo (inclui os do ciclo anterior, para o loop)
        let pecas = '';
        for (let c = -1; c <= B.REPETICOES; c++) {
          const quedas = [...SNIPS.map((su, k) => [su, yCorte(k) + PECA / 2, k]), [U_SOLTA, SOLTA[1] + 4 + PECA / 2, 3]];
          quedas.forEach(([su, yc, k]) => {
            const idade = (t / B.CICLO) - (c + su);
            if (idade < 0 || idade > QUEDA) return;
            const q = idade / QUEDA;
            const p0 = L([XT, yc]);
            const y = p0[1] + (boca + 40 - p0[1]) * q * q, x = p0[0] + (k - 1.5) * 14 * q;
            pecas += `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${r2(90 * q * (k % 2 ? 1 : -1))})"><rect x="${-13 * M.s}" y="${-PECA * M.s / 2}" width="${26 * M.s}" height="${PECA * M.s}" fill="${cor(c)}" stroke="${OL}" stroke-width="5"/></g>`;
          });
        }
        const mesa = clip + pilha(u >= U_PEGA ? rep + 2 : rep + 1) + cestoAtras + cestoFrente;
        return B.quadro(M.montar({ fundo: cen.svg, itensMesa: mesa, teo, depois: `<g clip-path="url(#cc)">${pecas}</g>` }));
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'snip') { S.colocar(fx, S.SOM.snip(), e.t, 0.8); S.colocar(fx, S.SOM.papel(0.08), e.t + 0.02, 0.2); }
      if (e.tipo === 'solta') S.colocar(fx, S.SOM.papel(0.12), e.t + 0.2, 0.2);
      if (e.tipo === 'pega') S.colocar(fx, S.SOM.papel(0.3), e.t, 0.4);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
