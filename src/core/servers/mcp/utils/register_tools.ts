import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { Logger } from "pino";

import { BaseTool } from "@/core/contracts/tool.js";
import { importer } from "@/core/helpers/index.js";

export const registerTools = async (
  toolsPath: string,
  server: McpServer,
  logger: Logger
) => {
  const tools = await fs.readdir(toolsPath);

  for (const t of tools) {
    const toolPath = path.join(toolsPath, t);
    const stats = await fs.stat(toolPath);

    if (!stats.isDirectory()) {
      continue;
    }

    const toolFiles = await fs.readdir(toolPath);

    let toolHandlerPath: string | undefined = undefined;
    let toolInstructionsPath: string | undefined = undefined;

    for (const toolFile of toolFiles) {
      const toolFilePath = path.join(toolPath, toolFile);
      const toolFileStats = await fs.stat(toolFilePath);

      if (!toolFileStats.isFile()) {
        continue;
      }

      if (toolFilePath.includes("handler")) {
        toolHandlerPath = toolFilePath;
      }

      if (toolFilePath.includes("instructions.md")) {
        toolInstructionsPath = toolFilePath;
      }
    }

    if (!toolHandlerPath) {
      logger.error(`Tool ${t} does not have a handler`);
      continue;
    }

    if (!toolInstructionsPath) {
      logger.error(`Tool ${t} does not have a instructions`);
      continue;
    }

    logger.info(`Loading tool ${t}...`);

    const ToolModule = await importer(toolHandlerPath);

    const tool = new ToolModule() as BaseTool;

    logger.info(`Loading tool instructions...`);

    const instructions = await fs.readFile(toolInstructionsPath, "utf-8");

    const toolName = tool.name();
    const toolInput = tool.input();

    server.tool<typeof toolInput>(
      toolName,
      instructions,
      toolInput,
      tool.handler
    );

    logger.info(`Tool '${toolName}' registered successfully`);
  }
};
