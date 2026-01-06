import { ExtendedExtraInfo } from "@/core/adapters/sse_transport_adapter.js";
import { BaseTool } from "@/core/contracts/tool.js";

import { logger } from "@/core/app/logger.js";
import hubspot from "@/providers/hubspot/index.js";

import schema, { UpdateDealStageSchema } from "./schema.js";

class UpdateDealStageTool extends BaseTool {
  name() {
    return "update_deal_stage";
  }

  input() {
    return schema;
  }

  async handler(params: UpdateDealStageSchema, extra?: ExtendedExtraInfo) {
    logger.debug(
      "Updating deal stage called with params",
      JSON.stringify(params, null, 2)
    );
    const { dealId, dealstage } = params;

    try {
      const contact = await BaseTool.getContact(extra!);
      logger.debug("Contact", JSON.stringify(contact, null, 2));

      await hubspot.updateDeal(dealId, {
        dealstage,
      });

      logger.debug("Deal stage updated successfully", {
        dealId,
        dealstage,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Deal stage updated successfully in HubSpot",
              dealId,
              newStage: dealstage,
            }),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Error updating deal stage", errorMessage);

      logger.debug(
        "Error updating deal stage",
        JSON.stringify(error, null, 2)
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Error updating deal stage in HubSpot",
              response: errorMessage,
            }),
          },
        ],
      };
    }
  }
}

export default UpdateDealStageTool;
