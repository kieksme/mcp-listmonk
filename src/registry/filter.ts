import { TOOL_CATEGORIES } from "../constants.js";
import type { AnyToolDefinition } from "./toolRegistry.js";

export { parseEnabledToolsEnv } from "../config.js";

const CATEGORY_SET = new Set<string>(TOOL_CATEGORIES);

/**
 * Resolves an array of selectors (exact tool names and/or category names,
 * case-insensitive) against the full tool catalog. An empty selector list
 * means "enable everything". Unknown selectors are dropped with a warning
 * rather than failing the whole server.
 */
export function resolveEnabledToolNames(selectors: string[], allTools: AnyToolDefinition[]): Set<string> {
  if (selectors.length === 0) {
    return new Set(allTools.map((t) => t.name));
  }

  const toolNamesByLower = new Map(allTools.map((t) => [t.name.toLowerCase(), t.name]));
  const enabled = new Set<string>();

  for (const raw of selectors) {
    const selector = raw.trim().toLowerCase();
    if (!selector) continue;

    if (CATEGORY_SET.has(selector)) {
      for (const tool of allTools) {
        if (tool.category === selector) enabled.add(tool.name);
      }
      continue;
    }

    const exactName = toolNamesByLower.get(selector);
    if (exactName) {
      enabled.add(exactName);
      continue;
    }

    console.warn(
      `WARNING: LISTMONK_ENABLED_TOOLS selector "${raw}" matches neither a tool name nor a category ` +
        `(${TOOL_CATEGORIES.join(", ")}). Ignoring it.`
    );
  }

  return enabled;
}
