# 10 · Funcionalidades

Catálogo completo com ID e status. Base do spec kit: cada funcionalidade aprovada vira (ou entra em) uma spec. Esforço: P = até 2 h, M = meio dia, G = 1 dia ou mais. Status: **feito**, **a fazer** (aprovado, na fila), **depois** (Fase 2, não aprovado ainda), **backlog**.

Atualizado em 2026-10-16, após o primeiro deploy em https://neurominds.vercel.app.

## Tela pública (criança) — spec 001
| ID | Funcionalidade | O que faz | Fase | Esforço | Status |
|---|---|---|---|---|---|
| NM-01 | Tela de cartas | Grade de ações como cartas de bloco de cor, com emoji e nome. Sem login. | 1 | P | feito |
| NM-02 | Galeria de vídeos | Um vídeo por vez, desliza com direção, setas dão a volta, arrastar navega, repetir sempre à mão, fichas numeradas para pular. | 1 | M | feito |
| NM-03 | Botão voltar fixo | Sempre no canto superior esquerdo, mesmo tamanho e ícone. | 1 | P | feito |
| NM-04 | Som sob controle | Interruptor único, ligado por padrão, lembrado no aparelho. "Toque para ouvir" quando o navegador barra. Sem autoplay do próximo. | 1 | P | feito |
| NM-05 | Legenda curta por vídeo | Uma linha abaixo do vídeo. | 1 | P | feito |
| NM-06 | Acessibilidade TEA | Alvos de 56 px, sem flash, reduced-motion, contraste AA. | 1 | P | feito |
| NM-07 | Identidade visual | Logo vetorial, paleta em duas camadas (marca e interface flat), Bebas Neue e Nunito. | 1 | P | feito |
| NM-08 | Modo stand | Botão de tela cheia, sem links externos. | 1 | P | feito |
| NM-09 | Voz lendo o nome da ação | Navegador fala "chutar" ao tocar na carta. | 1 | P | backlog |
| NM-10 | Rodapé de transparência | Texto curto de LGPD. | 1 | P | feito |
| NM-37 | Introdução com o Teo | A cada carregamento: tela animada de espera, vídeo de apresentação, Pular, e ao fim Repetir ou Seguir. | 1 | P | feito |
| NM-38 | Indicador de espera | Pontos nas cores da logo saltando. Na intro, no palco do vídeo e na troca de tela. | 1 | P | feito |
| NM-39 | Animações e efeitos sonoros | Pop, wiggle, slide nas entradas e toques. Sons sintetizados: hover, pop, tick, swoosh subindo/descendo, ding. | 1 | P | feito |
| NM-40 | Tela da ação cabe na janela | Vídeo se ajusta à altura disponível; controles sempre visíveis, sem rolagem. | 1 | P | feito |

## Gerenciador de conteúdo (Manu e Nina)
| ID | Funcionalidade | O que faz | Fase | Esforço | Status |
|---|---|---|---|---|---|
| NM-11 | Acesso ao admin | Senha única em `ADMIN_PASSWORD`, cookie assinado. | 1 | P | feito |
| NM-12 | Cadastro de ações | Criar, editar, ordenar, ativar e desativar (nome, emoji, cor). | 1 | M | feito |
| NM-13 | Upload de vídeos | Enviar para o Vercel Blob ou adicionar por link; legenda, ordem, ativo, excluir. Banco SQLite (libSQL/Turso). | 1 | M | feito |
| NM-14 | Pré-visualização | Player de cada vídeo no admin. | 1 | P | feito |
| NM-15 | Painel de uso | Totais, por ação e por vídeo, só contagens anônimas. | 1 | P | feito |
| NM-16 | Múltiplos editores | Admin vira papel no Supabase Auth. | 2 | M | depois |

