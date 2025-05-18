import * as dotenv from "dotenv";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// Determine mode (production or preview)
const isPreview = process.argv.includes('--preview');

// Load environment variables from .env and .env.local as needed
const rootDir = process.cwd();
const envFiles = isPreview
  ? [
      path.resolve(rootDir, ".env"),
      path.resolve(rootDir, ".env.local"),
    ]
  : [
      path.resolve(rootDir, ".env"),
    ];

// Read envs from files (last file wins for duplicate keys)
function readEnvVars(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const envPath of envFiles) {
    if (!fs.existsSync(envPath)) continue;
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      if (line.startsWith("#") || !line.trim()) continue;
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, name, value] = match;
        env[name] = value.replace(/^['"](.*)['"]$/, "$1");
      }
    }
  }
  return env;
}

// Find all wrangler.toml or wrangler.jsonc files in apps/*
function findWranglerConfigs(): { app: string; configPath: string; projectName: string }[] {
  const appsDir = path.join(rootDir, "apps");
  const result: { app: string; configPath: string; projectName: string }[] = [];
  if (!fs.existsSync(appsDir)) return result;
  for (const app of fs.readdirSync(appsDir)) {
    const appPath = path.join(appsDir, app);
    if (!fs.statSync(appPath).isDirectory()) continue;
    // Check for wrangler.toml
    const tomlPath = path.join(appPath, "wrangler.toml");
    if (fs.existsSync(tomlPath)) {
      const tomlContent = fs.readFileSync(tomlPath, "utf8");
      const nameMatch = tomlContent.match(/name\s*=\s*["']([^"']+)["']/);
      if (nameMatch && nameMatch[1]) {
        result.push({ app, configPath: tomlPath, projectName: nameMatch[1] });
        continue;
      }
    }
    // Check for wrangler.jsonc
    const jsoncPath = path.join(appPath, "wrangler.jsonc");
    if (fs.existsSync(jsoncPath)) {
      const jsonContent = fs.readFileSync(jsoncPath, "utf8");
      const nameMatch = jsonContent.match(/["']?name["']?\s*:\s*["']([^"']+)["']/);
      if (nameMatch && nameMatch[1]) {
        result.push({ app, configPath: jsoncPath, projectName: nameMatch[1] });
        continue;
      }
    }
  }
  return result;
}

async function pushEnvToAllWranglerApps() {
  const envVars = readEnvVars();
  const wranglerApps = findWranglerConfigs();
  if (wranglerApps.length === 0) {
    console.log("No wrangler.toml or wrangler.jsonc files found in apps/*");
    return;
  }
  for (const { app, projectName } of wranglerApps) {
    console.log(`\n🚀 Pushing envs to Cloudflare project: ${projectName} (app: ${app})`);
    for (const [name, value] of Object.entries(envVars)) {
      const tempFile = path.join(rootDir, ".temp-secret");
      fs.writeFileSync(tempFile, value);
      try {
        execSync(
          `wrangler pages secret put ${name} --project-name ${projectName} < ${tempFile}`,
          { stdio: "inherit" }
        );
        console.log(`✅ Set ${name} for ${projectName}`);
      } catch (e) {
        console.error(`❌ Failed to set ${name} for ${projectName}:`, (e as Error).message);
      } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    }
  }
  console.log("\n✅ Done pushing envs to all Cloudflare projects.");
}

pushEnvToAllWranglerApps().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
