import fs from "fs";
import path from "path";

const ROOT_DIR = process.cwd();
const WORKSPACES = ["apps/web", "apps/admin", "apps/api"];
const ROOT_ENV_FILES = [".env", ".env.local"]; // add .env.production etc if needed

// Read env key-value pairs from a file
function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  const env: Record<string, string> = {};
  for (const line of lines) {
    const match = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (match) {
      env[match[1]] = match[2];
    }
  }
  return env;
}

// Merge root envs into a target env file
function syncEnvFile(targetPath: string, rootEnvs: Record<string, string>) {
  let targetEnvs = parseEnvFile(targetPath);
  // Overwrite all root keys in target with root values
  for (const key of Object.keys(rootEnvs)) {
    targetEnvs[key] = rootEnvs[key];
  }
  // Keep any extra keys in target that are not in root
  const content = Object.entries(targetEnvs)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(targetPath, content);
  console.log(`✅ Synced: ${targetPath}`);
}

function run() {
  const rootEnvData: Record<string, Record<string, string>> = {};

  for (const rootFile of ROOT_ENV_FILES) {
    const absPath = path.join(ROOT_DIR, rootFile);
    rootEnvData[rootFile] = parseEnvFile(absPath);
  }

  for (const workspace of WORKSPACES) {
    for (const rootFile of ROOT_ENV_FILES) {
      const targetPath = path.join(ROOT_DIR, workspace, rootFile);
      syncEnvFile(targetPath, rootEnvData[rootFile]);
    }
  }
}

run();
