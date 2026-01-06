import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  JSONRPCMessage,
  JSONRPCMessageSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import { IncomingMessage, ServerResponse } from "node:http";

export interface CustomExtraInfo {
  [key: string]: any;
}

export interface ExtendedExtraInfo {
  authInfo?: any;
  customInfo?: CustomExtraInfo;
  _meta?: {
    contactId: string;
    workspaceId: string;
    channelId: string;
    conversationUid: string;
  };
}

/**
 * Adapter estendido do StreamableHTTPServerTransport que permite enviar informações customizadas no parâmetro extra
 */
export class SSETransportAdapter extends StreamableHTTPServerTransport {
  private _customExtraExtractor?: (req: IncomingMessage) => CustomExtraInfo;

  /**
   * Cria um novo adapter baseado no StreamableHTTPServerTransport oficial
   * @param options - Opções de configuração do transport
   * @param customExtraExtractor - Função opcional para extrair informações customizadas da requisição
   */
  constructor(
    options: {
      sessionIdGenerator?: () => string;
      onsessioninitialized?: (sessionId: string) => void;
    } = {},
    customExtraExtractor?: (req: IncomingMessage) => CustomExtraInfo
  ) {
    // Garantir que sessionIdGenerator seja fornecido
    const transportOptions = {
      sessionIdGenerator: options.sessionIdGenerator || (() => randomUUID()),
      onsessioninitialized: options.onsessioninitialized,
    };

    super(transportOptions);
    this._customExtraExtractor = customExtraExtractor;

    // Intercepta o onmessage original para injetar customInfo
    const originalOnMessage = this.onmessage;
    this.onmessage = (message: JSONRPCMessage, extra?: any) => {
      // Processa a mensagem com as informações customizadas
      this.handleMessageWithCustomInfo(message, extra);
      // Chama o handler original se existir
      if (originalOnMessage) {
        originalOnMessage.call(this, message, extra);
      }
    };
  }

  /**
   * Sobrescreve handleRequest para adicionar extração de informações customizadas
   */
  async handleRequest(
    req: IncomingMessage & { auth?: any },
    res: ServerResponse,
    parsedBody?: unknown
  ): Promise<void> {
    // Extrai informações de auth e customizadas da requisição
    const authInfo: any | undefined = req.auth;
    const customInfo = this._customExtraExtractor
      ? this._customExtraExtractor(req)
      : undefined;

    // Armazena as informações extras no contexto da requisição para uso posterior
    if (authInfo || customInfo) {
      (req as any).__extraInfo = { authInfo, customInfo };
    }

    // Chama o método pai
    await super.handleRequest(req, res, parsedBody);
  }

  /**
   * Manipula uma mensagem injetando customInfo como _meta nos params
   */
  private handleMessageWithCustomInfo(
    message: JSONRPCMessage,
    extra?: any
  ): void {
    try {
      // Valida a mensagem usando o schema oficial
      const parsedMessage = JSONRPCMessageSchema.parse(message);

      // Obtém informações extras do contexto ou dos parâmetros
      const extraInfo: ExtendedExtraInfo = extra || {};

      // Injeta customInfo como _meta nos params da mensagem (apenas para requisições)
      if (
        extraInfo.customInfo &&
        "params" in parsedMessage &&
        parsedMessage.params
      ) {
        parsedMessage.params = {
          ...parsedMessage.params,
          _meta: extraInfo.customInfo,
        };
      }

      // Atualiza a mensagem original com os params modificados
      Object.assign(message, parsedMessage);
    } catch (error) {
      // Em caso de erro, mantém a mensagem original
      console.warn("Erro ao processar mensagem customizada:", error);
    }
  }

  /**
   * Define uma função customizada para extrair informações extras da requisição
   */
  setCustomExtraExtractor(
    extractor: (req: IncomingMessage) => CustomExtraInfo
  ): void {
    this._customExtraExtractor = extractor;
  }

  /**
   * Método auxiliar para criar uma instância com configurações de sessão
   */
  static createWithSessionManagement(
    sessionIdGenerator: () => string,
    onSessionInitialized?: (sessionId: string) => void,
    customExtraExtractor?: (req: IncomingMessage) => CustomExtraInfo
  ): SSETransportAdapter {
    return new SSETransportAdapter(
      {
        sessionIdGenerator,
        onsessioninitialized: onSessionInitialized,
      },
      customExtraExtractor
    );
  }

  /**
   * Método auxiliar para criar uma instância stateless
   */
  static createStateless(
    customExtraExtractor?: (req: IncomingMessage) => CustomExtraInfo
  ): SSETransportAdapter {
    return new SSETransportAdapter(
      {
        sessionIdGenerator: undefined,
      },
      customExtraExtractor
    );
  }
}
