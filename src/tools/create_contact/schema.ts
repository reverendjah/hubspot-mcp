import { z } from "zod";

const schema = {
  name: z.string().describe("Nome completo do contato"),
  phone: z.string().optional().describe("Telefone do contato (formato: 5511999999999)"),
  email: z.string().optional().describe("Email do contato"),
  source: z.string().optional().describe("Origem do contato"),
};

export type CreateContactSchema = {
  name: string;
  phone?: string;
  email?: string;
  source?: string;
};

export default schema;
