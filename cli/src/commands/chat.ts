import { input } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";
import Table from "cli-table3";
import { AazDohApiClient, AgentChatResponseDto } from "../client.js";
import { printBanner, formatPersonaBadge } from "../ui/banner.js";
import { renderCommitmentsTable, renderTelemetryTable } from "../ui/table.js";

export async function chatCommand(): Promise<void> {
  printBanner();

  const client = new AazDohApiClient();
  let user;
  try {
    user = await client.getCurrentUser();
    console.log(
      `   Logged in as: ${chalk.hex("#FDFBF7").bold(user.fullName || user.email)} ` +
      `[Persona: ${formatPersonaBadge(user.aiPersona)}]`
    );
  } catch (err: any) {
    console.log(chalk.red(`   ⚠️  Authentication error: ${err.message}`));
    console.log(chalk.gray(`   Run ${chalk.cyan("aazdoh login")} to configure your credentials.`));
    return;
  }

  console.log(chalk.gray("   Type your natural language instruction or a slash command:"));
  console.log(chalk.gray("   Commands: /today  /undo  /stats  /clear  /exit\n"));

  const history: Array<{ role: string; content: string }> = [];

  while (true) {
    let query = "";
    try {
      query = await input({
        message: chalk.hex("#E2953B").bold("az>"),
      });
    } catch {
      // User pressed Ctrl+C or terminal closed
      console.log(chalk.gray("\nExiting AazDoh session. Stay accountable!"));
      break;
    }

    const trimmed = query.trim();
    if (!trimmed) continue;

    if (trimmed === "/exit" || trimmed === "/quit" || trimmed === ":q") {
      console.log(chalk.gray("Exiting AazDoh session. Stay accountable!"));
      break;
    }

    if (trimmed === "/clear") {
      console.clear();
      printBanner();
      continue;
    }

    if (trimmed === "/today" || trimmed === "/list") {
      const spinner = ora(chalk.gray("Fetching today's commitments...")).start();
      try {
        const list = await client.getTodayCommitments();
        spinner.stop();
        renderCommitmentsTable(list);
      } catch (e: any) {
        spinner.fail(chalk.red(`Failed to fetch today's plan: ${e.message}`));
      }
      continue;
    }

    if (trimmed === "/undo") {
      const spinner = ora(chalk.gray("Undoing last AI action...")).start();
      try {
        const receipt = await client.undoLastAction();
        spinner.succeed(chalk.green(`Successfully undid: ${receipt.description || receipt.actionType}`));
      } catch (e: any) {
        spinner.fail(chalk.red(`Undo failed: ${e.message}`));
      }
      continue;
    }

    if (trimmed === "/stats") {
      const spinner = ora(chalk.gray("Fetching 7-day velocity...")).start();
      try {
        const stats = await client.getAnalyticsSummary(7);
        spinner.stop();
        renderTelemetryTable(stats);
      } catch (e: any) {
        spinner.fail(chalk.red(`Failed to fetch stats: ${e.message}`));
      }
      continue;
    }

    // Natural language agent execution with streaming
    const spinner = ora({
      text: chalk.gray("Chief of Staff analyzing request..."),
      spinner: "dots",
    }).start();

    let streamOutput = "";
    let hasStartedDelta = false;

    try {
      const result = await client.streamChat(trimmed, history, {
        onStep: (step) => {
          spinner.text = chalk.hex("#E2953B")(`⚡ ${step}`);
        },
        onDelta: (delta) => {
          if (!hasStartedDelta) {
            spinner.stop();
            hasStartedDelta = true;
            process.stdout.write(chalk.hex("#FDFBF7")(""));
          }
          process.stdout.write(delta);
          streamOutput += delta;
        },
      });

      if (!hasStartedDelta) {
        spinner.stop();
        if (result.reply) {
          console.log(chalk.hex("#FDFBF7")(result.reply));
        }
      } else {
        console.log(""); // newline after stream
      }

      // Render Receipts if mutations occurred
      if (result.receipts && result.receipts.length > 0) {
        const receiptTable = new Table({
          head: [chalk.hex("#E2953B").bold("Action Executed"), chalk.hex("#E2953B").bold("Details")],
          colWidths: [22, 58],
          wordWrap: true,
          style: { head: [], border: ["grey"] },
        });

        for (const r of result.receipts) {
          receiptTable.push([chalk.green.bold(`✓ ${r.actionType}`), chalk.hex("#FDFBF7")(r.description)]);
        }

        console.log("");
        console.log(receiptTable.toString());

        if (result.undoAvailable) {
          console.log(chalk.gray(`   💡 Type ${chalk.cyan("/undo")} or run ${chalk.cyan("aazdoh undo")} to revert this change.`));
        }
      }

      if (result.cognitiveWarning) {
        console.log(chalk.bgHex("#C05330").white.bold("\n ⚠️  COGNITIVE OVERLOAD DETECTED: ") + " " + chalk.hex("#F59E0B")(result.cognitiveWarning));
      }

      console.log("");

      // Maintain session history
      history.push({ role: "user", content: trimmed });
      history.push({ role: "assistant", content: result.reply || streamOutput });
      if (history.length > 6) {
        history.splice(0, history.length - 6);
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Execution failed: ${err.message}`));
      console.log("");
    }
  }
}
