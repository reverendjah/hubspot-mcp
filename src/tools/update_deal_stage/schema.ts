import { z } from "zod";

const schema = {
  dealId: z.string().describe("ID do deal no HubSpot"),
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
    .describe("Novo estágio do deal no pipeline"),
};

export type UpdateDealStageSchema = {
  dealId: string;
  dealstage: string;
};

export default schema;
