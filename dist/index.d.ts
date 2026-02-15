interface ToolAnnotations {
    readOnlyHint?: boolean;
}
interface ToolResponseContent {
    type: string;
    text: string;
}
interface ToolResponse {
    content: ToolResponseContent[];
    isError?: boolean;
}
interface ModelContextClient {
    requestUserInteraction: (callback: UserInteractionCallback) => Promise<unknown>;
}
type UserInteractionCallback = () => Promise<unknown>;
type ToolExecuteCallback = (input: Record<string, unknown>, client: ModelContextClient) => Promise<ToolResponse>;
interface ModelContextTool {
    name: string;
    description: string;
    inputSchema?: Record<string, unknown>;
    execute: ToolExecuteCallback;
    annotations?: ToolAnnotations;
}
interface ModelContextOptions {
    tools: ModelContextTool[];
}
interface ModelContext {
    provideContext(options?: ModelContextOptions): void;
    clearContext(): void;
    registerTool(tool: ModelContextTool): void;
    unregisterTool(name: string): void;
}
interface WebMCPDebug {
    tools: Map<string, ModelContextTool>;
    callHistory: Array<{
        tool: string;
        input: Record<string, unknown>;
        timestamp: number;
        result?: unknown;
        error?: string;
    }>;
}

/**
 * Create a default ModelContextClient that passes through
 * user interaction callbacks.
 */
declare function createModelContextClient(): ModelContextClient;
/**
 * Initialize the WebMCP polyfill.
 *
 * Adds `navigator.modelContext` if it doesn't already exist natively.
 * Safe to call multiple times — subsequent calls are no-ops.
 * No-ops in non-browser environments (SSR).
 */
declare function initPolyfill(): void;

export { type ModelContext, type ModelContextClient, type ModelContextOptions, type ModelContextTool, type ToolAnnotations, type ToolExecuteCallback, type ToolResponse, type ToolResponseContent, type UserInteractionCallback, type WebMCPDebug, createModelContextClient, initPolyfill };
