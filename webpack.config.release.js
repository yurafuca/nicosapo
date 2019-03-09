/* eslint-disable */ /* prettier-disable */

const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = [{
    entry: {
      background: "./src/javascripts/background.js",
      content: "./src/javascripts/content.js",
      popup: "./src/javascripts/popup.js",
      options: "./src/javascripts/options.js"
    },
    output: {
      path: path.resolve(__dirname, "./dist/assets/javascripts"),
      filename: "[name].js"
    },
    module: {
      rules: [{
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          retainLines: true
        }
      },
        {
          test: /\.css$/,
          loaders: ["style-loader", "css-loader?modules"]
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin("[name].css"),
      new CopyWebpackPlugin([{
          from: "src/html",
          to: "../html"
        },
        {
          from: "src/javascripts/popper.min.js",
          to: "../javascripts/popper.min.js"
        },
        {
          from: "src/javascripts/tooltip.min.js",
          to: "../javascripts/tooltip.min.js"
        },
        {
          from: "src/stylesheets",
          to: "../stylesheets",
          ignore: ['*.scss']
        },
        {
          from: "src/images",
          to: "../images"
        },
        {
          from: "src/octicons",
          to: "../octicons"
        },
        {
          from: "src/sounds",
          to: "../sounds"
        },
        {
          from: "src/fonts",
          to: "../fonts"
        },
        {
          from: "manifest.json",
          to: "../manifest.json"
        },
      ]),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production")
      })
    ],
    resolve: {
      extensions: [".js", ".jsx", ".scss"]
    }
  },
  {
    entry: {
      popup: "./src/stylesheets/popup.scss",
      content: "./src/stylesheets/content.scss",
      options: "./src/stylesheets/options.scss"
    },
    output: {
      path: path.resolve(__dirname, "./dist/assets/stylesheets/"),
      filename: "[name].css"
    },
    module: {
      rules: [{
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader?outputStyle=expanded"]
        })
      }]
    },
    plugins: [new ExtractTextPlugin("[name].css")]
  }
];