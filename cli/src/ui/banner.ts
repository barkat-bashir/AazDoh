import chalk from "chalk";

export function printBanner(): void {
  const brand = chalk.hex("#E2953B").bold;
  const subtitle = chalk.hex("#8C827A");

  console.log("");
  console.log(brand("   ⚡ AAZDOH COGNITIVE ACCOUNTABILITY CLI"));
  console.log(subtitle("   Commit. Do. Report. Reflect. (Zero BS)"));
  console.log("");
}

export function formatPersonaBadge(persona?: string): string {
  switch (persona?.toUpperCase()) {
    case "STRICT":
      return chalk.bgHex("#C05330").hex("#FFFFFF").bold(" STRICT ");
    case "GENTLE":
      return chalk.bgHex("#10B981").hex("#FFFFFF").bold(" GENTLE ");
    default:
      return chalk.bgHex("#E2953B").hex("#1A0E08").bold(" BALANCED ");
  }
}

export function formatPriorityBadge(priority?: string): string {
  switch (priority?.toUpperCase()) {
    case "URGENT":
      return chalk.red.bold("[URGENT]");
    case "HIGH":
      return chalk.hex("#E2953B").bold("[HIGH]");
    case "MEDIUM":
      return chalk.hex("#F59E0B")("[MED]");
    case "LOW":
      return chalk.gray("[LOW]");
    default:
      return chalk.gray("[MED]");
  }
}

export function formatCategoryBadge(category?: string): string {
  switch (category?.toUpperCase()) {
    case "DEEP_WORK":
      return chalk.hex("#C05330").bold("🎯 DEEP FOCUS");
    case "ROUTINE":
      return chalk.hex("#10B981")("⚡ ROUTINE");
    case "LEARNING":
      return chalk.hex("#3B82F6")("📚 LEARNING");
    default:
      return chalk.gray("⚙️ " + (category || "TASK"));
  }
}
