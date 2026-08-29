import fs from "fs";
import path from "path";

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const namedImports = new Set();
  const defaultImports = new Set();

  const importRegex = /import\s+(?:([A-Za-z0-9_]+)\s*,?\s*)?(?:\{([^}]+)\})?\s*from\s*["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1]) defaultImports.add(match[1].trim());
    if (match[2]) {
      match[2].split(",").forEach((s) => {
        const parts = s.trim().split(/\s+as\s+/);
        const importedAs = (parts[1] || parts[0]).trim();
        if (importedAs) namedImports.add(importedAs);
      });
    }
  }

  const allImported = new Set([...namedImports, ...defaultImports]);

  // Extract actual JSX tags (exclude TS generics like <HTMLInputElement>, <T>, etc.)
  const jsxTags = new Set();
  // Match JSX tags: <Tag or <Tag> or <Tag attr=... but not useRef<Tag> or cast as <Tag>
  const jsxRegex = /(?:^|[^a-zA-Z0-9_$])<([A-Z][A-Za-z0-9_]*)(?:\s|>|\/>)/g;
  while ((match = jsxRegex.exec(content)) !== null) {
    const tag = match[1];
    // filter out standard TypeScript DOM type names if they are generics
    if (!["HTMLDivElement", "HTMLInputElement", "HTMLButtonElement", "HTMLFormElement", "Record", "File", "ReturnType", "T"].includes(tag)) {
      jsxTags.add(tag);
    }
  }

  const missing = [];
  for (const tag of jsxTags) {
    const isDeclared =
      new RegExp(`(?:function|class|const|let|var|type|interface)\\s+${tag}\\b`).test(content) ||
      allImported.has(tag);
    if (!isDeclared) {
      missing.push(tag);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Missing components in ${filePath}:`, missing);
    return false;
  }
  return true;
}

function scanDir(dir) {
  let passed = true;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== "node_modules" && file.name !== ".next") {
        if (!scanDir(fullPath)) passed = false;
      }
    } else if (file.name.endsWith(".tsx")) {
      if (!checkFile(fullPath)) passed = false;
    }
  }
  return passed;
}

console.log("🔍 Scanning all .tsx files for missing JSX imports...");
const appPassed = scanDir(path.resolve("app"));
const srcPassed = scanDir(path.resolve("src"));

if (appPassed && srcPassed) {
  console.log("✅ ALL .tsx files have 100% complete and valid imports!");
} else {
  process.exit(1);
}
