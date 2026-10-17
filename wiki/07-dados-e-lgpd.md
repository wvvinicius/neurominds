# 07 · Dados e LGPD

Dados de saúde de criança são **dados pessoais sensíveis** (LGPD, art. 5º, II e art. 14). O projeto só funciona se nunca precisar deles. A regra é desenhar para não ter o que vazar.

## O que o sistema NUNCA guarda
- Nome real, CPF, data de nascimento, foto ou voz da criança.
- Diagnóstico, nível de suporte, laudo, medicação, escola.
- Nome real do responsável. Só e-mail, e só para enviar o convite.
- Localização, IP (desligar no provedor de analytics se houver um).

## O que guarda e por quê
| Dado | Fase | Finalidade | Identifica alguém? |
|---|---|---|---|
| Eventos de uso com id anônimo de sessão | 1 | Saber o que foi usado na Mostra | Não. Id gerado no navegador, sem vínculo com pessoa |
| Apelido do aluno | 2 | O profissional reconhecer quem é | Só para o próprio profissional, que já conhece a criança |
| E-mail do responsável | 2 | Enviar o link de convite | Sim. Dado pessoal comum, base legal: consentimento do responsável |
| Sessões e eventos vinculados ao aluno | 2 | Relatório para o profissional ajustar a conduta | Só via apelido, dentro da conta do profissional |

## Regras de implementação
- Id anônimo de sessão: UUID gerado no navegador, guardado em `localStorage`, renovado a cada 24 h. Nunca enviado junto com qualquer identificador.
- O link do convite leva um token aleatório longo. Não leva o apelido nem o e-mail na URL.
- Row Level Security no Supabase: profissional só lê os próprios alunos, pranchas e sessões.
- Apelido tem placeholder e dica na tela: "Use um apelido, não o nome real".
- Excluir aluno apaga sessões e eventos em cascata. Botão visível para o profissional.
- Dados agregados para a FENIC saem sem apelido e sem e-mail. Exportação já anonimizada.

## Transparência
- Texto curto no rodapé da tela pública: "Este site não coleta dados pessoais. Registramos apenas quais vídeos foram vistos, de forma anônima."
- E-mail de convite diz o que será registrado e que o responsável pode pedir exclusão ao profissional.

## O que ainda não decidimos
- Se a clínica parceira entrar, precisamos de um termo simples de uso de dados anonimizados para pesquisa. Resolver antes da Fase 2 com a clínica.
