import { describe, expect, it, vi } from "vitest";
import { resolveEnabledToolNames } from "../../src/registry/filter.js";
import type { AnyToolDefinition } from "../../src/registry/toolRegistry.js";

function makeTool(name: string, category: AnyToolDefinition["category"]): AnyToolDefinition {
  return {
    name,
    category,
    title: name,
    description: name,
    inputSchema: {},
    annotations: {},
    handler: async () => ({ content: [] }),
  };
}

const ALL_TOOLS: AnyToolDefinition[] = [
  makeTool("listmonk_list_subscribers", "subscribers"),
  makeTool("listmonk_get_subscriber", "subscribers"),
  makeTool("listmonk_list_lists", "lists"),
  makeTool("listmonk_delete_list", "lists"),
];

describe("resolveEnabledToolNames", () => {
  it("enables every tool when the selector list is empty", () => {
    const enabled = resolveEnabledToolNames([], ALL_TOOLS);
    expect(enabled).toEqual(new Set(ALL_TOOLS.map((t) => t.name)));
  });

  it("resolves a category selector to all tools in that category", () => {
    const enabled = resolveEnabledToolNames(["subscribers"], ALL_TOOLS);
    expect(enabled).toEqual(new Set(["listmonk_list_subscribers", "listmonk_get_subscriber"]));
  });

  it("resolves an exact tool name selector", () => {
    const enabled = resolveEnabledToolNames(["listmonk_delete_list"], ALL_TOOLS);
    expect(enabled).toEqual(new Set(["listmonk_delete_list"]));
  });

  it("is case-insensitive for both categories and tool names", () => {
    const enabled = resolveEnabledToolNames(["SUBSCRIBERS", "Listmonk_Delete_List"], ALL_TOOLS);
    expect(enabled).toEqual(new Set(["listmonk_list_subscribers", "listmonk_get_subscriber", "listmonk_delete_list"]));
  });

  it("combines multiple selectors, merging categories and exact names", () => {
    const enabled = resolveEnabledToolNames(["lists", "listmonk_get_subscriber"], ALL_TOOLS);
    expect(enabled).toEqual(new Set(["listmonk_list_lists", "listmonk_delete_list", "listmonk_get_subscriber"]));
  });

  it("ignores blank selectors silently", () => {
    const enabled = resolveEnabledToolNames(["  ", "lists"], ALL_TOOLS);
    expect(enabled).toEqual(new Set(["listmonk_list_lists", "listmonk_delete_list"]));
  });

  it("warns and drops unknown selectors without throwing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const enabled = resolveEnabledToolNames(["not_a_real_tool_or_category"], ALL_TOOLS);

    expect(enabled).toEqual(new Set());
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("not_a_real_tool_or_category"));
    warnSpy.mockRestore();
  });

  it("returns an empty set when given selectors but an empty tool catalog", () => {
    const enabled = resolveEnabledToolNames(["subscribers"], []);
    expect(enabled).toEqual(new Set());
  });
});
