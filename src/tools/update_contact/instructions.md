Ferramenta para atualizar informações de um contato existente no HubSpot.

## Parameters explained:

- name: nome completo do usuário (opcional)
- email: e-mail válido do usuário (opcional)
- phone: telefone do usuário (opcional)
- patrimonio: total de patrimônio investido (opcional)
- capacidadeAporte: capacidade de aportes mensal (opcional)
- objetivo: objetivo do usuário com os investimentos (opcional)

## Validation rules:

- Pelo menos um campo deve ser fornecido para atualização
- O contato deve existir previamente no HubSpot (use create_contact primeiro se necessário)

## Possible responses:
- Contato atualizado com sucesso no HubSpot.
- Erro caso o contato não exista no HubSpot - nesse caso use create_contact primeiro.
