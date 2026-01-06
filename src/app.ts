import "dotenv/config";

import { env, logger, TransportsManager } from "@/core/app/index.js";

import { startHttpServer } from "@/core/servers/http/index.js";
import { startMcpServer } from "@/core/servers/mcp/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const log = logger.child({
  name: "app",
});

let mcpServer: McpServer | undefined;

const main = async () => {
  const app = await startHttpServer();

  await startMcpServer(app);

  app.listen(env.PORT, () => {
    log.info(`Server is running on port 0.0.0.0:${env.PORT}${env.HOOK_PREFIX}`);

    log.info(
      `MCP server is running on port 0.0.0.0:${env.PORT}${env.HOOK_PREFIX}/mcp`
    );
  });
};

process.on("SIGINT", async () => {
  log.info("SIGINT signal received. Shutting down...");

  const transports = TransportsManager.getInstance().getAll();
  for (const transport of Object.values(transports)) {
    await transport.close();
  }

  if (mcpServer) {
    await mcpServer.close();
  }

  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, shutting down...");
  process.kill(process.pid, "SIGINT");
});

process.on("uncaughtException", (error) => {
  logger.fatal(
    { error: error.message, stack: error.stack },
    "Uncaught exception"
  );
  process.exit(1);
});

main();
