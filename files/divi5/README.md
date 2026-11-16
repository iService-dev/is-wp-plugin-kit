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
│  └─ components/example-module/  # the module: edit, styles, settings (module.json),
│                                 #   translations (l10n.ts, loaded in its index.ts),
│                                 #   Front-End script (module.ts)
└─ modules/                      # Front-End rendering (PHP)
   ├─ Modules.php                # adds module(s) to the D5 dependency tree
   └─ ExampleModule/
      ├─ ExampleModule.php       # registers the module + render callback
      └─ ExampleModuleTrait/     # render / classnames / styles / script-data
                                 #   (+ CustomCssTrait, not used by default)
```

Each VB concept in `src/components/example-module/` has a 1:1 PHP equivalent in
`modules/ExampleModule/ExampleModuleTrait/` so the builder preview and the
front-end output stay in sync.

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
| `scripts/bundle.js`            | Visual Builder                        |
| `scripts/module.js`            | Front-End (enqueued by the render callback) |
| `styles/bundle.css`            | Front-End (enqueued by the render callback) **and** Visual Builder (`module.scss`) |
| `styles/vb-bundle.css`         | Visual Builder only (`style.scss`)    |
| `modules-json/example-module/` | PHP `ModuleRegistration::register_module` (copied `module.json` + default attrs) |

`bootstrap.php` enqueues the VB script/styles via Divi's `PackageBuildManager`
and only *registers* the front-end `styles/bundle.css`. The module's
`render_callback` enqueues `scripts/module.js` and `styles/bundle.css`, so the
front-end assets load only on pages (or Theme Builder templates) that contain
the module. WordPress 6.9+ moves styles enqueued during rendering into `<head>`
on classic themes like Divi, so there is no flash of unstyled content. When
you add a module, enqueue the style in its render callback too. These are only
loaded when Divi 5 is active.

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

## Adding another module

1. Duplicate `src/components/example-module/` → `src/components/<new>/`, update
   the names/classnames in `module.json`, `*.tsx`, `*.ts`, `*.scss`.
2. Register it in `src/index.ts`. (It reuses the shared `is/logo` icon by default;
   for a custom one, see *Module icon* above.)
3. Duplicate `modules/ExampleModule/` → `modules/<New>/`, update the namespace
   and class names, and add it in `modules/Modules.php`. Its render callback
   enqueues `styles/bundle.css` too (see *Build* above).
4. Only if the module needs its own Front-End script: add an entry in
   `webpack.config.js` (e.g. `'<new>-module': './src/components/<new>/module.ts'`
   → `scripts/<new>-module.js`) and enqueue that file in its render callback.
   The existing `module` entry only builds the example module's script.
5. `npm run build`.

For a parent module with child items, create both modules as above, then set
`"childModuleName": "<namespace>/<child-module>"` in the parent's `module.json`
and `"category": "child-module"` in the child's.
