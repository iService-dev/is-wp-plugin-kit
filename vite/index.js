import { defineConfig } from "vite";
import fg from "fast-glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    { src: "assets/src/images/*", dest: "css/images" },
    { src: "assets/src/fonts/**/*.{eot,woff,woff2,ttf}", dest: "css/fonts" },
    { src: "assets/src/legacy/css/**/*.css", dest: "css" },
    { src: "assets/src/legacy/js/**/*.js", dest: "js" },
  ];

  // Filter out targets where source path doesn't exist or has no files
  const cwd = userOptions.cwd ?? process.cwd();
  const validTargets = staticCopyTargets.filter((target) => {
    const files = fg.sync(target.src, { cwd });
    return files.length > 0;
  });

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
      target: "es2019",
      cssCodeSplit: true,
      rollupOptions: {
        input: makeInputs(),
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

    plugins: [viteStaticCopy({ targets: validTargets })],

    ...userOptions,
  });
}
