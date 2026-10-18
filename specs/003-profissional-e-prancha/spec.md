# Feature Specification: Área do profissional e prancha da criança

**Feature Branch**: `003-profissional-e-prancha`
**Created**: 2026-10-18
**Status**: Implemented
**Input**: NM-19, NM-20, NM-21, NM-23, NM-25, NM-26, NM-27, NM-28, NM-18 de `wiki/10-funcionalidades.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Profissional monta a prancha e entrega o link (Priority: P1)
A fonoaudióloga entra com o e-mail, cadastra "Joca" por apelido, marca as ações que ele vai trabalhar e copia o link da prancha para mandar à mãe. No consultório, abre o mesmo link pelo botão e a sessão fica marcada como presencial.

**Why this priority**: É o valor da Fase 2: cada criança vê só o que o profissional escolheu, e o profissional sabe o que aconteceu.

**Independent Test**: Login por link, criar aluno, marcar duas ações, abrir `/p/<token>` em outra janela e ver só essas duas cartas.

**Acceptance Scenarios**:
1. **Given** `/pro/login`, **When** informo o e-mail, **Then** recebo um link que vale 20 minutos e abre a área. O mesmo link não vale duas vezes.
2. **Given** a área, **When** cadastro um aluno com apelido, **Then** ele aparece na lista com 0 ações e 0 sessões.
3. **Given** o aluno, **When** marco ações e salvo, **Then** a prancha mostra só essas ações, na ordem da biblioteca.
4. **Given** o link da criança, **When** abro sem login, **Then** vejo "Oi, Joca!" e as cartas da prancha. Ação fora da prancha dá 404.
5. **Given** o link aberto pelo profissional logado, **Then** a sessão nasce como "Consultório". Aberto por qualquer outra pessoa, "Em casa".
6. **Given** "Gerar link novo", **Then** o link antigo para de funcionar.

### User Story 2 - Profissional lê o relatório (Priority: P2)
Depois de uma semana, a fonoaudióloga abre o aluno e vê as sessões, quanto tempo durou cada uma, quais ações foram abertas e quais vídeos foram vistos até o fim.

**Independent Test**: Usar a prancha, voltar ao aluno e ver a sessão listada com duração e contagens.

**Acceptance Scenarios**:
1. **Given** uso da prancha, **Then** o relatório mostra total de sessões, tempo total, vídeos até o fim e último uso.
2. **Given** a lista de sessões, **Then** cada linha mostra quando, onde (consultório ou casa), duração, ações abertas e vídeos até o fim.
3. **Given** a tabela por ação, **Then** cada ação da criança mostra aberturas, vídeos iniciados e vistos até o fim.

### User Story 3 - Dados para a FENIC (Priority: P3)
A equipe baixa um CSV agregado por semana e ação, sem nenhum identificador de pessoa.

**Acceptance Scenarios**:
1. **Given** profissional ou admin logado, **When** baixa `/api/export/uso.csv`, **Then** recebe semana, ação, aberturas, vídeos iniciados, concluídos, sessões anônimas, sessões de prancha e eventos presenciais. Sem login: 401.

### Edge Cases
- Sem `RESEND_API_KEY`: em dev o link aparece na tela; em produção a tela avisa que o envio falhou.
- Prancha sem ações: a criança vê "Sua prancha ainda está sendo montada".
- Profissional tenta abrir aluno de outro profissional: 404.
- Excluir aluno: apaga prancha, sessões e eventos vinculados.

## Requirements *(mandatory)*
- **FR-001** (NM-19): Login por link mágico por e-mail, token de uso único com 20 min, cookie assinado por 60 dias. Primeiro login cria o profissional.
- **FR-002** (NM-20): Aluno tem apelido e e-mail do responsável opcional. A interface MUST lembrar de não usar nome real.
- **FR-003** (NM-21): Uma prancha por aluno: subconjunto das ações ativas, na ordem da biblioteca.
- **FR-004** (NM-23): `/p/<token>` abre a prancha sem login. Token aleatório de 24 bytes, regenerável. Páginas com `noindex`.
- **FR-005** (NM-25): Cada abertura da prancha numa aba cria uma sessão (reaproveitada por 30 min). Eventos levam `session_id`; o fim da sessão é o último evento. Presencial quando quem abre é o profissional dono.
- **FR-006** (NM-26): Relatório por aluno: totais, sessões e por ação.
- **FR-007** (NM-27): Excluir aluno apaga tudo em cascata.
- **FR-008** (NM-28): Toda consulta de aluno MUST filtrar pelo profissional logado. Não existe rota que leia aluno por id sem esse filtro.
- **FR-009** (NM-18): CSV agregado por semana e ação, sem apelido, e-mail ou id de pessoa.
- **FR-011** (emenda 2026-10-18): Sessões presenciais MUST aceitar uma observação do profissional (texto livre, até 2000 caracteres), editável no relatório do aluno. Sessões em casa não têm o campo. A observação é do profissional sobre o atendimento; a regra de não registrar diagnóstico ou dado de saúde continua valendo e é lembrada no rodapé.
- **FR-010** (emenda 2026-10-18, NM-48): A entrada do site MUST ser o vídeo do Teo seguido da escolha "Sou profissional" ou "Sou aluno". "Sou profissional" leva ao login por link mágico. "Sou aluno" pede o e-mail do responsável e envia os links das pranchas cadastradas com ele; a resposta na tela é a mesma com ou sem cadastro. As cartas abertas ficam em `/cartas`, com atalho discreto na tela de escolha, para o stand da Mostra.

### Key Entities
- **professional**: id, email, name. **login_token**: token_hash, email, name, expires_at, used_at.
- **student**: id, professional_id, nickname, guardian_email, access_token. **student_action**: student_id, action_id, sort_order.
- **session**: id, student_id, in_person, started_at, ended_at. **event** ganha `session_id`.

## Success Criteria *(mandatory)*
- **SC-001**: Profissional cadastra aluno, monta prancha e copia o link em menos de 3 minutos.
- **SC-002**: Criança abre o link e vê as cartas em 1 toque, sem nenhuma tela de login.
- **SC-003**: Nenhuma tabela guarda nome real, diagnóstico ou dado de saúde.

## Assumptions
- Uma prancha por aluno basta na Fase 2. Várias pranchas nomeadas ficam no backlog.
- Convite por e-mail ao responsável (NM-22) fica fora: o profissional copia o link e manda como preferir.
- Para enviar e-mail a qualquer endereço, o Resend exige domínio verificado. Depende do domínio próprio (NM-30).
