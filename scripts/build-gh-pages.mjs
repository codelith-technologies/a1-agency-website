import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const webOut = path.join(rootDir, "apps", "web", "out");
const adminOut = path.join(rootDir, "apps", "admin", "out");

console.log("=== Building @a1/web with basePath /a1-agency-website ===");
execSync("npx turbo run build --filter=@a1/web", {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "/a1-agency-website" },
});

console.log("=== Building @a1/admin with basePath /a1-agency-website/admin ===");
execSync("npx turbo run build --filter=@a1/admin", {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "/a1-agency-website/admin" },
});

console.log("=== Assembling dist for GitHub Pages ===");
await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });

// 1. Copy web to dist
await fs.cp(webOut, distDir, { recursive: true });

// 2. Copy admin to dist/admin
const distAdmin = path.join(distDir, "admin");
await fs.mkdir(distAdmin, { recursive: true });
await fs.cp(adminOut, distAdmin, { recursive: true });

// 3. Add .nojekyll so GitHub Pages does not ignore _next folders
await fs.writeFile(path.join(distDir, ".nojekyll"), "");

// 4. Ensure admin/index.html points to login if accessed directly
const adminIndex = path.join(distAdmin, "index.html");
const loginIndex = path.join(distAdmin, "login.html");
try {
  await fs.access(loginIndex);
  await fs.copyFile(loginIndex, adminIndex);
} catch {
  // login.html already copied or handled
}

console.log("=== GitHub Pages build complete in dist/ ===");

