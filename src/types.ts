export interface ToolAnnotations {
  readOnlyHint?: boolean;
}

export interface ToolResponseContent {
  type: string;
  text: string;
}

export interface ToolResponse {
  content: ToolResponseContent[];
  isError?: boolean;
}

export interface ModelContextClient {
  requestUserInteraction: (
    callback: UserInteractionCallback
  ) => Promise<unknown>;
}

export type UserInteractionCallback = () => Promise<unknown>;

export type ToolExecuteCallback = (
  input: Record<string, unknown>,
  client: ModelContextClient
) => Promise<ToolResponse>;

export interface ModelContextTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: ToolExecuteCallback;
  annotations?: ToolAnnotations;
}

export interface ModelContextOptions {
  tools: ModelContextTool[];
}

export interface ModelContext {
  provideContext(options?: ModelContextOptions): void;
  clearContext(): void;
  registerTool(tool: ModelContextTool): void;
  unregisterTool(name: string): void;
}

export interface WebMCPDebug {
  tools: Map<string, ModelContextTool>;
  callHistory: Array<{
    tool: string;
    input: Record<string, unknown>;
    timestamp: number;
    result?: unknown;
    error?: string;
  }>;
}
