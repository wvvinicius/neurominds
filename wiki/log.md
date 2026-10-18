# Log de decisões

Formato: data · decisão · motivo. Mais recente no topo.

## 2026-10-18 (3) — biblioteca do Teo
- **48 vídeos de ação importados**, em 30 ações, a partir do gerador do Vini em `insumos/teo-personagem/`. Versões com som, hospedadas no Vercel Blob. Script idempotente em `app/scripts/import-teo.mjs`, rodado no local e no Turso.
- **Cartas sem vídeo desativadas** (abraçar, pular, dormir, lavar, brincar). Continuam no admin; reativar quando houver vídeo.
- **Decisão revisada**: vídeos são gerados por código (rig SVG), não por IA. O log de 16/10 dizia o contrário; o Vini mudou de ideia ao construir o rig.

## 2026-10-18 (2) — entrada por perfil
- **Home vira vídeo do Teo + "Sou profissional | Sou aluno".** Motivo: pedido do Vini. Cartas abertas foram para `/cartas`, com atalho discreto, porque o stand da Mostra não terá login.
- **"Sou aluno" é um link mágico para o responsável**: informa o e-mail cadastrado pelo profissional e recebe o link da prancha. Cobre o NM-22 em autoatendimento. A tela responde igual com ou sem cadastro, para não revelar quem está no sistema.
- **Chave do Resend gravada** em produção e preview. Sem domínio verificado, o Resend só entrega ao e-mail da própria conta.

## 2026-10-18 — spec 003
- **Área do profissional no ar** (`/pro`): login por link mágico, alunos por apelido, prancha por aluno, link da criança, sessões, relatório, exclusão em cascata, CSV anônimo.
- **Uma prancha por aluno.** A entidade `board` do modelo original virou `student_action`. Motivo: MVP; várias pranchas nomeadas só se um profissional pedir.
- **Convite por e-mail (NM-22) fora.** O profissional copia o link e manda como preferir. Motivo: evita depender de domínio verificado para o uso começar.
- **Segurança por linha na aplicação.** SQLite não tem RLS; todas as funções de aluno recebem o id do profissional logado.
- **Resend para e-mail, por HTTP, sem SDK.** Sem chave, em dev o link aparece na tela. Para enviar a qualquer e-mail é preciso domínio verificado, o que liga NM-30 (domínio) à Fase 2.

## 2026-10-16 (noite, 9)
- **Turso e Blob ligados em produção.** Banco e vídeos enviados agora persistem. A faixa de "banco temporário" sumiu do admin. Seed rodou na primeira visita.
- A integração instalou arquivos de referência do Turso (`.agents/`, `.claude/skills/turso-cloud/`, `skills-lock.json`). Removidos: não agregam ao produto. Documentação do libSQL está em `app/src/lib/db.ts` e neste wiki.

## 2026-10-16 (noite, 8) — spec 002
- **Supabase sai, SQLite entra.** Banco via libSQL: arquivo local em dev, Turso em produção. Motivo: decisão do Vini. Vídeos enviados pelo admin vão para o Vercel Blob, porque função serverless não guarda arquivo.
- **Gerenciador de conteúdo no ar** (`/admin`): senha única, ações, vídeos com upload, link e pré-visualização, painel de uso. Tudo que muda aparece no site na hora.
- **Eventos anônimos ligados**: open_home, open_action, play_video, finish_video com duração. Id de sessão rotativo de 24 h, sem dado pessoal.
- **Logo estava invertida** desde a conversão do PDF (arco virou tigela). Corrigida com espelhamento vertical. Favicon, ícone Apple e manifest gerados da marca.
- **Fallbacks em produção**: sem Turso o banco é temporário com aviso no admin; sem Blob o upload avisa e o link funciona; sem senha o admin desliga.

## 2026-10-16 (noite, 7)
- **Primeiro deploy em produção**: https://neurominds.vercel.app, via CLI a partir da raiz do repo. Root Directory `app` no projeto Vercel.
- **Intro aparece a cada carregamento do app**, não mais uma vez por sessão. Motivo: pedido do Vini. Voltar de uma carta não repete.
- **Sons distintos para avançar (subindo) e voltar (descendo)** na galeria.

## 2026-10-16 (noite, 6)
- **Player vira galeria**: desliza com direção, setas dão a volta, arrastar navega, repetir sempre à mão, fichas numeradas para pular. Motivo: pedido do Vini por experiência lúdica de galeria.
- **Indicador de espera padrão** (`LoadingDots`): pontos nas cores da logo saltando. Usado na intro, no palco do vídeo e no loading de rota da ação. Regra: toda espera visível para a criança mostra esse indicador.
- **Primeiros vídeos reais de chutar** (futebol, karatê, natação) em `app/public/videos/chutar/`, cadastrados no seed. Arquivos vêm de `insumos/`.

