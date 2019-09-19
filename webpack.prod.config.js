const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

module.exports = {
  entry: {
    quickjots: ['./src/js/storage.js', './src/js/main.js', './src/js/listeners.js'],
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    chunkFilename: '[id].[chunkhash].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/html/index.html',
      inject: true,
      chunks: ['quickjots'],
      filename: 'index.html',
      favicon: './src/images/favicon.ico',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new WorkboxPlugin.GenerateSW(),
    new WebpackPwaManifest({
      name: 'QuickJots',
      short_name: 'QuickJots',
      description: 'Jot down and auto-save any quick notes in your browser, using Markdown or plain-text',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      crossorigin: null,
      icons: [
        {
          src: './src/images/favicon.png',
          sizes: [96, 128, 192, 256, 384, 512]
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(woff|woff2)$/,
        loaders: ['url-loader'],
      },
      {
        test: /\.(png|svg|ico)$/,
        use: ['file-loader'],
      },
    ],
  },
};
