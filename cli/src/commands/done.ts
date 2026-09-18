import chalk from "chalk";
import ora from "ora";
import { checkbox } from "@inquirer/prompts";
import { isConfigured } from "../config.js";
import { AazDohApiClient, CommitmentDto } from "../client.js";

export async function promptAndCompleteCommitments(commitments: CommitmentDto[]): Promise<void> {
  const pending = commitments.filter((c) => c.status === "PENDING" || c.status === "ACTIVE");

  if (pending.length === 0) {
    console.log(chalk.green("   ✨ All commitments for this date are already completed or resolved!\n"));
    return;
  }

  try {
    const selectedIds = await checkbox({
      message: "Select commitments to mark as " + chalk.green.bold("KEPT / COMPLETED") + " (Space to select, Enter to confirm):",
      choices: pending.map((c) => {
        const phasePrefix =
          c.dayPhase === "MORNING"
            ? "🌅 "
            : c.dayPhase === "DAY"
            ? "☀️ "
            : c.dayPhase === "EVENING"
            ? "🌙 "
            : "";
        const duration = c.estimatedMinutes ? `${c.estimatedMinutes}m` : "30m";
        return {
          name: `${phasePrefix}${c.title} ${chalk.hex("#8C827A")(`(${duration} • ${c.priority})`)}`,
          value: c.id,
          description: c.expectedOutcome ? `Expected: ${c.expectedOutcome}` : undefined,
        };
      }),
    });

    if (selectedIds.length === 0) {
      console.log(chalk.hex("#8C827A")("   No commitments selected. No changes made.\n"));
      return;
    }

    const client = new AazDohApiClient();
    const spinner = ora(chalk.hex("#E2953B")(`Marking ${selectedIds.length} commitment(s) as completed...`)).start();

    const completedTitles: string[] = [];
    for (const id of selectedIds) {
      const match = pending.find((c) => c.id === id);
      try {
        await client.completeCommitment(id);
        completedTitles.push(match ? match.title : id);
      } catch (err: any) {
        spinner.warn(chalk.red(`Failed to complete "${match?.title || id}": ${err.message}`));
      }
    }

    spinner.succeed(chalk.green.bold(`Successfully completed ${completedTitles.length} commitment(s) via direct API!`));
    console.log("");
    for (const title of completedTitles) {
      console.log(`   ${chalk.green("✔")} ${chalk.hex("#FDFBF7").bold(title)} ${chalk.hex("#8C827A")("— Kept!")}`);
    }
    console.log("");
  } catch (err: any) {
    // If user cancelled prompt with Ctrl+C
    if (err.name === "ExitPromptError") {
      console.log(chalk.hex("#8C827A")("\n   Operation cancelled.\n"));
      return;
    }
    console.log(chalk.red(`\n   Error: ${err.message}\n`));
  }
}

export async function handleDoneCommand(queryWords?: string[], options?: { date?: string }): Promise<void> {
  if (!isConfigured()) {
    console.log(chalk.red("❌ AazDoh CLI is not configured."));
    console.log(chalk.yellow("Run 'aazdoh login' to authenticate with your API key."));
    process.exit(1);
  }

  const query = (queryWords || []).join(" ").trim();
  const client = new AazDohApiClient();
  const spinner = ora(chalk.hex("#E2953B")("Fetching commitments...")).start();

  try {
    const commitments = await client.getTodayCommitments(options?.date);
    spinner.stop();

    const pending = commitments.filter((c) => c.status === "PENDING" || c.status === "ACTIVE");

    if (pending.length === 0) {
      console.log(chalk.green("✨ No pending commitments found! All tasks are clear.\n"));
      return;
    }

    // Fast one-liner mode: match query against title or id
    if (query) {
      const queryLower = query.toLowerCase();
      const match = pending.find(
        (c) => c.id === query || c.title.toLowerCase().includes(queryLower)
      );

      if (!match) {
        console.log(chalk.yellow(`❌ No active commitment matching "${query}".`));
        console.log(chalk.hex("#8C827A")("Available active commitments:"));
        for (const p of pending) {
          console.log(`   • ${p.title} ${chalk.gray(`(${p.id})`)}`);
        }
        console.log("");
        return;
      }

      const completeSpinner = ora(chalk.hex("#E2953B")(`Marking "${match.title}" as done...`)).start();
      await client.completeCommitment(match.id);
      completeSpinner.succeed(chalk.green.bold(`Kept commitment: "${match.title}"!`));
      console.log("");
      return;
    }

    // Interactive Checkbox Prompt Mode
    await promptAndCompleteCommitments(commitments);
  } catch (err: any) {
    spinner.fail(chalk.red(`Failed to process command: ${err.message}`));
  }
}
