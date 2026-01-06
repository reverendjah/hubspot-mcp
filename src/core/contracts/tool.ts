export type BaseToolContext = {
  channelId: string;
  channelType: string;
  identityId: string;
};

export interface BaseToolContract {
  name(): string;
  input(): Record<string, any>;
  handler(params: Record<string, any>): Promise<any>;
}

export abstract class BaseTool implements BaseToolContract {
  constructor() {}

  abstract name(): string;
  abstract input(): Record<string, any>;

  abstract handler(params: Record<string, any>): Promise<any>;
}
