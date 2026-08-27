#!/usr/bin/env node
// Prints the tool catalog without any network access or Listmonk credentials.
// Used to verify tool count/uniqueness and the enable/disable filter mechanism.
import { assertUniqueToolNames } from "../src/registry/toolRegistry.js";
import { resolveEnabledToolNames } from "../src/registry/filter.js";
import { parseEnabledToolsEnv } from "../src/config.js";
import { ALL_TOOLS } from "../src/tools/index.js";
import { TOOL_CATEGORIES } from "../src/constants.js";

assertUniqueToolNames(ALL_TOOLS);

const selectors = parseEnabledToolsEnv(process.env.LISTMONK_ENABLED_TOOLS);
const enabled = resolveEnabledToolNames(selectors, ALL_TOOLS);

console.log(`Total tools: ${ALL_TOOLS.length}`);
console.log(`Categories (${TOOL_CATEGORIES.length}): ${TOOL_CATEGORIES.join(", ")}`);
console.log(`Enabled selectors: ${selectors.length ? selectors.join(", ") : "(none — all tools enabled)"}`);
console.log(`Enabled tool count: ${enabled.size}\n`);

for (const category of TOOL_CATEGORIES) {
  const inCategory = ALL_TOOLS.filter((t) => t.category === category);
  if (inCategory.length === 0) continue;
  console.log(`## ${category} (${inCategory.length})`);
  for (const tool of inCategory) {
    const mark = enabled.has(tool.name) ? "x" : " ";
    console.log(`  [${mark}] ${tool.name}`);
  }
}
