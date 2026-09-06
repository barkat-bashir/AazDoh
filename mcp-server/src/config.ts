import dotenv from "dotenv";
dotenv.config();

export interface ServerConfig {
  apiUrl: string;
  apiKey: string;
}

export function getConfig(): ServerConfig {
  const apiUrl =
    process.env.AAZDOH_API_URL ||
    process.env.AAZDOH_URL ||
    "https://aazdoh.onrender.com";

  const apiKey =
    process.env.AAZDOH_API_KEY ||
    process.env.AAZDOH_KEY ||
    "";

  if (!apiKey) {
    console.error(
      "[AAZDOH MCP WARNING] AAZDOH_API_KEY is not set. Please supply a valid API key (e.g. export AAZDOH_API_KEY=aazdoh_live_...)"
    );
  }

  return {
    apiUrl: apiUrl.replace(/\/+$/, ""),
    apiKey: apiKey.trim(),
  };
}
