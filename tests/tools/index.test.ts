import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TOOL_CATEGORIES } from "../../src/constants.js";
import { assertUniqueToolNames } from "../../src/registry/toolRegistry.js";
import { ALL_TOOLS } from "../../src/tools/index.js";

describe("ALL_TOOLS catalog", () => {
  it("is not empty", () => {
    expect(ALL_TOOLS.length).toBeGreaterThan(0);
  });

  it("has no duplicate tool names", () => {
    expect(() => assertUniqueToolNames(ALL_TOOLS)).not.toThrow();
  });

  it("gives every tool a name prefixed with listmonk_", () => {
    for (const tool of ALL_TOOLS) {
      expect(tool.name).toMatch(/^listmonk_/);
    }
  });

  it("assigns every tool a known category", () => {
    for (const tool of ALL_TOOLS) {
      expect(TOOL_CATEGORIES).toContain(tool.category);
    }
  });

  it("gives every tool a non-empty title, description, and a callable handler", () => {
    for (const tool of ALL_TOOLS) {
      expect(tool.title.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(0);
      expect(typeof tool.handler).toBe("function");
    }
  });

  it("gives every tool a Zod-based input schema", () => {
    for (const tool of ALL_TOOLS) {
      for (const field of Object.values(tool.inputSchema)) {
        expect(field).toBeInstanceOf(z.ZodType);
      }
    }
  });
});
