#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cmd = process.argv[2];

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

if (cmd === "init") {
  copy("gitignore");
  copy("oxlintrc.json");
  copy("stylelintrc.json");
  copy("postcss.config.cjs");
  copy("tsconfig.json");

  console.log("Project initialized with WP Plugin Kit defaults.");
}

if (cmd === "compile-mo") {
  const moScript = path.resolve(__dirname, "../files/compile-mo.mjs");
  import(moScript);
}
