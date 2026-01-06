import { env } from "@/core/app/env.js";
import {
  Contact,
  ContactImportResponse,
  ContactImport,
  ContactUpdate,
  MessageContent,
  BaseConversation,
} from "./plati.entities.js";
import { HeadersInit } from "node-fetch";
import { ConversationStatus, MessageType } from "./plati.enums.js";

export interface ICreateFollowUpRequest {
  name: string;
  taskType: string;
  scheduleType: "once" | "recurring";
  actionData: Record<string, any>;
  scheduledAt: string;
  isRecurring: boolean;
  priority: number;
  createdBy: string;
  identityUid: string;
}

/**
 * Dados necessários para enviar uma mensagem customizada com botões
 */
export interface ISendCustomMessageRequest {
  conversationUid: string;
  messageType: MessageType;
  contents: MessageContent[];
  metadata: Record<string, any>;
}

export interface ISendCustomMessageResponse {
  message: {
    uid: string;
    messageType: MessageType;
    createdAt: string;
    metadata: Record<string, string>;
  };
}

export interface IImportContactIntoChannelRequest {
  contacts: ContactImport[];
  updateExisting: boolean;
  skipErrors: boolean;
  createIdentities: boolean;
}

export interface IImportContactIntoChannelResponse {
  contacts?: ContactImportResponse[];
  total: number;
  success: number;
  updated: number;
  skipped: number;
  errors: number;
  errorDetails: any[];
}

/**
 * Tipos de erro que podem ocorrer nas chamadas Plati
 */
export class PlatiError extends Error {
  statusCode: number;
  apiError?: any;

  constructor(message: string, statusCode: number, apiError?: any) {
    super(message);
    this.name = "PlatiError";
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

/**
 * Cliente para integração com a API Plati
 * Fornece métodos para interagir com serviços WhatsApp Business
 */
export class Plati {
  private static readonly BASE_URL = "https://beta.plati.ai/v1";

  private static readonly API_KEY = env.PLATI_API_KEY;
  private static readonly CHANNEL_ID = env.PLATI_CHANNEL_ID;

  /**
   * Envia uma mensagem usando um custom message WhatsApp
   *
   * @param conversationUid - ID da conversa WhatsApp
   * @param data - Dados da mensagem customizada a ser enviada
   * @param triggerBy - Origem da mensagem
   * @returns Promise com a resposta da API
   * @throws {PlatiError} Se a requisição falhar
   */
  public static async sendCustomMessage<R = ISendCustomMessageResponse>(
    conversationUid: string,
    data: ISendCustomMessageRequest,
    triggerBy: "clickbus_webhook" | "mcp" | "untracked" = "untracked"
  ): Promise<R> {
    if (!conversationUid) {
      throw new Error("ID da conversa é obrigatório");
    }

    data.metadata = {
      ...data.metadata,
      source: "crm_mcp",
      trigger_by: triggerBy,
    };

    return this.request(
      `/conversations/${conversationUid}/messages`,
      "POST",
      data
    );
  }

  /**
   * Busca informações de um contato específico
   *
   * @param channelId - ID do canal a ser buscada
   * @param contactId - ID do contato a ser buscada
   * @returns Promise com a resposta da API contendo os dados do contato
   * @throws {PlatiError} Se a requisição falhar
   */
  public static async getContact(
    contactId: string
  ): Promise<Contact> {
    if (!this.CHANNEL_ID) {
      throw new Error("ID do canal é obrigatório");
    }
    if (!contactId) {
      throw new Error("ID do contato é obrigatório");
    }

    return this.request<Contact>(
      `/channels/${this.CHANNEL_ID}/contacts/${contactId}`,
      "GET"
    );
  }

  public static async importContactIntoChannel(
    data: IImportContactIntoChannelRequest
  ): Promise<IImportContactIntoChannelResponse> {
    return this.request<IImportContactIntoChannelResponse>(
      `/channels/${this.CHANNEL_ID}/contacts/import`,
      "POST",
      data
    );
  }

  /**
   * Atualiza um contato específico
   *
   * @param channelId - ID do canal a ser atualizada
   * @param contactId - ID do contato a ser atualizada
   * @param data - Dados do contato a serem atualizados
   * @returns Promise com a resposta da API
   * @throws {PlatiError} Se a requisição falhar
   */
  public static async updateContact(
    contactId: string,
    data: ContactUpdate
  ): Promise<Contact> {
    if (!this.CHANNEL_ID) {
      throw new Error("ID do canal é obrigatório");
    }
    if (!contactId) {
      throw new Error("ID do contato é obrigatório");
    }

    console.log({ contactId, data });

    return this.request<Contact>(
      `/channels/${this.CHANNEL_ID}/contacts/${contactId}`,
      "PUT",
      data
    );
  }

  public static async createConversationForContact(
    contactId: string
  ): Promise<BaseConversation> {
    return this.request<BaseConversation>(
      `/conversations/contact/${contactId}`,
      "POST",
      {
        channelId: this.CHANNEL_ID,
        metadata: {
          source: "crm_mcp",
          initiatedBy: "template_campaign",
        },
        status: ConversationStatus.ACTIVE,
      }
    );
  }

  /**
   * Cria um follow up
   *
   * @returns Promise com a resposta da API
   * @throws {PlatiError} Se a requisição falhar
   */
  public static async createFollowUp(
    data: ICreateFollowUpRequest
  ): Promise<any> {
    return this.request(`/scheduled-tasks`, "POST", data);
  }

  /**
   * Cancela um follow up específico
   *
   * @param followUpId - ID do follow up a ser cancelado
   * @returns Promise com a resposta da API
   * @throws {PlatiError} Se a requisição falhar
   */
  public static async cancelFollowUp(followUpId: string): Promise<void> {
    return this.request(`/scheduled-tasks/${followUpId}`, "DELETE");
  }

  /**
   * Realiza uma requisição para a API Plati
   *
   * @param path - Caminho da API
   * @param method - Método HTTP
   * @param payload - Dados a serem enviados (opcional)
   * @returns Promise com a resposta da API
   * @throws {PlatiError} Se a requisição falhar
   */
  private static async request<T = any>(
    path: string,
    method: string,
    payload?: any
  ): Promise<T> {
    if (!this.API_KEY) {
      throw new Error("PLATI_API_KEY não configurada no ambiente");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-api-key": this.API_KEY,
    };

    try {
      const response = await fetch(`${this.BASE_URL}${path}`, {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.log(`${this.BASE_URL}${path}`);
        console.error(responseData);

        throw new PlatiError(
          `Falha na requisição Plati: ${response.statusText}`,
          response.status,
          responseData
        );
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof PlatiError) {
        throw error;
      }

      throw new PlatiError(
        `Erro ao comunicar com a API Plati: ${(error as Error).message}`,
        500
      );
    }
  }
}
