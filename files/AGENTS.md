# iService WordPress plugin – agent guidelines

These rules apply to every agent. Don't edit this file; plugin-specific notes are in `PLUGIN.md`.
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
├── divi5/                   # native Divi 5 modules (see section 8)
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
- **Models are only used by services.** Classes in `Admin/`, `Frontend/`,
  `Api/`, `Divi/` and `divi5/` never call a model directly, only its
  service in `Core/Services/`. Keep a service even if it only passes calls
  through to the model. The same applies to the base plugin: use its
  services, never its models.
- **Keys are defined once.** Meta keys, option names and field names are
  constants or name functions in `Core/` (e.g. `Config.php` or the model).
  Everything else reads and writes them only through getters and setters,
  never with the raw string.
- **Post fields go through the base plugin's `Field_Service`.** A plugin
  adds its own fields through the filter `is/base/field_providers` (a class
  implementing `Field_Provider`, see `General_Data_Provider` in the base
  plugin) or adjusts them with `is/base/field_entries`. Never build an own
  field registry.
- **Don't change versions.** Never raise the `Version` header; the release
  workflow does that on every push to `main`. Set `$required_base_version`
  in the main plugin file only to a base plugin version that actually exists.

## 3. Check the base plugin first

Before writing a helper, class, style or script, check whether the IS Base
Plugin already does it and use that instead (repo `iService-dev/is-base-plugin`,
usually checked out next to this plugin; if you can't find it, ask a
developer instead of building your own):

- PHP helpers: `includes/lib/Core/Helpers/`
- PHP services and classes: `includes/lib/Core/Services/`,
  `includes/lib/Admin/Settings/` (settings pages and fields)
- Admin styles and scripts: use the base plugin's classes (`is-card`,
  `is-table`, buttons, fields, table filter, …) in your markup – its CSS and
  JS load on every admin page. See `assets/src/scss/components/` and
  `assets/src/ts/components/` for what exists; you can't `@use` or `import`
  them.

Never copy code from the base plugin into this plugin. If something is
missing in the base plugin and would be useful for other plugins too, stop
and ask a developer whether it belongs there.

## 4. Assets

- Write TypeScript in `assets/src/ts/` and SCSS in `assets/src/scss/`.
  No jQuery and no plain JS/CSS in new code. `assets/src/legacy/` only exists in older plugins.
  Exception: `divi5/` has its own build, folder layout and asset loading;
  follow `divi5/README.md` there.
- **SCSS is real SCSS, not CSS in a `.scss` file.** Use nesting, `@use`, variables and mixins.
  - Build it modular: an entry file (e.g. `backend.scss`) only `@use`s
    partials from `assets/src/scss/components/`. One component per partial,
    named after the component or mixin inside it (`_settings-form.scss`).
  - Variables live in the plugin's own `assets/src/scss/base/_variables.scss`
    (create it with the first variable you need). Colours, spacing,
    radii, font sizes and breakpoints always come from variables, never as
    literal values in components.
  - Admin and settings pages use the base plugin's styles and components
    (`is-card`, `is-table`, …) instead of their own look.
- **TypeScript is modular too.** An entry file (e.g. `backend.ts`) only
  imports and starts modules. Each feature is its own module in a subfolder
  of `assets/src/ts/` (e.g. `components/`) that exports typed functions or
  classes. No globals on `window` unless PHP or another script needs them,
  and then typed.
- Enqueue only through the base plugin's `Asset_Manager_Service`
  (`enqueue_js('name')`, `enqueue_css('name')`), never with hard-coded
  URLs to `assets/`. Exception: `divi5/` (see above).
- Load assets **only where they are needed** (the page, admin screen or
  module that uses them). Never load admin CSS/JS on the frontend.
  For user-specific assets, check a capability (`current_user_can()`), not
  `is_user_logged_in()`.
- No external CDNs, fonts or scripts. Everything ships with the plugin.
- No placeholder or test media in the repo.
  Images in `assets/src/images/` must be optimised; prefer SVG for icons
  and graphics and WebP for photos, and keep them under 200 KB unless
  there's a reason.

## 5. Security (non-negotiable)

- Every PHP file starts with `if (!defined('ABSPATH')) exit;` unless it only
  declares a namespaced class.
- **Escape all output** at the point of output. Values used in inline CSS
  must also be validated (e.g. `sanitize_hex_color()`).
- **Sanitize all input.**
- Every state-changing request from a logged-in user (forms, AJAX, REST
  with cookie auth) checks a **nonce** (`X-WP-Nonce` for REST) and a
  **capability** (`current_user_can`).
- Endpoints called by another server have no nonce. They check a token
  sent in a header (never in the URL) with `hash_equals()` and only do
  what that token is meant for.
- REST routes always have a real `permission_callback`, never
  `__return_true` for write routes.
