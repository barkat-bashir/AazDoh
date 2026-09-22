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
  return "1.0.18";
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

export function checkForCliUpdates(): void {
  try {
    const config = getConfig() as any;
    const now = Date.now();
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

    const latestVersion = config.latestKnownVersion;

    // Show cached notification instantly (0ms delay)
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

    // If cache expired, check npm registry in the background (fire-and-forget, non-blocking)
    if (!config.lastUpdateCheck || now - config.lastUpdateCheck > SIX_HOURS_MS) {
      fetch("https://registry.npmjs.org/aazdoh-cli/latest", {
        headers: { "User-Agent": `aazdoh-cli/${CURRENT_CLI_VERSION}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: any) => {
          if (data && data.version) {
            saveConfig({
              ...config,
              lastUpdateCheck: now,
              latestKnownVersion: data.version,
            } as any);
          }
        })
        .catch(() => { });
    }
  } catch {
    // Fail silently so update checks never crash the CLI
  }
}
