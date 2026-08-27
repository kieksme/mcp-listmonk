import { z } from "zod";
import { DEFAULT_PAGE_SIZE } from "../constants.js";

export const responseFormatField = z
  .enum(["markdown", "json"])
  .default("markdown")
  .describe("Output format: 'markdown' for human-readable text (default) or 'json' for machine-readable data.");

export const pageField = z
  .number()
  .int()
  .min(1)
  .default(1)
  .describe("Page number for paginated results (1-indexed).");

export const perPageField = z
  .number()
  .int()
  .min(1)
  .max(200)
  .default(DEFAULT_PAGE_SIZE)
  .describe(`Number of items per page (1-200, default ${DEFAULT_PAGE_SIZE}).`);

export const idField = z.number().int().positive().describe("Numeric id.");
