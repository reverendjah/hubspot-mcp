import { z } from "zod";

const schema = {
  name: z.string().describe("Nome completo do usuário"),
  email: z.string().describe("Email do usuário"),
  slot_date: z
    .string()
    .describe("Data de agendamento, deve ser no formato YYYY-MM-DD"),
  slot_start_time: z
    .string()
    .describe(
      "Horário de início do agendamento, deve ser no formato HH:MM (AM/PM) conforme a resposta do getAvailableTimes"
    ),
  time_zone: z
    .string()
    .describe(
      "Fuso horário do usuário, por padrão é America/Sao_Paulo caso não seja informado por ele"
    ),
  meeting_type: z
    .enum(["consultoria", "mentoria"])
    .describe(
      "Tipo de reunião que o usuário deseja agendar"
    ),
};

export type CreateBookingSchema = {
  name: string;
  email: string;
  slot_date: string;
  slot_start_time: string;
  time_zone: string;
  meeting_type: "consultoria" | "mentoria";
};

export default schema;
