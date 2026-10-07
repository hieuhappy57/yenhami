import { registerHooks } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();

function resolveWithExtensions(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const targetPath = path.join(rootDir, specifier.slice(2));
      const resolvedUrl = resolveWithExtensions(targetPath);
      if (resolvedUrl) {
        return nextResolve(resolvedUrl, context);
      }
    }
    try {
      return nextResolve(specifier, context);
    } catch (err) {
      if (err && err.code === "ERR_MODULE_NOT_FOUND" && specifier.startsWith(".")) {
        return nextResolve(specifier + ".ts", context);
      }
      throw err;
    }
  },
});
