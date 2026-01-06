import { resolve } from "node:path";
import { getDirname } from "./dirname.js";

const APP_ROOT = resolve(getDirname(), "..");

export const importer = async (filePath: string) => {
  try {
    if (filePath.endsWith(".map")) {
      return;
    }

    if (filePath.startsWith("./") || filePath.startsWith("../")) {
      return await import(new URL(filePath, `file://${APP_ROOT}/`).href);
    }

    return await import(filePath).then((module) => module.default);
  } catch (error) {
    throw error;
  }
};
