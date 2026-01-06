import { z } from "zod";

const schema = {
  name: z.string().describe("Nome completo do contato"),
  source: z.string().describe("Origem do contato baseada na primeira mensagem"),
};

export type CreateContactSchema = {
  name: string;
  source: string;
};

export default schema;
