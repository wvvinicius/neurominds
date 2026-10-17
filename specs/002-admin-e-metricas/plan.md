# Implementation Plan: Gerenciador de conteúdo e métricas

**Branch**: `002-admin-e-metricas` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

## Summary
Banco SQLite (libSQL) com três tabelas, seed automático a partir do `seed.json` existente. Área `/admin` protegida por cookie assinado, com páginas de ações, edição de ação com vídeos, e painel de uso. Uploads vão do navegador direto ao Vercel Blob. Eventos anônimos entram por um endpoint público e são lidos pelo painel. Ícones e manifest com a marca.

## Technical Context
**Language/Version**: TypeScript 5, Node 22 (dev), Node 24 (Vercel)
**Primary Dependencies**: Next.js 16, `@libsql/client`, `@vercel/blob`
**Storage**: SQLite via libSQL. Dev: `app/data/neurominds.db`. Prod: Turso (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`). Vídeos enviados: Vercel Blob (`BLOB_READ_WRITE_TOKEN`).
**Testing**: Manual. Verificação por curl das rotas e do cookie.
**Constraints**: Sem ORM. Server actions para gravação. Páginas públicas `force-dynamic`.

## Constitution Check
- I. MVP: só o que a equipe precisa para operar sozinha. Sem multiusuário, sem papéis. OK.
- II. Simples: SQL direto, server actions, formulários nativos. Três Client Components no admin (form com estado, uploader, confirmação). OK.
- III. Deploy: duas variáveis para persistência, uma para senha. Sem elas o app avisa e segue. OK.
- IV. Visual: mesmos tokens, versão utilitária. OK.
- V. LGPD: eventos só com id anônimo rotativo. OK.
- **Stack**: Supabase substituído por SQLite/libSQL + Turso + Vercel Blob. Decisão do Vini em 16/10. Registrado em `wiki/log.md` e constituição atualizada.

## Project Structure
```
app/src/
  lib/
    types.ts          ← tipos sem dependência (usados no navegador)
    db.ts             ← cliente libSQL, migração, seed
    data.ts           ← leitura pública (ativos)
    admin.ts          ← leitura e gravação do admin
    auth.ts           ← senha, cookie assinado
    events.ts         ← insert de evento e estatísticas
    track.ts          ← disparo de eventos no navegador
  app/
    api/events/route.ts          ← POST evento anônimo
    api/admin/upload/route.ts    ← token de upload do Blob
    admin/actions.ts             ← server actions
    admin/login/                 ← página e formulário
    admin/(painel)/layout.tsx    ← guarda + moldura
    admin/(painel)/page.tsx      ← ações
    admin/(painel)/acoes/[id]/   ← edição + vídeos
    admin/(painel)/uso/          ← painel
    icon.png, apple-icon.png, manifest.ts
  components/
    Track.tsx
    admin/{ui,ActionForm,ColorPicker,VideoUploader,ConfirmSubmit}.tsx
```

## Complexity Tracking
- Fallback de banco em `/tmp` na Vercel sem Turso: evita quebrar o site público antes da configuração. Custo: uma condição em `db.ts` e uma faixa de aviso.
