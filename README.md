# @iservice-dev/is-wp-plugin-kit

A toolkit for WordPress plugin development with Vite, TypeScript, and modern build tools.

## Features

- 🚀 **Vite Integration**: Fast development with HMR support
- 📦 **TypeScript Support**: Full TypeScript configuration for WordPress plugins
- 🎨 **SCSS Processing**: Modern CSS workflow with PostCSS and Autoprefixer
- 🔍 **Linting**: Pre-configured OXLint and Stylelint rules
- 🌍 **i18n Support**: Compile `.po` files to `.mo` for WordPress localization
- 📁 **Smart Asset Handling**: Automatic processing of JS, CSS, images, and fonts

## Installation

```bash
npm install --save-dev @iservice-dev/is-wp-plugin-kit
```

## Usage

### Initialize Your Project

Set up your WordPress plugin with default configuration files:

```bash
npx is-wp-plugin-kit init
```

This creates the following files in your project root:
- `.gitignore` - WordPress-specific ignore patterns
- `oxlintrc.json` - JavaScript/TypeScript linting configuration
- `stylelintrc.json` - CSS/SCSS linting configuration
- `postcss.config.cjs` - PostCSS configuration with Autoprefixer
- `tsconfig.json` - TypeScript configuration optimized for WordPress

### Vite Configuration

In your `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import wpPluginKit from '@iservice-dev/is-wp-plugin-kit';

export default defineConfig({
  plugins: [
    wpPluginKit({
      entry: 'src/main.ts', // Your main entry file
      outDir: 'dist',        // Output directory
    })
  ]
});
```

### Compile Translation Files

Compile `.po` files to `.mo` for WordPress i18n:

```bash
npx is-wp-plugin-kit compile-mo
```

This automatically finds and compiles all `.po` files in your `languages/` directory.

## What's Included

### Vite Plugin

The plugin automatically handles:
- **Entry point compilation** (TypeScript/JavaScript)
- **SCSS processing** with PostCSS
- **Asset copying** (images, fonts, PHP files)
- **WordPress-specific optimizations**

### Configuration Files

#### TypeScript (`tsconfig.json`)
Pre-configured for WordPress development with proper types and module resolution.

#### PostCSS (`postcss.config.cjs`)
Includes Autoprefixer for automatic vendor prefixing.

#### Linting
- **OXLint**: Fast JavaScript/TypeScript linting
- **Stylelint**: CSS/SCSS linting with modern standards

## Project Structure

Your WordPress plugin should follow this structure:

```
your-plugin/
├── src/
│   ├── main.ts          # Entry point
│   ├── styles/          # SCSS files
│   └── ...
├── languages/           # Translation files (.po)
├── dist/                # Built files (auto-generated)
├── vite.config.js
└── package.json
```

## Requirements

- Node.js 18 or higher
- Vite 5.x or 6.x (peer dependency)

## License

ISC

## Repository

[https://github.com/iservice-dev/is-wp-plugin-kit](https://github.com/iservice-dev/is-wp-plugin-kit)
