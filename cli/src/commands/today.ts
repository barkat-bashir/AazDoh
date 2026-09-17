import chalk from "chalk";
import ora from "ora";
import { isConfigured, getConfig } from "../config.js";
import { AazDohApiClient } from "../client.js";
import { renderCommitmentsTable } from "../ui/table.js";
import { printBanner, formatPersonaBadge } from "../ui/banner.js";

import { promptAndCompleteCommitments } from "./done.js";

export async function handleTodayCommand(options: { date?: string; interactive?: boolean }): Promise<void> {
  if (!isConfigured()) {
    console.log(chalk.red("❌ AazDoh CLI is not configured."));
    console.log(chalk.yellow("Run 'aazdoh login' to authenticate with your API key."));
    process.exit(1);
  }

  const config = getConfig();
  const targetDate = options.date || new Date().toISOString().split("T")[0];
  const spinner = ora(chalk.hex("#E2953B")(`Fetching commitment plan for ${targetDate}...`)).start();

  try {
    const client = new AazDohApiClient();
    const commitments = await client.getTodayCommitments(options.date);
    spinner.stop();

    printBanner();
    console.log(`   ${chalk.bold("Plan for:")} ${chalk.hex("#E2953B")(targetDate)} | ${chalk.bold("User:")} ${config.userFullName || "User"} ${formatPersonaBadge(config.aiPersona)}\n`);

    if (commitments.length === 0) {
      console.log(chalk.hex("#8C827A")("   No commitments scheduled for this date."));
      console.log(chalk.gray('   Add commitments using: aazdoh "add 45m DSA study today"\n'));
      return;
    }

    renderCommitmentsTable(commitments, targetDate);

    const pending = commitments.filter((c) => c.status === "PENDING" || c.status === "ACTIVE");

    if (options.interactive && pending.length > 0) {
      await promptAndCompleteCommitments(commitments);
    } else if (pending.length > 0) {
      console.log(`   ${chalk.hex("#E2953B")("💡 Tip:")} Run ${chalk.hex("#FDFBF7").bold("aazdoh done")} or ${chalk.hex("#FDFBF7").bold("aazdoh today -i")} to check off commitments with interactive checkboxes.\n`);
    }
  } catch (err: any) {
    spinner.fail(chalk.red(`Failed to fetch commitments: ${err.message}`));
    process.exit(1);
  }
}
