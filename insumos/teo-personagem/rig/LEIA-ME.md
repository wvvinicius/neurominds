# Teo — rig de animação

O Teo separado em 23 camadas PNG transparentes, em 3x (alta resolução). Abra o `demo.html` para ver o rig funcionando: acenar, andar, falar e piscar.

## Duas versões das mesmas camadas

| Pasta | Para quê | Como usar |
|---|---|---|
| `png-alinhado/` | **After Effects, Premiere, DaVinci, Canva** | Todas as camadas têm o mesmo tamanho (1380×1860). Empilhe tudo na mesma posição e o Teo se monta sozinho. Depois mude o *anchor point* de cada parte para o pivô (veja a tabela abaixo). |
| `png-pivo/` | **CapCut** e editores que só giram pelo centro | Cada parte tem a junta (ombro, quadril, pescoço) **exatamente no centro da imagem**. Então girar a camada já gira no lugar certo. |

## Ordem das camadas (de baixo para cima)

1. `perna-esq`, `perna-dir`
2. `corpo` (pescoço, camiseta e bermuda)
3. `braco-esq`, `braco-dir` (a manga vai junto com o braço)
4. `cabeca` (black power, orelhas, rosto sem olhos e sem boca)
5. `bochechas` (opcional)
6. **um** `olhos-*`
7. **uma** `boca-*`
8. `suor` (opcional)

Olhos, boca, bochechas e suor **seguem a cabeça**: no editor, coloque essas camadas como filhas da `cabeca` (parent/pre-comp) para elas acompanharem quando a cabeça inclina.

## Pivôs (onde cada parte gira), em `png-alinhado`

| Parte | Pivô (px no PNG 3x) |
|---|---|
| cabeça (e rosto) | 690, 786 (pescoço) |
| corpo | 690, 1482 (cintura, para respirar/quicar) |
| braço esquerdo | 516, 954 (ombro) |
| braço direito | 864, 954 (ombro) |
| perna esquerda | 606, 1410 (quadril) |
| perna direita | 774, 1410 (quadril) |

O `rig.json` tem esses mesmos valores em px e em %.

## Olhos e bocas disponíveis

- **Olhos:** aberto, piscando, risada, surpreso, confiante, ops, pensando
- **Bocas:** fechada, meio-aberta, sorriso, gargalhada, o, confiante, dentes, reta

**Fala (lipsync):** alterne `boca-fechada` → `boca-meio-aberta` → `boca-sorriso` → `boca-meio-aberta`, trocando a cada 3–4 frames, enquanto tiver áudio.
**Piscar:** troque para `olhos-piscando` por 3–4 frames, a cada 2–4 segundos.

## Movimentos prontos (ângulos de referência)

- **Acenar:** braço direito oscila entre −125° e −155°
- **Andar:** pernas ±18°, braços ±25° em oposição, corpo sobe e desce 8 px (ciclo de 0,8 s)
- **Herói:** braço direito vai a −165° (punho para cima) + `olhos-confiante` + `boca-confiante`
- **Respirar/parado:** corpo sobe e desce 8 px a cada 2,4 s, braços ±4°

## Regerar

```bash
node rig.js
```

As camadas vêm de `gerar.js` (desenho do Teo) e `rig.js` (separação). Os PNGs são exportados pelo Chrome em modo headless.
