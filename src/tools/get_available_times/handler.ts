import { BaseTool } from "@/core/contracts/tool.js";

import { logger } from "@/core/app/logger.js";
import { ExtendedExtraInfo } from "@/core/adapters/sse_transport_adapter.js";
import neetocal from "@/providers/neetocal/index.js";
import schema, { GetAvailableTimesSchema } from "./schema.js";

class GetAvailableTimesTool extends BaseTool {
  name() {
    return "get_available_times";
  }

  input() {
    return schema;
  }

  async handler(params: GetAvailableTimesSchema, extra?: ExtendedExtraInfo) {
    logger.debug("Getting available times called with params", JSON.stringify(params, null, 2));
    const { time_zone, year, month, day, meeting_type } = params;

    const contact = await BaseTool.getContact(extra!);
    logger.debug("Contact", JSON.stringify(contact, null, 2));

    try {
      const availableTimes = await neetocal.listAllAvailableSlots({
        time_zone,
        year: year.toString(),
        month: month.toString(),
        day: day?.toString?.() ?? undefined,
        meeting_type,
      });

      logger.debug("Available times fetched successfully", JSON.stringify(availableTimes, null, 2));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(availableTimes),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Error getting available times", errorMessage);

      logger.debug("Error getting available times", JSON.stringify(error, null, 2));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Error getting available times",
              response: errorMessage,
            }),
          },
        ],
      };
    }
  }
}

export default GetAvailableTimesTool;
