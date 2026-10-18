// V27 — Pintar a parede com rolo. Teo em pé (de lado) ao lado de um pedaço de parede marcado com fita crepe.
// Cada repetição: passa o rolo de cima a baixo (vai agachando) e a nova cor cobre a anterior → confere →
// molha o rolo na bandeja (a próxima cor) → sobe rápido.  Cores: branco → azul → verde → branco (a 3ª volta ao início).
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { sala } = require('../lib/cenario');
const { ret } = require('./obj-lote5');
const { OL, r2, tracoSvg: st } = B;

const CORES = ['#FFFFFF', '#4FA3F7', '#5DC26A'];       // cor da parede ANTES da repetição 0, 1, 2
const corDe = (i) => CORES[((i % 3) + 3) % 3];
const P = { x0: 1100, x1: 1240, y0: 330, y1: 700 };     // pedaço de parede
const RC = (P.x0 + P.x1) / 2, RL = P.x1 - P.x0, RR = 18; // rolo: centro x, comprimento, raio
const TOPO = P.y0 + RR, BASE = P.y1 - RR;
const BANDEJA = [1080, 872];
// fases
const DESCE = [0.06, 0.6], OLHA = [0.6, 0.7], MOLHA = [0.72, 0.84], SOBE = [0.86, 0.99];

