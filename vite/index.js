import { defineConfig } from "vite";
import fg from "fast-glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// vite-plugin-static-copy v4 always keeps the matched path, so "assets/src/images/a.png" with
// dest "css/images" would land in "css/images/assets/src/images/a.png". The kit has always
// flattened matches into `dest` (the v3 default), so keep that layout. A string/function `rename`
// keeps its v3 meaning (file name inside `dest`); an object `rename` is passed through as-is, so
// `rename: { stripBase: 0 }` opts in to keeping the folder structure.
function flattenTarget(target) {
  const { rename } = target;
  if (rename === undefined) return { ...target, rename: { stripBase: true } };
  if (typeof rename === "string") {
    return { ...target, rename: { stripBase: true, name: rename } };
  }
  if (typeof rename === "function") {
    return {
      ...target,
      rename: async (...args) => {
        const result = await rename(...args);
        return typeof result === "string" ? { stripBase: true, name: result } : result;
      },
    };
  }
  return target;
}

export function wpPluginKitVite(userOptions = {}) {
  function makeInputs() {
    const files = fg.sync(
      [
        "assets/src/ts/*.ts",
        "assets/src/scss/*.scss",
      ],
      {
        cwd: userOptions.cwd ?? process.cwd(),
      }
    );

    const entries = {};
    for (const f of files) {
      const base = path.basename(f).replace(/\.(ts|scss|js|css)$/i, "");

      let key;
      if (f.endsWith(".ts")) key = `js/${base}`;
      else if (f.endsWith(".scss")) key = `css/${base}`;
      else if (f.endsWith(".js")) key = `js/${base}`;
      else if (f.endsWith(".css")) key = `css/${base}`;
      else continue;

      entries[key] = path.resolve(userOptions.cwd ?? process.cwd(), f);
    }
    return entries;
  }

  const staticCopyTargets = userOptions.staticCopyTargets ?? [
    // `**/*` + stripBase 3 keeps sub-folders of assets/src/images (e.g. css/images/icons/…).
    { src: "assets/src/images/**/*", dest: "css/images", rename: { stripBase: 3 } },
    { src: "assets/src/fonts/**/*.{eot,woff,woff2,ttf}", dest: "css/fonts" },
    { src: "assets/src/legacy/css/**/*.css", dest: "css" },
    { src: "assets/src/legacy/js/**/*.js", dest: "js" },
  ];

  // Filter out targets where source path doesn't exist or has no files
  const cwd = userOptions.cwd ?? process.cwd();
  const validTargets = staticCopyTargets
    .filter((target) => {
      const files = fg.sync(target.src, { cwd });
      return files.length > 0;
    })
    .map(flattenTarget);

  const inputs = makeInputs();
  const scssEntries = new Set(
    Object.keys(inputs).filter((key) => key.startsWith("css/")).map((key) => key.slice(4))
  );

  return defineConfig({
    base: "./",

    server: {
      host: "0.0.0.0",
      port: userOptions.port ?? 5500,
      origin: `http://localhost:${userOptions.port ?? 5500}`,
      strictPort: true,
      cors: true,
      hmr: { host: "localhost", protocol: "ws" },
    },
    build: {
      outDir: userOptions.outDir ?? "assets/dist",
      assetsDir: "",
      emptyOutDir: true,
      manifest: "manifest.json",
      target: "esnext",
      cssCodeSplit: true,
      rollupOptions: {
        input: inputs,
		external: ['jquery', 'select2'],
        output: {
          intro: "(function(){",
          outro: "})();",
		  globals: {
			jquery: 'jQuery',
			select2: 'select2'
		  },
          entryFileNames: (chunk) =>
            chunk.name.startsWith("js/") ? "[name].js" : "js/[name].js",
          chunkFileNames: "js/[name]-[hash].js",
          assetFileNames: (asset) => {
            const fileName = asset.names?.[0] ?? "";
            const ext = path.extname(fileName).slice(1).toLowerCase();

            if (fileName.endsWith(".css") || ext === "css") {
              const baseName = fileName.replace(".css", "");
              if (baseName.startsWith("css/")) return `${baseName}.css`;
              // CSS imported by a TS entry is named after that entry. When an SCSS entry has the
              // same name, Vite 7 emitted the SCSS first (→ "x.css") and the import second (→ "x2.css");
              // Vite 8 emits them the other way round. Name the import explicitly so the SCSS entry
              // keeps "css/x.css" (loaded by name) and the import stays reachable via the manifest.
              if (scssEntries.has(baseName)) return `css/${baseName}2.css`;
              return `css/${baseName}.css`;
            }

            if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext))
              return "css/images/[name][extname]";

            if (["woff", "woff2", "ttf", "eot", "otf"].includes(ext))
              return "css/fonts/[name][extname]";

            return "[name][extname]";
          },
        },
      },
    },

    css: { postcss: "./postcss.config.cjs" },

    plugins: [
      {
        name: 'generate-build-version',
        buildStart() {
          const buildVersion = Date.now().toString();
          writeFileSync(
            path.resolve(cwd, 'includes/build-version.php'),
            `<?php\n// Auto-generated build version\nreturn '${buildVersion}';\n`
          );
        }
      },
      viteStaticCopy({ targets: validTargets })
    ],

    ...userOptions,
  });
}
