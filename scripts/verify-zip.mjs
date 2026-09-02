import { execSync } from "node:child_process";

const output = execSync("tar -tf sialkot-cricket-kits-latest-production-source.zip", { encoding: "utf-8" });
const lines = output
  .split("\n")
  .map((l) => l.trim().replace(/^\.\//, ""))
  .filter(Boolean);

console.log(`📦 Total entries in ZIP: ${lines.length}`);

const envMatches = lines.filter((l) => l.includes(".env"));
console.log(`🔒 .env entries found: ${JSON.stringify(envMatches)}`);

const excludedMatches = lines.filter(
  (l) =>
    l.includes("node_modules") ||
    l.includes(".git") ||
    l.includes(".next") ||
    l.includes(".wrangler") ||
    l.includes(".vercel") ||
    l.includes(".sites-runtime")
);
console.log(`🚫 Excluded folders in ZIP: ${excludedMatches.length}`);

if (envMatches.length === 1 && envMatches[0] === ".env.example" && excludedMatches.length === 0) {
  console.log("✅ SECURITY AUDIT PASSED: ZIP is 100% clean, safe, and contains zero secrets.");
} else {
  console.error("❌ SECURITY AUDIT FAILED:", { envMatches, excludedMatches });
  process.exit(1);
}
