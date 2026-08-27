import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";
import type { ToolCategory } from "../constants.js";
import type { ListmonkClient } from "../services/listmonkClient.js";

export interface ToolDefinition<Shape extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  category: ToolCategory;
  title: string;
  description: string;
  inputSchema: Shape;
  annotations: ToolAnnotations;
  handler: (client: ListmonkClient, args: z.infer<z.ZodObject<Shape>>) => Promise<CallToolResult>;
}

/** Narrows a strongly-typed ToolDefinition down to the shape registerFilteredTools needs. */
export type AnyToolDefinition = ToolDefinition<z.ZodRawShape>;

export function defineTool<Shape extends z.ZodRawShape>(def: ToolDefinition<Shape>): AnyToolDefinition {
  return def as unknown as AnyToolDefinition;
}

export function assertUniqueToolNames(tools: AnyToolDefinition[]): void {
  const seen = new Set<string>();
  for (const tool of tools) {
    if (seen.has(tool.name)) {
      throw new Error(`Duplicate tool name registered: ${tool.name}`);
    }
    seen.add(tool.name);
  }
}

export function registerFilteredTools(
  server: McpServer,
  client: ListmonkClient,
  allTools: AnyToolDefinition[],
  enabledNames: Set<string>
): void {
  for (const tool of allTools) {
    if (!enabledNames.has(tool.name)) continue;
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      async (args) => tool.handler(client, args as z.infer<z.ZodObject<z.ZodRawShape>>)
    );
  }
}
