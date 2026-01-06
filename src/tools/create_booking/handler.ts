import { env } from "@/core/app/env.js";
import { logger } from "@/core/app/logger.js";
import { BaseTool } from "@/core/contracts/tool.js";

import neetocal from "@/providers/neetocal/index.js";
import hubspot from "@/providers/hubspot/index.js";

import { ExtendedExtraInfo } from "@/core/adapters/sse_transport_adapter.js";
import schema, { CreateBookingSchema } from "./schema.js";

class CreateBookingTool extends BaseTool {
  name() {
    return "create_booking";
  }

  input() {
    return schema;
  }

  async handler(params: CreateBookingSchema, extra?: ExtendedExtraInfo) {
    logger.debug(
      "Creating booking called with params",
      JSON.stringify(params, null, 2)
    );
    const { name, email, slot_date, slot_start_time, time_zone, meeting_type } =
      params;

    try {
      const contact = await BaseTool.getContact(extra!);
      if (!contact.externalId) {
        logger.warn(
          "Contact does not have a HubSpot account created, call the create_contact tool first",
          JSON.stringify(contact, null, 2)
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message:
                  "Contact does not have a HubSpot account created, call the create_contact tool first",
              }),
            },
          ],
        };
      }

      // 1. Create booking in NeetoCal
      const booking = await neetocal.bookSlot({
        name,
        email,
        slot_date,
        slot_start_time,
        time_zone,
        meeting_slug:
          meeting_type === "consultoria"
            ? env.NEETO_CAL_CONSULTORIA_MEETING_SLUG
            : env.NEETO_CAL_MENTORIA_MEETING_SLUG,
      });

      logger.debug(
        "Booking created successfully in NeetoCal",
        JSON.stringify(booking, null, 2)
      );

      // 2. Create meeting in HubSpot
      // Parse the slot_start_time and slot_date to create proper timestamps
      const meetingTitle =
        meeting_type === "consultoria"
          ? `Consultoria - ${name}`
          : `Mentoria - ${name}`;

      // Calculate meeting times (assuming 1 hour duration)
      const startDateTime = new Date(`${slot_date}T${convertTo24Hour(slot_start_time)}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hour

      try {
        const meeting = await hubspot.createMeeting({
          properties: {
            hs_meeting_title: meetingTitle,
            hs_meeting_body: `Agendamento de ${meeting_type} via NeetoCal`,
            hs_meeting_start_time: startDateTime.toISOString(),
            hs_meeting_end_time: endDateTime.toISOString(),
            hs_meeting_outcome: "SCHEDULED",
          },
          associations: [
            {
              to: { id: parseInt(contact.externalId) },
              types: [
                {
                  associationCategory: "HUBSPOT_DEFINED",
                  associationTypeId: 200, // meeting_to_contact
                },
              ],
            },
          ],
        });

        logger.debug(
          "Meeting created successfully in HubSpot",
          JSON.stringify(meeting, null, 2)
        );
      } catch (hubspotError) {
        // Log but don't fail if HubSpot meeting creation fails
        // The NeetoCal booking is the primary concern
        logger.error(
          "Error creating meeting in HubSpot (booking was successful)",
          hubspotError instanceof Error ? hubspotError.message : String(hubspotError)
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Successfully created booking",
              booking,
            }),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.debug("Error creating booking", errorMessage);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Error creating booking on Neeto",
              response: errorMessage,
            }),
          },
        ],
      };
    }
  }
}

// Helper function to convert 12-hour format to 24-hour format
function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier?.toUpperCase() === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, "0")}:${minutes}:00`;
}

export default CreateBookingTool;
