import { z } from "zod";

const schema = {
  dealname: z.string().describe("Nome do deal/oportunidade"),
  amount: z.string().optional().describe("Valor do deal"),
  dealstage: z
    .enum([
      "appointmentscheduled",
      "qualifiedtobuy",
      "presentationscheduled",
      "decisionmakerboughtin",
      "contractsent",
      "closedwon",
      "closedlost",
    ])
    .describe("Estágio do deal no pipeline"),
  closedate: z
    .string()
    .optional()
    .describe("Data prevista de fechamento (YYYY-MM-DD)"),
};

export type CreateDealSchema = {
  dealname: string;
  amount?: string;
  dealstage: string;
  closedate?: string;
};

export default schema;
