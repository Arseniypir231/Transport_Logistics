import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const envPath = path.join(repoRoot, ".env");
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/run-with-env.mjs <command> [...args]");
  process.exit(1);
}

dotenv.config({
  path: envPath,
  override: true
});

const localCommand = path.join(repoRoot, "node_modules", ".bin", `${command}${process.platform === "win32" ? ".cmd" : ""}`);
const executable = fs.existsSync(localCommand) ? localCommand : command;

function quoteForShell(value) {
  return `"${value.replaceAll('"', '\\"')}"`;
}

const child =
  process.platform === "win32"
    ? spawn([executable, ...args].map(quoteForShell).join(" "), {
        cwd: repoRoot,
        env: process.env,
        shell: true,
        stdio: "inherit"
      })
    : spawn(executable, args, {
        cwd: repoRoot,
        env: process.env,
        shell: false,
        stdio: "inherit"
      });

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Command stopped with signal ${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 0);
});
