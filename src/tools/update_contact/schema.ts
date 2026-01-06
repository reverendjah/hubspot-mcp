import { z } from "zod";

const schema = {
  contactId: z.string().describe("ID do contato no HubSpot"),
  name: z.string().optional().describe("nome do usuário"),
  email: z.string().optional().describe("e-mail válido do usuário"),
  phone: z.string().optional().describe("telefone do usuário"),
  patrimonio: z
    .string()
    .optional()
    .nullable()
    .describe("total de patrimônio investido"),
  capacidadeAporte: z
    .string()
    .optional()
    .nullable()
    .describe("capacidade de aportes mensal"),
  objetivo: z
    .string()
    .optional()
    .nullable()
    .describe("o objetivo com os investimentos"),
};

export type UpdateContactSchema = {
  contactId: string;
  name?: string;
  email?: string;
  phone?: string;
  patrimonio?: string;
  capacidadeAporte?: string;
  objetivo?: string;
};

export default schema;
