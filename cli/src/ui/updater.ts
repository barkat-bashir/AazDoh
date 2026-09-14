import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import Table from "cli-table3";
import { getConfig, saveConfig } from "../config.js";

export function getCliVersion(): string {
  try {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(currentDir, "../../package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.version) return pkg.version;
    }
  } catch {
    // fallback
  }
  return "1.0.11";
}

export const CURRENT_CLI_VERSION = getCliVersion();

function compareSemver(current: string, latest: string): boolean {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
  const c = parse(current);
  const l = parse(latest);

  for (let i = 0; i < 3; i++) {
    const cv = c[i] || 0;
    const lv = l[i] || 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

export async function checkForCliUpdates(): Promise<void> {
  try {
    const config = getConfig() as any;
    const now = Date.now();
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

    let latestVersion = config.latestKnownVersion;

    if (!config.lastUpdateCheck || now - config.lastUpdateCheck > SIX_HOURS_MS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);

        const response = await fetch("https://registry.npmjs.org/aazdoh-cli/latest", {
          signal: controller.signal,
          headers: { "User-Agent": `aazdoh-cli/${CURRENT_CLI_VERSION}` },
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = (await response.json()) as { version?: string };
          if (data.version) {
            latestVersion = data.version;
            saveConfig({
              ...config,
              lastUpdateCheck: now,
              latestKnownVersion: data.version,
            } as any);
          }
        }
      } catch {
        // Non-blocking timeout or network error
      }
    }

    if (latestVersion && compareSemver(CURRENT_CLI_VERSION, latestVersion)) {
      const table = new Table({
        colWidths: [68],
        style: { head: [], border: ["yellow"] },
      });

      table.push([
        chalk.hex("#E2953B").bold(`⚡ Update available: `) +
        chalk.gray(`${CURRENT_CLI_VERSION}`) +
        chalk.hex("#E2953B")(" → ") +
        chalk.green.bold(`${latestVersion}\n`) +
        chalk.hex("#FDFBF7")(`Run `) +
        chalk.cyan.bold(`npm install -g aazdoh-cli`) +
        chalk.hex("#FDFBF7")(` to update to the latest version.`),
      ]);

      console.log(table.toString());
      console.log("");
    }
  } catch {
    // Fail silently so update checks never crash the CLI
  }
}
