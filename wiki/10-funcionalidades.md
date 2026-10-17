# 10 · Funcionalidades

Catálogo completo com ID. Serve de base para o spec kit: cada funcionalidade aprovada vira uma spec. Esforço: P = até 2 h, M = meio dia, G = 1 dia ou mais. Recomendação: **entra** (Fase 1), **depois** (Fase 2) ou **backlog**.

## Tela pública (criança)
| ID | Funcionalidade | O que faz | Fase | Esforço | Recomendação |
|---|---|---|---|---|---|
| NM-01 | Tela de cartas | Grade de ações como cartas grandes, coloridas, com emoji e nome. Sem login. | 1 | P | entra |
| NM-02 | Tela da ação | Abre a carta e mostra um vídeo por vez, com botões grandes de próximo e anterior. | 1 | M | entra |
| NM-03 | Botão voltar fixo | Sempre no canto superior esquerdo, mesmo tamanho e ícone. | 1 | P | entra |
| NM-04 | Som sob controle | Vídeo começa mudo. Botão grande de som. Sem autoplay do próximo. | 1 | P | entra |
| NM-05 | Legenda curta por vídeo | Uma linha opcional abaixo do vídeo ("chutar a bola"). | 1 | P | entra |
| NM-06 | Acessibilidade TEA | Alvos de 56 px, sem flash, respeita reduced-motion, contraste AA. | 1 | P | entra |
| NM-07 | Identidade visual | Logo, cores da logo como acento, Bebas Neue nos títulos, Nunito no corpo. | 1 | P | entra |
| NM-08 | Modo stand | Tela cheia, sem barra do navegador, sem links externos. Para o tablet da Mostra. | 1 | P | entra |
| NM-09 | Voz lendo o nome da ação | Ao tocar na carta, o navegador fala "chutar" (Web Speech API). | 1 | P | backlog |
| NM-10 | Rodapé de transparência | Texto curto: "não coleta dados pessoais, registra só vídeos vistos de forma anônima". | 1 | P | entra |
| NM-37 | Introdução com o Teo | Ao abrir, tela animada de carregamento e vídeo de apresentação do Teo, com "Pular". Uma vez por sessão. | 1 | P | entra (feito) |

## Gerenciador de conteúdo (Manu e Nina)
| ID | Funcionalidade | O que faz | Fase | Esforço | Recomendação |
|---|---|---|---|---|---|
| NM-11 | Acesso ao admin | Senha única em variável de ambiente, cookie assinado protege `/admin/*`. | 1 | P | entra |
| NM-12 | Cadastro de ações | Criar, editar, ordenar, ativar e desativar ações (nome, emoji, cor). | 1 | M | entra |
| NM-13 | Upload de vídeos | Subir mp4 direto para o Storage, ordenar, remover, ativar e desativar por ação. | 1 | M | entra |
| NM-14 | Pré-visualização | Ver o vídeo dentro do admin antes de publicar. | 1 | P | entra |
| NM-15 | Painel de uso | Contagem de aberturas por ação e vídeos vistos até o fim. Tabela simples. | 1 | P | entra |
| NM-16 | Múltiplos editores | Admin vira papel no Supabase Auth, cada pessoa com login próprio. | 2 | M | depois |

## Métricas e dados
| ID | Funcionalidade | O que faz | Fase | Esforço | Recomendação |
|---|---|---|---|---|---|
| NM-17 | Eventos anônimos | Registra abriu ação, tocou vídeo, terminou vídeo, com id anônimo de sessão. | 1 | P | entra |
| NM-18 | Exportação anonimizada | CSV agregado, sem apelido nem e-mail, para a FENIC. | 2 | P | depois |

## Profissional e aluno
| ID | Funcionalidade | O que faz | Fase | Esforço | Recomendação |
|---|---|---|---|---|---|
| NM-19 | Login do profissional | Link mágico por e-mail via Supabase Auth. | 2 | M | depois |
| NM-20 | Cadastro de alunos | Apelido e e-mail do responsável. Sem nome real, sem diagnóstico. | 2 | M | depois |
| NM-21 | Prancha por aluno | Profissional escolhe um subconjunto de ações da biblioteca para o aluno. | 2 | M | depois |
| NM-22 | Convite por e-mail | Responsável recebe link com token. Envio via Resend. | 2 | M | depois |
| NM-23 | Acesso da criança por link | Link abre só as ações da prancha, sem login. | 2 | P | depois |
| NM-24 | Modo presencial | Profissional abre a prancha do aluno no consultório. Sessão fica vinculada. | 2 | P | depois |
| NM-25 | Sessões vinculadas | Início, fim, presencial ou em casa, eventos ligados ao aluno. | 2 | M | depois |
| NM-26 | Relatório do aluno | Por sessão e por ação: frequência, duração, aberturas, vídeos até o fim. | 2 | G | depois |
| NM-27 | Exclusão de aluno | Apaga aluno, pranchas, sessões e eventos em cascata. | 2 | P | depois |
| NM-28 | Segurança por linha | RLS no Supabase: profissional só vê os próprios dados. | 2 | M | depois |

## Infra
| ID | Funcionalidade | O que faz | Fase | Esforço | Recomendação |
|---|---|---|---|---|---|
| NM-29 | Deploy na Vercel | Push na main publica. Preview por branch. | 1 | P | entra |
| NM-30 | Domínio próprio | Registro pelas alunas, apontado para a Vercel. | 1 | P | entra |
| NM-31 | Backup dos vídeos | Pasta no Drive como arquivo-mestre, fora do site. | 1 | P | entra (processo, não código) |

## Backlog
| ID | Funcionalidade | O que faz | Fase | Esforço | Recomendação |
|---|---|---|---|---|---|
| NM-32 | Gamificação | Pontos, medalhas, recompensa por tarefa. | 3 | G | backlog |
| NM-33 | Habilidades e desafios | Avaliar competência dentro da prancha, não só uso. | 3 | G | backlog |
| NM-34 | Relatório em PDF | Exportar relatório do aluno para a submissão da FENIC. | 3 | M | backlog |
| NM-35 | Uso offline | PWA com cache de vídeos. | 3 | G | backlog |
| NM-36 | Multi-clínica e planos | Estrutura comercial. | 3 | G | backlog |
