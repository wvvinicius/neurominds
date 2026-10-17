# 02 · Escopo do MVP

Fonte de verdade do escopo. Mudou? Atualiza aqui e registra em `log.md`.

## Princípio
"Entregar toda a ideia, ou a maior parte dela, com o menor esforço possível." Reduzir fricção para a criança e para quem alimenta o conteúdo. Tudo que é "legal, mas depois" vai para `09-backlog-futuro.md`.

## Fase 1 — Mostra (entrega 20/10/2026)

### Entra
- **Tela pública de cartas** (`/`): grade de ações como cartas grandes e coloridas. Sem login.
- **Tela da ação** (`/acao/[slug]`): a carta "abre" e mostra os vídeos daquela ação, um de cada vez, com próximo/anterior. Voltar para as cartas em um toque.
- **Gerenciador de conteúdo** (`/admin`): protegido por uma senha única. Cadastrar ação (nome, emoji, cor), ordenar, ativar/desativar. Subir, ordenar e remover vídeos de cada ação. Feito para a Manu e a Nina operarem sozinhas.
- **Métricas anônimas**: eventos (abriu ação, viu vídeo, terminou vídeo) com um id anônimo de sessão. Sem cadastro, sem nome. Serve para saber o que foi usado na Mostra.
- **Logo e cores** da NeuroMinds aplicadas.
- **Domínio próprio** se as alunas escolherem a tempo. Senão, URL da Vercel.

### Não entra na Fase 1
- Login para quem usa.
- Cadastro de criança ou profissional.
- Prancha personalizada.
- Relatório.
- Gamificação (pontos, medalhas, recompensas).
- App nativo. É site responsivo, abre no tablet e no celular.

## Fase 2 — Uso real (consultório e escola, a partir de nov/2026)

### Entra
- **Login do profissional** (e-mail e senha, ou link mágico).
- **Alunos** do profissional, identificados por apelido. E-mail do responsável para convite.
- **Prancha**: subconjunto de ações da biblioteca escolhido pelo profissional para aquele aluno (quem faz judô não precisa da mesma prancha de quem faz balé).
- **Convite por e-mail**: o responsável recebe um link e a criança usa em casa sem o profissional.
- **Modo presencial**: o profissional abre a prancha do aluno no consultório e a sessão fica vinculada a ele.
- **Relatório por sessão e por aluno**: tempo de uso, ações abertas, vídeos vistos até o fim, frequência. O profissional lê e ajusta a conduta.

### Não entra na Fase 2
- Gamificação. Avaliar só depois de ver relatórios reais.
- Qualquer coisa comercial (planos, pagamento, multi-clínica).

## Fase 3 — Só se a Fase 2 provar valor
Ver `09-backlog-futuro.md`.

## Critério para aceitar algo novo no escopo
Responder sim às três:
1. Ajuda a criança a compreender a ação, ou ajuda o profissional a decidir a conduta?
2. Cabe em poucas horas de desenvolvimento?
3. Não cria dependência do Vini para operar no dia a dia?
