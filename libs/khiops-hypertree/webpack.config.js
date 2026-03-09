const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/d3-hypertree.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'd3-hypertree.js',
    library: 'hyt',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // faster build; types emitted separately via tsc
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'src/ducd', to: 'js/ducd' }],
    }),
  ],
  devtool: false,
  performance: {
    hints: false,
  },
};
