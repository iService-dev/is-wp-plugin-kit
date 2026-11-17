# @iservice-dev/is-wp-plugin-kit

A toolkit for WordPress plugin development with Vite, TypeScript, and modern build tools. Internal iService tooling — plugins scaffolded with it use the `IS\` namespace and depend on the IS Base Plugin at runtime.

## Quick Start

### 1. Initialize a New Plugin

```bash
npx @iservice-dev/is-wp-plugin-kit init
```

This sets up your complete plugin structure with:
- Configuration files (`.gitignore`, TypeScript, linting, PostCSS)
- Folder structure (`assets/`, `includes/`; `languages/` is created by the build)
- Template files (`<plugin-slug>.php`, `Config.php`, `Plugin.php`, `de_DE.po`)
- GitHub Actions: `.github/workflows/checks.yml` and `deploy.yml` (see
  [CI checks](#ci-checks))
- `vite.config.ts` with default settings
- Agent guidelines: `AGENTS.md` (shared iService rules, owned by the kit — edit
  `files/AGENTS.md` here, not in the plugin), `PLUGIN.md` (plugin-specific
  notes, owned by the plugin) and `CLAUDE.md` (imports both for Claude Code)

To get the latest `AGENTS.md` into an existing plugin, run
`npx @iservice-dev/is-wp-plugin-kit@latest update-agents` in its root. Agents
do this themselves before each task (the file tells them to), so you only need
it once for plugins whose copy is older than that instruction. Don't re-run
`init` on an existing plugin; it overwrites `Plugin.php`, `Config.php` and the
main file.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development

```bash
npm run dev
```

### Optional: Add a Divi 5 module

`init` asks at the end whether to add Divi 5 support. To add it to an existing plugin later:

```bash
npx @iservice-dev/is-wp-plugin-kit add-divi5
```

Scaffolds a self-contained `divi5/` workspace (own webpack build) with a working
example module. Namespace and slug are auto-detected; the text domain defaults
to the slug (`--text-domain` to override). Block names and CSS classes get a
prefix from the slug (`is-ui-snippets-plugin` → `is-ui-snippets/…`,
`is_ui_snippets_…`), so modules of different plugins never collide. From then on `npm run build`
and `npm run dev` in the plugin root build/watch `divi5/` too (installing its deps
on first run) — no separate `cd divi5` step needed. The IS Base plugin auto-loads
it — no wiring needed.

## Configuration

### Port Settings

If you need a different port for general development, update both:

**`vite.config.ts`:**
```typescript
export default wpPluginKitVite({
  port: 5500  // Change this
});
```

**`includes/lib/Core/Config.php`:**
```php
$this->vitePort = 5500;  // Change this
```

**Port convention:** general plugins can run together on one site, so each gets its own port (next free number from 5173 up). Customer plugins never run together, so they all share `5500` (the `init` default).

### PHP Customization

The customization point in the PHP templates is marked with a `TODO` comment
in `includes/lib/Core/Plugin.php`. Plugin settings such as the Vite port live
in `includes/lib/Core/Config.php`.

## Available Commands

```bash
npm run dev        # Development mode with watchers
npm run build      # Production build
```

Kit CLI (via `npx @iservice-dev/is-wp-plugin-kit <command>`):

```bash
init               # Scaffold a new plugin
add-divi5          # Add a Divi 5 module bundle (divi5/)
update-agents      # Replace AGENTS.md with the kit's latest copy
compile-mo         # Convert .po → .mo
```

## What's Included

- **Vite**: Fast development server with HMR
- **TypeScript**: Full type support for WordPress development
- **SCSS**: Modern CSS workflow with PostCSS and Autoprefixer
- **Linting**: OXLint for JS/TS, Stylelint for CSS/SCSS
- **i18n**: Automatic `.po` to `.mo` compilation
- **File Watchers**: Auto-lint and compile on file changes
- **Divi 5 (optional)**: An auto-detected `divi5/` module workspace (own webpack build) is built by `npm run build`, watched by `npm run dev`, and packaged into the release zip. Plugins without a `divi5/` folder are unaffected.

## Project Structure

```
your-plugin/
├── assets/
│   ├── src/
│   │   ├── ts/          # TypeScript files
│   │   ├── scss/        # SCSS files
│   │   ├── images/      # Images
│   │   ├── fonts/       # Fonts
│   │   ├── l10n/        # Translation files (.po)
│   │   └── legacy/      # Legacy JS/CSS (older plugins only, not created by init)
│   └── dist/            # Built files (auto-generated)
├── includes/
│   └── lib/
│       ├── Core/        # Plugin core classes
│       ├── Admin/       # Admin classes
│       └── Frontend/    # Frontend classes
├── languages/           # Compiled .mo files
└── vite.config.ts
```

## CI checks

`init` adds two workflows that use the shared checks from
[`iService-dev/.github`](https://github.com/iService-dev/.github)
(plugin header, `php -l` on the minimum and newest PHP, build and zip):

- `checks.yml` runs them on every pull request into `dev` or `main` and on
  every push to `dev`.
- `deploy.yml` runs them on a push to `main` and then releases with the
  shared release workflow (tag `v<version>` and GitHub release with the zip).

## Releasing

The version is not raised automatically. Before merging `dev` into `main`:

1. On `dev`, set `Version:` in the main plugin file to exactly one step above
   the latest release: patch (`1.2.59` → `1.2.60`), minor (`1.3.0`) or major
   (`2.0.0`).
2. Open a pull request from `dev` into `main`. Its checks fail if it doesn't
   come from `dev` or the version isn't a valid next step.
3. Merge it. The release uses the version from the file; nothing is
   committed back.

Existing plugins: copy `files/checks.yml` and `files/deploy.yml` into
`.github/workflows/` (and remove any other release workflow).

## Requirements

- Node.js 22.12 or higher locally (CI uses Node 24)
- Vite 7 or 8 (new plugins start on Vite 8)
- **IS Base Plugin** — installed and active in WordPress. Plugins generated by this kit deactivate themselves if it is missing (they rely on its autoloader, updater, and requirement checks).

## License

ISC
