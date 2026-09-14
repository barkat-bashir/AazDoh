#!/usr/bin/env node

import { Command } from "commander";
import { handleLoginCommand } from "./commands/login.js";
import { handleTodayCommand } from "./commands/today.js";
import { handleRunPrompt } from "./commands/run.js";
import { chatCommand } from "./commands/chat.js";
import { handleUndoCommand } from "./commands/undo.js";
import { handleStatsCommand } from "./commands/stats.js";
import { stressTestCommand } from "./commands/stressTest.js";
import { handleFocusCommand, handleFocusWorker, checkAndDisplayCompletedFocus } from "./commands/focus.js";
import { checkForCliUpdates, CURRENT_CLI_VERSION } from "./ui/updater.js";

const program = new Command();

program
  .name("aazdoh")
  .description("⚡ AazDoh Autonomous AI Accountability Coach & Execution Agent for the Terminal")
  .version(CURRENT_CLI_VERSION);

// Hook background update check and completion receipt display
program.hook("preAction", async () => {
  checkAndDisplayCompletedFocus();
  await checkForCliUpdates();
});

program
  .command("login")
  .description("Configure AazDoh API key and server URL")
  .option("-k, --key <key>", "AazDoh API Key")
  .option("-u, --url <url>", "AazDoh Backend API URL")
  .action(handleLoginCommand);

program
  .command("today")
  .alias("list")
  .description("Show commitments and cognitive load for today (or specified date)")
  .option("-d, --date <date>", "Date in YYYY-MM-DD format")
  .action(handleTodayCommand);

program
  .command("chat")
  .description("Start an interactive multi-turn terminal session with the AI Chief of Staff")
  .action(chatCommand);

program
  .command("undo")
  .description("Undo the last AI agent mutation or state change")
  .action(handleUndoCommand);

program
  .command("stats")
  .alias("velocity")
  .description("Display 7-day velocity, focus metrics, and cognitive load trends")
  .option("-d, --days <days>", "Number of days to analyze (default: 7)", "7")
  .action(handleStatsCommand);

program
  .command("stress-test")
  .description("Execute a 60-second plan stress test against historical capacity")
  .option("-d, --defense <defense>", "Quick defense argument to justify planned workload")
  .action(stressTestCommand);

program
  .command("focus [durationOrTask...]")
  .alias("timer")
  .description("Start a local offline deep focus / Pomodoro timer with desktop notifications")
  .option("-l, --live", "Run interactive live countdown in foreground with keyboard controls")
  .option("--no-notify", "Disable native desktop notification on timer completion")
  .option("--no-sound", "Mute notification sound")
  .action(async (args: string[], options: { notify?: boolean; sound?: boolean; live?: boolean }) => {
    await handleFocusCommand(args, options);
  });

// Internal background worker daemon (not displayed in help menu)
program
  .command("__focus_worker <seconds> <taskName> <notify> <sound>", { hidden: true })
  .action(async (secondsStr: string, taskName: string, notifyStr: string, soundStr: string) => {
    const seconds = parseInt(secondsStr, 10) || 1500;
    const notify = notifyStr !== "0";
    const sound = soundStr !== "0";
    await handleFocusWorker(seconds, taskName, notify, sound);
  });

program
  .command("run [instruction...]")
  .description("Execute a natural language task or commitment operation")
  .action(async (instructionWords: string[]) => {
    const instruction = instructionWords.join(" ").trim();
    if (!instruction) {
      await chatCommand();
    } else {
      await handleRunPrompt(instruction);
    }
  });

// Handle default argument fallback: `aazdoh` launches interactive cockpit; `aazdoh "..."` runs prompt
program
  .arguments("[prompt...]")
  .action(async (args: string[]) => {
    const prompt = args.join(" ").trim();
    if (!prompt) {
      await chatCommand();
    } else {
      await handleRunPrompt(prompt);
    }
  });

await program.parseAsync(process.argv);
