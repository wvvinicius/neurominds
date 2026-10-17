# Feature Specification: Tela pública (criança)

**Feature Branch**: `001-tela-publica`
**Created**: 2026-10-16
**Status**: Approved
**Input**: Funcionalidades NM-01, NM-02, NM-03, NM-04, NM-05, NM-06, NM-07, NM-08, NM-10 de `wiki/10-funcionalidades.md`. NM-09 (voz) fica no backlog.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver cartas e abrir uma ação (Priority: P1)
A criança abre o site no tablet, vê cartas grandes e coloridas com emoji e nome da ação, toca em uma e vê o primeiro vídeo daquela ação.

**Why this priority**: É o produto inteiro na Fase 1. Sem isso não há Mostra.

**Independent Test**: Abrir `/`, ver pelo menos 8 cartas, tocar em "Chutar", ver o vídeo em tela grande em até 2 toques.

**Acceptance Scenarios**:
1. **Given** o site aberto, **When** a página carrega, **Then** aparecem as cartas ativas, ordenadas, cada uma com emoji, nome e uma das quatro cores da logo.
2. **Given** a tela de cartas, **When** toco em uma carta, **Then** abro `/acao/[slug]` com o primeiro vídeo visível e o nome da ação no topo.
3. **Given** a tela da ação, **When** toco no botão de voltar, **Then** volto para as cartas, no mesmo lugar da tela.
4. **Given** uma ação sem vídeos, **When** abro a tela da ação, **Then** vejo uma mensagem amigável e o botão de voltar.

### User Story 2 - Controlar o vídeo (Priority: P2)
A criança vê um vídeo por vez. Ele começa mudo. Ela liga o som se quiser, passa para o próximo contexto ou volta ao anterior. Nada avança sozinho.

**Why this priority**: Sem controle previsível a criança com TEA perde a referência. É o que diferencia de um player comum.

**Independent Test**: Abrir uma ação com 3 vídeos, confirmar que começa mudo, ligar o som, ir ao próximo, voltar, deixar o vídeo terminar e confirmar que não avança.

**Acceptance Scenarios**:
1. **Given** a tela da ação, **When** o vídeo começa, **Then** está mudo e há um botão grande de som visível.
2. **Given** o vídeo mudo, **When** toco no botão de som, **Then** o áudio liga e o ícone muda. Toco de novo e desliga.
3. **Given** o vídeo 1 de 3, **When** toco em "próximo", **Then** vejo o vídeo 2 e o indicador mostra "2 de 3".
4. **Given** o vídeo 1 de 3, **When** toco em "anterior", **Then** nada acontece e o botão está visivelmente desabilitado.
5. **Given** o vídeo terminou, **When** não toco em nada, **Then** ele permanece parado no último quadro com um botão grande de "ver de novo".
6. **Given** um vídeo com legenda, **When** ele está na tela, **Then** a legenda aparece em uma linha abaixo do vídeo. Sem legenda, nada aparece.

### User Story 3 - Modo stand (Priority: P3)
Na Mostra, a equipe coloca o tablet em tela cheia para o público usar sem sair do site por acidente.

**Why this priority**: Só importa no dia 20/10. É pequeno e evita problemas no stand.

**Independent Test**: Tocar no botão "Tela cheia" no topo da tela de cartas, confirmar que o navegador entra em tela cheia e que não há nenhum link para fora do site.

**Acceptance Scenarios**:
1. **Given** a tela de cartas, **When** toco em "Tela cheia", **Then** o navegador entra em tela cheia e o site continua funcionando.
2. **Given** qualquer tela pública, **When** procuro links externos, **Then** não existem.

