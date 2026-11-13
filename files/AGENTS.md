# iService WordPress plugin – agent guidelines

These rules apply to every agent - don't edit this file; plugin-specific notes are in `PLUGIN.md`.
Read `PLUGIN.md` too if it exists.

If a rule here conflicts with a request, stop and ask instead of working
around it.

## 1. What this repository is

- A WordPress plugin built on the **IS Base Plugin** (`is-base-plugin`).
  It does not run without it: the base plugin provides the autoloader,
  updater, asset manager, Divi loading and requirement checks.
- Scaffolded with `npx @iservice-dev/is-wp-plugin-kit init`. Keep the
  generated structure; don't invent a parallel one.

## 2. Structure

```
<plugin-slug>/
├── <plugin-slug>.php        # plugin header + bootstrap only, no logic
├── includes/lib/            # PHP, PSR-4: IS\<Name>\<Folder>\<Class>
│   ├── Core/                # Plugin.php (boot), Config.php, Helpers/, Models/, Services/
│   ├── Admin/               # admin-only classes (auto-instantiated)
│   ├── Frontend/            # frontend classes (auto-instantiated)
│   ├── Api/                 # REST controllers
│   └── Divi/                # Divi 4 modules (legacy, only for existing modules)
├── divi5/                   # native Divi 5 modules (see section 7)
├── assets/src/              # ts/, scss/, images/, fonts/, l10n/ – sources only
├── assets/dist/             # build output – never edit, never commit
└── languages/               # compiled .mo – generated; never edit, never commit
```

- Namespace: `IS\<Name>\…`, folder path = namespace. One class per file,
  file name = class name. No `require`/`include` for own classes.
- Classes in `Admin/` and `Frontend/` are instantiated automatically by
  `Auto_Instantiate`; register hooks in the constructor.
- Plugin settings and constants live in `Core/Config.php`, not in globals or
  `define()`.
- Don't put new top-level folders or files in the plugin root without a
  reason stated in the pull request.

## 3. Assets

- Write TypeScript in `assets/src/ts/` and SCSS in `assets/src/scss/`.
  No jQuery and no plain JS/CSS in new code. `assets/src/legacy/` only exists in older plugins.
- Enqueue only through the base plugin's `Asset_Manager_Service`
  (`enqueue_js('name')`, `enqueue_css('name')`), never with hard-coded
  URLs to `assets/`. Exception: Divi 5 modules in `divi5/` load their files
  through `divi5/bootstrap.php` and the module's render callback; keep that
  as it is.
- Load assets **only where they are needed** (the page, admin screen or
  module that uses them). Never load admin CSS/JS on the frontend.
  For user-specific assets, check a capability (`current_user_can()`), not
  `is_user_logged_in()`.
- No external CDNs, fonts or scripts. Everything ships with the plugin.
- No placeholder or test media in the repo.
  Images in `assets/src/images/` must be optimised; keep them under
  200 KB unless there's a reason.

## 4. Security (non-negotiable)

- Every PHP file starts with `if (!defined('ABSPATH')) exit;` unless it only
  declares a namespaced class.
- **Escape all output** at the point of output. Values used in inline CSS
  must also be validated (e.g. `sanitize_hex_color()`).
- **Sanitize all input.**
- Every state-changing request (forms, AJAX, REST) checks a **nonce** and a
  **capability** (`current_user_can`). REST routes always have a real
  `permission_callback`, never `__return_true` for write routes.
- Database: `$wpdb->prepare()` for every query with variables.
- JS: never write untrusted strings with `innerHTML`, `insertAdjacentHTML` or
  jQuery `.html()`. Use `textContent` or create elements.
- **No site-wide side effects** for a single feature, for example allowing
  new upload file types, changing user roles or capabilities, or changing
  core or other plugins' behaviour. If a feature seems to need this, stop and
  ask a developer.
- Never commit secrets: API keys, tokens, passwords, customer data, `.env`.

## 5. Translations

- All user-facing strings in English in the code, wrapped in `__()`,
  `esc_html__()` etc. with the plugin's text domain (see the plugin header
  or `PLUGIN.md`; normally the plugin slug).
- Translations go into `assets/src/l10n/<locale>.po` (e.g. `de_DE.po`);
  `.mo` files are built automatically.

## 6. Accessibility

- Never remove focus outlines without a visible replacement (`:focus-visible`).
- Respect user preferences like `prefers-reduced-motion`.
- Anything that moves or loops on its own needs a pause/stop control.
- Interactive elements are real `<button>`/`<a>` elements, reachable and
  usable with the keyboard, with accessible names.
- Images need meaningful `alt` text (or `alt=""` if decorative).

## 7. Divi modules

- **New modules are native Divi 5 modules** in `divi5/` (created with
  `npx @iservice-dev/is-wp-plugin-kit add-divi5`).
- Every module is self-contained in its own folder and doesn't depend on
  other modules.
- Front-end scripts only load when the module is on the page. Exception for
  now: the small `divi5/styles/bundle.css` loads on every page.
- **Where content is stored is a developer decision.** Divi saves module
  content inside the page. That's fine for layout and visual settings. Stop and
  ask a developer before building if the content:
  - is a list of items (events, FAQs, …),
  - should be searchable, filterable or have its own URL.
- If the decision is "store it in Divi for now", build the module so it can
  switch later: the render code gets its items from one function
  (`get_items()`), and can be replaced easily. Write the decision in the pull request.

## 8. Code quality

- Follow the WordPress coding standards; the build runs oxlint and stylelint.
  Fix warnings, don't disable rules.
- PHP 8.3+ syntax and types. No optional parameters before required ones.
- No dead code, no commented-out code, no unused options, no fallbacks for
  browsers or APIs older than five years.
- No magic numbers: name them as constants or settings.
- Clear names instead of comments. Comment only what the code can't say itself.

## 9. Build and run

```bash
npm install        # once
npm run dev        # watch mode with HMR (also builds divi5/)
npm run build      # production build: lint, Vite, .mo, divi5/
```

`npm run build` must pass without errors before you open a pull request.

## 10. Git workflow

- **Never commit to `main` or `dev` directly.** Create a branch from `dev`
  (`feature/<short-name>`, `fix/<short-name>`) and open a pull request into
  `dev`.
- Only developers merge `dev` into `main`. Every push to `main` creates a
  release.
- Never commit `node_modules/`, `vendor/`, `assets/dist/`, `languages/*.mo`,
  build output or editor files.
- Every pull request describes what changed and, ideally, how it was tested.

## 11. When to stop and ask a developer

- Anything touching data storage, custom post types, the database, REST APIs,
  user roles or settings of other plugins.
- Adding Composer or npm dependencies.
- Security-related code you are not sure about.
- When a rule in this file blocks what you were asked to do.
