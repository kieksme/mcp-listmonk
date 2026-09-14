import { describe, expect, it, vi } from "vitest";
import {
  assertUniqueToolNames,
  defineTool,
  registerFilteredTools,
  type AnyToolDefinition,
} from "../../src/registry/toolRegistry.js";
import type { ListmonkClient } from "../../src/services/listmonkClient.js";

function makeTool(name: string, overrides: Partial<AnyToolDefinition> = {}): AnyToolDefinition {
  return defineTool({
    name,
    category: "miscellaneous",
    title: name,
    description: `Description for ${name}`,
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async () => ({ content: [{ type: "text", text: "ok" }] }),
    ...overrides,
  });
}

describe("defineTool", () => {
  it("returns the definition unchanged (identity passthrough)", () => {
    const tool = makeTool("listmonk_example");
    expect(tool.name).toBe("listmonk_example");
    expect(tool.category).toBe("miscellaneous");
  });
});

describe("assertUniqueToolNames", () => {
  it("does not throw when all tool names are unique", () => {
    expect(() => assertUniqueToolNames([makeTool("a"), makeTool("b")])).not.toThrow();
  });

  it("throws with the offending name when a duplicate exists", () => {
    expect(() => assertUniqueToolNames([makeTool("dup"), makeTool("dup")])).toThrow(
      "Duplicate tool name registered: dup"
    );
  });

  it("does not throw for an empty tool list", () => {
    expect(() => assertUniqueToolNames([])).not.toThrow();
  });
});

describe("registerFilteredTools", () => {
  it("registers only the enabled tools, passing through the client and args to the handler", async () => {
    const registerTool = vi.fn();
    const fakeServer = { registerTool } as unknown as Parameters<typeof registerFilteredTools>[0];
    const fakeClient = {} as ListmonkClient;

    const handlerA = vi.fn(async () => ({ content: [{ type: "text" as const, text: "a" }] }));
    const handlerB = vi.fn(async () => ({ content: [{ type: "text" as const, text: "b" }] }));
    const toolA = makeTool("tool_a", { handler: handlerA });
    const toolB = makeTool("tool_b", { handler: handlerB });

    registerFilteredTools(fakeServer, fakeClient, [toolA, toolB], new Set(["tool_a"]));

    expect(registerTool).toHaveBeenCalledTimes(1);
    expect(registerTool).toHaveBeenCalledWith(
      "tool_a",
      expect.objectContaining({ title: "tool_a", description: "Description for tool_a" }),
      expect.any(Function)
    );

    const registeredHandler = registerTool.mock.calls[0][2] as (args: unknown) => Promise<unknown>;
    await registeredHandler({ foo: "bar" });
    expect(handlerA).toHaveBeenCalledWith(fakeClient, { foo: "bar" });
    expect(handlerB).not.toHaveBeenCalled();
  });

  it("registers nothing when the enabled set is empty", () => {
    const registerTool = vi.fn();
    const fakeServer = { registerTool } as unknown as Parameters<typeof registerFilteredTools>[0];

    registerFilteredTools(fakeServer, {} as ListmonkClient, [makeTool("only_tool")], new Set());

    expect(registerTool).not.toHaveBeenCalled();
  });
});
