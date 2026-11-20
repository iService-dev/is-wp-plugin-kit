# Divi 5 modules

Self-contained Divi 5 module(s) for this iService plugin. This directory
has its **own** build pipeline (webpack) and does **not** touch the plugin's
Vite kit pipeline in `/assets`. It is loaded automatically by the IS Base
plugin (`Core\Services\Divi_Service`) whenever a `divi5/bootstrap.php` is present. The only
wiring needed is the `new Divi_Service(...)` line in `includes/lib/Core/Plugin.php`,
which the kit template already has (older plugins may still use `new Divi(...)`).

It is based on Elegant Themes' official
[`d5-extension-example-modules`](https://github.com/elegantthemes/d5-extension-example-modules)
(the *Static Module* example), trimmed down to a single, minimal **Title +
Content** module to use as a starting point.

## Layout

```
divi5/
├─ bootstrap.php                 # loaded by the IS Base plugin; registers modules + assets
├─ webpack.config.js             # build config (independent of Vite)
├─ package.json                  # build deps + scripts
├─ tsconfig.json
├─ composer.json                 # local dev only; releases use the fallback autoloader in bootstrap.php
├─ src/                          # Visual Builder (TypeScript/React) source
│  ├─ index.ts                   # registers the module(s) in the VB
│  └─ components/example-module/  # one folder per module, see "Module folder" below
└─ modules/                      # Front-End rendering (PHP)
   ├─ Modules.php                # adds module(s) to the D5 dependency tree
   ├─ Assets.php                 # loads one module's Front-End files (Assets::enqueue)
   └─ ExampleModule/
      ├─ ExampleModule.php       # registers the module + render callback
      └─ ExampleModuleTrait/     # render / classnames / styles / script-data
                                 #   (+ CustomCssTrait, not used by default)
```

Each VB concept in `src/components/example-module/` has a 1:1 PHP equivalent in
`modules/ExampleModule/ExampleModuleTrait/` so the builder preview and the
front-end output stay in sync.

## Module folder

```
src/components/<module>/
├─ module.ts          # Front-End JS entry → scripts/<module>.js (omit if no JS is needed)
├─ module.scss        # Front-End CSS entry → styles/<module>.css
├─ frontend/          # helpers that only module.ts imports (optional)
├─ styles/            # SCSS partials that only module.scss @uses (optional)
├─ index.ts, edit.tsx, module.json, l10n.ts, …   # Visual Builder (shared bundle)
```

- The build finds `module.ts` and `module.scss` in every folder by itself; only
  these two names are entries. Everything else reaches them through `import` /
  `@use`, so a complex module still ends up as one JS and one CSS file.
- No second entry per module: if a module seems to need two scripts,
  `module.ts` imports both, or it is really two modules.
- A module never imports from another module's folder. A small helper that
  several modules need may be duplicated; if shared code grows, ask a developer.

## Build

Normally you don't build here directly — the plugin-root commands drive this
workspace automatically (installing its deps on first run):

```bash
npm run build      # in the plugin root: builds the plugin + divi5/
npm run dev        # in the plugin root: watches everything, divi5/ included
```

To build only this module standalone:

```bash
cd divi5
npm install
npm run build      # production build
npm run start      # watch mode while developing
```

The build emits (all git-ignored):

| Output                         | Loaded where                          |
| ------------------------------ | ------------------------------------- |
| `scripts/bundle.js`            | Visual Builder (all modules)          |
| `styles/bundle.css`            | Visual Builder (all modules' `module.scss`) |
| `styles/vb-bundle.css`         | Visual Builder only (`style.scss`)    |
| `scripts/<module>.js`          | Front-End, only where that module is used (only if it has `module.ts`) |
| `styles/<module>.css`          | Front-End, only where that module is used |
| `modules-json/<module>/`       | PHP `ModuleRegistration::register_module` (copied `module.json` + default attrs) |

`bootstrap.php` enqueues the VB files via Divi's `PackageBuildManager`. On the
Front-End, each module's render callback calls `Assets::enqueue('<module>')`,
which loads that module's own files, so a page only gets the CSS/JS of the
modules it contains (also in Theme Builder templates). WordPress 6.9+ moves
styles enqueued during rendering into `<head>` on classic themes like Divi, so
there is no flash of unstyled content. `npm run dev` picks up a new module
folder only after a restart.

## Builder preview

The Visual Builder loads only `bundle.js`, `bundle.css` and `vb-bundle.css`. A
module's `module.ts` never runs there, so its preview in the Builder is static
(no autoscroll, sliders, …). That's fine: don't write code that tries to start
the front-end behaviour inside the Builder. On the front end, `module.ts` starts
each instance once when the page has loaded; no `MutationObserver` or re-init
events.

## Icons in a module

Icons are SVG files in the plugin's `assets/src/images/icons/` (see `AGENTS.md`,
section 4).

- **Builder:** `import arrowUp from '../../../../assets/src/images/icons/arrow-up.svg';`
  gives the markup as a string; render it with
  `<span aria-hidden="true" dangerouslySetInnerHTML={{ __html: arrowUp }} />`.
  This is safe because the file is part of the plugin, never user input.
- **Front end (PHP):** read the built copy from
  `assets/dist/css/images/icons/<name>.svg` and print it inline in the same
  wrapper.
- A choice of icons is a select field whose options are a fixed list of file
  names; never an upload or a free text field.

## Translations

Divi does **not** run a third-party module's `module.json` strings through
`wp_set_script_translations` in the Builder's app-window, so the module ships its
own catalog instead:

- `src/components/example-module/l10n.ts` — the catalog in `setLocaleData`
  format; keys are the English source strings.
- The component's `index.ts` (`src/components/example-module/index.ts`) loads
  it into `wp.i18n` (only when the page language starts with `de`) and runs the
  Builder metadata (title, field labels/descriptions, group/option labels) and
  the default admin label through `__()`.

Front-end PHP strings stay in the plugin's normal `.po`/`.mo`; this catalog is
only for the Builder/JS strings. Edit `l10n.ts` and rebuild. To add another
language, export a second catalog from `l10n.ts` and extend the language check
in the component's `index.ts`.

## Module icon

The example module's `module.json` uses `"moduleIcon": "is/logo"` — the shared
iService brand icon, registered once by **is-base-plugin**
in Divi's global icon library (`divi.iconLibrary.icon.map`).

### Custom per-module icon (optional)

If a module needs its own distinctive icon (rather than the brand mark), register
it from this plugin's bundle:

1. Add `src/icons/<my-icon>/index.tsx` exporting `name`, `viewBox`, `component`:

   ```tsx
   import React, { ReactElement } from 'react';
   export const name      = 'my-plugin/my-icon';
   export const viewBox   = '0 0 16 16';
   export const component = (): ReactElement => <path d="M2 2h12v12H2z" />;
   ```

   **Important:** Divi's module picker renders every icon inside a *fixed*
   `viewBox="0 0 16 16"`, which **overrides** the `viewBox` you export. Author the
   artwork for a 0–16 space, or it lands outside the viewport and looks blank. (A
   glyph drawn at e.g. 1024 units must be scaled down with a wrapping
   `<g transform="scale(0.0145) …">`.) Divi also tints picker icons monochrome via
   CSS — that's normal; only override it if you truly need a fixed colour.

2. Register it via the icon-library filter — add `src/module-icons.ts`:

   ```ts
   import { addFilter } from '@wordpress/hooks';
   import * as myIcon from './icons/my-icon';
   addFilter('divi.iconLibrary.icon.map', 'D5_HOOKS_NS_PLACEHOLDER', (icons) => ({
     ...icons, // keep existing icons, or they get wiped
     [myIcon.name]: myIcon,
   }));
   ```

   …and import it once from `src/index.ts`: `import './module-icons';`

3. Point the module's `"moduleIcon"` at your icon's `name` and rebuild.

For a *shared* brand icon used across multiple plugins, add it to is-base-plugin
(`includes/lib/Divi5/is-icons.js`) instead, so every plugin can reference it.

## Names

Block names and CSS classes carry a prefix that is unique to this plugin, so
modules of different plugins never collide. `add-divi5` derives it from the
plugin slug: for `is-ui-snippets-plugin` the example module is the block
`is-ui-snippets/example-module` with the CSS class
`is_ui_snippets_example_module`. Every module needs its own name, built the
same way (`<prefix>/<module>`, `<prefix>_<module>`); a copied module keeps the
original's name until you change it. Never rename a block once pages use it:
Divi loses every saved instance.

## Adding another module

1. Duplicate `src/components/example-module/` → `src/components/<new>/`, update
   the names/classnames in `module.json`, `*.tsx`, `*.ts`, `*.scss` (see
   *Names* above).
2. Register it in `src/index.ts`. (It reuses the shared `is/logo` icon by default;
   for a custom one, see *Module icon* above.)
3. Duplicate `modules/ExampleModule/` → `modules/<New>/`, update the namespace
   and class names, and add it in `modules/Modules.php`. Its render callback
   calls `Assets::enqueue('<new>')` with the folder name from step 1.
4. Delete `module.ts` if the module needs no Front-End JS. No webpack change is
   needed: the build finds the new folder by itself.
5. `npm run build` (restart `npm run dev` if it is running).

For a parent module with child items, create both modules as above, then set
`"childModuleName": "<prefix>/<child-module>"` in the parent's `module.json`
and `"category": "child-module"` in the child's.
