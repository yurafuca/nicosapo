const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');

module.exports = [
  {
    entry: {
        background: "./src/javascripts/background.js",
        content: "./src/javascripts/content.js",
        popup: "./src/javascripts/popup.jsx",
        options: "./src/javascripts/options.js"
    },
    output: {
        path: './dist/assets/javascripts',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true,
                    presets: [
                      'react',
                      'es2015'
                    ]
                }
            }
        ]
    },
    plugins: [
      new ExtractTextPlugin("[name].css"),
      new CopyWebpackPlugin([
        { from: 'src/html', to: '../html' },
        { from: 'src/images', to: '../images' },
        { from: 'src/octicons', to: '../octicons' },
        { from: 'src/sounds', to: '../sounds' },
       { from: 'manifest.json', to: '../manifest.json' }
      ])
    ],
    devtool: 'source-map',
    resolve: {
      extensions: [
        "",
        ".js",
        ".jsx",
        ".scss",
      ]
    }
  },
  {
    entry: {
      popup: './src/stylesheets/popup.scss',
      content: './src/stylesheets/content.scss',
      options: './src/stylesheets/options.scss',
    },
    output: {
      path: './dist/assets/stylesheets/',
      filename: '[name].css'
    },
    module: {
      loaders: [
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin('[name].css')
    ]
  }
];
