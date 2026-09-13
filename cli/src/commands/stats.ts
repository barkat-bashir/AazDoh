import chalk from "chalk";
import ora from "ora";
import { isConfigured, getConfig } from "../config.js";
import { AazDohApiClient } from "../client.js";
import { renderTelemetryTable } from "../ui/table.js";
import { printBanner, formatPersonaBadge } from "../ui/banner.js";

export async function handleStatsCommand(options: { days?: string }): Promise<void> {
  if (!isConfigured()) {
    console.log(chalk.red("❌ AazDoh CLI is not configured."));
    console.log(chalk.yellow("Run 'aazdoh login' to authenticate."));
    process.exit(1);
  }

  const days = options.days ? parseInt(options.days, 10) : 7;
  const config = getConfig();
  const spinner = ora(chalk.hex("#E2953B")(`Fetching ${days}-day execution telemetry...`)).start();

  try {
    const client = new AazDohApiClient();
    const stats = await client.getAnalyticsSummary(days);
    spinner.stop();

    printBanner();
    console.log(`   ${chalk.bold("Telemetry Window:")} ${chalk.hex("#E2953B")(`${days} Days`)} | ${chalk.bold("User:")} ${config.userFullName || "User"} ${formatPersonaBadge(config.aiPersona)}\n`);

    renderTelemetryTable(stats);
  } catch (err: any) {
    spinner.fail(chalk.red(`Failed to fetch stats: ${err.message}`));
    process.exit(1);
  }
}
