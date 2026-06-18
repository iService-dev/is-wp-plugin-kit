const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // Entry points — `bundle` is the Visual Builder, `module` is the Front-End script.
  // @see https://webpack.js.org/concepts/#entry
  entry: {
    bundle: './src/index.ts',
    module: './src/components/example-module/module.ts',
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
