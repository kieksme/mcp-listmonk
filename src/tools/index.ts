import type { AnyToolDefinition } from "../registry/toolRegistry.js";
import { adminTools } from "./admin.js";
import { bounceTools } from "./bounces.js";
import { campaignTools } from "./campaigns.js";
import { importTools } from "./import.js";
import { listTools } from "./lists.js";
import { logsTools } from "./logs.js";
import { maintenanceTools } from "./maintenance.js";
import { mediaTools } from "./media.js";
import { miscTools } from "./misc.js";
import { publicTools } from "./public.js";
import { settingsTools } from "./settings.js";
import { subscriberTools } from "./subscribers.js";
import { templateTools } from "./templates.js";
import { transactionalTools } from "./transactional.js";

export const ALL_TOOLS: AnyToolDefinition[] = [
  ...subscriberTools,
  ...campaignTools,
  ...templateTools,
  ...listTools,
  ...mediaTools,
  ...importTools,
  ...bounceTools,
  ...settingsTools,
  ...maintenanceTools,
  ...publicTools,
  ...transactionalTools,
  ...logsTools,
  ...adminTools,
  ...miscTools,
];
