const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
