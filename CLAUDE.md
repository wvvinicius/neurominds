# NeuroMinds — instruções para o LLM

Projeto pro bono: app web lúdico que ajuda crianças com TEA a compreender **ações** (chutar, abraçar, pular...) por meio de vídeos curtos em vários contextos. Nasceu de um projeto escolar (SESI) e será apresentado na Mostra da escola em **terça, 20/10/2026**.

## Leia primeiro
1. `wiki/INDEX.md` — mapa da wiki.
2. `wiki/02-escopo-mvp.md` — o que entra e o que NÃO entra. É a fonte de verdade do escopo.
3. `wiki/04-stack-e-deploy.md` — decisões técnicas travadas.

## Regras de ouro
- **É um MVP.** Antes de criar qualquer coisa pergunte: "isso agrega valor pro profissional ou pra criança HOJE?" Se não, não faz. Anota em `wiki/09-backlog-futuro.md`.
- **Direto e rápido.** Menos abstração, menos camadas, menos dependências. Código simples que o Vini consegue manter sozinho em semanas caóticas.
- **Deploy em minutos.** Nada que exija servidor próprio, Docker ou pipeline. Vercel + Supabase.
- **Lúdico, não poluído.** Cores da logo como acento sobre fundo branco. Ver `wiki/05-design-system.md`.
- **LGPD por padrão.** Nunca identificar criança por nome real. Ver `wiki/07-dados-e-lgpd.md`.
- **Idioma:** código em inglês (variáveis, tabelas, rotas internas), UI e docs em pt-BR.
- Toda decisão nova vai pra `wiki/log.md` com data.

## Spec Kit
O projeto usa GitHub Spec Kit. Constituição em `.specify/memory/constitution.md`. Cada feature vive em `specs/NNN-nome/` com `spec.md`, `plan.md` e `tasks.md`, e referencia os IDs `NM-xx` de `wiki/10-funcionalidades.md`. Skills disponíveis: `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`. O repo não é git ainda, então as specs são criadas por pasta, sem branch.

## Estrutura do repo
```
CLAUDE.md        ← você está aqui
.specify/        ← Spec Kit (constituição, templates, scripts)
specs/           ← uma pasta por feature
insumos/         ← material bruto (logo PDF, transcrição da reunião). Não editar.
wiki/            ← conhecimento curado do projeto. Fonte de verdade.
app/             ← Next.js. Rodar com `cd app && npm run dev`.
```
