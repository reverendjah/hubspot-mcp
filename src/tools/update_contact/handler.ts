import { BaseTool } from "@/core/contracts/tool.js";

import { logger } from "@/core/app/logger.js";
import hubspot from "@/providers/hubspot/index.js";

import schema, { UpdateContactSchema } from "./schema.js";

class UpdateContactTool extends BaseTool {
  name() {
    return "update_contact";
  }

  input() {
    return schema;
  }

  async handler(params: UpdateContactSchema) {
    logger.debug(
      "Updating contact called with params",
      JSON.stringify(params, null, 2)
    );
    const { contactId, name, email, phone, patrimonio, capacidadeAporte, objetivo } = params;

    try {
      // Build properties object with only defined values
      const properties: Record<string, string> = {};

      if (name && name !== "undefined") {
        const nameParts = name.trim().split(" ");
        properties.firstname = nameParts[0];
        if (nameParts.length > 1) {
          properties.lastname = nameParts.slice(1).join(" ");
        }
      }

      if (email && email !== "undefined") {
        properties.email = email;
      }

      if (phone && phone !== "undefined") {
        properties.phone = phone;
      }

      // Custom properties - these may need to be created in HubSpot first
      if (patrimonio && patrimonio !== "undefined") {
        properties.patrimonio = patrimonio;
      }

      if (capacidadeAporte && capacidadeAporte !== "undefined") {
        properties.capacidade_aporte = capacidadeAporte;
      }

      if (objetivo && objetivo !== "undefined") {
        properties.objetivo_investimento = objetivo;
      }

      if (Object.keys(properties).length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: "No properties to update",
              }),
            },
          ],
        };
      }

      await hubspot.updateContact(contactId, properties);

      logger.debug(
        "Contact updated successfully",
        JSON.stringify(properties, null, 2)
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Contact updated successfully in HubSpot",
            }),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Error updating contact", errorMessage);

      logger.debug("Error updating contact", JSON.stringify(error, null, 2));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Error updating contact in HubSpot",
              response: errorMessage,
            }),
          },
        ],
      };
    }
  }
}

export default UpdateContactTool;
