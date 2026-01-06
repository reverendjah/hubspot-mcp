import { Express, RequestHandler } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import * as R from "ramda";

import { importer } from "@/core/helpers/index.js";

export const registerRoutes = async (
  routesPath: string,
  middlewaresPath: string,
  server: Express,
  logger: any,
  basePath = "/"
) => {
  // Verificar se o diretório existe antes de tentar lê-lo
  try {
    await fs.access(routesPath);
  } catch (error) {
    logger.warn(`Routes directory not found: ${routesPath}`);
    return;
  }

  const routes = await fs.readdir(routesPath);

  // Filtrar apenas arquivos válidos (não .gitkeep, .map, .disabled.js)
  const validRoutes = routes.filter(
    (r) =>
      !r.endsWith(".gitkeep") &&
      !r.endsWith(".map") &&
      !r.endsWith(".disabled.js")
  );

  if (validRoutes.length === 0) {
    logger.info(`No valid routes found in ${routesPath}`);
    return;
  }

  for (const r of routes) {
    const routePath = path.join(routesPath, r);
    const stats = await fs.stat(routePath);

    if (stats.isDirectory()) {
      const isParamFolder = r.startsWith("[") && r.endsWith("]");
      const paramName = isParamFolder ? r.slice(1, -1) : r;
      const newBasePath = path.join(
        basePath,
        isParamFolder ? `:${paramName}` : r
      );

      await registerRoutes(
        routePath,
        middlewaresPath,
        server,
        logger,
        newBasePath
      );
      continue;
    }

    if (
      r.endsWith("gitkeep") ||
      r.endsWith(".map") ||
      r.endsWith(".disabled.js")
    ) {
      continue;
    }

    logger.info(`Loading file ${r}...`);

    const RouteModule = await importer(routePath);
    const route = new RouteModule();

    const method = route.method().toLowerCase();
    const middlewares = [];

    for (const name of route.middlewares()) {
      const params = name.split(":");

      const fileName = params[0];
      const args = (params[1] || "").split("|");
      const cleanArgs = R.reject(R.equals(""))(args);

      const fnModule = await importer(`${middlewaresPath}/${fileName}.js`);
      const fn = fnModule.default;

      if (cleanArgs.length > 0) {
        middlewares.push(fn(...cleanArgs));
      } else {
        middlewares.push(fn);
      }
    }

    const catchAllHandler: RequestHandler = async (req, res, next) => {
      try {
        await route.handler(req, res, next);
      } catch (error) {
        logger.error(error);

        next(error);
      }
    };

    const fullPath = path.join(basePath, route.path());

    switch (method) {
      case "get":
        server.get(fullPath, middlewares, catchAllHandler);
        break;
      case "post":
        server.post(fullPath, middlewares, catchAllHandler);
        break;
      case "put":
        server.put(fullPath, middlewares, catchAllHandler);
        break;
      case "patch":
        server.patch(fullPath, middlewares, catchAllHandler);
        break;
      case "delete":
        server.delete(fullPath, middlewares, catchAllHandler);
        break;
      default:
        logger.warn(`Method '${method}' not supported!`);
        break;
    }

    logger.info(
      `Route '${route.method()} ${fullPath}' registered successfully`
    );
  }
};
