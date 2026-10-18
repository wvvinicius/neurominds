# Cenas de ação do Teo — como montar uma

Cada vídeo do [PLANO-VIDEOS.md](../PLANO-VIDEOS.md) é um arquivo `acoes/Vxx.js`.
Os exemplos prontos são [V04.js](V04.js) (de lado, com pernas por alvo) e [V39.js](V39.js) (de frente, com objeto na mão, partículas em loop e música). **Leia os dois antes de começar.**

## Regras do vídeo ([REGRAS-VIDEO.md](../REGRAS-VIDEO.md))
- 6 s, 30 fps, 1920×1080. A **mesma ação 3 vezes** (uma por ciclo de 2 s).
- Câmera fixa, corpo inteiro do Teo visível, sem cortes e sem zoom. Sem texto, sem legendas e sem logos.
- **O frame 0 e o frame 180 (virtual) precisam ser iguais**, para o loop não ter emenda:
  - Use `B.tempo(f)` → `{ t, u, rep }`. Keyframes `B.kf([[0, v], ..., [1, v]], u)` começam e terminam no mesmo valor.
  - Movimentos contínuos usam `B.onda(t, periodo)` com período que divide 2 s (2, 1, 0,5, 0,25…) ou 6 s.
  - Partículas e objetos que "sobram" do ciclo anterior: calcule também o ciclo `-1` (veja as notas em V39).
- Ações que precisam "desfazer" para repetir (abrir/fechar, calçar/tirar, guardar…): a ação principal ocupa ~65–75% do ciclo, devagar e clara, e a volta à pose inicial é rápida e neutra no fim do ciclo.
- Outros personagens (mamãe, cachorro, caixa, irmãozinho) **não falam**. Desenhe em SVG no mesmo estilo: contorno escuro grosso (`B.OL`, 6 px), cores chapadas e sem sombra realista.
- Som: efeitos sincronizados com os eventos + ambiente baixo (`S.AMB.*`). Sem voz.

## Contrato do arquivo
```js
module.exports = {
  id: 'V05', slug: 'abaixar-tampa-vaso', acao: 'Abaixar', contexto: 'Abaixar a tampa do vaso sanitário',
  criar() {            // pode pré-calcular coisas aqui
    return {
      eventos: [{ t: 0.9, tipo: 'tampa' }, ...],   // instantes (s) para o som
      frame(f) { return B.quadro(svgDoFundo + svgDoTeo + ...); },   // f = 0..179 → string SVG 1920×1080
    };
  },
  som(S, eventos) { const fx = S.trilha(); S.colocar(fx, S.SOM.toc(), t, ganho); return { fx, amb: S.AMB.casa() }; },
};
```

## Comandos
```bash
node render.js V05 --frame 40      # 1 frame → video/acoes/folhas/V05-f40.png (rápido, use bastante)
node render.js V05 V06 --paralelo 2   # vídeos completos (~3 min cada)
```
A saída fica em `video/acoes/V05-<slug>.mp4` e `-som.mp4`, e a revisão em `video/acoes/folhas/V05.png` (15 frames) e `V05-onda.png` (forma de onda).
**Não rode mais de 2 renders ao mesmo tempo:** outros lotes estão usando a mesma máquina.

## API
`const B = require('../lib/base')`: `W H FPS N CICLO OL C`, `tempo kf ease bump onda mix clamp`, `lerp add girar angulo dirv chain ik`, `quadro(svg)`, `gota(x,y,s,cor)`, `tracoSvg(d,w,cor)`, `piscando(t)`, `aleatorio(seed)`, `r2`.
Cores do Teo em `B.C`: `skin hair ol shirt shorts shoe mouth tongue blush pupil skinLine`.

### Teo — `require('../lib/teo')`
`teoLado(p)` (olhando para a direita; `espelhar: true` vira para a esquerda) e `teoFrente(p)` → `{ svg, info }`.
- `x, y`: posição do **quadril** na cena. `s`: escala (1.4–1.6). Em pé: `y = teoLado.emPe(chao, s, pes)` / `teoFrente.emPe(chao, s, pes)`.
- `lean` (inclina o tronco, graus; positivo = para a frente no Teo de lado) e `cabeca` (inclina a cabeça).
- Membros, de lado: `bracoPerto bracoLonge pernaPerto pernaLonge`. De frente: `bracoEsq bracoDir pernaEsq pernaDir` (esquerda/direita **da tela**).
  - Por ângulos: `{ a1, a2 }`, medidos a partir de "reto para baixo"; positivo = para a direita da tela (de lado = para a frente).
  - Por alvo (IK): `{ alvo: [x, y], dobra: 1 | -1 }` em coordenadas locais (quadril = 0,0). `dobra` escolhe para que lado o cotovelo ou joelho dobra; teste os dois.
  - Pernas por alvo deixam o pé reto no chão. Use `giroPe` para forçar.
  - Medidas de lado: coxa 55, canela 60, braço 46, antebraço 44, ombro em (6,-116), cabeça em (10,-212). Em pé, o chão local fica em y = 115 + sola (21 de tênis, 14 descalço).
  - Medidas de frente: coxa 50, canela 42, braço 54, antebraço 50, ombros (±58,-152), quadris (±28,0), cabeça (0,-278). Em pé, o chão local fica em y = 124 (de tênis).
