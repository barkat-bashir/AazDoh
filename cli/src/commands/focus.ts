import readline from "readline";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { spawn, exec, execFile } from "child_process";
import chalk from "chalk";
import notifier from "node-notifier";
import { confirm, select } from "@inquirer/prompts";
import { isConfigured } from "../config.js";
import { AazDohApiClient } from "../client.js";
import { printBanner } from "../ui/banner.js";

const TIMER_STATE_FILE = path.join(os.homedir(), ".aazdoh", "timer.json");
const COMPLETED_FOCUS_FILE = path.join(os.homedir(), ".aazdoh", "completed_focus.json");

export interface BackgroundTimerState {
  pid: number;
  taskName: string;
  startTime: string;
  targetEndTime: string;
  totalDurationSeconds: number;
  notify: boolean;
  sound: boolean;
}

export interface CompletedFocusReceipt {
  taskName: string;
  durationSeconds: number;
  completedAt: string;
}

export function saveCompletedReceipt(receipt: CompletedFocusReceipt): void {
  try {
    const dir = path.dirname(COMPLETED_FOCUS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(COMPLETED_FOCUS_FILE, JSON.stringify(receipt, null, 2), "utf-8");
  } catch {}
}

export function checkAndDisplayCompletedFocus(): void {
  try {
    if (fs.existsSync(COMPLETED_FOCUS_FILE)) {
      const content = fs.readFileSync(COMPLETED_FOCUS_FILE, "utf-8");
      const receipt = JSON.parse(content) as CompletedFocusReceipt;
      fs.unlinkSync(COMPLETED_FOCUS_FILE);

      const timeStr = formatTime(receipt.durationSeconds);
      console.log("");
      console.log(
        chalk.bgHex("#10B981").hex("#FFFFFF").bold(" 🎉 FOCUS SESSION COMPLETED ") +
        chalk.hex("#E2953B").bold(` "${receipt.taskName}"`) +
        chalk.gray(` (${timeStr}) — Great job!`)
      );
      console.log("");
    }
  } catch {}
}

export function getTimerState(): BackgroundTimerState | null {
  try {
    if (fs.existsSync(TIMER_STATE_FILE)) {
      const content = fs.readFileSync(TIMER_STATE_FILE, "utf-8");
      const state = JSON.parse(content) as BackgroundTimerState;
      const endTime = new Date(state.targetEndTime).getTime();
      // If the target end time has already passed, clear it
      if (Date.now() < endTime) {
        return state;
      } else {
        clearTimerState();
      }
    }
  } catch {
    // Ignored
  }
  return null;
}

export function saveTimerState(state: BackgroundTimerState): void {
  const dir = path.dirname(TIMER_STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TIMER_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

export function clearTimerState(): void {
  try {
    if (fs.existsSync(TIMER_STATE_FILE)) {
      fs.unlinkSync(TIMER_STATE_FILE);
    }
  } catch {
    // Ignored
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses user input for duration string into seconds.
 * Supports: '25m', '45min', '1h', '1.5h', '90s', '30' (defaults to minutes)
 */
export function parseDurationToSeconds(input?: string): number {
  if (!input || !input.trim()) {
    return 25 * 60; // Default 25 minutes
  }

  const clean = input.trim().toLowerCase();
  
  if (/^\d+(\.\d+)?$/.test(clean)) {
    return Math.max(1, Math.round(parseFloat(clean) * 60));
  }

  const hourMatch = clean.match(/^(\d+(\.\d+)?)\s*(h|hr|hours?)$/);
  if (hourMatch) {
    return Math.max(1, Math.round(parseFloat(hourMatch[1]) * 3600));
  }

  const minMatch = clean.match(/^(\d+(\.\d+)?)\s*(m|min|mins|minutes?)$/);
  if (minMatch) {
    return Math.max(1, Math.round(parseFloat(minMatch[1]) * 60));
  }

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

export interface FocusOptions {
  notify?: boolean;
  sound?: boolean;
  live?: boolean;
}

/**
 * Shows current active timer status (always computed from real wall-clock time)
 */
export function handleFocusStatus(): void {
  checkAndDisplayCompletedFocus();
  const state = getTimerState();
  if (!state) {
    console.log(chalk.gray("   No active background focus timer running."));
    console.log(chalk.gray('   Start one with: ') + chalk.hex("#E2953B")('az focus 25m "Your Task"') + "\n");
    return;
  }

  const endTime = new Date(state.targetEndTime).getTime();
  const now = Date.now();
  const remainingSeconds = Math.max(0, Math.round((endTime - now) / 1000));
  const elapsedSeconds = state.totalDurationSeconds - remainingSeconds;
  const percent = Math.min(100, Math.round((elapsedSeconds / state.totalDurationSeconds) * 100));
  const formattedEndTime = new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  printBanner();
  console.log(`   ${chalk.bgHex("#C05330").hex("#FFFFFF").bold(" ⏳ ACTIVE FOCUS SESSION ")} ${chalk.hex("#E2953B").bold(state.taskName)}`);
  console.log(`   [${renderProgressBar(percent, 25)}] ${chalk.bold(formatTime(remainingSeconds))} remaining (${percent}%)`);
  console.log(`   ${chalk.gray("Target finish:")} ${chalk.hex("#FDFBF7")(formattedEndTime)}  |  ${chalk.gray("Total:")} ${chalk.cyan(formatTime(state.totalDurationSeconds))}`);
  console.log(chalk.gray(`\n   Run `) + chalk.cyan(`az focus stop`) + chalk.gray(` to cancel.\n`));
}

/**
 * Stops/cancels any active background timer
 */
export function handleFocusStop(): void {
  const state = getTimerState();
  if (!state) {
    console.log(chalk.gray("\n   No active focus timer to stop.\n"));
    return;
  }

  if (state.pid && isProcessAlive(state.pid)) {
    try {
      process.kill(state.pid);
    } catch {
      // Ignored
    }
  }

  clearTimerState();
  console.log(chalk.hex("#8C827A")(`\n   🛑 Focus session cancelled: "${state.taskName}"\n`));
}

/**
 * Dispatches cross-platform desktop notification and system chime with safe async wait
 */
export async function dispatchNotificationAsync(
  title: string,
  message: string,
  sound: boolean = true
): Promise<void> {
  // 1. Play native system audio alert
  if (sound) {
    if (process.platform === "win32") {
      try {
        const soundCmd = "$files = @('C:\\Windows\\Media\\Alarm01.wav', 'C:\\Windows\\Media\\notify.wav', 'C:\\Windows\\Media\\tada.wav'); $p = $false; foreach ($f in $files) { if (Test-Path $f) { (New-Object Media.SoundPlayer $f).PlaySync(); $p = $true; break; } } if (-not $p) { [System.Media.SystemSounds]::Exclamation.Play(); }";
        execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", soundCmd], () => {});
      } catch {}
    } else if (process.platform === "darwin") {
      try {
        exec("afplay /System/Library/Sounds/Glass.aiff", () => {});
      } catch {}
    } else {
      try {
        process.stdout.write("\u0007");
      } catch {}
    }
  }

  // 2. Dispatch native OS toast notification
  return new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    // Safety timeout: ensure we don't hang indefinitely
    const timer = setTimeout(finish, 4000);

    try {
      notifier.notify(
        {
          title,
          message,
          sound: false, // Handled above via native Media.SoundPlayer
          wait: false,
          appID: "AazDoh Focus",
        },
        () => {
          clearTimeout(timer);
          finish();
        }
      );
    } catch {
      clearTimeout(timer);
      finish();
    }
  });
}

/**
 * Internal background worker entry point with sleep-resilient wall-clock polling
 */
export async function handleFocusWorker(
  seconds: number,
  taskName: string,
  notify: boolean,
  sound: boolean
): Promise<void> {
  const targetEndTimeMs = Date.now() + seconds * 1000;

  // Sleep-resilient loop: check real wall-clock time every 1 second
  while (Date.now() < targetEndTimeMs) {
    const remainingMs = targetEndTimeMs - Date.now();
    const sleepChunk = Math.min(1000, Math.max(100, remainingMs));
    await new Promise((resolve) => setTimeout(resolve, sleepChunk));
  }

  clearTimerState();

  saveCompletedReceipt({
    taskName,
    durationSeconds: seconds,
    completedAt: new Date().toISOString(),
  });

  if (notify) {
    await dispatchNotificationAsync("⚡ AazDoh Focus Completed", `Time's up for: ${taskName}!`, sound);
  }

  process.exit(0);
}

/**
 * Main dispatcher for `aazdoh focus` / `aazdoh timer`
 */
export async function handleFocusCommand(args: string[], options: FocusOptions): Promise<void> {
  const firstArg = (args[0] || "").toLowerCase().trim();

  // Subcommand dispatch: status
  if (firstArg === "status") {
    handleFocusStatus();
    return;
  }

  // Subcommand dispatch: stop / cancel
  if (firstArg === "stop" || firstArg === "cancel") {
    handleFocusStop();
    return;
  }

  // Check if a timer is already active
  const existing = getTimerState();
  if (existing && !options.live) {
    const endTime = new Date(existing.targetEndTime).getTime();
    const remainingSeconds = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    console.log(chalk.yellow(`\n   ⚠️  A focus timer is already running in the background:`));
    console.log(`   🎯 ${chalk.hex("#E2953B").bold(existing.taskName)} (${formatTime(remainingSeconds)} remaining)`);
    console.log(chalk.gray(`   Run `) + chalk.cyan(`az focus status`) + chalk.gray(` to inspect or `) + chalk.cyan(`az focus stop`) + chalk.gray(` to cancel.\n`));
    return;
  }

  let durationSeconds = 25 * 60;
  let taskName = "Deep Focus Session";

  if (args.length > 0) {
    if (isDurationToken(args[0])) {
      durationSeconds = parseDurationToSeconds(args[0]);
      if (args.length > 1) {
        taskName = args.slice(1).join(" ").trim() || taskName;
      }
    } else {
      taskName = args.join(" ").trim() || taskName;
    }
  }

  // If live mode requested, run the interactive foreground TUI
  if (options.live) {
    await runLiveTimerTUI(durationSeconds, taskName, options);
    return;
  }

  // Default: Start in background & free the terminal immediately
  const targetEndTime = new Date(Date.now() + durationSeconds * 1000);
  const formattedEndTime = targetEndTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const entryScript = path.resolve(currentDir, "../index.js");

  const notifyFlag = options.notify !== false ? "1" : "0";
  const soundFlag = options.sound !== false ? "1" : "0";

  const child = spawn(
    process.execPath,
    [entryScript, "__focus_worker", String(durationSeconds), taskName, notifyFlag, soundFlag],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    }
  );

  child.unref();

  saveTimerState({
    pid: child.pid || 0,
    taskName,
    startTime: new Date().toISOString(),
    targetEndTime: targetEndTime.toISOString(),
    totalDurationSeconds: durationSeconds,
    notify: options.notify !== false,
    sound: options.sound !== false,
  });

  printBanner();
  console.log(`   ${chalk.bgHex("#10B981").hex("#FFFFFF").bold(" ⚡ FOCUS STARTED IN BACKGROUND ")} ${chalk.hex("#E2953B").bold(taskName)}`);
  console.log(`   ${chalk.gray("Target finish:")} ${chalk.hex("#FDFBF7")(formattedEndTime)}  |  ${chalk.gray("Duration:")} ${chalk.cyan(formatTime(durationSeconds))}`);
  console.log(`   ${chalk.gray("🔔 Native desktop notification will alert you when time expires.")}`);
  console.log(
    chalk.gray("\n   💡 Commands: ") +
      chalk.cyan("az focus status") +
      chalk.gray(" (check time)  •  ") +
      chalk.cyan("az focus stop") +
      chalk.gray(" (cancel)  •  ") +
      chalk.cyan("az focus --live") +
      chalk.gray(" (interactive TUI)\n")
  );
}

/**
 * Interactive Live TUI with real wall-clock tracking across sleep / suspension
 */
async function runLiveTimerTUI(
  durationSeconds: number,
  taskName: string,
  options: FocusOptions
): Promise<void> {
  let totalDuration = durationSeconds;
  let targetEndTimeMs = Date.now() + durationSeconds * 1000;
  let isPaused = false;
  let pauseStartedAt: number | null = null;
  let timerInterval: NodeJS.Timeout | null = null;

  const formattedEndTime = () =>
    new Date(targetEndTimeMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  printBanner();
  console.log(`   ${chalk.bgHex("#C05330").hex("#FFFFFF").bold(" 🎯 LIVE FOCUS MODE ")} ${chalk.hex("#E2953B").bold(taskName)}`);
  console.log(`   ${chalk.gray("Target finish:")} ${chalk.hex("#FDFBF7")(formattedEndTime())}  |  ${chalk.gray("Duration:")} ${chalk.cyan(formatTime(totalDuration))}`);
  console.log("");
  console.log(chalk.gray("   Controls: [Space] Pause/Resume  [+] +5m  [-] -5m  [q] Cancel & Exit\n"));

  process.stdout.write("\u001B[?25l");

  const cleanup = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    process.stdout.write("\u001B[?25h");
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }
  };

  const getRemainingSeconds = (): number => {
    if (isPaused && pauseStartedAt) {
      return Math.max(0, Math.round((targetEndTimeMs - pauseStartedAt) / 1000));
    }
    return Math.max(0, Math.round((targetEndTimeMs - Date.now()) / 1000));
  };

  const renderTimerFrame = () => {
    const remainingSeconds = getRemainingSeconds();
    const elapsed = Math.max(0, totalDuration - remainingSeconds);
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
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      process.stdin.on("data", (key: string) => {
        if (key === "\u0003" || key === "q" || key === "Q") {
          cleanup();
          readline.cursorTo(process.stdout, 0);
          readline.clearLine(process.stdout, 0);
          console.log(`\n   ${chalk.hex("#8C827A")("🛑 Focus session stopped.")}\n`);
          resolve();
          return;
        }

        if (key === " " || key === "p" || key === "P") {
          if (!isPaused) {
            // Pause
            isPaused = true;
            pauseStartedAt = Date.now();
          } else {
            // Resume: adjust targetEndTime forward by paused duration
            if (pauseStartedAt) {
              const pausedDurationMs = Date.now() - pauseStartedAt;
              targetEndTimeMs += pausedDurationMs;
              pauseStartedAt = null;
            }
            isPaused = false;
          }
          renderTimerFrame();
          return;
        }

        if (key === "+" || key === "=") {
          targetEndTimeMs += 5 * 60 * 1000;
          totalDuration += 5 * 60;
          renderTimerFrame();
          return;
        }

        if (key === "-" || key === "_") {
          const remaining = getRemainingSeconds();
          if (remaining > 5 * 60) {
            targetEndTimeMs -= 5 * 60 * 1000;
            totalDuration = Math.max(300, totalDuration - 5 * 60);
          }
          renderTimerFrame();
          return;
        }
      });
    }

    renderTimerFrame();

    timerInterval = setInterval(async () => {
      if (!isPaused) {
        const remainingSeconds = getRemainingSeconds();
        renderTimerFrame();

        if (remainingSeconds <= 0) {
          cleanup();
          readline.cursorTo(process.stdout, 0);
          readline.clearLine(process.stdout, 0);

          process.stdout.write("\u0007");

          console.log(`\n   ${chalk.bgGreen.black.bold(" 🎉 TIME'S UP! ")} ${chalk.green.bold("Great focus session completed!")}`);
          console.log(`   ${chalk.gray("Completed:")} ${chalk.hex("#E2953B").bold(taskName)} (${formatTime(totalDuration)})\n`);

          if (options.notify !== false) {
            await dispatchNotificationAsync("⚡ AazDoh Focus Completed", `Time's up for: ${taskName}!`, options.sound !== false);
          }

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
                      name: `${c.title} (${c.estimatedMinutes}m) [${c.priority}]`,
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
              // Cancelled
            }
          }

          resolve();
        }
      }
    }, 1000);
  });
}
