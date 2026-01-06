Ferramenta responsável por criar um agendamento no Neetocal e registrar a reunião no HubSpot quando o usuário confirmar o horário desejado

## When to use this tool:

- Quando o usuário já ter confirmado que deseja agendar uma reunião em um horário específico depois de ter consultado os horários disponíveis com a ferramenta get_available_times
- Somente depois de ter consultado os horários disponíveis com a ferramenta get_available_times
- Somente use quando já tiver todos os parâmetros coletados

## Key features:

- Cria um agendamento no Neetocal
- Registra a reunião no HubSpot como um Meeting
- Associa a reunião ao contato no HubSpot

## Parameters explained:

- name: nome completo do usuário. Deve ser solicitado se ainda não foi fornecido
- email: e-mail válido do usuário. O pattern deve ser nome@domain.tld
- slot_date: data do agendamento no formato YYYY-MM-DD (exemplo: 2024-03-15)
- slot_start_time: horário de início no formato HH:MM (AM/PM) conforme retornado pela get_available_times
- time_zone: fuso horário do usuário, por padrão é "America/Sao_Paulo" caso não seja especificado
- meeting_type: O tipo de reunião que será buscada. Deve se alinhar com o tipo de perfil do usuário.

## Important

- Sempre confirme os dados do agendamento com o usuário antes de executar
- Certifique-se de que o horário escolhido está disponível (use get_available_times primeiro)
- Não tente criar agendamentos sem confirmação explícita do usuário
- Valide se o e-mail tem formato correto antes de enviar
- O slot_start_time deve ser exatamente como retornado pela ferramenta get_available_times
