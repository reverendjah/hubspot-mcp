import { ExtendedExtraInfo } from "@/core/adapters/sse_transport_adapter.js";
import { logger } from "@/core/app/logger.js";
import { BaseTool } from "@/core/contracts/tool.js";

import hubspot from "@/providers/hubspot/index.js";
import { Plati } from "@/providers/plati/index.js";

import schema, { CreateContactSchema } from "./schema.js";

class CreateContactTool extends BaseTool {
  name() {
    return "create_contact";
  }

  input() {
    return schema;
  }

  async handler(params: CreateContactSchema, extra?: ExtendedExtraInfo) {
    logger.debug(
      "Creating contact called with params",
      JSON.stringify(params, null, 2)
    );
    const { name, source } = params;

    const contact = await BaseTool.getContact(extra!);

    if (!contact) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Contact not found in Plati",
            }),
          },
        ],
      };
    }

    const phoneFormatted = contact?.identifier
      ? String(contact.identifier).startsWith("55")
        ? String(contact.identifier).replace(
            /(\d{2})(\d{2})(\d{4,5})(\d{4})/,
            (_match, p1, p2, p3, p4) =>
              `${p1}${p2}${p3.length === 4 ? "9" + p3 : p3}${p4}`
          )
        : String(contact.identifier)
      : "";

    // Check if already registered via externalId
    if (contact.externalId) {
      try {
        const hubspotContact = await hubspot.getContact(contact.externalId);
        if (hubspotContact) {
          logger.debug(
            "Contact already registered",
            JSON.stringify(hubspotContact, null, 2)
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  message: "Contact already registered",
                  contactId: hubspotContact.id,
                }),
              },
            ],
          };
        }
      } catch {
        // Contact not found in HubSpot, will create new one
      }
    }

    // Search by phone in HubSpot
    if (phoneFormatted) {
      const searchResult = await hubspot.getContactByPhone(phoneFormatted);

      logger.debug("Search result", JSON.stringify(searchResult, null, 2));

      if (searchResult.results.length > 0) {
        const existingContact = searchResult.results[0];
        logger.debug(
          "Contact already exists in HubSpot",
          JSON.stringify(existingContact, null, 2)
        );

        await Plati.updateContact(extra?._meta?.contactId as string, {
          externalId: existingContact.id,
        }).catch((error) => {
          logger.error(error);
        });

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

    logger.debug("Creating contact", JSON.stringify(name, null, 2));
    logger.debug("Phone formatted", JSON.stringify(phoneFormatted, null, 2));
    logger.debug("Source", JSON.stringify(source, null, 2));

    // Split name into first and last name
    const nameParts = name.trim().split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ") || "";

    try {
      const response = await hubspot.createContact({
        properties: {
          firstname,
          lastname,
          phone: phoneFormatted,
          hs_lead_status: "NEW",
          lifecyclestage: "lead",
        },
      });

      logger.debug("Contact created", JSON.stringify(response, null, 2));

      await Plati.updateContact(extra?._meta?.contactId as string, {
        externalId: response.id,
      }).catch((error) => {
        logger.error(error);
      });

      logger.debug("Contact updated in Plati", JSON.stringify(response, null, 2));

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
