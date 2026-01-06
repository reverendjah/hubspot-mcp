import { env } from "@/core/app/env.js";

import type {
  BookSlotRequest,
  BookSlotResponse,
  ListAllAvailableSlotsRequest,
  ListAllAvailableSlotsResponse,
  ListBookingsRequest,
  ListBookingsResponse,
} from "./neetocal.types.js";

class NeetoCal {
  private apiKey: string;
  private meetingSlug: {
    consultoria: string;
    mentoria: string;
  };

  constructor() {
    this.apiKey = env.NEETO_CAL_API_KEY;
    this.meetingSlug = {
      consultoria: env.NEETO_CAL_CONSULTORIA_MEETING_SLUG,
      mentoria: env.NEETO_CAL_MENTORIA_MEETING_SLUG,
    };
  }

  async listAllAvailableSlots(payload: ListAllAvailableSlotsRequest) {
    const meeting_slug = payload.meeting_type === "consultoria"
      ? this.meetingSlug.consultoria
      : this.meetingSlug.mentoria;

    const queryParams = {
      time_zone: payload.time_zone,
      year: payload.year,
      month: payload.month,
      day: payload.day ?? undefined,
    };

    return this.call<ListAllAvailableSlotsResponse>(
      `/slots/${meeting_slug}`,
      "GET",
      undefined,
      queryParams as Record<string, string>
    );
  }

  async listBookings(payload: ListBookingsRequest) {
    return this.call<ListBookingsResponse>(
      "/bookings",
      "GET",
      undefined,
      payload
    );
  }

  async bookSlot(payload: BookSlotRequest) {
    return this.call<BookSlotResponse>("/bookings", "POST", payload, undefined);
  }

  async call<Response = unknown>(
    path: string,
    method: string,
    body: Record<string, unknown> | undefined,
    queryParams: Record<string, string> = {}
  ): Promise<Response> {
    const response = await fetch(
      `${env.NEETO_CAL_API_URL}/${path}${
        queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ""
      }`,
      {
        method,
        headers: {
          "X-Api-Key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to call NeetoCal API: ${
          response.statusText
        } ${await response.text()}`
      );
    }

    return response.json() as Promise<Response>;
  }
}

export default new NeetoCal();
