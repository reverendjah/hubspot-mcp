import path from "node:path";
import { fileURLToPath } from "node:url";

export const getDirname = () => {
  return path.dirname(fileURLToPath(import.meta.url));
};
