# Tasks: Gerenciador de conteúdo e métricas

**Input**: [spec.md](spec.md), [plan.md](plan.md)

## Phase 1: Banco
- [x] T001 `@libsql/client` e `@vercel/blob` instalados; `serverExternalPackages` no `next.config.ts`
- [x] T002 `lib/db.ts`: cliente, schema (action, video, event), seed a partir de `seed.json`, fallback `/tmp` na Vercel
- [x] T003 `lib/types.ts` sem dependências; `lib/data.ts` lê do banco; páginas públicas `force-dynamic`

## Phase 2: Acesso (NM-11)
- [x] T004 `lib/auth.ts`: senha, token HMAC, cookie httpOnly 30 dias
- [x] T005 `/admin/login` com `useActionState`; `(painel)/layout.tsx` redireciona sem sessão

## Phase 3: Ações e vídeos (NM-12, NM-13, NM-14)
- [x] T006 `lib/admin.ts`: listar, criar (slug único), editar, ativar, mover, excluir ações; adicionar, legenda, ativar, mover, excluir vídeos
- [x] T007 `admin/actions.ts`: server actions com guarda e `revalidatePath("/", "layout")`
- [x] T008 `/admin`: lista com ordem, ativa/inativa, link de edição; formulário de nova ação com `ColorPicker`
- [x] T009 `/admin/acoes/[id]`: edição, lista de vídeos com pré-visualização, legenda, ordem, ativo, excluir com confirmação; `VideoUploader` (Blob + link); excluir ação
- [x] T010 `api/admin/upload`: `handleUpload` com tipos e tamanho; 501 claro sem token

## Phase 4: Métricas (NM-17, NM-15)
- [x] T011 `lib/track.ts` + `Track.tsx`: id anônimo 24 h, `sendBeacon`; eventos na home, na ação e no player (play/finish com duração)
- [x] T012 `api/events`: validação e insert; nunca falha para o usuário
- [x] T013 `lib/events.ts` + `/admin/uso`: totais, por ação, por vídeo

## Phase 5: Marca (NM-44)
- [x] T014 Logo SVG corrigida (estava invertida); `icon.png`, `apple-icon.png`, `manifest.ts`, `appleWebApp`

## Phase 6: Polish
- [x] T015 Lint, tipos e build de produção limpos
- [x] T016 `.env.example`, `data/` no gitignore, wiki e constituição atualizadas
- [ ] T017 Configurar Turso e Blob na Vercel (depende de conta e variáveis)
- [ ] T018 Teste da equipe: criar uma ação e subir um vídeo em produção
