import type { NextFunction, Request, Response } from "express";

async function checkHealth(_req: Request, res: Response, _next: NextFunction) {
  return res.status(200).json({
    message: "All systems are healthy",
    services: [],
  });
}

export default checkHealth;
