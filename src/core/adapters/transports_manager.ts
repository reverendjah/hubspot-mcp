import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import { logger } from "../app/logger.js";
import { SSETransportAdapter } from "./sse_transport_adapter.js";

type SupportedTransport = SSEServerTransport | SSETransportAdapter;

export class TransportsManager {
  private static instance: TransportsManager;
  private transports: Record<string, SupportedTransport> = {};

  private constructor() {}

  public static getInstance(): TransportsManager {
    if (!TransportsManager.instance) {
      TransportsManager.instance = new TransportsManager();
    }
    return TransportsManager.instance;
  }

  public getAll() {
    return this.transports;
  }

  public get(key: string) {
    return this.transports[key];
  }

  public set(key: string, value: SupportedTransport) {
    this.transports[key] = value;
  }

  public async delete(key: string) {
    const transport = this.transports[key];

    if (!transport) {
      return;
    }

    try {
      await transport.close();
    } catch (error) {
      logger.error(`Error closing transport ${key}`);
      logger.error(error);
    } finally {
      delete this.transports[key];
    }
  }

  public has(key: string) {
    return key in this.transports;
  }
}
