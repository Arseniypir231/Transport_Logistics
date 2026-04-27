import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function isProjectRoot(directory: string) {
  const packagePath = path.join(directory, "package.json");

  if (!fs.existsSync(packagePath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8")) as { name?: string };
    return packageJson.name === "transport-logistics-platform";
  } catch {
    return false;
  }
}

function findProjectRoot(startDirectory: string) {
  let current = path.resolve(startDirectory);

  while (true) {
    if (isProjectRoot(current)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }

    current = parent;
  }
}

export function loadProjectEnv() {
  const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = findProjectRoot(process.cwd()) ?? findProjectRoot(moduleDirectory) ?? process.cwd();
  const envPath = path.join(projectRoot, ".env");

  dotenv.config({
    path: envPath,
    override: true
  });

  return { envPath, projectRoot };
}
