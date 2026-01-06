import { Plati } from "@/providers/plati/index.js";
import { ExtendedExtraInfo } from "../adapters/sse_transport_adapter.js";

export type BaseToolContext = {
  channelId: string;
  channelType: string;
  identityId: string;
};

export interface BaseToolContract {
  name(): string;
  input(): Record<string, any>;
  handler(params: Record<string, any>): Promise<any>;
}

export abstract class BaseTool implements BaseToolContract {
  constructor() {}

  abstract name(): string;
  abstract input(): Record<string, any>;

  abstract handler(params: Record<string, any>): Promise<any>;

  static async getContact(extras: ExtendedExtraInfo) {
    const contactId = extras?._meta?.contactId;
    if (!contactId) {
      throw new Error("Contact ID is required");
    }

    const result = await Plati.getContact(contactId);

    return result;
  }
}
