import { access, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

// Packages database migrations after Vite finishes compiling.
export function sites(): Plugin {
  let root = process.cwd();

  return {
    name: "sites",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const drizzleSource = resolve(root, "drizzle");
      const outputDirectory = resolve(root, "dist", "drizzle");

      if (await exists(drizzleSource)) {
        await mkdir(resolve(root, "dist"), { recursive: true });
        await cp(drizzleSource, outputDirectory, { recursive: true });
      }
    },
  };
}
