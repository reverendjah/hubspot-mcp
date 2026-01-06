import path from "node:path";

export const getAppPath = (
  { dirname, exit = 2 }: { dirname: string; exit?: number },
  ...paths: string[]
) => {
  const exits = Array.from({ length: exit }, () => "..");

  return path.join(dirname, ...exits, ...paths);
};
