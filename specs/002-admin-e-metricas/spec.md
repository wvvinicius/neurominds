# Feature Specification: Gerenciador de conteúdo e métricas

**Feature Branch**: `002-admin-e-metricas`
**Created**: 2026-10-16
**Status**: Implemented
**Input**: NM-11, NM-12, NM-13, NM-14, NM-15, NM-17, NM-44 de `wiki/10-funcionalidades.md`. Decisão do Vini: banco SQLite.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Equipe de conteúdo cadastra ações e vídeos sozinha (Priority: P1)
Manu ou Nina entram no gerenciador com a senha da equipe, criam a ação "Abraçar", escolhem emoji e cor, sobem três vídeos com legenda, conferem a pré-visualização e veem a carta aparecer no site na hora.

**Why this priority**: É o que tira o Vini do caminho. Sem isso, cada vídeo novo depende dele.

**Independent Test**: Entrar em `/admin`, criar uma ação, adicionar um vídeo por link, abrir o site e ver a carta e o vídeo.

**Acceptance Scenarios**:
1. **Given** `/admin` sem sessão, **When** abro, **Then** sou levado a `/admin/login`. Com a senha certa, entro; com a errada, vejo "Senha incorreta".
2. **Given** a lista de ações, **When** crio "Abraçar" com 🤗 e vermelho, **Then** ela aparece na lista e no site, por último.
3. **Given** uma ação, **When** subo um MP4 com legenda, **Then** ele aparece na lista com player de pré-visualização e no site como último vídeo da ação.
4. **Given** uma ação, **When** adiciono por link `/videos/chutar/chutar-futebol.mp4`, **Then** funciona igual ao upload.
5. **Given** ações e vídeos, **When** uso ↑ ↓, **Then** a ordem muda no admin e no site.
6. **Given** uma ação ativa, **When** marco Inativa, **Then** some do site e continua no admin, apagada. O mesmo para vídeo.
7. **Given** um vídeo, **When** clico Excluir e confirmo, **Then** some do banco e, se estava no Blob, do armazenamento.

### User Story 2 - Equipe vê o que foi usado (Priority: P2)
Depois da Mostra, a equipe abre "Uso" e vê quantas sessões anônimas houve, quais ações foram mais abertas e quais vídeos foram vistos até o fim.

**Why this priority**: Evidência para a FENIC desde o primeiro dia.

**Independent Test**: Navegar no site, abrir uma ação, deixar um vídeo terminar, abrir `/admin/uso` e ver as contagens subirem.

**Acceptance Scenarios**:
1. **Given** uso do site, **When** abro `/admin/uso`, **Then** vejo sessões anônimas, interações, vídeos até o fim e últimos 7 dias.
2. **Given** a tabela por ação, **Then** cada linha mostra aberturas, vídeos iniciados e vistos até o fim.
3. **Given** a tabela por vídeo, **Then** vejo iniciados, até o fim e tempo médio.

### Edge Cases
- Hospedagem sem Blob configurado: "Enviar arquivo" avisa e "Adicionar por link" segue funcionando.
- Hospedagem sem Turso: faixa amarela no admin avisa que o banco é temporário.
- Produção sem `ADMIN_PASSWORD`: a tela de login explica que o admin está desligado.
- Evento malformado no endpoint público: 400, sem gravar. Métrica nunca derruba a experiência da criança.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001** (NM-11): Admin MUST exigir senha única (`ADMIN_PASSWORD`) e manter sessão por cookie assinado, httpOnly, 30 dias. Em dev sem variável, senha "neurominds".
- **FR-002** (NM-12): Admin MUST criar, editar (nome, emoji, cor), ordenar, ativar/desativar e excluir ações. Slug gerado do nome, único.
- **FR-003** (NM-13): Admin MUST adicionar vídeo por upload (navegador → Vercel Blob, até 50 MB, MP4/WebM/MOV) e por link; editar legenda; ordenar; ativar/desativar; excluir.
- **FR-004** (NM-14): Cada vídeo no admin MUST ter player de pré-visualização.
- **FR-005** (NM-15): Admin MUST mostrar painel de uso com totais, por ação e por vídeo, só com contagens anônimas.
- **FR-006** (NM-17): Site público MUST registrar `open_home`, `open_action`, `play_video`, `finish_video` (com duração) com id anônimo de sessão renovado a cada 24 h. Endpoint público valida tipo e tamanhos.
- **FR-007** (NM-44): Favicon, ícone Apple e manifest MUST usar a marca.
- **FR-008**: Banco MUST ser SQLite via libSQL: arquivo local em dev, Turso em produção, migração e seed automáticos na primeira consulta.
- **FR-009**: Toda mudança no admin MUST aparecer no site público sem redeploy.

### Key Entities
- **action**: id, slug, name, emoji, color, sort_order, is_active, created_at.
- **video**: id, action_id, src, caption, sort_order, is_active, created_at.
- **event**: id, anon_session_id, type, action_id, video_id, duration_ms, created_at.

## Success Criteria *(mandatory)*
- **SC-001**: Equipe cadastra uma ação com três vídeos em menos de 5 minutos sem ajuda.
- **SC-002**: Nenhum dado pessoal em nenhuma tabela.
- **SC-003**: Mudança no admin visível no site em menos de 5 segundos.

## Assumptions
- Turso e Vercel Blob são configurados por variáveis de ambiente; sem eles o app degrada com aviso, nunca quebra.
- Um único perfil de admin basta na Fase 1 (NM-16 fica para depois).
