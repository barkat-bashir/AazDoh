import chalk from "chalk";
import ora from "ora";
import { isConfigured } from "../config.js";
import { AazDohApiClient } from "../client.js";

export async function handleUndoCommand(): Promise<void> {
  if (!isConfigured()) {
    console.log(chalk.red("❌ AazDoh CLI is not configured."));
    console.log(chalk.yellow("Run 'aazdoh login' to authenticate."));
    process.exit(1);
  }

  const spinner = ora(chalk.hex("#E2953B")("Reverting last agent action...")).start();

  try {
    const client = new AazDohApiClient();
    const receipt = await client.undoLastAction();
    spinner.succeed(chalk.green.bold("Action reverted successfully!"));

    console.log("");
    console.log(`   ${chalk.hex("#E2953B").bold("Reverted:")} ${chalk.hex("#FDFBF7")(receipt.description)}`);
    console.log(`   ${chalk.hex("#8C827A")("Action Type:")} ${chalk.gray(receipt.actionType)}`);
    console.log(`   ${chalk.hex("#8C827A")("Timestamp:")}   ${chalk.gray(new Date(receipt.createdAt).toLocaleString())}`);
    console.log("");
  } catch (err: any) {
    spinner.fail(chalk.red(`Undo failed: ${err.message}`));
    process.exit(1);
  }
}
