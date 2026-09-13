import { password } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";
import { saveConfig, getConfig } from "../config.js";
import { AazDohApiClient } from "../client.js";
import { printBanner, formatPersonaBadge } from "../ui/banner.js";

export async function handleLoginCommand(options: { key?: string; url?: string }): Promise<void> {
  printBanner();

  const current = getConfig();
  let apiKey = options.key;
  let apiUrl = options.url || current.apiUrl || "https://aazdoh.onrender.com";

  if (!apiKey) {
    console.log(chalk.hex("#8C827A")("Authenticate your terminal with your AazDoh API key."));
    console.log(chalk.gray("(Generate an API Key from Web App -> Settings -> Developer API Keys)\n"));

    apiKey = await password({
      message: "Enter your AazDoh API Key:",
      mask: "•",
      validate: (val) => (val.trim().length > 0 ? true : "API Key cannot be empty."),
    });
  }

  const spinner = ora(chalk.hex("#E2953B")("Validating API Key with AazDoh backend...")).start();

  try {
    const testClient = new AazDohApiClient({
      apiUrl: apiUrl.trim(),
      apiKey: apiKey.trim(),
    });

    const profile = await testClient.getCurrentUser();

    saveConfig({
      apiUrl: apiUrl.trim(),
      apiKey: apiKey.trim(),
      userFullName: profile.fullName,
      userEmail: profile.email,
      aiPersona: profile.aiPersona,
    });

    spinner.succeed(chalk.green.bold(`Authentication successful!`));
    console.log("");
    console.log(`   ${chalk.hex("#8C827A")("User:")}    ${chalk.bold(profile.fullName)} (${profile.email})`);
    console.log(`   ${chalk.hex("#8C827A")("Persona:")} ${formatPersonaBadge(profile.aiPersona)}`);
    console.log(`   ${chalk.hex("#8C827A")("Config:")}  ${chalk.gray("~/.aazdoh/config.json")}`);
    console.log("");
    console.log(chalk.hex("#E2953B")("⚡ You're ready! Try running:"));
    console.log(chalk.gray('   aazdoh today'));
    console.log(chalk.gray('   aazdoh "completed TUF DSA, add 45m System Design"'));
    console.log(chalk.gray('   aazdoh chat'));
    console.log("");
  } catch (err: any) {
    spinner.fail(chalk.red.bold(`Authentication failed: ${err.message}`));
    console.log("");
    console.log(chalk.yellow("Ensure your backend server is running and the API key is active."));
    process.exit(1);
  }
}
