// === CONTATOS ===
export type CreateContactRequest = {
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    hs_lead_status?: string;
    lifecyclestage?: string;
    [key: string]: string | undefined;
  };
};

export type ContactResponse = {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type SearchContactRequest = {
  filterGroups: Array<{
    filters: Array<{
      propertyName: string;
      operator: string;
      value: string;
    }>;
  }>;
  properties?: string[];
  limit?: number;
};

export type SearchContactResponse = {
  total: number;
  results: Array<{
    id: string;
    properties: Record<string, string>;
    createdAt: string;
    updatedAt: string;
  }>;
};

// === DEALS ===
export type CreateDealRequest = {
  properties: Record<string, string>;
  associations?: Array<{
    to: { id: number | string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
};

export type DealResponse = {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type SearchDealRequest = {
  filterGroups: Array<{
    filters: Array<{
      propertyName: string;
      operator: string;
      value: string;
    }>;
  }>;
  properties?: string[];
  limit?: number;
};

export type SearchDealResponse = {
  total: number;
  results: Array<{
    id: string;
    properties: Record<string, string>;
    createdAt: string;
    updatedAt: string;
  }>;
};

// === MEETINGS ===
export type CreateMeetingRequest = {
  properties: {
    hs_meeting_title: string;
    hs_meeting_body?: string;
    hs_meeting_start_time: string;
    hs_meeting_end_time: string;
    hs_meeting_outcome?: string;
    hubspot_owner_id?: string;
    [key: string]: string | undefined;
  };
  associations?: Array<{
    to: { id: number | string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
};

export type MeetingResponse = {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

// === ASSOCIATIONS ===
export type AssociationType = {
  associationCategory: "HUBSPOT_DEFINED" | "USER_DEFINED";
  associationTypeId: number;
};

// Common association type IDs
export const ASSOCIATION_TYPES = {
  CONTACT_TO_DEAL: 4,
  DEAL_TO_CONTACT: 3,
  MEETING_TO_CONTACT: 200,
  CONTACT_TO_MEETING: 199,
} as const;
