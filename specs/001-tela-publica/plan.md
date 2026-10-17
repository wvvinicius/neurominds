# Implementation Plan: Tela pública (criança)

**Branch**: `001-tela-publica` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

## Summary
Duas rotas públicas em Next.js: `/` com a grade de cartas e `/acao/[slug]` com o player de um vídeo por vez. Dados lidos de `seed.json` por uma função única, pronta para trocar por Supabase quando o admin existir. Identidade visual via tokens Tailwind e fontes do Google. Sem banco, sem auth, sem métricas nesta spec.

## Technical Context
**Language/Version**: TypeScript 5, Node 22
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 4, `next/font/google`
**Storage**: `src/data/seed.json` nesta spec. Supabase entra na spec do admin.
**Testing**: Manual no tablet (constituição, workflow). Lint com `npm run lint`.
**Target Platform**: Navegador em tablet (Chrome/Safari), paisagem e retrato. Funciona no celular.
**Project Type**: Web, projeto único em `app/`.
**Performance Goals**: Cartas em menos de 2 s em 4G. Vídeo começa em menos de 1 s após o toque.
**Constraints**: Alvos 56 px, sem autoplay do próximo, sem som automático, reduced-motion, sem links externos.
**Scale/Scope**: Dezenas de ações, centenas de vídeos, público de um stand.

## Constitution Check
- I. MVP: cobre só NM-01 a 08 e NM-10. Voz (NM-09) e métricas (NM-17) ficam fora. OK.
- II. Simples: dois Server Components, dois Client Components (player, botão de tela cheia). Sem estado global, sem libs extras. OK.
- III. Deploy: `next build` estático, sobe na Vercel sem variável de ambiente. OK.
- IV. Lúdico e acessível: tokens de cor, fontes, regras de toque e motion no CSS global. OK.
- V. LGPD: nenhum dado coletado nesta spec. Rodapé de transparência presente. OK.

Ajuste de scaffold: `cacheComponents` e `partialPrefetching` desligados no `next.config.ts`. Motivo: o modo de cache do Next 16 exige Suspense ou `"use cache"` em toda leitura dinâmica, o que vai complicar a troca para Supabase sem trazer ganho para um site deste tamanho.

## Project Structure

### Documentation (this feature)
```
specs/001-tela-publica/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)
```
app/
├── public/
│   └── logo-mark.svg             ← arco-íris e mão, extraídos do PDF
├── src/
│   ├── app/
│   │   ├── globals.css           ← tokens de cor, fontes, reduced-motion
│   │   ├── layout.tsx            ← fontes, lang pt-BR, metadata
│   │   ├── page.tsx              ← cartas (Server Component)
│   │   ├── not-found.tsx         ← 404 amigável
│   │   └── acao/[slug]/page.tsx  ← tela da ação (Server Component)
│   ├── components/
│   │   ├── Logo.tsx
│   │   ├── ActionCard.tsx
│   │   ├── BackButton.tsx
│   │   ├── ActionPlayer.tsx      ← Client Component
│   │   ├── FullscreenButton.tsx  ← Client Component
│   │   └── Footer.tsx
│   ├── data/seed.json
│   └── lib/data.ts               ← getActions(), getActionBySlug()
└── next.config.ts
```

## Complexity Tracking
Nenhuma violação da constituição.
