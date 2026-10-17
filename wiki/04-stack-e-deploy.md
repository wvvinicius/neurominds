# 04 · Stack e deploy

Critério: subir em minutos, custo zero ou quase, um dev mantém sozinho. Nada de servidor próprio, Docker ou pipeline.

## Stack travada
| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js** (App Router) + TypeScript | Um projeto só para site público, admin e API. Deploy nativo na Vercel. |
| Estilo | **Tailwind CSS** | Rápido, sem arquivo de tema separado. Tokens das cores da logo no config. |
| Banco | **SQLite via libSQL** (`@libsql/client`). Dev: arquivo em `app/data/`. Produção: **Turso** (SQLite hospedado, gratuito). | Decisão do Vini (16/10). Mesmo código nos dois ambientes; só muda a URL. Na Vercel o disco é efêmero, por isso Turso. |
| Arquivos | **Vercel Blob** (upload direto do navegador) | Função serverless não guarda arquivo. Blob tem plano gratuito e fica no mesmo painel. Vídeos do repositório continuam em `public/videos/`. |
| Auth (Fase 1) | **Senha única** em `ADMIN_PASSWORD`, cookie assinado | Suficiente para a equipe de conteúdo. |
| Auth (Fase 2) | A definir (Auth.js ou similar) | Login do profissional por e-mail. |
| E-mail (Fase 2) | **Resend** | Convite ao responsável. Plano gratuito basta. |
| Hospedagem | **Vercel** | Push na `main` = deploy. Preview por branch. |
| Domínio | A definir pelas alunas (registro.br, ~R$ 40/ano) | Aponta para a Vercel. |

## Admin na Fase 1 (entregue na spec 002)
Senha única em `ADMIN_PASSWORD`. O layout de `/admin` verifica um cookie assinado (HMAC da senha) e redireciona para `/admin/login`. Sem tabela de usuários. Em dev, sem a variável, a senha é `neurominds`. Em produção, sem a variável, o admin fica desligado com aviso.

## Variáveis de ambiente
```
ADMIN_PASSWORD=          ← senha da equipe de conteúdo
TURSO_DATABASE_URL=      ← libsql://...turso.io  (sem ela: arquivo local em dev, /tmp efêmero na Vercel)
TURSO_AUTH_TOKEN=
BLOB_READ_WRITE_TOKEN=   ← Vercel Blob (sem ela: "Enviar arquivo" avisa, "Adicionar por link" funciona)
```
Sem Turso em produção, o site público funciona com o seed e o admin mostra uma faixa amarela avisando que o banco é temporário.

## Estrutura do app (specs 001 e 002 entregues)
```
app/
  public/logo-mark.svg       ← arco-íris e mão, extraídos do PDF
  public/videos/<slug>/      ← vídeos versionados no repositório
  public/intro/              ← vídeo de apresentação do Teo
  data/neurominds.db         ← SQLite local (ignorado pelo git)
  src/app/
    globals.css              ← tokens (Tailwind 4, @theme), animações
    layout.tsx               ← fontes, metadata, ícones
    page.tsx                 ← cartas (público)
    acao/[slug]/             ← galeria da ação + loading
    admin/                   ← login, ações, vídeos, uso (server actions em actions.ts)
    api/events/              ← eventos anônimos
    api/admin/upload/        ← token do Vercel Blob
    manifest.ts, icon.png, apple-icon.png
  src/components/            ← público: Logo, ActionCard, ActionPlayer, IntroOverlay, SoundToggle, LoadingDots...
  src/components/admin/      ← ui, ActionForm, ColorPicker, VideoUploader, ConfirmSubmit
  src/data/seed.json         ← conteúdo inicial; entra no banco na primeira execução
  src/lib/
    types.ts                 ← tipos sem dependência
    db.ts                    ← libSQL, schema, seed
    data.ts                  ← leitura pública
    admin.ts                 ← gravações do admin
    auth.ts                  ← senha e cookie
    events.ts                ← eventos e estatísticas
    sound.ts, track.ts       ← som e métricas no navegador
```

Versões: Next.js 16, React 19, Tailwind 4 (tokens via `@theme` no CSS, sem `tailwind.config`). `cacheComponents` desligado. Páginas públicas `force-dynamic` porque o conteúdo vem do banco.

## Onde está no ar
- **Produção:** https://neurominds.vercel.app
- Projeto Vercel `neurominds`, time `neurominds` (hobby), Root Directory `app`, Node 24.
- Repositório: https://github.com/wvvinicius/neurominds (branch `main`).
- Banco: Turso via integração da Vercel (`database-aquamarine-car`). Vídeos enviados: Blob store `neurominds-videos`. Variáveis já no projeto, nos três ambientes.
- Admin: https://neurominds.vercel.app/admin (senha em `ADMIN_PASSWORD`, no painel da Vercel).
- Deploy manual a partir da raiz do repo: `npx vercel deploy --prod --scope neurominds`.

## Subir do zero
1. Importar o repo na Vercel com Root Directory `app`.
2. Criar um banco no Turso (`turso db create neurominds`), copiar URL e token para as variáveis.
3. Criar um Blob store no painel da Vercel (Storage → Blob) ligado ao projeto; a variável entra sozinha.
4. Definir `ADMIN_PASSWORD`. Push na `main`. Pronto. A migração e o seed rodam na primeira visita.

## Regras de código
- Server Components por padrão. Client Component só onde há interação (player, admin).
- SQL direto com libSQL. Sem camada de repositório, sem ORM. Gravações só por server actions com guarda de admin.
- Upload de vídeo: do navegador direto para o Vercel Blob com token emitido por rota protegida, para não passar pelo servidor (limite de 4,5 MB no body).
- Sem testes automatizados na Fase 1. Teste manual no tablet antes da Mostra.
- Sem i18n, sem dark mode, sem PWA. Tela cheia no navegador já resolve.
