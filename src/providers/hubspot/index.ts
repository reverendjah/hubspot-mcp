import { env } from "@/core/app/env.js";

import type {
  CreateContactRequest,
  ContactResponse,
  SearchContactRequest,
  SearchContactResponse,
  CreateDealRequest,
  DealResponse,
  SearchDealRequest,
  SearchDealResponse,
  CreateMeetingRequest,
  MeetingResponse,
} from "./hubspot.types.js";

class HubSpot {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = env.HUBSPOT_API_KEY;
    this.baseUrl = "https://api.hubapi.com";
  }

  // === CONTATOS ===

  async createContact(
    payload: CreateContactRequest
  ): Promise<ContactResponse> {
    return this.call<ContactResponse>("/crm/v3/objects/contacts", "POST", {
      properties: payload.properties,
    });
  }

  async updateContact(
    contactId: string,
    properties: Record<string, string>
  ): Promise<ContactResponse> {
    return this.call<ContactResponse>(
      `/crm/v3/objects/contacts/${contactId}`,
      "PATCH",
      { properties }
    );
  }

  async getContact(contactId: string): Promise<ContactResponse> {
    return this.call<ContactResponse>(
      `/crm/v3/objects/contacts/${contactId}`,
      "GET"
    );
  }

  async searchContacts(
    payload: SearchContactRequest
  ): Promise<SearchContactResponse> {
    return this.call<SearchContactResponse>(
      "/crm/v3/objects/contacts/search",
      "POST",
      payload
    );
  }

  async getContactByEmail(email: string): Promise<SearchContactResponse> {
    return this.searchContacts({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
      properties: ["email", "firstname", "lastname", "phone"],
    });
  }

  async getContactByPhone(phone: string): Promise<SearchContactResponse> {
    return this.searchContacts({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "phone",
              operator: "EQ",
              value: phone,
            },
          ],
        },
      ],
      properties: ["email", "firstname", "lastname", "phone"],
    });
  }

  // === DEALS ===

  async createDeal(payload: CreateDealRequest): Promise<DealResponse> {
    return this.call<DealResponse>("/crm/v3/objects/deals", "POST", payload);
  }

  async updateDeal(
    dealId: string,
    properties: Record<string, string>
  ): Promise<DealResponse> {
    return this.call<DealResponse>(
      `/crm/v3/objects/deals/${dealId}`,
      "PATCH",
      { properties }
    );
  }

  async getDeal(dealId: string): Promise<DealResponse> {
    return this.call<DealResponse>(`/crm/v3/objects/deals/${dealId}`, "GET");
  }

  async searchDeals(payload: SearchDealRequest): Promise<SearchDealResponse> {
    return this.call<SearchDealResponse>(
      "/crm/v3/objects/deals/search",
      "POST",
      payload
    );
  }

  async associateDealToContact(
    dealId: string,
    contactId: string
  ): Promise<void> {
    await this.call(
      `/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
      "PUT"
    );
  }

  // === MEETINGS ===

  async createMeeting(payload: CreateMeetingRequest): Promise<MeetingResponse> {
    return this.call<MeetingResponse>(
      "/crm/v3/objects/meetings",
      "POST",
      payload
    );
  }

  async associateMeetingToContact(
    meetingId: string,
    contactId: string
  ): Promise<void> {
    await this.call(
      `/crm/v3/objects/meetings/${meetingId}/associations/contacts/${contactId}/meeting_to_contact`,
      "PUT"
    );
  }

  // === METODO BASE ===

  private async call<Response = unknown>(
    path: string,
    method: string,
    body?: Record<string, unknown>
  ): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HubSpot API Error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // Para PUT/DELETE sem body de resposta
    if (response.status === 204 || method === "PUT") {
      return {} as Response;
    }

    return response.json() as Promise<Response>;
  }
}

export default new HubSpot();