### Edge Cases
- Tablet em retrato: cartas em 2 colunas, vídeo ocupa a largura. Em paisagem: 4 colunas, vídeo ocupa a altura.
- Vídeo falha ao carregar: mostra mensagem curta e mantém próximo/anterior funcionando.
- `prefers-reduced-motion` ativo: nenhuma transição ou escala no toque.
- Slug inexistente em `/acao/[slug]`: página 404 amigável com botão de voltar.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001** (NM-01): Sistema MUST exibir as ações ativas como cartas com emoji, nome e cor, ordenadas por `sort_order`.
- **FR-002** (NM-02): Sistema MUST exibir um vídeo por vez na tela da ação com botões de próximo e anterior e indicador "n de total".
- **FR-003** (NM-03): Botão de voltar MUST estar no canto superior esquerdo, com o mesmo tamanho e ícone em todas as telas.
- **FR-004** (NM-04): Vídeo MUST iniciar mudo. MUST haver botão de som. Sistema MUST NOT avançar para o próximo vídeo automaticamente.
- **FR-005** (NM-05): Sistema MUST exibir a legenda do vídeo em uma linha quando existir.
- **FR-006** (NM-06): Alvos de toque MUST ter no mínimo 56 px. Sistema MUST respeitar `prefers-reduced-motion`. Texto MUST ter contraste AA. Sem flash, sem animação de fundo.
- **FR-007** (NM-07): Sistema MUST usar a logo, as cores `#F8E600 #009ADA #FC0000 #45A102`, Bebas Neue em títulos e Nunito no corpo. Fundo branco.
- **FR-008** (NM-08): Tela de cartas MUST ter um botão que coloca o navegador em tela cheia. Telas públicas MUST NOT ter links externos.
- **FR-009** (NM-10): Rodapé MUST exibir: "Este site não coleta dados pessoais. Registramos apenas quais vídeos foram vistos, de forma anônima."
- **FR-010**: Dados de ações e vídeos MUST vir de uma única função de leitura, para que o admin (NM-12, NM-13) troque a fonte sem alterar as telas.
- **FR-011** (emenda 2026-10-16): Som MUST ser um interruptor único do app, desligado por padrão, lembrado no aparelho. Controla o áudio dos vídeos e os efeitos sonoros da interface (pop ao tocar na carta, tick ao navegar, ding ao terminar o vídeo). Efeitos sintetizados, sem arquivos.
- **FR-013** (emenda 2026-10-16, NM-37): Ao abrir o site, sistema MUST mostrar uma introdução em tela cheia com o vídeo de apresentação do Teo. Enquanto o vídeo carrega, MUST mostrar uma tela animada (logo, nome, pontos saltando). MUST haver botão "Pular" sempre visível. A introdução some ao terminar o vídeo ou ao pular, e aparece uma vez por sessão do navegador. Som segue o interruptor global. Se o vídeo falhar, a introdução some sozinha.
- **FR-012** (emenda 2026-10-16): Animações lúdicas MUST ser curtas (até 0,5 s), disparadas por carregamento ou toque, nunca em loop no fundo. Exceções em loop: pulso suave do botão "ver de novo" e ondinhas do ícone de som ligado. Todas desligam com `prefers-reduced-motion`.

### Key Entities
- **Action**: slug, name, emoji, color (yellow | blue | red | green), sort_order, is_active, videos.
- **Video**: src (URL ou caminho), caption opcional, sort_order, is_active.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: Da tela inicial ao primeiro vídeo em no máximo 2 toques.
- **SC-002**: Todo botão da tela pública mede 56 px ou mais em ambos os eixos.
- **SC-003**: Página de cartas carrega em menos de 2 s em 4G no tablet.
- **SC-004**: Zero links externos nas telas públicas.
- **SC-005**: Nenhum vídeo avança sozinho em nenhuma circunstância.

## Assumptions
- Na Fase 1 os dados vêm de `src/data/seed.json`. Quando o admin existir, a função de leitura passa a consultar o Supabase. As telas não mudam.
- Vídeos em MP4 16:9, 5 a 8 s, conforme `wiki/06-conteudo-videos.md`.
- Métricas (NM-17) não fazem parte desta spec. O player expõe pontos de extensão (início, fim, troca de vídeo) para uma spec futura.
