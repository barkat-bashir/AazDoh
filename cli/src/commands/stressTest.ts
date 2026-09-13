import ora from "ora";
import chalk from "chalk";
import Table from "cli-table3";
import { AazDohApiClient } from "../client.js";
import { printBanner, formatPersonaBadge } from "../ui/banner.js";

function getRiskBar(score: number): string {
  const totalBlocks = 20;
  const filledBlocks = Math.round((score / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  
  let color = chalk.green;
  if (score >= 75) color = chalk.red.bold;
  else if (score >= 50) color = chalk.hex("#F59E0B").bold;
  else if (score >= 25) color = chalk.hex("#E2953B");

  const bar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
  return color(`[${bar}] ${score}%`);
}

export async function stressTestCommand(options: { defense?: string }): Promise<void> {
  printBanner();

  const spinner = ora({
    text: chalk.gray("Chief of Staff conducting 60-second plan stress test..."),
    spinner: "dots",
  }).start();

  try {
    const client = new AazDohApiClient();
    const testResult = await client.stressTestPlan(options.defense);

    spinner.succeed(chalk.green("Stress test complete."));
    console.log("");

    // Risk Header
    let riskBadge = chalk.bgGreen.black.bold(" LOW RISK ");
    if (testResult.riskScore >= 75) {
      riskBadge = chalk.bgRed.white.bold(` CRITICAL RISK (${testResult.riskLevel}) `);
    } else if (testResult.riskScore >= 50) {
      riskBadge = chalk.bgHex("#F59E0B").black.bold(` ELEVATED RISK (${testResult.riskLevel}) `);
    } else if (testResult.riskScore >= 25) {
      riskBadge = chalk.bgHex("#E2953B").black.bold(` MODERATE RISK (${testResult.riskLevel}) `);
    }

    console.log(`   ${riskBadge}  ${getRiskBar(testResult.riskScore)}`);
    console.log("");

    // Diagnostic Summary Box
    console.log(chalk.hex("#E2953B").bold("   📋 Diagnostic Assessment:"));
    console.log(chalk.hex("#FDFBF7")(`   ${testResult.diagnosticSummary}`));
    console.log("");

    // Time Breakdown Table
    const timeTable = new Table({
      head: [
        chalk.hex("#E2953B").bold("Planned Load"),
        chalk.hex("#E2953B").bold("Historical 7-Day Capacity"),
        chalk.hex("#E2953B").bold("Optimized Workload"),
      ],
      colWidths: [22, 28, 24],
      style: { head: [], border: ["grey"] },
    });

    timeTable.push([
      chalk.bold(`${Math.round(testResult.plannedHours * 10) / 10} hours`),
      chalk.cyan(`${Math.round(testResult.historicalCapacityHours * 10) / 10} hours/day`),
      chalk.green.bold(`${Math.round(testResult.optimizedHours * 10) / 10} hours`),
    ]);

    console.log(timeTable.toString());
    console.log("");

    // Optimizations Table
    if (testResult.proposedOptimizations && testResult.proposedOptimizations.length > 0) {
      console.log(chalk.hex("#E2953B").bold("   🎯 Recommended Interventions:"));
      const optTable = new Table({
        head: [
          chalk.hex("#E2953B").bold("Action"),
          chalk.hex("#E2953B").bold("Proposed Adjustment"),
          chalk.hex("#E2953B").bold("Reasoning"),
        ],
        colWidths: [18, 30, 36],
        wordWrap: true,
        style: { head: [], border: ["grey"] },
      });

      for (const opt of testResult.proposedOptimizations) {
        let actionColor = chalk.cyan;
        if (opt.suggestedAction === "DROP" || opt.suggestedAction === "POSTPONE") {
          actionColor = chalk.red.bold;
        } else if (opt.suggestedAction === "SPLIT" || opt.suggestedAction === "TRIM_DURATION") {
          actionColor = chalk.hex("#F59E0B");
        }

        const adjustment = opt.proposedTitle 
          ? `${opt.proposedTitle} (${opt.proposedMinutes || 0}m)`
          : opt.proposedMinutes ? `${opt.proposedMinutes}m` : "—";

        optTable.push([
          actionColor(opt.suggestedAction),
          chalk.hex("#FDFBF7")(adjustment),
          chalk.gray(opt.reasoning),
        ]);
      }

      console.log(optTable.toString());
      console.log("");
    }

    if (testResult.defenseFeedback) {
      console.log(chalk.hex("#E2953B").bold("   🛡️ Defense Evaluation:"));
      console.log(chalk.gray(`   "${testResult.defenseFeedback}"`));
      console.log("");
    }

  } catch (err: any) {
    spinner.fail(chalk.red(`Stress test failed: ${err.message}`));
    console.log("");
  }
}
