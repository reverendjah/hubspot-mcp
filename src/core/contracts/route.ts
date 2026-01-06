import { Request, Response } from "express";

export interface BaseRoute {
  method(): string;

  path(): string;

  middlewares(): Array<string>;

  handler(req: Request, res: Response): Promise<any>;
}
