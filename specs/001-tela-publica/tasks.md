# Tasks: Tela pública (criança)

**Input**: [spec.md](spec.md), [plan.md](plan.md)
**Tests**: Não solicitados. Validação manual no tablet.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[USn]**: user story da spec

## Phase 1: Setup
- [x] T001 Desligar `cacheComponents` e `partialPrefetching` em `app/next.config.ts`
- [x] T002 [P] Copiar `logo-mark.svg` para `app/public/` e remover SVGs do scaffold
- [x] T003 [P] Tokens de cor, fontes e reduced-motion em `app/src/app/globals.css`
- [x] T004 [P] Fontes Bebas Neue e Nunito, `lang="pt-BR"`, metadata em `app/src/app/layout.tsx`

## Phase 2: Foundational
- [x] T005 Tipos `Action`/`Video` e funções `getActions()`, `getActionBySlug()` em `app/src/lib/data.ts`
- [x] T006 [P] Seed com as 8 ações sugeridas em `app/src/data/seed.json`
- [x] T007 [P] `Logo.tsx` (marca + wordmark em Bebas Neue) em `app/src/components/`
- [x] T008 [P] `Footer.tsx` com texto de transparência (FR-009) em `app/src/components/`
- [x] T009 [P] `BackButton.tsx` fixo no canto superior esquerdo (FR-003) em `app/src/components/`

## Phase 3: User Story 1 - Ver cartas e abrir uma ação (P1) 🎯 MVP
- [x] T010 [US1] `ActionCard.tsx` com emoji, nome, cor e alvo mínimo 56 px em `app/src/components/`
- [x] T011 [US1] Página de cartas em `app/src/app/page.tsx` (grade responsiva 2/4 colunas, header com logo, footer)
- [x] T012 [US1] Página da ação em `app/src/app/acao/[slug]/page.tsx` com `notFound()` para slug inválido e estado vazio sem vídeos
- [x] T013 [US1] `not-found.tsx` amigável com botão de voltar em `app/src/app/`

## Phase 4: User Story 2 - Controlar o vídeo (P2)
- [x] T014 [US2] `ActionPlayer.tsx`: um vídeo por vez, mudo por padrão, botão de som, próximo/anterior com indicador "n de total", sem autoplay do próximo, botão "ver de novo" ao terminar, legenda opcional, erro de carregamento tratado
- [x] T015 [US2] Pontos de extensão no player (callbacks `onPlay`, `onEnded`, `onChange`) sem implementação, para a spec de métricas

## Phase 5: User Story 3 - Modo stand (P3)
- [x] T016 [US3] `FullscreenButton.tsx` (Client Component, `requestFullscreen`) no header da página de cartas
- [x] T017 [US3] Revisar que não há links externos nas telas públicas

## Phase 6: Polish
- [x] T018 `npm run lint` e `npm run build` sem erros
- [ ] T019 Teste manual: tablet retrato e paisagem, reduced-motion ligado, ação sem vídeo, slug inválido
- [x] T020 Atualizar `wiki/log.md` e `wiki/04-stack-e-deploy.md` com o que mudou

## Phase 7: Emenda lúdica (FR-011, FR-012)
- [x] T021 Keyframes e tokens de animação em `app/src/app/globals.css` (pop, wiggle, slide, pulse, wave) e faixa `.nm-stripe`
- [x] T022 `app/src/lib/sound.ts`: interruptor global em localStorage + efeitos sintetizados com Web Audio
- [x] T023 `SoundToggle.tsx` (pill no header, round no player) substitui o botão de mudo local do player
- [x] T024 Animações de entrada e toque em `ActionCard`, `BackButton`, `ActionPlayer`, páginas de cartas, ação e 404

## Phase 8: Introdução com o Teo (FR-013)
- [x] T025 Vídeo `insumos/apresentacao-teo.mp4` copiado para `app/public/intro/`
- [x] T026 `IntroOverlay.tsx`: tela de carregamento animada, vídeo com pular, uma vez por sessão, incluída em `page.tsx`

## Dependencies & Execution Order
- Phase 1 e 2 antes de tudo. T002, T003, T004 em paralelo. T006 a T009 em paralelo após T005.
- US1 (T010 a T013) entrega valor sozinha e é o MVP.
- US2 (T014, T015) depende de T012.
- US3 (T016, T017) depende de T011.
