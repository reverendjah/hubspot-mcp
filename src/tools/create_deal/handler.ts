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
    const { contactId, contactName, contactPhone, contactEmail, dealname, amount, dealstage, closedate } = params;

    try {
      // Resolve contact ID
      let resolvedContactId = contactId;

      if (!resolvedContactId) {
        // Try to find existing contact by phone or email
        if (contactPhone) {
          const searchResult = await hubspot.getContactByPhone(contactPhone);
          if (searchResult.results.length > 0) {
            resolvedContactId = searchResult.results[0].id;
            logger.debug("Found existing contact by phone", { contactId: resolvedContactId });
          }
        }

        if (!resolvedContactId && contactEmail) {
          const searchResult = await hubspot.getContactByEmail(contactEmail);
          if (searchResult.results.length > 0) {
            resolvedContactId = searchResult.results[0].id;
            logger.debug("Found existing contact by email", { contactId: resolvedContactId });
          }
        }

        // If still no contact found, create one
        if (!resolvedContactId) {
          if (!contactName && !contactPhone && !contactEmail) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    message: "Contact ID is required, or provide contactName with contactPhone or contactEmail to create a new contact",
                  }),
                },
              ],
            };
          }

          // Create new contact
          const nameParts = (contactName || "Unknown").trim().split(" ");
          const firstname = nameParts[0];
          const lastname = nameParts.slice(1).join(" ") || "";

          const contactProperties: Record<string, string> = {
            firstname,
            lastname,
            hs_lead_status: "NEW",
            lifecyclestage: "lead",
          };

          if (contactPhone) {
            contactProperties.phone = contactPhone;
          }

          if (contactEmail) {
            contactProperties.email = contactEmail;
          }

          const newContact = await hubspot.createContact({ properties: contactProperties });
          resolvedContactId = newContact.id;
          logger.debug("Created new contact", { contactId: resolvedContactId });
        }
      }

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
            to: { id: parseInt(resolvedContactId) },
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
              contactId: resolvedContactId,
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