- **Decide who sees it.** For every admin page, setting, field, notice or
  tool, decide whether only iService sees it or the customer too, and write
  the decision in the pull request. Control it only through the base plugin,
  never with your own e-mail, role or user ID checks:
  - Admin pages: see "Working with the IS Security plugin" below.
  - Anything that is not a menu page (a field, a metabox, a notice, a
    button): check `IS\Base\Core\Helpers\User::current_user_is_iservice()`.
    Don't use `Security::should_restrict_iservice()` for this: it returns
    `false` for everyone as soon as the IS Security plugin is active,
    because that plugin only controls menu pages.

- Database: `$wpdb->prepare()` for every query with variables.
- JS: never write untrusted strings with `innerHTML`, `insertAdjacentHTML` or
  jQuery `.html()`. Use `textContent` or create elements.
- **No site-wide side effects** for a single feature, for example allowing
  new upload file types, changing user roles or capabilities, or changing
  core or other plugins' behaviour. If a feature seems to need this, stop and
  ask a developer.
- Never commit secrets: API keys, tokens, passwords, customer data, `.env`.

### Working with the IS Security plugin

The IS Security plugin is optional. The plugin must work the same without
it, so never call its classes directly; only use the hooks below and the
base plugin.

- **Menu pages must be in the security catalog**, otherwise the customer
  can't restrict them and they can't inherit rules from their parent.
  - Settings pages go under the iService menu with `Subpage::register()`.
    They are added to the catalog automatically and inherit the iService
    rule (`who_type` `inherit`). Pass the last parameter `$security` only to
    override that, e.g. `['who_type' => 'all']`.
  - A plugin with its own top-level menu (needs a reason in the pull
    request) registers it and every submenu through the filter
    `is_security/backend/catalog`. Copy the structure from
    `Settings::register_security_catalog()` in the base plugin.
- **Settings show up readable in the activity log.** Use the base plugin's
  `Setting_*` fields and always pass the named argument `log` (all except
  `Setting_Info`, which saves nothing), e.g.
  `log: ['source' => $this->config->pluginName, 'area' => __('API Settings', $this->config->pluginName)]`.
  Add `'label' => …` inside `log` only if the field label isn't clear on its
  own. With your own `register_setting()`, pass `label` and `log` the same way.
- **Secret options are masked** in the log only if their name contains
  `key`, `secret`, `token`, `pass`, `salt`, `license` or `api`. Name them
  accordingly.
- Requests that must skip the access rules go through the filter
  `is_security/access/bypass_paths` (admin-ajax, admin-post, cron and REST
  already do). Ask a developer before adding one.

## 6. Translations

- All user-facing strings in English in the code, wrapped in `__()`,
  `esc_html__()` etc. with the plugin's text domain. The text domain must be
  the plugin slug (= folder name); otherwise translations don't load.
- Translations go into `assets/src/l10n/<locale>.po` (e.g. `de_DE.po`);
  `.mo` files are built automatically.
- `.po` files use CRLF line endings. Keep them when editing, otherwise the
  whole file shows up in the diff.
- The plugin header must contain `Domain Path: /languages`. Without it,
  translations stay English from WordPress 6.7 on.
- Strings in TypeScript are translated in PHP and passed to the script with
  `Asset_Manager_Service::localize()`. Don't hard-code user-facing text in
  TypeScript. Exception: Divi 5 Builder strings go into the module's
  `l10n.ts` (see `divi5/README.md`).

### Working with WPML and the IS WPML plugin

Many sites run WPML, and the IS WPML plugin handles fields in custom
tables, which WPML itself doesn't know. Both are optional: the plugin must
work without them. Use only WPML's own filters (`wpml_object_id`,
`wpml_element_language_details`, …) and the `is/wpml/*` hooks, never the
classes of either plugin.

- **Every new field gets a deliberate translation mode**, and you write the
  decision in the pull request:
  - `ignore`: the translation starts empty.
  - `copy`: copied and kept in sync, locked in translations.
  - `copy_once`: copied when the translation is created, then free.
  - `translate`: part of the WPML translation job (text and numbers only).
- **Post meta** (`wp_postmeta`) is set in WPML's custom field translation.
  With "don't translate", Meta Box hides the field in translations
  completely.
- **Fields in custom tables** come from a `Field_Provider` (see section 2).
  Each entry sets its default mode in `attrs['translation']` (`'copy'`
  etc.), and a column that holds post or term IDs sets `ref` to
  `'post:<post_type>'` or `'term:<taxonomy>'` (see `General_Data_Provider`).
  For Meta Box fields the same goes into the field config as `'translation'`
  and `'translation_ref'`. The customer can change the mode on the IS WPML
  settings page.
- **No own copy or sync logic for translations** (on `save_post`, on a new
  translation, on a finished job). The IS WPML plugin does that. Follow-up
  work such as clearing caches hooks into `is/wpml/after_copy` or
  `is/wpml/after_job_applied`.
