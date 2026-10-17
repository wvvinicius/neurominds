# NeuroMinds Constitution

Fonte: `wiki/` (02-escopo-mvp, 04-stack-e-deploy, 05-design-system, 07-dados-e-lgpd). Em conflito, a wiki manda e esta constituição é atualizada.

## Core Principles

### I. MVP primeiro
Toda funcionalidade passa pelo critério de `wiki/02-escopo-mvp.md`: ajuda a criança a compreender a ação ou o profissional a decidir a conduta; cabe em poucas horas; não cria dependência do dev para operar. Ideias que não passam vão para `wiki/09-backlog-futuro.md`, nunca para o código.

### II. Direto e simples
Menos abstração, menos camadas, menos dependências. Server Components por padrão, Client Components só onde há interação. Sem ORM, sem camada de repositório, sem i18n, sem dark mode, sem PWA. Um dev mantém sozinho em semanas caóticas.

### III. Deploy em minutos
Vercel + Supabase. Push na `main` publica. Nada que exija servidor próprio, Docker ou pipeline. Variáveis de ambiente documentadas em `.env.example`.

### IV. Lúdico, acessível, previsível (NON-NEGOTIABLE)
Fundo branco, cores da logo como acento, Bebas Neue em títulos curtos, Nunito no corpo. Na tela da criança: alvo de toque mínimo 56 px, som ligado por padrão com interruptor sempre visível (decisão de 16/10; o navegador só libera áudio após o primeiro toque, e a tela oferece "toque para ouvir"), sem autoplay do próximo vídeo, sem flash, sem animação de fundo, botão de voltar sempre no mesmo lugar, `prefers-reduced-motion` respeitado, contraste AA. Ver `wiki/05-design-system.md`.

### V. LGPD por desenho
Nunca guardar nome real, diagnóstico, idade, foto ou voz de criança. Uso identificado só por apelido, dentro da conta do profissional. Métricas públicas são anônimas. Ver `wiki/07-dados-e-lgpd.md`.

## Stack travada
Next.js (App Router) + TypeScript + Tailwind CSS. SQLite via libSQL (arquivo em dev, Turso em produção). Vercel Blob para vídeos enviados pelo admin. Senha única para o admin na Fase 1. Resend para e-mail (Fase 2). Vercel para hospedagem. Trocar qualquer item exige registro em `wiki/log.md` com motivo. (Emenda 2026-10-16: Supabase substituído por SQLite, decisão do Vini.)

## Workflow
- Catálogo de funcionalidades com ID em `wiki/10-funcionalidades.md`. Cada spec referencia os IDs `NM-xx` que cobre.
- Specs em `specs/NNN-nome/` com `spec.md`, `plan.md`, `tasks.md`.
- Código em inglês, UI e docs em pt-BR.
- Sem testes automatizados na Fase 1. Teste manual no tablet antes da Mostra.
- Decisões novas vão para `wiki/log.md` com data.

## Governance
Esta constituição prevalece sobre qualquer prática não documentada. Emendas exigem atualização da wiki correspondente e entrada no `wiki/log.md`. Complexidade adicional precisa de justificativa escrita no `plan.md` da feature.

**Version**: 1.1.0 | **Ratified**: 2026-10-16 | **Last Amended**: 2026-10-16 (som padrão, stack SQLite)
