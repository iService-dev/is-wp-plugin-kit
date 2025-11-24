#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cmd = process.argv[2];

// ---------------------------
// Utility: safe copy
// ---------------------------
const copy = (file) => {
  try {
    const src = path.resolve(__dirname, "../files", file);
    const dest = path.resolve(
      process.cwd(),
      file.replace(/^gitignore$/, ".gitignore")
    );

    if (!fs.existsSync(src)) {
      console.error(`Error: Source file ${file} not found.`);
      process.exit(1);
    }

    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file}`);
  } catch (error) {
    console.error(`Error copying ${file}:`, error.message);
    process.exit(1);
  }
};

// ---------------------------
// INIT
// ---------------------------
if (cmd === "init") {
  copy("gitignore");
  copy("oxlintrc.json");
  copy("stylelintrc.json");
  copy("postcss.config.cjs");
  copy("tsconfig.json");

  console.log("✓ Project initialized with WP Plugin Kit defaults.");
  process.exit(0);
}

// ---------------------------
// compile-mo
// ---------------------------
if (cmd === "compile-mo") {
  const moScript = path.resolve(__dirname, "../files/compile-mo.mjs");
  import(moScript);
  process.exit(0);
}

// ---------------------------
// DEV (vite + watchers + mo)
// ---------------------------
if (cmd === "dev") {
  execSync(
    "concurrently -k " +
      '"vite" ' +
      "\"chokidar 'assets/src/ts/**/*.ts' -c 'oxlint assets/src/ts'\" " +
      "\"chokidar 'assets/src/scss/**/*.scss' -c 'stylelint \\\"assets/src/scss/**/*.scss\\\" --fix'\" " +
      "\"chokidar 'assets/src/l10n/**/*.po' -c 'is-wp-plugin-kit compile-mo'\"",
    { stdio: "inherit" }
  );
  process.exit(0);
}

// ---------------------------
// Sub-tasks used by dev
// ---------------------------

if (cmd === "dev:vite") {
  execSync("vite", { stdio: "inherit" });
  process.exit(0);
}

if (cmd === "watch:lint") {
  execSync("chokidar 'assets/src/ts/**/*.ts' -c 'oxlint assets/src/ts'", {
    stdio: "inherit",
  });
  process.exit(0);
}

if (cmd === "watch:stylelint") {
  execSync(
    "chokidar 'assets/src/scss/**/*.scss' -c 'stylelint \"assets/src/scss/**/*.scss\" --fix'",
    { stdio: "inherit" }
  );
  process.exit(0);
}

if (cmd === "watch:mo") {
  execSync(
    "chokidar 'assets/src/l10n/**/*.po' -c 'is-wp-plugin-kit compile-mo'",
    { stdio: "inherit" }
  );
  process.exit(0);
}

// ---------------------------
// BUILD
// ---------------------------
if (cmd === "build") {
  execSync("oxlint assets/src/ts", { stdio: "inherit" });
  execSync('stylelint "assets/src/scss/**/*.scss" --fix', { stdio: "inherit" });
  execSync("vite build", { stdio: "inherit" });
  execSync("is-wp-plugin-kit compile-mo", { stdio: "inherit" });

  console.log("✓ Build completed");
  process.exit(0);
}

// ---------------------------
// HELP
// ---------------------------
console.log(`
is-wp-plugin-kit – available commands:

  init             → Copy default config files into project
  compile-mo       → Convert .po → .mo
  dev              → Run vite + lint/watch + mo watcher
  build            → Run full production build
  dev:vite         → Run Vite only
  watch:lint       → Watch + lint TS
  watch:stylelint  → Watch + format SCSS
  watch:mo         → Watch + compile .po files
`);

process.exit(0);
