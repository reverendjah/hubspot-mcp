import { z } from "zod";

const schema = {
  time_zone: z
    .string()
    .describe(
      "Fuso horário do usuário, por padrão é America/Sao_Paulo caso não seja informado por ele"
    ),
  year: z
    .number()
    .describe(
      "Ano que o usuário deseja fazer o agendamento, por padrão é o ano atual, caso seja final do ano, e esteja perto do natal/ano novo, jogue para o ano seguinte"
    ),
  month: z
    .number()
    .describe(
      "Mês que o usuário deseja agendar, por padrão é o mês atual, caso seja final do mês, e esteja perto do natal/ano novo, jogue para o mês seguinte"
    ),
  day: z
    .number()
    .describe(
      "Dia sugerido para a reunião, deve ser um número entre 1 e 31"
    ),
  meeting_type: z
    .enum(["consultoria", "mentoria"])
    .describe(
      "Tipo de reunião que o usuário deseja agendar"
    ),
};

export type GetAvailableTimesSchema = {
  time_zone: string;
  year: number;
  month: number;
  day: number;
  meeting_type: "consultoria" | "mentoria";
};

export default schema;
