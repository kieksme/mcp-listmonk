export const CHARACTER_LIMIT = 25_000;
export const DEFAULT_PAGE_SIZE = 20;

export const TOOL_CATEGORIES = [
  "subscribers",
  "campaigns",
  "templates",
  "lists",
  "media",
  "import",
  "bounces",
  "settings",
  "maintenance",
  "public",
  "transactional",
  "logs",
  "admin",
  "miscellaneous",
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