## 2026-10-16 (noite, 5)
- **Som ligado por padrão.** Antes era desligado. Motivo: decisão do Vini. Limite do navegador: antes do primeiro toque, vídeo só toca mudo; a tela mostra "Toque para ouvir" e um toque libera. Constituição e design system atualizados.
- **Intro: ao terminar oferece Repetir ou Seguir.** Nada avança sozinho.

## 2026-10-16 (noite, 4)
- **Introdução com o Teo (NM-37)**: ao abrir o site, tela animada de carregamento e vídeo de apresentação, com "Pular". Aparece uma vez por sessão do navegador, para não repetir a cada volta às cartas. Vídeo em `app/public/intro/`. Motivo: pedido do Vini.

## 2026-10-16 (noite, 3)
- **Paleta de interface em duas camadas**: marca (cores puras da logo, só na logo e detalhes) e interface (soft, mid, deep derivados, flat, sem sombra). Motivo: Vini achou as cores puras vivas demais em área grande. Ver `05-design-system.md`.
- **Repositório git criado e publicado** em github.com/wvvinicius/neurominds. Transcrição da reunião fica fora do git (nomes de alunas). Deploy na Vercel com Root Directory `app`.

## 2026-10-16 (noite, 2)
- **Personagem fixo nos vídeos: Teo**, menino negro, engraçado, cabelo black power, roupa nas cores da logo. Nome provisório. Motivo: identidade e reconhecimento pela criança entre vídeos.
- **Vídeos são gerados por IA, não animados por código.** Um gerador em código foi tentado e descartado no mesmo dia. Motivo: decisão do Vini, o produto precisa de vídeo de verdade.
- **Primeira ação com prompts prontos: chutar** (arte marcial, futebol, natação). Ver `11-personagem-e-prompts.md`.

## 2026-10-16 (noite)
- **Emenda lúdica na spec 001**: animações de entrada e toque (pop, wiggle, slide) e efeitos sonoros sintetizados (pop, tick, ding). Motivo: pedido do Vini para deixar mais lúdico.
- **Som vira interruptor único do app**, desligado por padrão e lembrado no aparelho via localStorage. Controla vídeos e efeitos. Motivo: um conceito só para a criança, e garante que nada toca som sem alguém ligar.

## 2026-10-16 (tarde)
- **Spec Kit instalado** (`.specify/`, skills `/speckit-*`). Spec 001 "Tela pública" cobre NM-01 a 08 e NM-10. NM-09 (voz) fica no backlog.
- **App criado em `app/`**: Next.js 16, React 19, Tailwind 4. Scaffold veio com `cacheComponents` ligado; desligado de propósito para não complicar a troca de seed por Supabase.
- **Dados da Fase 1 em `src/data/seed.json`** lidos por `src/lib/data.ts`. Motivo: admin (NM-11 a 15) ainda não foi aprovado; quando for, só a camada de dados muda.
- **Logo vetorial convertida para SVG** (`app/public/logo-mark.svg`) direto do PDF. Wordmark renderizado em Bebas Neue via fonte web, não como path.
- **Player sem loop**: ao terminar, mostra "ver de novo". Motivo: a criança decide; e a futura métrica de "viu até o fim" (NM-17) precisa do evento de término.

## 2026-10-16
- **Wiki criada** a partir da transcrição da reunião de 14/10 e da logo. Estrutura: 9 docs + log.
- **Cores extraídas do vetor da logo**: amarelo `#F8E600`, azul `#009ADA`, vermelho `#FC0000`, verde `#45A102`, preto e branco. Fonte do wordmark: Bebas Neue. UI usará Nunito para corpo.
- **Stack travada**: Next.js + Tailwind + Supabase (Postgres, Storage, Auth na Fase 2) + Vercel. Motivo: deploy em minutos, custo zero, um dev mantém sozinho.
- **Admin da Fase 1 com senha única** em variável de ambiente. Motivo: a equipe de conteúdo precisa de independência já na Mostra, sem construir auth completo.
- **Métricas anônimas entram na Fase 1**. Motivo: custo baixo e dá evidência de uso para a FENIC desde o primeiro dia.
- **Proporção dos vídeos: 16:9, 5 a 8 s, até 15 MB**. Motivo: tablet em paisagem no stand, player simples, storage gratuito aguenta.

## 2026-10-14 (reunião de kickoff)
- **Vini desenvolve e hospeda sem custo.** Equipe de conteúdo gera os vídeos. Motivo: o gargalo é vídeo, não código.
- **Fase 1 é pública, sem login.** Motivo: prazo de 6 dias e uso no stand por público aberto. Decisão da Nina, aceita por todos.
- **Login, prancha por aluno e relatório ficam para a Fase 2.** Motivo: valor para o profissional está em escolher ações por criança e saber se usou. Precisa existir, mas não até a Mostra.
- **Gamificação adiada.** Motivo: "mais trabalho do que valor" numa primeira versão (Vini). Nina concordou.
- **Criança nunca identificada por nome real.** Motivo: LGPD, dados sensíveis. Uso por apelido vinculado a um responsável adulto.
- **Objetivo é causa, não negócio.** Conversa comercial só daqui a 12 meses, se houver resultado.
