import fs from "fs";
import path from "path";
import os from "os";
import dotenv from "dotenv";

dotenv.config();

export interface AazDohCliConfig {
  apiUrl: string;
  apiKey: string;
  userFullName?: string;
  userEmail?: string;
  aiPersona?: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".aazdoh");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function getConfig(): AazDohCliConfig {
  let fileConfig: Partial<AazDohCliConfig> = {};

  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      fileConfig = JSON.parse(content);
    } catch {
      // Ignored if invalid JSON
    }
  }

  const apiUrl =
    process.env.AAZDOH_API_URL ||
    fileConfig.apiUrl ||
    "https://aazdoh.onrender.com";

  const apiKey =
    process.env.AAZDOH_API_KEY ||
    fileConfig.apiKey ||
    "";

  return {
    apiUrl: apiUrl.replace(/\/+$/, ""),
    apiKey: apiKey.trim(),
    userFullName: fileConfig.userFullName,
    userEmail: fileConfig.userEmail,
    aiPersona: fileConfig.aiPersona,
  };
}

export function saveConfig(config: Partial<AazDohCliConfig>): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const current = getConfig();
  const merged: AazDohCliConfig = {
    ...current,
    ...config,
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf-8");
}

export function clearConfig(): void {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
}

export function isConfigured(): boolean {
  const config = getConfig();
  return Boolean(config.apiKey && config.apiKey.length > 0);
}
