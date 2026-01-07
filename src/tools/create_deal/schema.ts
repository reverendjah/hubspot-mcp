import { z } from "zod";

const schema = {
  contactId: z.string().optional().describe("ID do contato no HubSpot (opcional se fornecer phone ou email)"),
  contactName: z.string().optional().describe("Nome do contato (usado se criar novo contato)"),
  contactPhone: z.string().optional().describe("Telefone do contato para buscar/criar (formato: 5511999999999)"),
  contactEmail: z.string().optional().describe("Email do contato para buscar/criar"),
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
  contactId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  dealname: string;
  amount?: string;
  dealstage: string;
  closedate?: string;
};

export default schema;
