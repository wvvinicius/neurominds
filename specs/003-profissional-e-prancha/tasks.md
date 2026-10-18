# Tasks: Área do profissional e prancha da criança

**Input**: [spec.md](spec.md), [plan.md](plan.md)

## Phase 1: Banco
- [x] T001 Tabelas professional, login_token, student, student_action, session; coluna `event.session_id` com migração guardada por PRAGMA

## Phase 2: Login (NM-19)
- [x] T002 `lib/mail.ts` (Resend por HTTP, "skipped" sem chave)
- [x] T003 `lib/pro-auth.ts`: startLogin, completeLogin, cookie, requireProfessional
- [x] T004 `/pro/login` + `ProLoginForm`; `/pro/entrar` valida e redireciona; `(area)/layout.tsx` com guarda

## Phase 3: Alunos e prancha (NM-20, NM-21, NM-23, NM-27, NM-28)
- [x] T005 `lib/pro.ts`: listar, criar, editar, excluir em cascata, prancha, token, board por token
- [x] T006 `/pro`: lista e cadastro; `/pro/alunos/[id]`: link, prancha, dados, exclusão
- [x] T007 `/p/[token]` e `/p/[token]/acao/[slug]` reutilizando ActionCard (href) e BackButton (href)

## Phase 4: Sessões e relatório (NM-25, NM-26)
- [x] T008 `/api/sessions` (presencial pelo cookie do profissional); `track.ts` com sessão por aba e fila; `BoardSession`
- [x] T009 `insertEvent` grava `session_id` e atualiza `ended_at`
- [x] T010 Relatório do aluno: totais, sessões, por ação

## Phase 5: Exportação (NM-18)
- [x] T011 `/api/export/uso.csv` agregado por semana e ação, protegido

## Phase 6: Polish
- [x] T012 Lint, tipos e build de produção limpos; fluxo testado por curl (login, aluno, prancha, sessão, eventos, relatório, CSV)
- [x] T013 `.env.example`, wiki, constituição, catálogo e log
- [ ] T014 Configurar `RESEND_API_KEY` e `MAIL_FROM` com domínio verificado (depende de NM-30)
- [ ] T015 Teste com a fonoaudióloga: cadastrar um aluno real (apelido) e usar no consultório
