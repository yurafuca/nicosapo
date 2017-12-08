const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');

module.exports = [
  {
    entry: {
        background: "./src/javascripts/background.js",
        content: "./src/javascripts/content.js",
        popup: "./src/javascripts/popup.jsx",
        options: "./src/javascripts/options.jsx"
    },
    output: {
        path: path.resolve(__dirname, './dist/assets/javascripts'),
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
                    presets: ['react', 'es2015']
                }
          },
          {
            test: /\.css$/,
            loaders: ['style-loader', 'css-loader?modules'],
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
        { from: 'manifest.json', to: '../manifest.json' },
        { from: 'src/stylesheets/modal.css', to: '../stylesheets/modal.css' },
        { from: 'src/stylesheets/switcher.css', to: '../stylesheets/switcher.css' },
        { from: 'src/stylesheets/balloon.min.css', to: '../stylesheets/balloon.min.css' },
        { from: 'src/stylesheets/animate.min.css', to: '../stylesheets/animate.min.css' },
      ]),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.optimize.UglifyJsPlugin()
    ],
    resolve: {
      extensions: [
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
      options: './src/stylesheets/options.scss'
    },
    output: {
      path: path.resolve(__dirname, './dist/assets/stylesheets/'),
      filename: '[name].css'
    },
    module: {
     rules: [
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract(
            {
              fallback: "style-loader",
              use: ["css-loader", "sass-loader?outputStyle=expanded"]
            }
          )
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin('[name].css')
    ]
  }
];
