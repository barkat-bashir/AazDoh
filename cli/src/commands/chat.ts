import { input } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";
import Table from "cli-table3";
import { AazDohApiClient } from "../client.js";
import { printBanner, formatPersonaBadge } from "../ui/banner.js";
import { renderCommitmentsTable, renderTelemetryTable } from "../ui/table.js";
import { stressTestCommand } from "./stressTest.js";
import { handleFocusCommand } from "./focus.js";

function printHelpMenu(): void {
  console.log(chalk.hex("#E2953B").bold("\n   ⚡ AAZDOH INTERACTIVE COCKPIT COMMANDS:"));
  const table = new Table({
    head: [chalk.hex("#E2953B").bold("Command"), chalk.hex("#E2953B").bold("Description")],
    colWidths: [22, 58],
    wordWrap: true,
    style: { head: [], border: ["grey"] },
  });

  table.push(
    [chalk.cyan("/today") + chalk.gray(" (or /list)"), chalk.hex("#FDFBF7")("Display today's commitments, progress, and scheduled load")],
    [chalk.cyan("/stress-test"), chalk.hex("#FDFBF7")("Run 60-second plan feasibility check against 7-day velocity baseline")],
    [chalk.cyan("/stats") + chalk.gray(" (or /velocity)"), chalk.hex("#FDFBF7")("View 7-day velocity, consistency score, and focus hour metrics")],
    [chalk.cyan("/focus") + chalk.gray(" [duration] [task]"), chalk.hex("#FDFBF7")("Start a local offline deep focus / Pomodoro timer (e.g. /focus 25m)")],
    [chalk.cyan("/undo"), chalk.hex("#FDFBF7")("Instantly revert the last AI agent mutation or state change")],
    [chalk.cyan("/clear"), chalk.hex("#FDFBF7")("Clear terminal screen and refresh daily cockpit")],
    [chalk.cyan("/help") + chalk.gray(" (or /?)"), chalk.hex("#FDFBF7")("Show this quick-reference help menu")],
    [chalk.cyan("/exit") + chalk.gray(" (or /quit, :q)"), chalk.hex("#FDFBF7")("Exit the interactive session")]
  );

  console.log(table.toString());
  console.log(chalk.gray("\n   💡 Or simply type any natural language instruction:"));
  console.log(chalk.hex("#FDFBF7")('      • "finished DSA trees with 4 problems solved"'));
  console.log(chalk.hex("#FDFBF7")('      • "add 45m deep focus on PostgreSQL connection pool tuning"'));
  console.log(chalk.hex("#FDFBF7")('      • "postpone team sync prep to tomorrow morning"\n'));
}

export async function chatCommand(): Promise<void> {
  printBanner();

  const client = new AazDohApiClient();
  let user;
  try {
    user = await client.getCurrentUser();
    console.log(
      `   Logged in as: ${chalk.hex("#FDFBF7").bold(user.fullName || user.email)} ` +
      `[Persona: ${formatPersonaBadge(user.aiPersona)}]\n`
    );
  } catch (err: any) {
    console.log(chalk.red(`   ⚠️  Authentication error: ${err.message}`));
    console.log(chalk.gray(`   Run ${chalk.cyan("aazdoh login")} to configure your credentials.`));
    return;
  }

  // Pre-fetch and render today's commitments upon entering cockpit
  try {
    const todayList = await client.getTodayCommitments();
    if (todayList && todayList.length > 0) {
      renderCommitmentsTable(todayList);
    } else {
      console.log(chalk.hex("#8C827A")("   No commitments scheduled for today."));
      console.log(chalk.gray('   Lock in your focus: type "add 45m deep work on <task>"\n'));
    }
  } catch {
    // Non-blocking if offline or failed initial fetch
  }

  console.log(chalk.gray("   Type instructions or commands (/today, /stress-test, /stats, /undo, /help, /exit):\n"));

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

    let trimmed = query.trim();
    if (!trimmed) continue;

    // Strip redundant leading "az " or "aazdoh " if typed inside the cockpit
    trimmed = trimmed.replace(/^(az|aazdoh)\s+/i, "").trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();

    if (
      trimmed === "/exit" ||
      trimmed === "/quit" ||
      trimmed === ":q" ||
      lower === "exit" ||
      lower === "quit" ||
      lower === "q"
    ) {
      console.log(chalk.gray("Exiting AazDoh session. Stay accountable!"));
      break;
    }

    if (trimmed === "/clear" || lower === "clear" || lower === "cls") {
      console.clear();
      printBanner();
      try {
        const todayList = await client.getTodayCommitments();
        if (todayList && todayList.length > 0) {
          renderCommitmentsTable(todayList);
        }
      } catch {}
      continue;
    }

    if (trimmed === "/help" || trimmed === "/?" || lower === "help" || lower === "?") {
      printHelpMenu();
      continue;
    }

    if (trimmed === "/today" || trimmed === "/list" || lower === "today" || lower === "list") {
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

    if (
      trimmed === "/stress-test" ||
      trimmed === "/stresstest" ||
      lower === "stress-test" ||
      lower === "stresstest" ||
      lower === "stress test"
    ) {
      await stressTestCommand({ skipBanner: true });
      continue;
    }

    if (trimmed === "/undo" || lower === "undo") {
      const spinner = ora(chalk.gray("Undoing last AI action...")).start();
      try {
        const receipt = await client.undoLastAction();
        spinner.succeed(chalk.green(`Successfully undid: ${receipt.description || receipt.actionType}`));
      } catch (e: any) {
        spinner.fail(chalk.red(`Undo failed: ${e.message}`));
      }
      continue;
    }

    if (trimmed === "/stats" || trimmed === "/velocity" || lower === "stats" || lower === "velocity") {
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

    if (
      lower.startsWith("/focus") ||
      lower.startsWith("/timer") ||
      lower.startsWith("focus ") ||
      lower.startsWith("timer ") ||
      lower === "focus" ||
      lower === "timer"
    ) {
      const parts = trimmed.split(/\s+/).slice(1);
      await handleFocusCommand(parts, {});
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
          console.log(chalk.gray(`   💡 Type ${chalk.cyan("/undo")} to revert this change.`));
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
