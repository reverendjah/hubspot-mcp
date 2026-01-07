import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getDirname } from "./dirname.js";

const APP_ROOT = resolve(getDirname(), "..");

const getDefaultExport = (module: any) => {
  return module?.default ?? module;
};

export const importer = async (filePath: string) => {
  try {
    if (filePath.endsWith(".map")) {
      return;
    }

    if (filePath.startsWith("./") || filePath.startsWith("../")) {
      const absolutePath = resolve(APP_ROOT, filePath);
      const module = await import(pathToFileURL(absolutePath).href);
      return getDefaultExport(module);
    }

    // Handle absolute Windows paths
    if (/^[a-zA-Z]:/.test(filePath)) {
      const module = await import(pathToFileURL(filePath).href);
      return getDefaultExport(module);
    }

    const module = await import(filePath);
    return getDefaultExport(module);
  } catch (error) {
    throw error;
  }
};
