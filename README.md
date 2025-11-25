# @iservice-dev/is-wp-plugin-kit

A toolkit for WordPress plugin development with Vite, TypeScript, and modern build tools.

## Quick Start

### 1. Initialize a New Plugin

```bash
npx @iservice-dev/is-wp-plugin-kit init
```

This sets up your complete plugin structure with:
- Configuration files (`.gitignore`, TypeScript, linting, PostCSS)
- Folder structure (`assets/`, `includes/`, `languages/`)
- Template files (`Config.php`, `Plugin.php`, `de_DE.po`)
- `vite.config.ts` with default settings

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development

```bash
npm run dev
```

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

### PHP Customization

All customization points in the PHP template files are marked with `TODO` comments. Check:
- `includes/lib/Core/Plugin.php`
- `includes/lib/Core/Config.php`

## Available Commands

```bash
npm run dev        # Development mode with watchers
npm run build      # Production build
```

## What's Included

- **Vite**: Fast development server with HMR
- **TypeScript**: Full type support for WordPress development
- **SCSS**: Modern CSS workflow with PostCSS and Autoprefixer
- **Linting**: OXLint for JS/TS, Stylelint for CSS/SCSS
- **i18n**: Automatic `.po` to `.mo` compilation
- **File Watchers**: Auto-lint and compile on file changes

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
│   │   └── legacy/      # Legacy JS/CSS
│   └── dist/            # Built files (auto-generated)
├── includes/
│   └── lib/
│       ├── Core/        # Plugin core classes
│       ├── Admin/       # Admin classes
│       └── Frontend/    # Frontend classes
├── languages/           # Compiled .mo files
└── vite.config.ts
```

## Requirements

- Node.js 18 or higher
- Vite 7.x

## License

ISC
