import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Read the published package version from package.json (next to dist/ at runtime). */
export function loadPackageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = join(here, "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
  if (!pkg.version || typeof pkg.version !== "string") {
    throw new Error(`package.json at ${pkgPath} is missing a version field`);
  }
  return pkg.version;
}
