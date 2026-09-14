import readline from "readline";
import chalk from "chalk";
import notifier from "node-notifier";
import { confirm, select } from "@inquirer/prompts";
import { isConfigured } from "../config.js";
import { AazDohApiClient } from "../client.js";
import { printBanner } from "../ui/banner.js";

/**
 * Parses user input for duration string into seconds.
 * Supports: '25m', '45min', '1h', '1.5h', '90s', '30' (defaults to minutes)
 */
export function parseDurationToSeconds(input?: string): number {
  if (!input || !input.trim()) {
    return 25 * 60; // Default 25 minutes
  }

  const clean = input.trim().toLowerCase();
  
  // Pure number check: e.g. "25" -> 25 minutes
  if (/^\d+(\.\d+)?$/.test(clean)) {
    return Math.max(1, Math.round(parseFloat(clean) * 60));
  }

  // Hours: e.g. "1.5h", "2hours", "1hr"
  const hourMatch = clean.match(/^(\d+(\.\d+)?)\s*(h|hr|hours?)$/);
  if (hourMatch) {
    return Math.max(1, Math.round(parseFloat(hourMatch[1]) * 3600));
  }

  // Minutes: e.g. "25m", "45min", "30mins"
  const minMatch = clean.match(/^(\d+(\.\d+)?)\s*(m|min|mins|minutes?)$/);
  if (minMatch) {
    return Math.max(1, Math.round(parseFloat(minMatch[1]) * 60));
  }

  // Seconds: e.g. "90s", "30sec"
  const secMatch = clean.match(/^(\d+(\.\d+)?)\s*(s|sec|secs|seconds?)$/);
  if (secMatch) {
    return Math.max(1, Math.round(parseFloat(secMatch[1])));
  }

  return 25 * 60;
}

