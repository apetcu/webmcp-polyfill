"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createModelContextClient: () => createModelContextClient,
  initPolyfill: () => initPolyfill
});
module.exports = __toCommonJS(index_exports);

// src/polyfill.ts
function validateInput(schema, input) {
  if (schema.type === "object") {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return "Expected input to be an object";
    }
    const required = schema.required;
    if (Array.isArray(required)) {
      for (const field of required) {
        if (!(field in input)) {
          return `Missing required field: ${field}`;
        }
      }
    }
    const properties = schema.properties;
    if (properties) {
      for (const [key, propSchema] of Object.entries(properties)) {
        if (!(key in input)) continue;
        const value = input[key];
        const expectedType = propSchema.type;
        if (!expectedType) continue;
        let valid = true;
        switch (expectedType) {
          case "string":
            valid = typeof value === "string";
            break;
          case "number":
          case "integer":
            valid = typeof value === "number";
            break;
          case "boolean":
            valid = typeof value === "boolean";
            break;
          case "array":
            valid = Array.isArray(value);
            break;
          case "object":
            valid = typeof value === "object" && value !== null && !Array.isArray(value);
            break;
        }
        if (!valid) {
          return `Field "${key}" expected type "${expectedType}", got "${typeof value}"`;
        }
      }
    }
  }
  return null;
}
function createModelContext() {
  const baseTools = /* @__PURE__ */ new Map();
  const dynamicTools = /* @__PURE__ */ new Map();
  const callHistory = [];
  function getAllTools() {
    const merged = /* @__PURE__ */ new Map();
    baseTools.forEach((tool, name) => merged.set(name, tool));
    dynamicTools.forEach((tool, name) => merged.set(name, tool));
    return merged;
  }
  function wrapExecute(tool) {
    const originalExecute = tool.execute;
    return {
      ...tool,
      execute: async (input, client) => {
        if (tool.inputSchema) {
          const error = validateInput(
            tool.inputSchema,
            input
          );
          if (error) {
            const entry2 = {
              tool: tool.name,
              input,
              timestamp: Date.now(),
              error
            };
            callHistory.push(entry2);
            throw new Error(`Input validation failed: ${error}`);
          }
        }
        const entry = {
          tool: tool.name,
          input,
          timestamp: Date.now()
        };
        try {
          const result = await originalExecute(input, client);
          entry.result = result;
          callHistory.push(entry);
          return result;
        } catch (err) {
          entry.error = err instanceof Error ? err.message : String(err);
          callHistory.push(entry);
          throw err;
        }
      }
    };
  }
  const modelContext = {
    provideContext(options) {
      baseTools.clear();
      if (options?.tools) {
        for (const tool of options.tools) {
          if (dynamicTools.has(tool.name)) {
            throw new Error(
              `Tool "${tool.name}" already registered as a dynamic tool`
            );
          }
          baseTools.set(tool.name, wrapExecute(tool));
        }
      }
      updateDebug();
    },
    clearContext() {
      baseTools.clear();
      dynamicTools.clear();
      updateDebug();
    },
    registerTool(tool) {
      if (baseTools.has(tool.name) || dynamicTools.has(tool.name)) {
        throw new Error(`Tool "${tool.name}" is already registered`);
      }
      dynamicTools.set(tool.name, wrapExecute(tool));
      updateDebug();
    },
    unregisterTool(name) {
      const deletedBase = baseTools.delete(name);
      const deletedDynamic = dynamicTools.delete(name);
      if (!deletedBase && !deletedDynamic) {
        throw new Error(`Tool "${name}" is not registered`);
      }
      updateDebug();
    }
  };
  const debug = {
    tools: getAllTools(),
    callHistory
  };
  function updateDebug() {
    debug.tools = getAllTools();
  }
  if (typeof window !== "undefined") {
    window.__webmcp = debug;
  }
  return modelContext;
}
function createModelContextClient() {
  return {
    requestUserInteraction: async (callback) => {
      return await callback();
    }
  };
}
function initPolyfill() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return;
  }
  if ("modelContext" in navigator) {
    return;
  }
  const modelContext = createModelContext();
  Object.defineProperty(navigator, "modelContext", {
    value: modelContext,
    writable: false,
    enumerable: true,
    configurable: false
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createModelContextClient,
  initPolyfill
});
//# sourceMappingURL=index.cjs.map