- `expr`: `feliz calmo orgulho riso esforco surpreso triste chorando concentrado cantando mastigando impaciente`, ou um objeto que mistura `{ base, sob, olho, boca, blush, lagrimas, suor, olhar:[dx,dy] }`.
  - `sob`: normal, alta, esforco, triste, foco.
  - `olho`: aberto, grande, semi, feliz, fechado, apertado.
  - `boca`: sorriso, riso, fechada, o, oGrande, triste, chorando, dentes, lingua, mastigando.
  - `fase` anima lágrimas e mastigação (0..1, repetindo). `piscar: B.piscando(t)` faz piscar.
- `roupa`: `{ camisa: cor | null (sem camisa), manga: 'curta' | 'longa', baixo: 'bermuda' | 'calca' | 'sunga', corBaixo, pes: 'tenis' | 'descalco' | 'meia' | 'chuteira' }`. O padrão é camiseta amarela, bermuda azul e tênis vermelho. Só mude quando a cena pedir.
- Cabeça de lado: `oculosNatacao`, `molhado`, `extra` (SVG em coordenadas da cabeça).
- Objetos: `itensAtras`, `itensTronco` (gira com o tronco), `itensMeio` (entre o corpo e o braço da frente), `itensFrente`. Cada um recebe uma string ou uma função `info => svg`, em coordenadas **locais**.
- `info`: `maoPerto/maoLonge` (ou `maoEsq/maoDir`), `cotovelo*`, `antebraco*` (ângulo, para girar o objeto na mão), `pe*`, `joelho*`, `boca`, `olho`, `cabeca`, `daCabeca([x,y])` (ponto da cabeça → local), `aCena([x,y])` (local → cena), `chaoLocal`.
- Sombra: `sombra:false`, `sombraX`, `sombraY` (local), `sombraLarg`.

### Cenários — `require('../lib/cenario')`
`sala() quarto() cozinha() banheiro() mercado() parque() rua() praia() piscinaFundo()` → `{ svg, chao }`. Também `OBJ.mesa/cadeira/caixa/bola`, `ret nuvem sol arvore arbusto janelaParede quadroParede piso`. Pode compor novos cenários com essas peças.

### Sons — `S` (recebido em `som(S, eventos)`)
`S.trilha()`, `S.colocar(trilha, som, t, ganho)` (o som dá a volta no fim), `S.eco(trilha)`.
`S.SOM`: `passo pof toc clique vush(dur) esfrega(dur, centro) rangido(dur) papel(dur) snip ding(f) boing quique splash(forca) plop gotinha gole crunch dado encaixe pisadaFofa soluco latido buzina caixaRegistradora nota(nome|Hz, dur) bumbo chimbal`.
`S.AMB`: `silencio casa banheiro parque rua mar piscina mercado`. Os ambientes já vêm em volume baixo.
Primitivas para sons novos: `ruido tom(len, freqFn, ampFn, forma) passaBaixa passaAlta passaFaixa envelope somar dec ataque`.

## Não edite
`lib/`, `gerar.js`, `render.js`, `PLANO-VIDEOS.md` e arquivos de outros lotes. Se precisar de algo novo, como um objeto ou uma expressão, crie no próprio `Vxx.js` ou num `acoes/obj-<lote>.js` seu.
Se encontrar um bug na base, contorne localmente e descreva o bug no relatório.

## Checklist antes de dar um vídeo como pronto
1. `--frame` em 3–4 momentos (início, meio da ação, fim) parece certo e bonito.
2. Na folha de contato (`folhas/Vxx.png`), as 3 repetições estão iguais e o primeiro frame bate com o último.
3. O Teo inteiro está visível e reconhecível: black power, camiseta amarela, bermuda azul e tênis vermelho (salvo quando a cena pede outra roupa).
4. A forma de onda (`folhas/Vxx-onda.png`) mostra os sons nos momentos das ações.
