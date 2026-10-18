# Implementation Plan: Área do profissional e prancha da criança

**Branch**: `003-profissional-e-prancha` | **Date**: 2026-10-18 | **Spec**: [spec.md](spec.md)

## Summary
Cinco tabelas novas e uma coluna em `event`. Área `/pro` com login por link mágico (Resend), lista de alunos, página do aluno (link, prancha, relatório, dados, exclusão). Rotas públicas `/p/<token>` reutilizam `ActionCard` e `ActionPlayer`. Sessões criadas pelo navegador via `/api/sessions`, eventos passam a levar `session_id` quando a criança está na prancha. CSV agregado em `/api/export/uso.csv`.

## Technical Context
**Dependencies novas**: nenhuma. E-mail via `fetch` na API do Resend.
**Auth**: cookie `nm_pro` = `id.hmac(id)`, segredo `AUTH_SECRET` ou `ADMIN_PASSWORD`.
**Sessão de prancha**: `sessionStorage` por aba guarda o id por 30 min; `track()` enfileira eventos até a sessão existir.
**Segurança por linha**: filtro `professional_id = ?` em todas as funções de `lib/pro.ts`.

## Constitution Check
- I. MVP: uma prancha por aluno, sem convite por e-mail, sem múltiplas pranchas. OK.
- II. Simples: formulários nativos e server actions; três Client Components pequenos (form de aluno, copiar link, form de login). OK.
- III. Deploy: três variáveis novas, todas opcionais com degradação clara. OK.
- IV. Visual: prancha da criança é a mesma tela pública com saudação. Área pro usa a mesma UI utilitária do admin. OK.
- V. LGPD: apelido, e-mail do responsável opcional, token aleatório, páginas `noindex`, CSV sem identificadores. OK.

## Project Structure
```
app/src/
  lib/pro-auth.ts     ← link mágico, cookie, requireProfessional
  lib/pro.ts          ← alunos, prancha, token, sessão, relatório, CSV
  lib/mail.ts         ← Resend por HTTP
  lib/format.ts       ← datas e durações em pt-BR
  lib/track.ts        ← + sessão de prancha e fila
  app/pro/login/      ← página + formulário
  app/pro/entrar/route.ts
  app/pro/(area)/     ← layout com guarda, lista, aluno
  app/pro/actions.ts
  app/p/[token]/      ← prancha e ação da criança
  app/api/sessions/route.ts
  app/api/export/uso.csv/route.ts
  components/BoardSession.tsx, pro/StudentForm.tsx, pro/CopyButton.tsx
```

## Complexity Tracking
- Fila de eventos em `track.ts`: evita perder `open_home`/`open_action` disparados antes da sessão existir. Custo: 15 linhas.
