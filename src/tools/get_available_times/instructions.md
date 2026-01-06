Ferramenta responsável por consultar os horários disponíveis no Neetocal para agendamento

## When to use this tool:

- Quando o usuário solicitar informações sobre horários disponíveis para agendamento
- Após sugerir de marcar uma reunião com os consultores
- Depois que o usuário pedir para marcar uma reunião
- Quando o usuário pedir para marcar por um horário específico

## Key features:

- Retorna todos os horários do dia solicitado para agendamento
- Pode filtrar somente por uma data específica caso o usuário tenha pedido
- Funciona com fuso horário configurável

## Parameters explained:

- time_zone: fuso horário do usuário, por padrão é "America/Sao_Paulo" caso não seja informado
- year: ano que o usuário deseja consultar, por padrão é o ano atual, nunca mande datas passadas.
- month: mês que o usuário deseja consultar, por padrão é o mês atual, nunca mande datas passadas.
- day: dia sugerido para a reunião.
- meeting_type: O tipo de reunião que será buscada. Deve se alinhar com o tipo de perfil do usuário.

## Important

- Os horários retornados devem ser apresentados de forma clara ao usuário
- Se o usuário não especificar uma data, mostre as opções disponíveis
- Considere o contexto temporal (final de mês/ano) para sugerir datas apropriadas
- Caso o dia atual seja sexta, por exemplo, o próximo dia deve ser segunda, pois não há agendamento em finais de semanas e feriados.
