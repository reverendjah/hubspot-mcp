import { logger } from "@/core/app/logger.js";
import { BaseTool } from "@/core/contracts/tool.js";

import hubspot from "@/providers/hubspot/index.js";

import schema, { CreateContactSchema } from "./schema.js";

class CreateContactTool extends BaseTool {
  name() {
    return "create_contact";
  }

  input() {
    return schema;
  }

  async handler(params: CreateContactSchema) {
    logger.debug(
      "Creating contact called with params",
      JSON.stringify(params, null, 2)
    );
    const { name, phone, email, source } = params;

    // Search by phone in HubSpot for deduplication
    if (phone) {
      const searchResult = await hubspot.getContactByPhone(phone);

      logger.debug("Search by phone result", JSON.stringify(searchResult, null, 2));

      if (searchResult.results.length > 0) {
        const existingContact = searchResult.results[0];
        logger.debug(
          "Contact already exists in HubSpot",
          JSON.stringify(existingContact, null, 2)
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: "Contact already exists in HubSpot",
                contactId: existingContact.id,
              }),
            },
          ],
        };
      }
    }

    // Search by email in HubSpot for deduplication
    if (email) {
      const searchResult = await hubspot.getContactByEmail(email);

      logger.debug("Search by email result", JSON.stringify(searchResult, null, 2));

      if (searchResult.results.length > 0) {
        const existingContact = searchResult.results[0];
        logger.debug(
          "Contact already exists in HubSpot (by email)",
          JSON.stringify(existingContact, null, 2)
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: "Contact already exists in HubSpot",
                contactId: existingContact.id,
              }),
            },
          ],
        };
      }
    }

    logger.debug("Creating contact", JSON.stringify({ name, phone, email, source }, null, 2));

    // Split name into first and last name
    const nameParts = name.trim().split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ") || "";

    try {
      const properties: Record<string, string> = {
        firstname,
        lastname,
        hs_lead_status: "NEW",
        lifecyclestage: "lead",
      };

      if (phone) {
        properties.phone = phone;
      }

      if (email) {
        properties.email = email;
      }

      if (source) {
        properties.leadsource = source;
      }

      const response = await hubspot.createContact({ properties });

      logger.debug("Contact created", JSON.stringify(response, null, 2));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Successfully created contact in HubSpot",
              contactId: response.id,
            }),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Error creating contact", errorMessage);

      logger.debug("Error creating contact", JSON.stringify(error, null, 2));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Error creating contact in HubSpot",
              response: errorMessage,
            }),
          },
        ],
      };
    }
  }
}

export default CreateContactTool;
