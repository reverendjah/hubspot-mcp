import {
  ButtonType,
  ContentType,
  ConversationStatus,
  ConversationType,
} from "./plati.enums.js";

export type IdentifierType =
  | "PHONE"
  | "EMAIL"
  | "USER_ID"
  | "USERNAME"
  | "CUSTOM";
export type Status = "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING" | "ARCHIVED";

export interface Contact {
  uid: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  identifier: string;
  identifierType: IdentifierType;
  externalId: string | null;
  status: Status;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  lastInteractionAt: string;
  firstInteractionAt: string;
  tags: string[] | null;
  segment: string | null;
  marketingOptIn: boolean;
  marketingOptInAt: string | null;
  metadata: {
    source?: {
      provider?: string;
      externalId?: string;
      phoneNumberId?: string;
      integrationType?: string;
      externalTimestamp?: string;
      [key: string]: string | undefined;
    };
  };
}

export interface ContactUpdate
  extends Partial<
    Pick<
      Contact,
      | "externalId"
      | "displayName"
      | "firstName"
      | "lastName"
      | "status"
      | "isActive"
      | "isVerified"
    >
  > {}

export interface ContactImport
  extends Partial<
    Pick<
      Contact,
      | "identifier"
      | "identifierType"
      | "displayName"
      | "firstName"
      | "lastName"
      | "status"
      | "isActive"
      | "isVerified"
      | "tags"
      | "segment"
      | "marketingOptIn"
      | "marketingOptInAt"
      | "metadata"
    >
  > {
  customFields?: Record<string, string>;
}

export interface ContactImportResponse
  extends Partial<
    Pick<
      Contact,
      "uid" | "displayName" | "identifier" | "identifierType" | "externalId"
    >
  > {}

export interface MessageContent {
  type: ContentType;
  data: {
    text: string;
    id?: string;
    type?: ButtonType;
    mediaUrl?: string;
    url?: string;
  };
}

export interface BaseConversation {
  uid: string;
  type: ConversationType;
  status: ConversationStatus;
  channelUid: string;
  workspaceUid: string;
  metadata?: {
    source?: string;
    createdVia?: string;
    [key: string]: string | undefined;
  };
  lastInteractionAt: string;
  createdAt: string;
  updatedAt: string;
}
