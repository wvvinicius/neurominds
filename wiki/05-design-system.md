# 05 · Design system

Fonte: logo `insumos/NeuroMinds.pdf` (Canva, vetorial). Arco-íris de quatro faixas com a silhueta de uma mão aberta e o wordmark NEUROMINDS em Bebas Neue. Cores extraídas do vetor, sem aproximação.

## Cores

Duas camadas. As cores puras da logo são **marca**: aparecem na logo e em detalhes pequenos. A **interface** usa tons derivados, flat, sem sombra e sem gradiente. Decisão de 16/10: as cores puras em área grande ficavam vivas demais.

### Marca (extraídas do vetor da logo)
| Token | Hex | Origem |
|---|---|---|
| `nm-yellow` | `#F8E600` | faixa externa |
| `nm-blue` | `#009ADA` | segunda faixa |
| `nm-red` | `#FC0000` | terceira faixa |
| `nm-green` | `#45A102` | faixa interna |

### Interface
| Família | soft (fundos) | mid (faixa, detalhes) | deep (botões, texto colorido) |
|---|---|---|---|
| amarelo | `#FFF4B8` | `#F0D64A` | `#8A7A00` |
| azul | `#D8EDF9` | `#58B5E6` | `#1B7FBD` |
| vermelho | `#FFDCD9` | `#F0776F` | `#C2362D` |
| verde | `#DFF2D2` | `#7EC25F` | `#2F7A05` |

Neutros: `ink #1A1A1A` (texto), `paper #FFFFFF` (fundo de tela), `mist #F3F3F0` (botão secundário), `fog #E4E4DF` (hover do secundário, pontos inativos).

Regras:
- Carta: fundo `soft`, emoji em disco `paper`, nome em `deep` da mesma família. Hover: `mid` a 40%.
- Botão primário (voltar, anterior, próximo): `blue-deep` com texto `paper`. Hover: `nm-blue`.
- Botão secundário (som desligado, tela cheia): `mist`, texto `ink` a 70%.
- Som ligado: `green-soft` com ícone `green-deep`.
- Sem sombra em nada. Sem borda em cartas. Raio padrão `rounded-2xl`, botões redondos.
- Faixa do arco-íris: 5 px, tons `mid`.

Cada ação recebe uma das quatro famílias no cadastro. A grade alterna as famílias para lembrar o arco-íris da logo.

## Tipografia
- **Títulos e wordmark:** Bebas Neue (Google Fonts). Só em caixa alta, só em títulos curtos. Não usar em texto corrido nem na tela da criança além do nome da ação.
- **Interface e corpo:** Nunito (Google Fonts), pesos 600 e 800. Arredondada, legível, amigável para criança. Tamanho mínimo 18px na tela pública, 16px no admin.

## Princípios lúdicos
- **Cartas, não listas.** Cada ação é uma carta grande, colorida, com emoji enorme e o nome embaixo. Mínimo 140px de lado no tablet.
- **Uma coisa por vez.** Tela da ação mostra um vídeo só, ocupando o máximo. Próximo e anterior como botões grandes e redondos.
- **Feedback físico.** Toque na carta: escala 0,96 e sobe de volta. Transições de 150 a 200 ms. Nada que pisque.
- **Fundo branco sempre.** Cores só nos tons `soft` em área grande. Saturação pura fica na logo.
- **Logo** no topo da tela pública, pequena, à esquerda. Não repetir o arco-íris como decoração.

## Animação e som (implementado na spec 001)
- **Entrada:** cartas fazem "pop" em cascata (70 ms entre cada), logo e botão de voltar deslizam, título da ação sobe e o emoji balança uma vez.
- **Toque:** carta sobe levemente no hover, encolhe no toque, emoji balança. Botões crescem no hover e encolhem no toque.
- **Loops permitidos:** só o pulso suave do "ver de novo" e as ondinhas do ícone de som ligado. Nada mais se move sozinho.
- **Som:** um interruptor único, desligado por padrão, lembrado no aparelho. Liga o áudio dos vídeos e os efeitos: blip suave ao passar o mouse (só mouse, nunca no toque), pop (carta), tick (navegar, voltar), duas notas (ligar/desligar), ding (vídeo terminou). Sintetizados com Web Audio, sem arquivos.
- **Faixa do arco-íris:** linha estática de 8 px com as quatro cores no topo de cada tela.

## Acessibilidade para TEA (obrigatório)
- Sem som automático. O vídeo começa mudo; botão de som visível e grande.
- Sem autoplay do próximo vídeo. A criança decide quando avançar.
- Sem animação de fundo, sem confete, sem elementos que se movem sozinhos.
- Layout previsível: botão de voltar sempre no mesmo lugar (canto superior esquerdo), mesmo tamanho, mesmo ícone.
- Alvo de toque mínimo 56px. Espaço entre cartas de pelo menos 16px para evitar toque errado.
- Contraste de texto AA. Texto branco só sobre azul, vermelho e verde. Sobre amarelo, texto `ink`.
- Respeitar `prefers-reduced-motion`: desliga todas as transições.
- Sem texto longo na tela da criança. Nome da ação e, no máximo, uma legenda curta por vídeo.

## Admin
Mesmos tokens, mas utilitário: tabela, formulário, botões azuis. Sem esforço de design além de legível e funcional.
