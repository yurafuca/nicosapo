const path = require('path');

module.exports = {
    entry: {
        bundle: './src/app.js'
    },
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                loader: 'babel',
                exclude: /node_modules/,
                test: /\.js[x]?$/,
                query: {
                    cacheDirectory: true,
                    presets: ['react', 'es2015']
                }
            }
        ]
    }
};
