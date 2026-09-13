#!/usr/bin/env node

import { Command } from "commander";
import { handleLoginCommand } from "./commands/login.js";
import { handleTodayCommand } from "./commands/today.js";
import { handleRunPrompt } from "./commands/run.js";
import { chatCommand } from "./commands/chat.js";
import { handleUndoCommand } from "./commands/undo.js";
import { handleStatsCommand } from "./commands/stats.js";
import { stressTestCommand } from "./commands/stressTest.js";

const program = new Command();

program
  .name("aazdoh")
  .description("⚡ AazDoh Autonomous AI Accountability Coach & Execution Agent for the Terminal")
  .version("1.0.0");

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
  .command("run [instruction...]")
  .description("Execute a natural language task or commitment operation")
  .action(async (instructionWords: string[]) => {
    const instruction = instructionWords.join(" ").trim();
    if (!instruction) {
      await handleTodayCommand({});
    } else {
      await handleRunPrompt(instruction);
    }
  });

// Handle default argument fallback: `aazdoh "commit to 45m deep work on docs"`
program
  .arguments("[prompt...]")
  .action(async (args: string[]) => {
    const prompt = args.join(" ").trim();
    if (!prompt) {
      await handleTodayCommand({});
    } else {
      await handleRunPrompt(prompt);
    }
  });

program.parse(process.argv);