## Métricas e dados
| ID | Funcionalidade | O que faz | Fase | Esforço | Status |
|---|---|---|---|---|---|
| NM-17 | Eventos anônimos | open_home, open_action, play_video, finish_video com duração. Id anônimo de 24 h. | 1 | P | feito |
| NM-18 | Exportação anonimizada | CSV agregado para a FENIC. | 2 | P | depois |

## Conteúdo
| ID | Funcionalidade | O que faz | Fase | Esforço | Status |
|---|---|---|---|---|---|
| NM-41 | Personagem Teo e prompts | Bloco de personagem, regras e prompts por cena para gerar os vídeos por IA. | 1 | P | feito |
| NM-42 | Vídeos de chutar | Futebol, karatê e natação em `public/videos/chutar/`, cadastrados no mock. | 1 | — | feito |
| NM-43 | Vídeos das outras 7 ações | Abraçar, pular, correr, comer, dormir, lavar, brincar. Gerados pela equipe com os prompts. | 1 | — | a fazer |

## Profissional e aluno — Fase 2
| ID | Funcionalidade | O que faz | Fase | Esforço | Status |
|---|---|---|---|---|---|
| NM-19 | Login do profissional | Link mágico por e-mail. | 2 | M | depois |
| NM-20 | Cadastro de alunos | Apelido e e-mail do responsável, sem nome real. | 2 | M | depois |
| NM-21 | Prancha por aluno | Subconjunto de ações escolhido pelo profissional. | 2 | M | depois |
| NM-22 | Convite por e-mail | Responsável recebe link com token. | 2 | M | depois |
| NM-23 | Acesso da criança por link | Abre só as ações da prancha, sem login. | 2 | P | depois |
| NM-24 | Modo presencial | Profissional abre a prancha no consultório. | 2 | P | depois |
| NM-25 | Sessões vinculadas | Início, fim, presencial ou em casa. | 2 | M | depois |
| NM-26 | Relatório do aluno | Frequência, duração, aberturas, vídeos até o fim. | 2 | G | depois |
| NM-27 | Exclusão de aluno | Apaga tudo em cascata. | 2 | P | depois |
| NM-28 | Segurança por linha | RLS no Supabase. | 2 | M | depois |

## Infra
| ID | Funcionalidade | O que faz | Fase | Esforço | Status |
|---|---|---|---|---|---|
| NM-29 | Deploy na Vercel | Push na main publica. Produção em https://neurominds.vercel.app. | 1 | P | feito |
| NM-30 | Domínio próprio | Registrado pelas alunas, apontado para a Vercel. | 1 | P | a fazer (depende do nome) |
| NM-31 | Backup dos vídeos | Pasta no Drive como arquivo-mestre. | 1 | P | a fazer (processo) |
| NM-44 | Favicon e ícone de tela inicial | Ícones e manifest gerados da marca. | 1 | P | feito |
| NM-47 | Turso e Blob em produção | Banco e armazenamento persistentes na Vercel. Sem eles o app avisa e degrada. | 1 | P | a fazer (depende de conta) |
| NM-45 | Teste no tablet do stand | Retrato e paisagem nas três telas. Ajustes do que aparecer. | 1 | P | a fazer |

## Backlog
| ID | Funcionalidade | O que faz | Fase | Esforço | Status |
|---|---|---|---|---|---|
| NM-32 | Gamificação | Pontos, medalhas, recompensas. | 3 | G | backlog |
| NM-33 | Habilidades e desafios | Avaliar competência dentro da prancha. | 3 | G | backlog |
| NM-34 | Relatório em PDF | Para a submissão da FENIC. | 3 | M | backlog |
| NM-35 | Uso offline | PWA com cache de vídeos. | 3 | G | backlog |
| NM-36 | Multi-clínica e planos | Estrutura comercial. | 3 | G | backlog |
| NM-46 | Ilustrações no lugar de emoji | Ícone desenhado por carta, no estilo do Teo. Emoji varia por aparelho. | 2 | M | backlog |
