import chalk from "chalk";
import ora from "ora";
import { isConfigured } from "../config.js";
import { AazDohApiClient, AgentChatResponseDto } from "../client.js";

export async function handleRunPrompt(promptText: string): Promise<void> {
  const cleanPrompt = promptText.trim();
  if (!cleanPrompt) {
    console.log(chalk.red("Error: Prompt cannot be empty."));
    process.exit(1);
  }

  if (cleanPrompt.length > 500) {
    console.log(chalk.red(`Error: Prompt exceeds maximum limit of 500 characters (${cleanPrompt.length}/500).`));
    console.log(chalk.yellow("Keep your instructions crisp and focused."));
    process.exit(1);
  }

  if (!isConfigured()) {
    console.log(chalk.red("❌ AazDoh CLI is not configured."));
    console.log(chalk.yellow("Run 'aazdoh login' first to authenticate with your API key."));
    process.exit(1);
  }

  const client = new AazDohApiClient();
  const spinner = ora({
    text: chalk.hex("#E2953B")("🤖 Reasoning over execution options..."),
    color: "yellow",
  }).start();

  let accumulatedDelta = "";
  let finalResult: AgentChatResponseDto | null = null;

  try {
    finalResult = await client.streamChat(cleanPrompt, [], {
      onStep: (step) => {
        spinner.text = chalk.hex("#E2953B")(step);
      },
      onDelta: (delta) => {
        accumulatedDelta += delta;
      },
      onDone: (done) => {
        finalResult = done;
      },
      onError: (err) => {
        spinner.fail(chalk.red(`Execution failed: ${err}`));
      },
    });

    spinner.stop();

    const reply = finalResult?.reply || accumulatedDelta;
    console.log("");

    if (reply) {
      // Clean display of the coach's reply
      console.log(formatCoachReply(reply));
    }

    // Display receipts
    if (finalResult?.receipts && finalResult.receipts.length > 0) {
      console.log("");
      console.log(chalk.hex("#E2953B").bold("⚡ Executed Actions:"));
      for (const r of finalResult.receipts) {
        console.log(`   ${chalk.green("✓")} ${chalk.hex("#FDFBF7")(r.description)}`);
      }
      console.log(chalk.gray("\n   (Run 'aazdoh undo' to revert)"));
    }

    if (finalResult?.cognitiveWarning) {
      console.log("");
      console.log(chalk.bgHex("#C05330").white.bold(" ⚠️ COGNITIVE LOAD WARNING "));
      console.log(chalk.hex("#E2953B")(`   ${finalResult.cognitiveWarning}`));
    }

    console.log("");
  } catch (err: any) {
    spinner.fail(chalk.red(`Agent error: ${err.message}`));
    process.exit(1);
  }
}

function formatCoachReply(text: string): string {
  // Simple markdown polish for terminal
  return text
    .split("\n")
    .map((line) => {
      if (line.startsWith("⚡")) return chalk.hex("#E2953B").bold(line);
      if (line.startsWith("*") || line.startsWith("-")) return `  ${chalk.hex("#E2953B")("•")} ${line.replace(/^[*-\s]+/, "")}`;
      if (line.startsWith("⚠️")) return chalk.yellow.bold(line);
      return `   ${line}`;
    })
    .join("\n");
}
