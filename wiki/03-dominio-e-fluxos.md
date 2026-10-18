# 03 · Domínio e fluxos

## Vocabulário
| Termo | Significado | Na reunião chamaram de |
|---|---|---|
| **Ação** | Verbo que a criança precisa compreender. Ex.: chutar, abraçar, pular. | gatilho, tema, cartinha |
| **Vídeo** | Clipe curto gerado por IA mostrando a ação em um contexto. Uma ação tem vários. | vídeo, situação |
| **Carta** | Representação visual da ação na tela inicial. | cartinha, caixinha |
| **Biblioteca** | Conjunto de todas as ações e vídeos cadastrados. | acervo |
| **Painel de verbos** (Fase 2) | Subconjunto de ações escolhido pelo profissional para um aluno. Na interface é sempre "painel de verbos" (decisão de 18/10/2026); no código e nas tabelas o nome continua `board`/`student_action`. | prancha, prancheta |
| **Aluno** (Fase 2) | Criança que usa, identificada por apelido. | paciente, estudante, João, Maria |
| **Sessão** (Fase 2) | Período de uso contínuo de uma prancha por um aluno. | uso, jornada |
| **Evento** | Registro de uma interação (abriu ação, viu vídeo). | indicador, pontuação |

## Modelo de dados

### Fase 1
```
action   id, slug, name, emoji, color, sort_order, is_active, created_at
video    id, action_id, storage_path, caption, sort_order, is_active, created_at
event    id, anon_session_id, type, action_id?, video_id?, duration_ms?, created_at
```
`event.type`: `open_home` · `open_action` · `play_video` · `finish_video`

### Fase 2 (implementado na spec 003)
```
professional    id, email, name, created_at
login_token     token_hash, email, name, expires_at, used_at
student         id, professional_id, nickname, guardian_email, access_token, created_at
student_action  student_id, action_id, sort_order        ← a prancha
session         id, student_id, in_person, started_at, ended_at
event           + session_id (nulo quando o uso é anônimo)
```
Regras:
- `student.nickname` nunca é nome real. Nenhum campo de diagnóstico, idade ou laudo.
- `access_token` é o que vai no link da criança. A criança não tem senha.
- **Uma prancha por aluno** (decisão de MVP, 18/10/2026): a prancha é o conjunto em `student_action`. Várias pranchas nomeadas ficam no backlog.
- Sessão nasce quando a prancha é aberta numa aba e termina no último evento. Presencial quando quem abre é o profissional dono do aluno.
- Toda consulta de aluno filtra por `professional_id` do logado. É a "segurança por linha" do SQLite.

## Fluxos

### F0 · Entrada do site (desde 18/10/2026)
1. Abre o site. Vê o vídeo do Teo (pode pular, repetir ou seguir).
2. Escolhe "Sou profissional" (vai ao login por e-mail) ou "Sou aluno" (responsável informa o e-mail e recebe o link da prancha).
3. Quem só quer explorar toca em "Só quero ver as cartas" e cai em `/cartas`.

### F1 · Criança na Mostra (Fase 1)
1. Abre `/cartas` (ou o atalho na tela de escolha). Vê as cartas de ações, grandes e coloridas.
2. Toca em "chutar". A carta abre e mostra o primeiro vídeo.
3. Assiste. Toca em "próximo" e vê outro contexto de chutar.
4. Toca na seta grande de voltar e escolhe outra carta.

Métricas anônimas gravadas em segundo plano.

### F2 · Equipe de conteúdo alimenta a biblioteca (Fase 1)
1. Entra em `/admin` com a senha.
2. Cria a ação "Chutar", escolhe emoji e cor.
3. Sobe de 3 a 5 vídeos mp4, ordena, salva.
4. A ação aparece na tela pública na hora.

### F3 · Profissional monta prancha (Fase 2)
1. Faz login. Cadastra o aluno "Joca" com o e-mail da mãe.
2. Cria a prancha "Rotina de casa" escolhendo 6 ações da biblioteca.
3. Clica em "convidar". A mãe recebe e-mail com o link.

### F4 · Criança usa em casa (Fase 2)
1. A mãe abre o link no tablet. Vê só as 6 ações da prancha do Joca.
2. A criança usa igual ao F1. A sessão fica vinculada ao Joca.

### F5 · Profissional lê o relatório (Fase 2)
1. Abre o aluno. Vê as sessões: data, duração, presencial ou em casa.
2. Vê por ação: quantas vezes abriu, quantos vídeos viu até o fim.
3. Decide: mantém a prancha ou monta outra.

## O que o relatório precisa responder (Fase 2)
- O aluno usou? Quantas vezes? Quando?
- Ficou quanto tempo? Ficou parado ou interagiu?
- Quais ações mais abriu? Quais ignorou?
- Assistiu os vídeos até o fim?

Nada além disso até um profissional pedir.
