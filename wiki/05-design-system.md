# 05 · Design system

Fonte: logo `insumos/NeuroMinds.pdf` (Canva, vetorial). Arco-íris de quatro faixas com a silhueta de uma mão aberta e o wordmark NEUROMINDS em Bebas Neue. Cores extraídas do vetor, sem aproximação.

## Cores
| Token | Hex | Origem | Uso |
|---|---|---|---|
| `yellow` | `#F8E600` | faixa externa | Destaque, fundo de carta, "sucesso" lúdico |
| `blue` | `#009ADA` | segunda faixa | Cor primária de interface: botões, links, foco |
| `red` | `#FC0000` | terceira faixa | Fundo de carta, acento. Nunca para erro em tela da criança |
| `green` | `#45A102` | faixa interna | Fundo de carta, confirmação no admin |
| `ink` | `#000000` | mão e wordmark | Texto principal |
| `paper` | `#FFFFFF` | fundo da logo | Fundo de todas as telas |

Derivadas (gerar no Tailwind com opacidade, não criar novos hex):
- Fundo de carta: cor a 100%. Texto da carta: `paper` com sombra leve, ou `ink` sobre amarelo.
- Fundo suave de seção: cor a 10% sobre `paper`.
- Estado pressionado: cor a 85%.

Cada ação recebe uma das quatro cores no cadastro. A grade alterna as cores para formar o "arco-íris" da logo.

## Tipografia
- **Títulos e wordmark:** Bebas Neue (Google Fonts). Só em caixa alta, só em títulos curtos. Não usar em texto corrido nem na tela da criança além do nome da ação.
- **Interface e corpo:** Nunito (Google Fonts), pesos 600 e 800. Arredondada, legível, amigável para criança. Tamanho mínimo 18px na tela pública, 16px no admin.

## Princípios lúdicos
- **Cartas, não listas.** Cada ação é uma carta grande, colorida, com emoji enorme e o nome embaixo. Mínimo 140px de lado no tablet.
- **Uma coisa por vez.** Tela da ação mostra um vídeo só, ocupando o máximo. Próximo e anterior como botões grandes e redondos.
- **Feedback físico.** Toque na carta: escala 0,96 e sobe de volta. Transições de 150 a 200 ms. Nada que pisque.
- **Fundo branco sempre.** As cores saturadas são acento. Quatro cores chapadas em tela cheia cansam e sobrecarregam.
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
