import { bool, cleanEnv, num, str } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),

  NODE_ENV: str({ default: "development" }),

  LOG_LEVEL: str({ default: "debug" }),
  LOG_PRETTY_PRINT: bool({ default: true }),

  HOOK_PREFIX: str({ default: "/hook" }),

  MCP_SERVER_NAME: str({ default: "HubSpot MCP" }),
  MCP_SERVER_VERSION: str({ default: "1.0.0" }),

  PLATI_API_KEY: str(),
  PLATI_CHANNEL_ID: str(),
  PLATI_WORKSPACE_ID: str(),

  HUBSPOT_API_KEY: str(),
  HUBSPOT_PIPELINE_ID: str({ default: "default" }),
  HUBSPOT_OWNER_ID: str({ default: "" }),
});
