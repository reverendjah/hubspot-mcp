Ferramenta para atualizar o estágio de um deal existente no HubSpot.

## Parameters explained:

- dealId: ID do deal no HubSpot (retornado pela tool create_deal)
- dealstage: Novo estágio do deal no pipeline:
  - appointmentscheduled: Reunião agendada
  - qualifiedtobuy: Qualificado para compra
  - presentationscheduled: Apresentação agendada
  - decisionmakerboughtin: Decisor envolvido
  - contractsent: Contrato enviado
  - closedwon: Fechado - Ganho
  - closedlost: Fechado - Perdido

## Validation rules:

- O deal deve existir previamente no HubSpot
- O dealId deve ser válido

## Possible responses:
- Deal stage atualizado com sucesso no HubSpot.
- Erro caso o deal não exista no HubSpot.