function isDurationToken(token: string): boolean {
  return /^\d+(\.\d+)?(h|hr|hours?|m|min|mins|minutes?|s|sec|secs|seconds?)?$/i.test(token.trim());
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function renderProgressBar(percentage: number, width: number = 24): string {
  const clamped = Math.min(100, Math.max(0, percentage));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;

  let barColor = chalk.hex("#E2953B");
  if (clamped >= 90) barColor = chalk.green.bold;
  else if (clamped >= 50) barColor = chalk.hex("#F59E0B");

  return barColor("█".repeat(filled)) + chalk.gray("░".repeat(empty));
}

interface FocusOptions {
  notify?: boolean;
  sound?: boolean;
}

export async function handleFocusCommand(args: string[], options: FocusOptions): Promise<void> {
  let durationSeconds = 25 * 60;
  let taskName = "Deep Focus Session";

  if (args.length > 0) {
    if (isDurationToken(args[0])) {
      durationSeconds = parseDurationToSeconds(args[0]);
      if (args.length > 1) {
        taskName = args.slice(1).join(" ").trim() || taskName;
      }
    } else {
      // First argument is not a duration, treat entire input as task name with default 25m
      taskName = args.join(" ").trim() || taskName;
    }
  }

  let totalDuration = durationSeconds;
  let remainingSeconds = durationSeconds;
  let isPaused = false;
  let timerInterval: NodeJS.Timeout | null = null;

  const targetEndTime = new Date(Date.now() + remainingSeconds * 1000);
  const formattedEndTime = targetEndTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  printBanner();
  console.log(`   ${chalk.bgHex("#C05330").hex("#FFFFFF").bold(" 🎯 FOCUS MODE ")} ${chalk.hex("#E2953B").bold(taskName)}`);
  console.log(`   ${chalk.gray("Target finish:")} ${chalk.hex("#FDFBF7")(formattedEndTime)}  |  ${chalk.gray("Duration:")} ${chalk.cyan(formatTime(totalDuration))}`);
  console.log("");
  console.log(chalk.gray("   Controls: [Space] Pause/Resume  [+] +5m  [-] -5m  [q] Cancel & Exit\n"));

  // Hide cursor during timer
  process.stdout.write("\u001B[?25l");

  const cleanup = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    // Restore cursor
    process.stdout.write("\u001B[?25h");
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }
  };

  const renderTimerFrame = () => {
    const elapsed = totalDuration - remainingSeconds;
    const percent = Math.min(100, Math.round((elapsed / totalDuration) * 100));
    const progressBar = renderProgressBar(percent, 25);
    const timeFormatted = formatTime(remainingSeconds);

    const statusBadge = isPaused
      ? chalk.bgHex("#F59E0B").hex("#1A0E08").bold(" ⏸ PAUSED ")
      : chalk.bgHex("#10B981").hex("#FFFFFF").bold(" ▶ FOCUS ");

    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);

    const output = `   ${statusBadge} [${progressBar}] ${chalk.bold(timeFormatted)} (${percent}%)`;
    process.stdout.write(output);
  };

  return new Promise<void>((resolve) => {
    // Setup Raw Mode Keyboard Listener
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      process.stdin.on("data", (key: string) => {
        // Ctrl+C or 'q'
        if (key === "\u0003" || key === "q" || key === "Q") {
          cleanup();
          readline.cursorTo(process.stdout, 0);
          readline.clearLine(process.stdout, 0);
          console.log(`\n   ${chalk.hex("#8C827A")("🛑 Focus session stopped.")}\n`);
          resolve();
          return;
        }

        // Space or 'p' -> Pause / Resume
        if (key === " " || key === "p" || key === "P") {
          isPaused = !isPaused;
          renderTimerFrame();
          return;
        }

        // '+' or '=' -> Add 5 minutes
        if (key === "+" || key === "=") {
          remainingSeconds += 5 * 60;
          totalDuration += 5 * 60;
          renderTimerFrame();
          return;
        }

        // '-' or '_' -> Subtract 5 minutes
        if (key === "-" || key === "_") {
          if (remainingSeconds > 5 * 60) {
            remainingSeconds -= 5 * 60;
            totalDuration = Math.max(remainingSeconds, totalDuration - 5 * 60);
          } else {
            remainingSeconds = 1;
          }
          renderTimerFrame();
          return;
        }
      });
    }

    renderTimerFrame();

    timerInterval = setInterval(async () => {
      if (!isPaused) {
        remainingSeconds--;
        renderTimerFrame();

        if (remainingSeconds <= 0) {
          cleanup();
          readline.cursorTo(process.stdout, 0);
          readline.clearLine(process.stdout, 0);

          // Audio bell
          process.stdout.write("\u0007");

          console.log(`\n   ${chalk.bgGreen.black.bold(" 🎉 TIME'S UP! ")} ${chalk.green.bold("Great focus session completed!")}`);
          console.log(`   ${chalk.gray("Completed:")} ${chalk.hex("#E2953B").bold(taskName)} (${formatTime(totalDuration)})\n`);

          // Trigger Desktop Notification if not disabled
          if (options.notify !== false) {
            try {
              notifier.notify({
                title: "⚡ AazDoh Focus Completed",
                message: `Time's up for: ${taskName}!`,
                sound: options.sound !== false,
                wait: false,
              });
            } catch {
              // Ignore notification trigger failures gracefully
            }
          }

          // Optional post-timer hook: Sync with AazDoh commitments if logged in
          if (isConfigured()) {
            try {
              const shouldSync = await confirm({
                message: "Would you like to mark a commitment as completed in AazDoh?",
                default: false,
              });

              if (shouldSync) {
                const client = new AazDohApiClient();
                const todayCommitments = await client.getTodayCommitments();
                const pending = todayCommitments.filter((c: any) => c.status === "PENDING" || c.status === "IN_PROGRESS");

                if (pending.length === 0) {
                  console.log(chalk.gray("   No pending commitments found for today."));
                } else {
                  const selectedId = await select({
                    message: "Select the commitment to complete:",
                    choices: pending.map((c: any) => ({
                      name: `${c.title} (${c.allocatedMinutes}m) [${c.priority}]`,
                      value: c.id,
                    })),
                  });

                  if (selectedId) {
                    await client.completeCommitment(selectedId, { notes: `Completed in ${Math.round(totalDuration / 60)}m focus timer.` });
                    console.log(chalk.green("   ✅ Commitment marked as completed in AazDoh!\n"));
                  }
                }
              }
            } catch {
              // User cancelled prompt
            }
          }

          resolve();
        }
      }
    }, 1000);
  });
}