module.exports = {
  id: 'V27', slug: 'pintar-parede-rolo', acao: 'Pintar', contexto: 'Pintar a parede com rolo',
  criar() {
    const cen = sala({ quadro: false });
    const s = 1.5, X = 820, Y0 = teoLado.emPe(cen.chao, s);
    const PE_PERTO = [5.75, 114.7], PE_LONGE = [-9.75, 111.7];
    const fita = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F3D27A" stroke="${OL}" stroke-width="3" opacity="0.95"/>`;
    const moldura = fita(P.x0 - 14, P.y0 - 14, RL + 28, 14) + fita(P.x0 - 14, P.y1, RL + 28, 14) + fita(P.x0 - 14, P.y0 - 14, 14, P.y1 - P.y0 + 28) + fita(P.x1, P.y0 - 14, 14, P.y1 - P.y0 + 28);
    const bandejaSvg = `<path d="M ${BANDEJA[0] - 80} ${cen.chao - 6} L ${BANDEJA[0] - 70} ${BANDEJA[1] - 12} L ${BANDEJA[0] + 86} ${BANDEJA[1] - 24} L ${BANDEJA[0] + 86} ${cen.chao - 6} Z" fill="#8A8F98" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      ${st(`M ${BANDEJA[0] - 60} ${BANDEJA[1] - 2} L ${BANDEJA[0] + 70} ${BANDEJA[1] - 12}`, 4, '#B9C3CC')}
      <ellipse cx="${BANDEJA[0] + 4}" cy="${cen.chao - 4}" rx="100" ry="9" fill="#000" opacity="0.12"/>`;
    const rolo = (c, cor, ang) => `
      ${st(`M ${r2(c[0] - RL / 2 + 10)} ${r2(c[1])} L ${r2(c[0] - RL / 2 - 8)} ${r2(c[1])}`, 8, '#5E6670')}
      <rect x="${r2(c[0] - RL / 2)}" y="${r2(c[1] - RR)}" width="${RL}" height="${2 * RR}" rx="${RR}" fill="${cor}" stroke="${OL}" stroke-width="6"/>
      ${st(`M ${r2(c[0] - RL / 2 + 14)} ${r2(c[1] - 6)} L ${r2(c[0] + RL / 2 - 14)} ${r2(c[1] - 6)}`, 4, '#fff', 'opacity="0.45"')}`;
    // vetor mão → rolo (o cabo vai deitando quando o rolo desce; na bandeja fica apontando para baixo)
    const LC = 250, vetA = a => [LC * Math.cos(B.rad(a)), LC * Math.sin(B.rad(a))];
    const VET_TOPO = vetA(-23), VET_BASE = vetA(6), VET_MOLHA = vetA(45), VET_MEIO = vetA(-8);

    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + DESCE[0]) * B.CICLO, tipo: 'rola', d: (DESCE[1] - DESCE[0]) * B.CICLO },
        { t: (i + 0.62) * B.CICLO, tipo: 'ding' },
        { t: (i + 0.78) * B.CICLO, tipo: 'molha' },
        { t: (i + SOBE[0]) * B.CICLO, tipo: 'sobe' },
      ]),
      frame(f) {
        const { t, u, rep } = B.tempo(f);
        const kDesce = B.clamp((u - DESCE[0]) / (DESCE[1] - DESCE[0]));
        const kd = B.ease(kDesce);
        // rolo e cabo
        let rolC, vet;
        const molha = B.kf([[0, 0], [MOLHA[0], 0], [0.77, 1], [0.8, 1], [MOLHA[1], 0.6], [SOBE[0], 0], [1, 0]], u);
        if (u < OLHA[1]) { rolC = [RC, B.mix(TOPO, BASE, kd)]; vet = B.lerp(VET_TOPO, VET_BASE, kd); }
        else if (u < SOBE[0]) {
          const a = B.ease(B.clamp((u - OLHA[1]) / (0.77 - OLHA[1]))), b = B.ease(B.clamp((u - 0.8) / (SOBE[0] - 0.8)));
          const mol = [BANDEJA[0], BANDEJA[1] + 2], meio = [RC - 20, BASE - 40];
          rolC = u < 0.8 ? B.lerp([RC, BASE], mol, a) : B.lerp(mol, meio, b);
          vet = u < 0.8 ? B.lerp(VET_BASE, VET_MOLHA, a) : B.lerp(VET_MOLHA, VET_MEIO, b);
        } else {
          const b = B.ease((u - SOBE[0]) / (SOBE[1] - SOBE[0]));
          rolC = B.lerp([RC - 20, BASE - 60], [RC, TOPO], b); vet = B.lerp(VET_MEIO, VET_TOPO, b);
        }
        const mao = [rolC[0] - vet[0], rolC[1] - vet[1]];
        // agachar acompanha a altura do rolo (e mais fundo na bandeja)
        const kAg = B.clamp((rolC[1] - TOPO) / (BASE - TOPO) * 0.85 + 0.35 * molha, 0, 1.25);
        const desce = 56 * kAg, atras = 20 * kAg;
        const x = X - atras * s, y = Y0 + desce * s;
        const local = p => [(p[0] - x) / s, (p[1] - y) / s];
        const corAtual = corDe(rep + 1), corAntes = corDe(rep);
        const corRolo = u < 0.78 ? corAtual : corDe(rep + 2);
        const expr = u > OLHA[0] && u < OLHA[1] + 0.02 ? { base: 'orgulho', olhar: [6, -2] } : (u > DESCE[0] && u < DESCE[1] ? { base: 'concentrado', olhar: [7, -2] } : { base: 'feliz', olhar: [6, 0] });
        const teo = teoLado({
          x, y, s, lean: 4 + 22 * kAg + 10 * molha, cabeca: -14 * (1 - kAg) + 4,
          pernaPerto: { alvo: [PE_PERTO[0] + atras, PE_PERTO[1] - desce], dobra: -1 },
          pernaLonge: { alvo: [PE_LONGE[0] + atras, PE_LONGE[1] - desce], dobra: -1 },
          bracoPerto: { alvo: local(mao), dobra: 1 },
          bracoLonge: { alvo: local([mao[0] - vet[0] * 0.22, mao[1] - vet[1] * 0.22]), dobra: 1 },
          expr, piscar: B.piscando(t),
          sombraY: 135.7 - desce, sombraX: 15 + atras,
          itensMeio: i => {
            const h = i.aCena(i.maoPerto);
            return `<g transform="translate(${r2(-x / s)} ${r2(-y / s)}) scale(${r2(1 / s)})">
              ${st(`M ${r2(h[0])} ${r2(h[1])} L ${r2(rolC[0] - RL / 2 - 8)} ${r2(rolC[1])}`, 16)}${st(`M ${r2(h[0])} ${r2(h[1])} L ${r2(rolC[0] - RL / 2 - 8)} ${r2(rolC[1])}`, 7, '#5E6670')}
              ${st(`M ${r2(h[0])} ${r2(h[1])} L ${r2(B.lerp(h, [rolC[0] - RL / 2, rolC[1]], 0.18)[0])} ${r2(B.lerp(h, [rolC[0] - RL / 2, rolC[1]], 0.18)[1])}`, 20)}
              ${st(`M ${r2(h[0])} ${r2(h[1])} L ${r2(B.lerp(h, [rolC[0] - RL / 2, rolC[1]], 0.18)[0])} ${r2(B.lerp(h, [rolC[0] - RL / 2, rolC[1]], 0.18)[1])}`, 11, '#E63946')}
              ${rolo(rolC, corRolo)}</g>`;
          },
        });
        // parede: cor anterior + nova cor do topo até o rolo
        const pint = u < DESCE[0] ? 0 : (u < OLHA[1] ? rolC[1] - P.y0 : P.y1 - P.y0);
        const parede = `<rect x="${P.x0}" y="${P.y0}" width="${RL}" height="${P.y1 - P.y0}" fill="${corAntes}"/>
          ${pint > 0 ? `<rect x="${P.x0}" y="${P.y0}" width="${RL}" height="${r2(Math.min(pint, P.y1 - P.y0))}" fill="${corAtual}"/>` : ''}
          ${pint > 0 && pint < P.y1 - P.y0 - 2 ? st(`M ${P.x0 + 6} ${r2(P.y0 + pint)} q 20 6 40 0 q 20 -6 40 0 q 20 6 40 0`, 3, OL, 'opacity="0.25"') : ''}
          ${moldura}`;
        // pingos quando molha o rolo
        let pingos = '';
        if (u > 0.76 && u < 0.86) {
          const a = (u - 0.76) / 0.1;
          for (let j = 0; j < 4; j++) pingos += `<circle cx="${r2(BANDEJA[0] - 40 + j * 28 + 10 * Math.sin(j * 3))}" cy="${r2(BANDEJA[1] - 30 - 50 * Math.sin(Math.PI * a) * (0.6 + 0.2 * j))}" r="${7 - j}" fill="${corDe(rep + 2)}" stroke="${OL}" stroke-width="3" opacity="${r2(1 - a * 0.6)}"/>`;
        }
        // rolo à frente do Teo só quando está na bandeja (fica na frente das pernas)
        return B.quadro(cen.svg + parede + bandejaSvg + teo.svg + pingos);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'rola') S.colocar(fx, S.SOM.esfrega(e.d, 650), e.t, 0.4);
      if (e.tipo === 'ding') S.colocar(fx, S.SOM.ding(1320), e.t, 0.14);
      if (e.tipo === 'molha') { S.colocar(fx, S.SOM.splash(0.4), e.t, 0.35); S.colocar(fx, S.SOM.plop(), e.t + 0.05, 0.3); }
      if (e.tipo === 'sobe') S.colocar(fx, S.SOM.vush(0.3), e.t, 0.2);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
