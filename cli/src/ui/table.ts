import Table from "cli-table3";
import chalk from "chalk";
import { CommitmentDto, AnalyticsSummaryDto } from "../client.js";
import { formatPriorityBadge, formatCategoryBadge } from "./banner.js";

export function renderCommitmentsTable(commitments: CommitmentDto[], dateStr?: string): void {
  const table = new Table({
    head: [
      chalk.hex("#E2953B").bold("Status"),
      chalk.hex("#E2953B").bold("Commitment Title"),
      chalk.hex("#E2953B").bold("Duration"),
      chalk.hex("#E2953B").bold("Priority"),
      chalk.hex("#E2953B").bold("Category"),
      chalk.hex("#E2953B").bold("Expected Outcome"),
    ],
    colWidths: [10, 32, 12, 10, 16, 28],
    wordWrap: true,
    style: {
      head: [],
      border: ["grey"],
    },
  });

  let totalMinutes = 0;
  let completedCount = 0;
  let pendingCount = 0;

  for (const c of commitments) {
    const isDone = c.status === "COMPLETED";
    const isMissed = c.status === "MISSED";
    const isPostponed = c.status === "POSTPONED";

    if (isDone) completedCount++;
    if (c.status === "PENDING" || c.status === "ACTIVE") pendingCount++;
    totalMinutes += c.estimatedMinutes || 0;

    let statusText = chalk.hex("#F59E0B")("⭕ PENDING");
    if (isDone) statusText = chalk.green.bold("✅ DONE");
    else if (isMissed) statusText = chalk.red.bold("❌ MISSED");
    else if (isPostponed) statusText = chalk.cyan("⏩ MOVED");

    const titleText = isDone
      ? chalk.gray(c.title)
      : chalk.hex("#FDFBF7").bold(c.title);

    const durationText = chalk.hex("#8C827A")(`${c.estimatedMinutes || 30}m`);
    const priorityBadge = formatPriorityBadge(c.priority);
    const categoryBadge = formatCategoryBadge(c.category);
    const outcomeText = c.expectedOutcome
      ? chalk.hex("#8C827A")(c.expectedOutcome)
      : chalk.gray("—");

    table.push([
      statusText,
      titleText,
      durationText,
      priorityBadge,
      categoryBadge,
      outcomeText,
    ]);
  }

  console.log(table.toString());

  const hours = Math.round((totalMinutes / 60.0) * 10) / 10;
  const loadBadge = totalMinutes > 360
    ? chalk.bgRed.white.bold(" OVERLOADED (>6h) ")
    : totalMinutes > 240
      ? chalk.bgHex("#E2953B").black.bold(" OPTIMAL ")
      : chalk.bgGreen.black.bold(" LIGHT ");

  console.log("");
  console.log(
    `   ${chalk.hex("#E2953B").bold("Summary:")} ` +
    `${chalk.green.bold(String(completedCount))} Done | ` +
    `${chalk.hex("#F59E0B").bold(String(pendingCount))} Pending | ` +
    `${chalk.bold(String(hours) + "h")} total scheduled (${totalMinutes}m) • ` +
    loadBadge
  );
  console.log("");
}

export function renderTelemetryTable(stats: AnalyticsSummaryDto): void {
  const table = new Table({
    head: [
      chalk.hex("#E2953B").bold("Metric"),
      chalk.hex("#E2953B").bold("7-Day Velocity Value"),
    ],
    colWidths: [30, 40],
    style: { head: [], border: ["grey"] },
  });

  const completionPct = Math.round(stats.completionRate || 0);
  const rateColor = completionPct >= 80 ? chalk.green.bold : completionPct >= 60 ? chalk.hex("#E2953B").bold : chalk.red.bold;

  table.push(
    ["Completion Rate", rateColor(`${completionPct}% (${stats.completedCommitments}/${stats.totalCommitments} kept)`)],
    ["Total Deep Focus Time", chalk.hex("#FDFBF7").bold(`${Math.round(stats.totalFocusHours * 10) / 10} hours`)],
    ["Daily Average Focus", chalk.hex("#FDFBF7").bold(`${Math.round(stats.avgDailyFocusHours * 10) / 10} hours/day`)],
    ["Rescheduled / Postponed", chalk.hex("#F59E0B")(`${stats.postponedCommitments} tasks`)],
    ["Missed / Dropped", chalk.red(`${stats.missedCommitments || 0} tasks`)]
  );

  console.log(table.toString());
  console.log("");
}
