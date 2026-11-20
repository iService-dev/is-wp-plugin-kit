const fs = require('fs');
const path = require('path');
const { Compilation } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Front-End files per module, found automatically: src/components/<module>/module.ts
// → scripts/<module>.js and module.scss → styles/<module>.css. Only these two names
// are entries; everything else reaches them through import / @use. The watcher
// (npm run dev) picks up a new module folder only after a restart.
const componentsDir = path.resolve(__dirname, 'src/components');
const frontendEntries = Object.fromEntries(
  fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => [
      dir.name,
      ['module.ts', 'module.scss']
        .map((file) => path.join(componentsDir, dir.name, file))
        .filter((file) => fs.existsSync(file)),
    ])
    .filter(([, files]) => files.length > 0)
);

// A module with only module.scss would still get an empty scripts/<module>.js.
class RemoveStyleOnlyScripts {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('RemoveStyleOnlyScripts', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'RemoveStyleOnlyScripts', stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE },
        () => {
          for (const [name, files] of Object.entries(frontendEntries)) {
            if (!files.some((file) => file.endsWith('.ts')) && compilation.getAsset(`${name}.js`)) {
              compilation.deleteAsset(`${name}.js`);
            }
          }
        }
      );
    });
  }
}

module.exports = {
  // `bundle` is the Visual Builder (all modules); every other entry is one module's Front-End files.
  // @see https://webpack.js.org/concepts/#entry
  entry: {
    bundle: './src/index.ts',
    ...frontendEntries,
  },

  // Divi & WordPress already enqueue these in global scope, so they must NOT be
  // bundled. They are mapped to the globals Divi exposes.
  // @see https://webpack.js.org/configuration/externals/#externals
  externals: {
    // Third party dependencies.
    jquery: 'jQuery',
    underscore: '_',
    lodash: 'lodash',
    react: ['vendor', 'React'],
    'react-dom': ['vendor', 'ReactDOM'],

    // WordPress dependencies.
    '@wordpress/i18n': ['vendor', 'wp', 'i18n'],
    '@wordpress/hooks': ['vendor', 'wp', 'hooks'],

    // Divi dependencies.
    '@divi/rest': ['divi', 'rest'],
    '@divi/data': ['divi', 'data'],
    '@divi/module': ['divi', 'module'],
    '@divi/module-utils': ['divi', 'moduleUtils'],
    '@divi/modal': ['divi', 'modal'],
    '@divi/field-library': ['divi', 'fieldLibrary'],
    '@divi/icon-library': ['divi', 'iconLibrary'],
    '@divi/module-library': ['divi', 'moduleLibrary'],
    '@divi/style-library': ['divi', 'styleLibrary'],
  },

  module: {
    rules: [
      // Handle `.tsx` and `.ts` files.
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            // Skip type-checking to keep builds fast/unblocked while the Divi
            // type packages evolve. Types are still stripped correctly.
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },

      // `import icon from '…/icon.svg'` gives the file's markup as a string.
      {
        test: /\.svg$/,
        type: 'asset/source',
      },

      // Handle `.css` and `.scss` files.
      {
        test: /\.s?css$/i,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: {
              url: false,
              importLoaders: 2,
            },
          },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },

  optimization: {
    // Split CSS: `style.scss` → Visual Builder only (vb-bundle.css);
    // every other *.scss (e.g. module.scss) → Front-End + VB (bundle.css).
    splitChunks: {
      cacheGroups: {
        vb: {
          type: 'css/mini-extract',
          test: /[\\/]style(\.module)?\.(sc|sa|c)ss$/,
          chunks: 'all',
          enforce: true,
          name(_, chunks, cacheGroupKey) {
            const chunkName = chunks[0].name;
            return `${path.dirname(chunkName)}/${cacheGroupKey}-${path.basename(chunkName)}`;
          },
        },
        default: false,
      },
    },
  },

  plugins: [
    new RemoveStyleOnlyScripts(),

    // Extract CSS into ../styles/[name].css (relative to the `scripts` output dir).
    new MiniCssExtractPlugin({
      filename: '../styles/[name].css',
    }),

    // Copy the module metadata JSON consumed by PHP (ModuleRegistration::register_module).
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/module.json',
          context: 'src/components',
          to: path.resolve(__dirname, 'modules-json'),
        },
        {
          from: '**/module-default-render-attributes.json',
          context: 'src/components',
          to: path.resolve(__dirname, 'modules-json'),
        },
      ],
    }),
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.json'],
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'scripts'),
  },

  stats: {
    errorDetails: true,
  },
};
