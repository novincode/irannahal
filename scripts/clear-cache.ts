import { promisify } from "util";
import { exec as execCb } from "child_process";
import { glob } from "glob";
import path from "path";
import fs from "fs/promises";

const exec = promisify(execCb);

const patterns = [
  "**/.next",
  "**/.vercel",
  "**/.wrangler",
  "**/.cache",
  "**/cache"
];

async function removeDirs(pattern: string) {
  const matches = await glob(pattern, { 
    cwd: process.cwd(), 
    absolute: true, 
    dot: true, 
    ignore: "**/node_modules/**" 
  });
  
  for (const dir of matches) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
      console.log(`Removed: ${dir}`);
    } catch (e) {
      console.error(`Failed to remove: ${dir}`, e);
    }
  }
}

(async () => {
  for (const pattern of patterns) {
    await removeDirs(pattern);
  }
  console.log("Cache folders cleared.");
})();