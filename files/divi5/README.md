# Divi 5 modules

Self-contained Divi 5 module(s) for this iService plugin. This directory
has its **own** build pipeline (webpack) and does **not** touch the plugin's
Vite kit pipeline in `/assets`. It is loaded automatically by the IS Base
plugin (`Core\Divi`) whenever a `divi5/bootstrap.php` is present — no manual
wiring in the plugin's main file is required.

It is based on Elegant Themes' official
[`d5-extension-example-modules`](https://github.com/elegantthemes/d5-extension-example-modules)
(the *Static Module* example), trimmed down to a single, minimal **Title +
Content** module to use as a starting point.

## Layout

```
divi5/
├─ bootstrap.php                 # required by ../D5_TEXTDOMAIN_PLACEHOLDER.php; registers + enqueues
├─ webpack.config.js             # build config (independent of Vite)
├─ package.json                  # build deps + scripts
├─ tsconfig.json
├─ composer.json                 # optional PSR-4 autoload (a fallback autoloader exists)
├─ src/                          # Visual Builder (TypeScript/React) source
│  ├─ index.ts                   # registers the module in the VB
│  ├─ module-icons.ts            # adds the module icon to Divi's icon library
│  ├─ icons/module-example/
│  └─ components/example-module/  # the module: edit, styles, settings (module.json), etc.
└─ modules/                      # Front-End rendering (PHP)
   ├─ Modules.php                # adds module(s) to the D5 dependency tree
   └─ ExampleModule/
      ├─ ExampleModule.php       # registers the module + render callback
      └─ ExampleModuleTrait/     # render / classnames / styles / script-data / custom-css
```

Each VB concept in `src/components/example-module/` has a 1:1 PHP equivalent in
`modules/ExampleModule/ExampleModuleTrait/` so the builder preview and the
front-end output stay in sync.

## Build

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
| `styles/bundle.css`            | Front-End **and** Visual Builder (`module.scss`) |
| `styles/vb-bundle.css`         | Visual Builder only (`style.scss`)    |
| `modules-json/example-module/` | PHP `ModuleRegistration::register_module` (copied `module.json` + default attrs) |

`bootstrap.php` enqueues these via Divi's `PackageBuildManager` (VB) and
`wp_enqueue_style` (front-end). It is only `require`d when Divi 5 is active.

## Adding another module

1. Duplicate `src/components/example-module/` → `src/components/<new>/`, update
   the names/classnames in `module.json`, `*.tsx`, `*.ts`, `*.scss`.
2. Register it in `src/index.ts` (and add an icon in `src/icons` + `module-icons.ts`).
3. Duplicate `modules/ExampleModule/` → `modules/<New>/`, update the namespace
   and class names, and add it in `modules/Modules.php`.
4. `npm run build`.
