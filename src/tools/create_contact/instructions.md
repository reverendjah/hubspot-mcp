Ferramenta que cria um contato no HubSpot assim que o usuário informar seu nome completo.

## Parameters explained:

- name: nome completo REAL do usuário (ex: "João Silva", "Maria Santos"). NUNCA use "Usuário" ou nomes genéricos.
- source: origem do contato, definido nos cases abaixo.

## Validation rules:

- O nome deve conter pelo menos nome e sobrenome
- O nome deve ser fornecido explicitamente pelo usuário na conversa
- Se o usuário não informou o nome, pergunte: "Para prosseguir, preciso do seu nome completo. Pode me informar?"
- Só execute a ferramenta após receber uma resposta clara com o nome

## Possible responses:
- Contato criado com sucesso no HubSpot.
- Caso o usuário já tenha se registrado anteriormente, a função retornará que o contato já foi registrado.

## Sources:

Mensagens iniciais enviadas pelos usuários e qual origem pertence. Isso será usado como tracking.

- Case 1: Olá
  Source: WhatsApp

- Case 2: Olá, tudo bem? Eu gostaria de agendar um horário com um Consultor
  Source: Landing Page

- Case 3: Olá, como vai? Eu gostaria de agendar um horário com um Consultor
  SOURCE: Canal Youtube

- Default case:
  SOURCE: WhatsApp