- **Fields rendered without Meta Box** ask
  `apply_filters('is/wpml/field_locked', false, '<table>.<column>', $post_id)`.
  A locked field is rendered `disabled` with the note box
  `is-wpml-locked-note` and is not saved. See `Admin/Metafield.php` in the
  base plugin.
- **Derived values are never copied.** A value calculated from other fields
  (e.g. plain text from the content) is calculated again in the translation
  from the translated fields.
- IDs of posts, terms or media in your own code go through
  `apply_filters('wpml_object_id', $id, $type, true, $lang)` before they
  are shown or linked in another language.
- Test new features in a translated post or page too, not only in the
  default language.

## 7. Accessibility

- Never remove focus outlines without a visible replacement (`:focus-visible`).
- Respect user preferences like `prefers-reduced-motion`.
- Anything that moves or loops on its own needs a pause/stop control.
- Interactive elements are real `<button>`/`<a>` elements, reachable and
  usable with the keyboard, with accessible names.
- Images need meaningful `alt` text (or `alt=""` if decorative).

## 8. Divi modules

- **New modules are native Divi 5 modules** in `divi5/`. If the plugin has
  no `divi5/` folder yet, create it once with
  `npx @iservice-dev/is-wp-plugin-kit add-divi5`. Further modules are added
  inside it as described in `divi5/README.md` ("Adding another module").
  Never delete an existing `divi5/` folder.
- Every module is self-contained in its own folder and doesn't depend on
  other modules, except a child module on its parent (see
  `divi5/README.md`).
- Front-end scripts and styles only load when the module is on the page:
  the module's render callback enqueues them (see the example module).
- **Where content is stored is a developer decision.** Divi saves module
  content inside the page. That's fine for layout and visual settings. Stop and
  ask a developer before building if the content:
  - is a list of items (events, FAQs, …),
  - should be searchable, filterable or have its own URL.
- If the decision is "store it in Divi for now", build the module so it can
  switch later: the render code gets its items from one function
  (`get_items()`), and can be replaced easily. Write the decision in the pull request.

## 9. Code quality

- Follow the WordPress coding standards. The build lints TypeScript
  (oxlint) and SCSS (stylelint) in `assets/src/` and fixes some SCSS issues
  itself (review those changes); `divi5/` is not linted. Fix warnings, don't
  disable rules. PHP is
  not linted by the build, so check it yourself against the standards and
  run `php -l` on changed files.
- PHP 8.3+ syntax and types. No optional parameters before required ones.
- No dead code, no commented-out code, no unused options, no fallbacks for
  browsers or APIs older than five years.
- **Fix the cause, don't add a fallback.** If a value is missing because a
  field, option or hook is wired wrongly, wire it correctly. No "use A,
  otherwise B" logic that hides the problem.
- No magic numbers: name them as constants or settings.
- **HTML formatting:** every element and every text starts on its own line,
  indented one level deeper than its parent. Attributes go on their own
  lines when there are more than two. Exceptions: `<textarea>` and `<pre>`,
  where whitespace is part of the content.

  ```php
  <label for="is_seo_keyphrase">
  	<?php echo esc_html__('Focus keyphrase', $p); ?>
  </label>
  ```

- **No CSS in HTML:** no `style` attributes and no `<style>` blocks, in
  PHP templates and in TypeScript (`element.style`) alike. Styles go into
  SCSS and are switched with classes. Only a value that comes from a
  setting may be passed as a CSS custom property
  (`style="--is-accent: …"`), validated as described in section 5.
- **No comments by default.** Use clear names and small functions instead.
  Write a comment only if it is really necessary, i.e. it explains a reason
  the code can't show (a WordPress or plugin quirk, a workaround with a
  link). No comments that repeat what the code does, no section dividers,
  no docblocks that only restate names and types.

## 10. Build and run

```bash
npm install        # once
npm run dev        # watch mode with HMR (also builds divi5/)
npm run build      # production build: lint, Vite, .mo, divi5/
```

`npm run build` must pass without errors before you open a pull request.

## 11. Git workflow

- **Never commit to `main` or `dev` directly.** Create a branch from `dev`
  (`feature/<short-name>`, `fix/<short-name>`) and open a pull request into
  `dev`.
- Only developers merge `dev` into `main`. Every push to `main` creates a
  release, unless the commit message contains `[skip release]`.
- Never commit `node_modules/`, `vendor/`, `assets/dist/`, `languages/*.mo`,
  build output or editor files.
- Every pull request describes what changed and, ideally, how it was tested.

## 12. When to stop and ask a developer

- Anything touching data storage, custom post types, the database, REST APIs,
  user roles or settings of other plugins.
- Adding Composer or npm dependencies.
- Security-related code you are not sure about.