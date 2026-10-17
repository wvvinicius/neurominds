# 04 · Stack e deploy

Critério: subir em minutos, custo zero ou quase, um dev mantém sozinho. Nada de servidor próprio, Docker ou pipeline.

## Stack travada
| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js** (App Router) + TypeScript | Um projeto só para site público, admin e API. Deploy nativo na Vercel. |
| Estilo | **Tailwind CSS** | Rápido, sem arquivo de tema separado. Tokens das cores da logo no config. |
| Banco | **Supabase Postgres** | Gratuito, SQL direto, painel web para a equipe olhar os dados. |
| Arquivos | **Supabase Storage** (bucket `videos`, público para leitura) | Mesmo projeto do banco. 1 GB grátis cobre ~200 vídeos curtos. Se estourar, migra para Cloudflare R2. |
| Auth (Fase 2) | **Supabase Auth** | Já está no projeto. Link mágico por e-mail evita senha. |
| E-mail (Fase 2) | **Resend** | Convite ao responsável. Plano gratuito basta. |
| Hospedagem | **Vercel** | Push na `main` = deploy. Preview por branch. |
| Domínio | A definir pelas alunas (registro.br, ~R$ 40/ano) | Aponta para a Vercel. |

## Admin na Fase 1
Senha única em variável de ambiente (`ADMIN_PASSWORD`). Middleware do Next protege `/admin/*` com cookie assinado. Sem tabela de usuários. Na Fase 2 o admin passa a ser um papel dentro do Supabase Auth.

## Estrutura do app (estado atual, spec 001 entregue)
```
app/
  public/logo-mark.svg       ← arco-íris e mão, extraídos do PDF
  src/app/
    globals.css              ← tokens de cor e fontes (Tailwind 4, @theme)
    layout.tsx               ← Bebas Neue + Nunito, lang pt-BR
    page.tsx                 ← cartas (público)
    acao/[slug]/page.tsx     ← vídeos da ação (público)
    not-found.tsx
  src/components/            ← Logo, ActionCard, BackButton, ActionPlayer, FullscreenButton, Footer
  src/data/seed.json         ← ações e vídeos da Fase 1 (até o admin existir)
  src/lib/data.ts            ← getActions(), getActionBySlug(). Única porta de leitura
```
Próximas specs acrescentam: `src/app/admin/`, `src/lib/supabase.ts`, `src/app/api/events/route.ts`, `supabase/migrations/`, `.env.example`.

Versões: Next.js 16, React 19, Tailwind 4 (tokens via `@theme` no CSS, sem `tailwind.config`). `cacheComponents` desligado no `next.config.ts`.

## Variáveis de ambiente
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      ← só no servidor (admin, upload)
ADMIN_PASSWORD=
```

## Subir do zero
1. Criar projeto no Supabase. Rodar `supabase/migrations/*.sql` no SQL Editor. Criar bucket `videos` público.
2. Importar o repo na Vercel. Colar as variáveis de ambiente.
3. Push na `main`. Pronto.

## Regras de código
- Server Components por padrão. Client Component só onde há interação (player, admin).
- Consultas ao Supabase direto nos Server Components. Sem camada de repositório, sem ORM.
- Upload de vídeo: do navegador direto para o Storage com URL assinada, para não passar pelo servidor da Vercel (limite de 4,5 MB no body).
- Sem testes automatizados na Fase 1. Teste manual no tablet antes da Mostra.
- Sem i18n, sem dark mode, sem PWA. Tela cheia no navegador já resolve.
