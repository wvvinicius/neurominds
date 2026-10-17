# 06 · Conteúdo: vídeos

Os vídeos são o gargalo do projeto, não o código. Quem gera é a equipe de conteúdo (Manu e Nina). O Vini faz uma amostra de duas ações e passa o prompt. Este doc é o manual.

## Especificação técnica
| Item | Valor |
|---|---|
| Formato | MP4, H.264, áudio AAC ou sem áudio |
| Proporção | 16:9 (1280×720). Todos iguais, sem misturar |
| Duração | 5 a 8 segundos |
| Tamanho | Até 15 MB por arquivo |
| Nome do arquivo | `acao-contexto.mp4`, ex.: `chutar-bola-campo.mp4` |
| Quantidade | 3 a 5 vídeos por ação. Começar com 3 e completar depois |

## Regras de conteúdo
- **Uma ação por vídeo, um contexto por vídeo.** Chutar bola no campo é um vídeo. Chutar no karatê é outro.
- **A ação tem que ser óbvia e única.** Sem outras ações acontecendo ao mesmo tempo.
- **Lúdico e colorido, estilo desenho animado 2D.** Não é cinematográfico. Não é realista.
- **Sem texto, sem legenda, sem logo** dentro do vídeo.
- **Sem flashes, sem cortes rápidos, sem câmera tremendo.** Câmera fixa, um plano só.
- **Sem rosto de pessoa real.** Personagens de desenho evitam direito de imagem e deixam o conteúdo neutro.
- **Diversidade** de personagens entre os vídeos (tom de pele, cabelo, idade), sem fazer disso o assunto do vídeo.
- Cada vídeo é assistido inteiro por quem gerou antes de subir. Se tiver qualquer coisa estranha, gera de novo.

## Prompt padrão
Substituir o que está entre colchetes. Funciona em Veo (Gemini), Sora e similares.

```
Animação 2D estilo desenho infantil, cores vivas e chapadas, traço limpo e simples,
fundo simples e pouco detalhado. Uma criança [CONTEXTO: descrever quem, onde e o que]
executando claramente a ação de [AÇÃO]. Um único movimento claro e completo.
Câmera fixa, plano médio, sem cortes. Sem texto, sem legendas, sem logotipos.
Iluminação suave e uniforme, sem flashes. Duração de 6 segundos. Proporção 16:9.
```

Exemplo preenchido:
```
... Uma criança de camiseta amarela em um campo de futebol verde, ensolarado,
executando claramente a ação de CHUTAR uma bola vermelha, que rola para frente. ...
```

## Lista inicial de ações
Pendente: a Manu envia a lista oficial. Sugestão para a amostra e para a Mostra, 8 ações:

| Ação | Emoji | Contextos sugeridos |
|---|---|---|
| Chutar | ⚽ | bola no campo · golpe no karatê · água na piscina · folhas no parque |
| Abraçar | 🤗 | mãe · amigo · cachorro · ursinho |
| Pular | 🦘 | corda · pula-pula · poça · cama elástica |
| Correr | 🏃 | parque · pista · praia · atrás de um balão |
| Comer | 🍎 | maçã · sopa com colher · lanche na escola · picolé |
| Dormir | 😴 | cama · colo · rede · carro |
| Lavar | 🧼 | mãos · dentes · rosto · prato |
| Brincar | 🧸 | blocos · boneca · massinha · areia |

## Fluxo de trabalho da equipe de conteúdo
1. Gera o vídeo no gerador com o prompt padrão.
2. Baixa, assiste inteiro, confere as regras de conteúdo.
3. Renomeia (`acao-contexto.mp4`).
4. Sobe em `/admin`, na ação certa. Ordena.
5. Abre o site e vê se apareceu.

Guardar os originais em um Drive compartilhado (uma pasta por ação) como backup. O site não é o arquivo-mestre.
