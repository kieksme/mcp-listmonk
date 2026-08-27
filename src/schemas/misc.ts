import { z } from "zod";
import { responseFormatField } from "./common.js";

export const getHealthSchema = {} satisfies z.ZodRawShape;

export const getServerConfigSchema = {
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getI18nLangSchema = {
  lang: z.string().min(2).describe("Language code, e.g. 'en' or 'de'."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getDashboardChartsSchema = {
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getDashboardCountsSchema = {
  response_format: responseFormatField,
} satisfies z.ZodRawShape;
