import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass-embedded";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** The plugin's own icons. Same folder the PHP getter looks in first. */
export const OWN_ICON_DIR = "assets/src/images/icons";
/** The base plugin's icons that every plugin may use. */
export const SHARED_ICON_DIR = "assets/src/images/shared-icons";
/** Folder with the kit's SCSS partials (`@use "is-icons"`). */
export const KIT_SCSS_DIR = path.resolve(__dirname, "../files/scss");

const NAME = /^[a-z0-9-]+$/;
const GRID = "0 0 24 24";

/**
 * Checks one icon file against the kit rules (AGENTS.md §4).
 * Returns a list of problems; empty when the icon is fine.
 */
export function validateIcon(file) {
  const problems = [];
  const name = path.basename(file, ".svg");
  if (!NAME.test(name)) problems.push(`file name must match ${NAME} (a-z, 0-9, -)`);

  const svg = fs.readFileSync(file, "utf8");
  const root = svg.match(/<svg\b[^>]*>/i)?.[0];
  if (!root) return [...problems, "no <svg> root element"];

  // Attribute values may use double or single quotes.
  const viewBox = root.match(/viewBox=(["'])(.*?)\1/i)?.[2];
  if (viewBox?.trim().replace(/\s+/g, " ") !== GRID) problems.push(`viewBox must be "${GRID}" (is "${viewBox ?? "missing"}")`);
  if (/\s(width|height)=["']/i.test(root)) problems.push("remove width/height from <svg>, size comes from CSS");
  // The PHP getter sets these on the <svg> itself; a second copy would make the markup invalid.
  if (/\s(class|style|role|focusable|aria-[a-z]+)=["']/i.test(root)) problems.push("no class, style, role, focusable or aria-* on <svg>, the getter sets them");
  // An icon can be printed several times on one page, so ids (and url(#…) references) would clash.
  if (/\sid=["']|url\(\s*['"]?#|href=["']#/i.test(svg)) problems.push("no id attributes or #references, an icon may appear several times on a page");
  if (/<(script|style|foreignObject|image)\b/i.test(svg)) problems.push("no <script>, <style>, <foreignObject> or <image>");
  if (/\son[a-z]+=/i.test(svg)) problems.push("no event handler attributes");
  if (/(xlink:)?href=["']/i.test(svg)) problems.push("no external references");

  const colours = [...svg.matchAll(/\b(fill|stroke)(?:=(["'])(.*?)\2|:\s*([^";']+))/gi)]
    .map((m) => (m[3] ?? m[4]).trim())
    .filter((v) => !/^(currentColor|none)$/i.test(v));
  if (colours.length) problems.push(`only currentColor or none as fill/stroke (found ${[...new Set(colours)].join(", ")})`);

  return problems;
}

/** All `*.svg` files in a folder, sorted by name. */
export function listIcons(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".svg"))
    .sort()
    .map((f) => path.join(dir, f));
}

/** SVG markup as a CSS-safe data URI (URL-encoded, no base64, so it stays small). */
export function svgDataUri(file) {
  const svg = fs.readFileSync(file, "utf8").trim().replace(/\s*\n\s*/g, " ");
  const encoded = encodeURIComponent(svg).replace(/%(20|3D|3A|2F|2C|2E)/g, (m) => decodeURIComponent(m));
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Sass options and the Vite plugin for the icon workflow.
 *
 * Sass options:
 *  - `@use "is-icons"` resolves to the kit's mixin,
 *  - `is-own-icon-exists($name)` tells the mixin whether the plugin has its own icon,
 *  - `is-svg-icon-names($dir)` / `is-svg-icon-uri($dir, $name)` list a folder's icons and return one
 *    as a data URI (the base plugin builds icons.css with them).
 *
 * Paths are resolved against Vite's root (known once the config is resolved), the same root the
 * mixin's `url('/assets/…')` is resolved against, so the existence check and the URL agree.
 *
 * The plugin tells the dev server about the icon folders: Sass reads them through functions,
 * so Vite would not notice a new, changed or deleted icon on its own.
 */
export function iconWorkflow(cwd) {
  const state = { root: cwd };
  const resolve = (...parts) => path.resolve(state.root, ...parts);
  const stringArg = (value, label) => value.assertString(label).text;

  const sassOptions = {
    loadPaths: [KIT_SCSS_DIR],
    functions: {
      "is-own-icon-exists($name)": ([name]) => {
        const icon = stringArg(name, "name");
        if (!NAME.test(icon)) throw new Error(`icon(): invalid icon name "${icon}"`);
        return fs.existsSync(resolve(OWN_ICON_DIR, `${icon}.svg`)) ? sass.sassTrue : sass.sassFalse;
      },
      "is-svg-icon-names($dir)": ([dir]) => {
        const folder = resolve(stringArg(dir, "dir"));
        const names = listIcons(folder).map((file) => new sass.SassString(path.basename(file, ".svg"), { quotes: false }));
        return new sass.SassList(names, { separator: "," });
      },
      "is-svg-icon-uri($dir, $name)": ([dir, name]) => {
        const icon = stringArg(name, "name");
        if (!NAME.test(icon)) throw new Error(`is-svg-icon-uri(): invalid icon name "${icon}"`);
        return new sass.SassString(svgDataUri(resolve(stringArg(dir, "dir"), `${icon}.svg`)), { quotes: true });
      },
    },
  };

  const plugin = {
    name: "is-icons",
    configResolved(config) {
      state.root = config.root;
    },
    configureServer(server) {
      const dirs = [OWN_ICON_DIR, SHARED_ICON_DIR].map((dir) => resolve(dir));
      server.watcher.add(dirs);

      const onIconChange = (file) => {
        if (!file.endsWith(".svg") || !dirs.some((dir) => file.startsWith(dir + path.sep))) return;
        const graph = server.environments?.client?.moduleGraph ?? server.moduleGraph;
        for (const mod of graph.idToModuleMap.values()) {
          if (mod.file?.endsWith(".scss")) graph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
      };
      ["add", "change", "unlink"].forEach((event) => server.watcher.on(event, onIconChange));
    },
  };

  return { sassOptions, plugin };
}

/**
 * Merges the kit's SCSS options with a plugin's own `css.preprocessorOptions.scss`,
 * keeping both sets of load paths and functions.
 */
export function mergeScssOptions(kit, own = {}) {
  return {
    ...kit,
    ...own,
    loadPaths: [...(kit.loadPaths ?? []), ...(own.loadPaths ?? [])],
    functions: { ...kit.functions, ...own.functions },
  };
}
