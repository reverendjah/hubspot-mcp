import { BaseTool } from "@/core/contracts/tool.js";

import { env } from "@/core/app/env.js";
import { logger } from "@/core/app/logger.js";
import hubspot from "@/providers/hubspot/index.js";

import schema, { CreateDealSchema } from "./schema.js";

class CreateDealTool extends BaseTool {
  name() {
    return "create_deal";
  }

  input() {
    return schema;
  }

  async handler(params: CreateDealSchema) {
    logger.debug(
      "Creating deal called with params",
      JSON.stringify(params, null, 2)
    );
    const { contactId, dealname, amount, dealstage, closedate } = params;

    try {
      // Build deal properties
      const properties: Record<string, string> = {
        dealname,
        dealstage,
        pipeline: env.HUBSPOT_PIPELINE_ID,
      };

      if (amount && amount !== "undefined") {
        properties.amount = amount;
      }

      if (closedate && closedate !== "undefined") {
        properties.closedate = closedate;
      }

      if (env.HUBSPOT_OWNER_ID) {
        properties.hubspot_owner_id = env.HUBSPOT_OWNER_ID;
      }

      // Create deal with association to contact
      const response = await hubspot.createDeal({
        properties,
        associations: [
          {
            to: { id: parseInt(contactId) },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 3, // deal_to_contact
              },
            ],
          },
        ],
      });

      logger.debug("Deal created", JSON.stringify(response, null, 2));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Deal created successfully in HubSpot",
              dealId: response.id,
            }),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Error creating deal", errorMessage);

      logger.debug("Error creating deal", JSON.stringify(error, null, 2));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Error creating deal in HubSpot",
              response: errorMessage,
            }),
          },
        ],
      };
    }
  }
}

export default CreateDealTool;
