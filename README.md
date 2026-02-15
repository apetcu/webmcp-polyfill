# webmcp-polyfill

Lightweight W3C WebMCP (`navigator.modelContext`) polyfill for making websites AI-agent-friendly.

## Overview

WebMCP (Model Context Protocol for the Web) is a proposed standard that allows websites to expose tools and context to AI agents. This polyfill provides a compatible implementation of `navigator.modelContext` for browsers that don't yet support it natively.

## Installation

```bash
npm install webmcp-polyfill
```

## Usage

```ts
import { initPolyfill, createModelContextClient } from "@adipetcu/webmcp-polyfill";

// Initialize the polyfill early (e.g., in your app entry point)
// Safe to call multiple times; subsequent calls are no-ops
initPolyfill();

// Define tools that AI agents can use
const tools = [
  {
    name: "search",
    description: "Search for products on the site",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
    execute: async (input, client) => ({
      content: [{ type: "text", text: `Results for: ${input.query}` }],
    }),
  },
];

// Provide context to agents
navigator.modelContext.provideContext({ tools });
```

### Dynamic tool registration

```ts
// Register a tool at runtime
navigator.modelContext.registerTool({
  name: "getUser",
  description: "Get current user info",
  execute: async () => ({
    content: [{ type: "text", text: JSON.stringify(user) }],
  }),
});

// Unregister when no longer needed
navigator.modelContext.unregisterTool("getUser");
```

### Clearing context

```ts
navigator.modelContext.clearContext();
```

## API

- **`initPolyfill()`** — Adds `navigator.modelContext` if not present. No-op in non-browser environments (SSR).

- **`createModelContextClient()`** — Returns a default client implementation for tool execution. Useful when tools need to request user interaction (e.g., confirmations).

- **`ModelContext.provideContext(options?)`** — Set the initial tools available to agents.

- **`ModelContext.registerTool(tool)`** — Add a tool at runtime.

- **`ModelContext.unregisterTool(name)`** — Remove a registered tool.

- **`ModelContext.clearContext()`** — Clear all base and dynamic tools.

## Debug

In development, the polyfill exposes a debug object on `window.__webmcp`:

- **`tools`** — Map of all registered tools
- **`callHistory`** — Array of tool invocations with inputs, results, and errors

## License

Apache-2.0 — see [LICENSE](LICENSE) for details.
