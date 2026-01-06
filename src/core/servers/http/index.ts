import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import methodOverride from "method-override";
import { pinoHttp } from "pino-http";

import { env, logger } from "@/core/app/index.js";
import { getAppPath, getDirname, importer } from "@/core/helpers/index.js";

import { registerRoutes } from "./utils/register_routes.js";

export const startHttpServer = async () => {
  const log = logger.child({
    name: "http-server",
    serverType: "http",
  });

  const __dirname = getDirname();

  const healthCheckerPath = getAppPath(
    { dirname: __dirname },
    "hooks",
    "health.js"
  );

  log.info("Searching for health checker...");

  const healthChecker = await importer(healthCheckerPath);

  if (!healthChecker) {
    log.error("Health checker not found");
    process.exit(1);
  }

  log.info("Health checker found");

  log.info("Starting HTTP server...");

  const app = express();

  log.info("Configuring server middlewares...");

  app.use(
    compression({
      filter: (req, res) => {
        if (req.path.startsWith(`${env.HOOK_PREFIX}/mcp`)) {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );
  app.use(
    bodyParser.json({
      limit: "10mb",
    })
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(methodOverride());
  app.use(
    cors({
      origin: "*",
    })
  );

  app.use(
    pinoHttp({
      customAttributeKeys: {
        req: "request",
        res: "response",
        err: "error",
        responseTime: "time",
      },
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
          body: res.body,
        }),
      },
      autoLogging: {
        ignore(req) {
          return req.path === "/health";
        },
      },
    })
  );

  log.info("Configuring routes...");

  const routesPath = getAppPath({ dirname: __dirname }, "hooks", "routes");

  const middlewaresPath = getAppPath(
    { dirname: __dirname },
    "hooks",
    "middlewares"
  );

  const serverPrefix = env.HOOK_PREFIX;

  await registerRoutes(routesPath, middlewaresPath, app, log, serverPrefix);

  log.info("Configuring health check route...");

  app.get(`${serverPrefix}/health`, healthChecker);

  return app;
};
