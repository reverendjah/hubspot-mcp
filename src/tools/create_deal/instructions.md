Ferramenta para criar um deal (oportunidade) no HubSpot associado ao contato atual.

## Parameters explained:

- dealname: Nome descritivo do deal (ex: "Consultoria Financeira - João Silva")
- amount: Valor estimado do deal em reais (opcional)
- dealstage: Estágio atual do deal no pipeline:
  - appointmentscheduled: Reunião agendada
  - qualifiedtobuy: Qualificado para compra
  - presentationscheduled: Apresentação agendada
  - decisionmakerboughtin: Decisor envolvido
  - contractsent: Contrato enviado
  - closedwon: Fechado - Ganho
  - closedlost: Fechado - Perdido
- closedate: Data prevista de fechamento no formato YYYY-MM-DD (opcional)

## Validation rules:

- O contato deve existir previamente no HubSpot (use create_contact primeiro se necessário)
- O dealname deve ser descritivo e incluir informações relevantes

## Possible responses:
- Deal criado com sucesso no HubSpot.
- Erro caso o contato não exista no HubSpot - nesse caso use create_contact primeiro.
