import { type Express } from "express";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import { env, logger } from "@/core/app/index.js";
import { getAppPath, getDirname } from "@/core/helpers/index.js";

import { registerTools } from "./utils/register_tools.js";

export interface CustomExtraInfo {
  [key: string]: any;
}

const extractCustomInfo = (req: any): CustomExtraInfo => {
  const headers = req.headers;

  return {
    workspaceId: headers["x-workspace-id"] as string | undefined,
    channelId: headers["x-channel-id"] as string | undefined,
    contactId: headers["x-contact-id"] as string | undefined,
    requestId: headers["x-request-id"] as string | undefined,
    conversationUid: headers["x-conversation-id"] as string | undefined,
    userAgent: headers["user-agent"] as string | undefined,
    timestamp: Date.now(),
  };
};

// Middleware para injetar _meta na requisição
const injectMetaMiddleware = (req: any, customInfo: CustomExtraInfo) => {
  // Adiciona o customInfo ao objeto de requisição para que possa ser acessado pelos tools
  req._mcpMeta = customInfo;

  // Se o body da requisição tem params, injeta _meta lá também
  if (req.body && typeof req.body === "object" && req.body.params) {
    req.body.params._meta = customInfo;
  }
};

// Função para criar e configurar um servidor MCP
const createMcpServerInstance = async (toolsPath: string, log: any) => {
  const server = new McpServer({
    name: env.MCP_SERVER_NAME,
    version: env.MCP_SERVER_VERSION,
  });

  await registerTools(toolsPath, server, log);
  return server;
};

export const startMcpServer = async (app: Express) => {
  const log = logger.child({
    name: "mcp-server",
    serverType: "mcp",
  });

  log.info("Starting MCP server in stateless mode...");

  const toolsPath = getAppPath({ dirname: getDirname() }, "tools");

  // Endpoint unificado para Streamable HTTP (stateless)
  app.all(`${env.HOOK_PREFIX}/mcp`, async (req, res) => {
    const method = req.method;
    const requestMethod = req.body?.method || "unknown";
    const requestId = req.body?.id;

    try {
      log.debug(`Received ${method} request for MCP`, {
        method: requestMethod,
        id: requestId,
        headers: req.headers,
        isInitialize: method === "POST" ? isInitializeRequest(req.body) : false,
        query: req.query,
      });

      // Extrai informações customizadas da requisição
      const customInfo = extractCustomInfo(req);

      // Injeta _meta na requisição
      injectMetaMiddleware(req, customInfo);

      // Para modo stateless, cria nova instância com transport oficial
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
      });

      const server = await createMcpServerInstance(toolsPath, log);

      // Log da requisição
      const requestInfo = {
        httpMethod: method,
        workspaceId: req.headers["x-workspace-id"],
        channelId: req.headers["x-channel-id"],
        contactId: req.headers["x-contact-id"],
        conversationUid: req.headers["x-conversation-id"],
        requestId: req.headers["x-request-id"],
        mcpMethod: requestMethod,
        isInitialize: method === "POST" ? isInitializeRequest(req.body) : false,
        customInfo,
      };

      log.info("Processing MCP request", requestInfo);

      // Cleanup automático quando requisição terminar
      let cleanedUp = false;
      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        log.debug("Request closed, cleaning up resources", requestInfo);
        try {
          transport.close();
          server.close();
        } catch (cleanupError) {
          log.warn({ cleanupError }, "Error during cleanup");
        }
      };

      res.on("close", cleanup);
      res.on("finish", cleanup);

      // Conecta servidor ao transport
      await server.connect(transport);

      // Processa a requisição baseado no método HTTP
      if (method === "POST") {
        // POST - comunicação principal (initialize, tools, etc.)
        await transport.handleRequest(req, res, req.body);
      } else {
        // GET/DELETE - notificações e cleanup
        await transport.handleRequest(req, res);
      }

      log.debug("MCP request processed successfully", requestInfo);
    } catch (error) {
      console.error("RAW ERROR:", error);
      console.error("ERROR TYPE:", typeof error);
      console.error("ERROR CONSTRUCTOR:", error?.constructor?.name);

      const errorMessage = error instanceof Error
        ? error.message
        : (error !== undefined && error !== null ? String(error) : "Unknown error");
      const errorStack = error instanceof Error ? error.stack : undefined;

      log.error({
        error: errorMessage,
        stack: errorStack,
        errorObject: error,
        httpMethod: method,
        mcpMethod: requestMethod,
        requestId: requestId,
      }, "Error processing MCP request");

      if (!res.headersSent) {
        // Resposta de erro padrão JSON-RPC
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: requestId || null,
        });
      }
    }
  });

  // Endpoint de fallback para SSE (compatibilidade com clientes antigos)
  app.get(`${env.HOOK_PREFIX}/sse`, async (req, res) => {
    log.warn("SSE endpoint accessed, redirecting to Streamable HTTP", {
      originalUrl: req.originalUrl,
      userAgent: req.headers["user-agent"],
    });

    res.status(301).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message:
          "SSE is deprecated. Please use Streamable HTTP at /mcp endpoint.",
        redirect: `${env.HOOK_PREFIX}/mcp`,
      },
      id: null,
    });
  });

  // Health check endpoint
  app.get(`${env.HOOK_PREFIX}/mcp/health`, async (req, res) => {
    res.status(200).json({
      status: "healthy",
      mode: "stateless",
      server: env.MCP_SERVER_NAME,
      version: env.MCP_SERVER_VERSION,
      endpoints: {
        main: `${env.HOOK_PREFIX}/mcp`,
        sse_fallback: `${env.HOOK_PREFIX}/sse`,
      },
      timestamp: new Date().toISOString(),
    });
  });

  log.info("MCP server configured in stateless mode");
  log.info(`MCP endpoint: ${env.HOOK_PREFIX}/mcp (ALL methods)`);
  log.info(`Health check: ${env.HOOK_PREFIX}/mcp/health`);
  log.info(`SSE fallback: ${env.HOOK_PREFIX}/sse (redirects to /mcp)`);
  log.info("Features enabled:");
  log.info("  ✅ Stateless operation (no session management)");
  log.info("  ✅ Horizontal scaling support");
  log.info("  ✅ Load balancer compatible");
  log.info("  ✅ Custom metadata extraction");
  log.info("  ✅ Official StreamableHTTPServerTransport");
  log.info("  ✅ Unified endpoint for all HTTP methods");

  // Retorna configuração do servidor
  return {
    mode: "stateless",
    endpoints: {
      main: `${env.HOOK_PREFIX}/mcp`,
      health: `${env.HOOK_PREFIX}/mcp/health`,
      sse_fallback: `${env.HOOK_PREFIX}/sse`,
    },
    toolsPath,
    extractCustomInfo,
  };
};
