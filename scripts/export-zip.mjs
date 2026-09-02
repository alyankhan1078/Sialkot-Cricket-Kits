import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const stageDir = path.join(rootDir, "zip_stage");
const zipName = "sialkot-cricket-kits-latest-production-source.zip";
const zipPath = path.join(rootDir, zipName);

// Clean previous
if (fs.existsSync(stageDir)) fs.rmSync(stageDir, { recursive: true, force: true });
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

fs.mkdirSync(stageDir, { recursive: true });

const includeDirs = ["app", "src", "public", "worker", "db", "scripts", "types", "drizzle"];
const includeFiles = [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "next.config.ts",
  "next-env.d.ts",
  "postcss.config.mjs",
  "eslint.config.mjs",
  "drizzle.config.ts",
  ".env.example",
  "README.md",
  "START_HERE.md",
  "supabase-schema-and-seed.sql",
];

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      if (
        element === "node_modules" ||
        element === ".next" ||
        element === "dist" ||
        element === ".git" ||
        element === ".wrangler" ||
        element === ".sites-runtime" ||
        element === "build" ||
        element === ".vercel" ||
        element === "zip_stage"
      ) {
        return;
      }
      copyFolderSync(fromPath, toPath);
    } else {
      if (element.startsWith(".env") && element !== ".env.example") return;
      if (element.endsWith(".zip") || element === "prev-logo.png") return;
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

// Copy directories
includeDirs.forEach((dir) => {
  copyFolderSync(path.join(rootDir, dir), path.join(stageDir, dir));
});

// Copy individual files
includeFiles.forEach((file) => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, path.join(stageDir, file));
  }
});

console.log("Packaging zip archive using native tar...");
execSync(`tar -caf "${zipName}" -C zip_stage .`, { stdio: "inherit", cwd: rootDir });

// Cleanup staging directory
fs.rmSync(stageDir, { recursive: true, force: true });

const stats = fs.statSync(zipPath);
console.log(`\n✅ Successfully exported: ${zipName}`);
console.log(`📦 File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log(`📍 Location: ${zipPath}`);
